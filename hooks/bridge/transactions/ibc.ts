import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { IBCToken } from "../interfaces/tokens";
import { Transaction } from "@/config/interfaces/transactions";
import { CosmosNetwork } from "@/config/interfaces/networks";
import { ethToCantoAddress, isValidEthAddress } from "@/utils/address.utils";
import { createMsgsConvertERC20 } from "@/utils/cosmos/transactions/messages/convertERC20";
import { createMsgsIBCOut } from "@/utils/cosmos/transactions/messages/ibc";
import IBC_CHANNELS from "@/config/jsons/ibcChannels.json";
import { tryFetchMultipleEndpoints } from "@/utils/async.utils";

export async function txIBCOut(
  chainId: number,
  senderEthAddress: string,
  receiverCosmosAddress: string,
  receivingChain: CosmosNetwork,
  token: IBCToken,
  amount: string
): PromiseWithError<Transaction[]> {
  // check params
  if (!isValidEthAddress(senderEthAddress)) {
    return NEW_ERROR("txIBCOut: invalid eth address: " + senderEthAddress);
  }
  if (!receivingChain.checkAddress(receiverCosmosAddress)) {
    return NEW_ERROR(
      "txIBCOut: invalid cosmos address: " +
        receiverCosmosAddress +
        " for chain " +
        receivingChain.id
    );
  }
  // get all data needed for tx
  const { data: cantoAddress, error: ethToCantoError } =
    await ethToCantoAddress(senderEthAddress);
  if (ethToCantoError) {
    return NEW_ERROR("txIBCOut::" + ethToCantoError.message);
  }

  const channelId =
    IBC_CHANNELS[receivingChain.id as keyof typeof IBC_CHANNELS];
  if (!channelId || !channelId.fromCanto) {
    return NEW_ERROR("txIBCOut: invalid channel id: " + receivingChain.id);
  }

  const { data: ibcData, error: ibcError } = await getIBCData(
    receivingChain.restEndpoint,
    receivingChain.extraEndpoints
  );
  if (ibcError) {
    return NEW_ERROR("txIBCOut::" + ibcError.message);
  }

  const { data: blockTimestamp, error: timestampError } =
    await getBlockTimestamp(
      receivingChain.restEndpoint,
      receivingChain.extraEndpoints,
      receivingChain.latestBlockEndpoint
    );
  if (timestampError) {
    return NEW_ERROR("txIBCOut::" + timestampError.message);
  }

  // return the messges
  return NO_ERROR([
    _convertERC20Tx(
      chainId,
      token.address,
      amount,
      senderEthAddress,
      cantoAddress
    ),
    _ibcOutTx(
      chainId,
      "transfer",
      channelId.fromCanto,
      amount,
      token.ibcDenom,
      receiverCosmosAddress,
      cantoAddress,
      Number(ibcData.height.revision_number),
      Number(ibcData.height.revision_height) + 1000,
      blockTimestamp.slice(0, 9) + "00000000000",
      "ibc from canto"
    ),
  ]);
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _convertERC20Tx = (
  chainId: number,
  tokenAddress: string,
  amount: string,
  sender: string,
  receiver: string
): Transaction => {
  const convertCoinTx = createMsgsConvertERC20({
    contract_address: tokenAddress,
    amount,
    receiver,
    sender,
  });
  return {
    chainId,
    description: "Convert ERC20",
    type: "COSMOS",
    msg: convertCoinTx,
  };
};

const _ibcOutTx = (
  chainId: number,
  sourcePort: string,
  sourceChannel: string,
  amount: string,
  denom: string,
  cosmosReceiver: string,
  cantoSender: string,
  revisionNumber: number,
  revisionHeight: number,
  timeoutTimestamp: string,
  memo: string
): Transaction => {
  const ibcTx = createMsgsIBCOut({
    sourcePort,
    sourceChannel,
    amount,
    denom,
    cosmosReceiver,
    cantoSender,
    revisionNumber,
    revisionHeight,
    timeoutTimestamp,
    memo,
  });
  return {
    chainId,
    type: "COSMOS",
    description: "IBC Out",
    msg: ibcTx,
  };
};

/**
 * TRANSACTION HELPERS
 */

interface IBCData {
  height: {
    revision_number: string;
    revision_height: string;
  };
}
/**
 * @param {string} restEndpoint rest endpoint to request counter-party chain timestamp
 */
async function getIBCData(
  restEndpoint: string,
  extraEndpoints?: string[]
): PromiseWithError<IBCData> {
  const allEndpoints = [restEndpoint, ...(extraEndpoints ?? [])].map(
    (endpoint) => endpoint + "/ibc/core/channel/v1/channels"
  );
  const ibcData = await tryFetchMultipleEndpoints<IBCData>(allEndpoints);
  if (ibcData.error) {
    return NEW_ERROR("getIBCData::" + ibcData.error.message);
  }
  return ibcData;
}

/**
 * @param {string} restEndpoint rest endpoint to request counter-party chain timestamp
 */
async function getBlockTimestamp(
  restEndpoint: string,
  extraEndpoints?: string[],
  latestBlockEndpoint?: string
): PromiseWithError<string> {
  const urlEnding = latestBlockEndpoint ?? "";
  const allEndpoints = [restEndpoint, ...(extraEndpoints ?? [])].map(
    (endpoint) => endpoint + urlEnding + "/blocks/latest"
  );
  const { data, error } = await tryFetchMultipleEndpoints<{
    block: { header: { time: string } };
  }>(allEndpoints);
  if (error) {
    return NEW_ERROR("getBlockTimestamp::" + error.message);
  }
  try {
    // get iso formatted time stamp from latest block
    const ts = data["block"]["header"]["time"];
    // parse string into microseconds UTC
    const ms = Date.parse(ts);
    // return as nano-seconds
    return NO_ERROR(Number(ms * 1e7 + 600 * 1e9).toString());
  } catch (error) {
    return NEW_ERROR("getBlockTimestamp: " + (error as Error).message);
  }
}
