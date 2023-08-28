import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { Transaction } from "@/config/interfaces/transactions";
import { CosmosNetwork } from "@/config/interfaces/networks";
import { ethToCantoAddress, isValidEthAddress } from "@/utils/address.utils";
import { createMsgsIBCTransfer } from "@/utils/cosmos/transactions/messages/ibc/ibc";
import IBC_CHANNELS from "@/config/jsons/ibcChannels.json";
import { tryFetchMultipleEndpoints } from "@/utils/async.utils";
import { _convertERC20Tx } from "./recovery";
import { isERC20Token } from "@/utils/tokens/tokens.utils";
import { IBCToken } from "@/config/interfaces/tokens";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import { formatBalance } from "@/utils/tokenBalances.utils";
import { CANTO_MAINNET_COSMOS } from "@/config/networks";

/**
 * @notice creates a list of transactions that need to be made for IBC out of canto
 * @param {number} chainId chainId to send tx on
 * @param {string} senderEthAddress eth address to send tx from
 * @param {string} receiverCosmosAddress cosmos address to send tx to
 * @param {CosmosNetwork} receivingChain chain to send tx to
 * @param {IBCToken} token token to send
 * @param {string} amount amount to send
 * @param {boolean} recovery if this is a recovery tx
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function txIBCOut(
  chainId: number,
  senderEthAddress: string,
  receiverCosmosAddress: string,
  receivingChain: CosmosNetwork,
  token: IBCToken,
  amount: string,
  recovery: boolean = false
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

  // if recovery, return only the ibc msg
  const allTxs: Transaction[] = [];
  if (!recovery) {
    // since convert ERC20 must be done, check to make sure the token is also an ERC20
    if (!isERC20Token(token)) {
      return NEW_ERROR(
        "txIBCOut: token must be ERC20 to convert to IBC: " + token.id
      );
    }
    allTxs.push(
      _convertERC20Tx(
        chainId,
        token.address,
        amount,
        senderEthAddress,
        cantoAddress,
        TX_DESCRIPTIONS.CONVERT_ERC20(
          token.symbol,
          formatBalance(amount, token.decimals)
        )
      )
    );
  }
  allTxs.push(
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
      "ibc from canto",
      TX_DESCRIPTIONS.BRIDGE(
        token.symbol,
        formatBalance(amount, token.decimals),
        CANTO_MAINNET_COSMOS.name,
        receivingChain.name
      )
    )
  );

  return NO_ERROR(allTxs);
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */

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
  memo: string,
  description: string
): Transaction => {
  const ibcTx = createMsgsIBCTransfer({
    sourcePort,
    sourceChannel,
    amount,
    denom,
    cosmosReceiver,
    cosmosSender: cantoSender,
    revisionNumber,
    revisionHeight,
    timeoutTimestamp,
    memo,
  });
  return {
    chainId,
    type: "COSMOS",
    description,
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
 * @param {string[]} extraEndpoints extra endpoints to try if first one fails
 * @returns {PromiseWithError<IBCData>} IBCData or error
 */
export async function getIBCData(
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
 * @param {string[]} extraEndpoints extra endpoints to try if first one fails
 * @param {string} latestBlockEndpoint endpoint to get latest block
 * @returns {PromiseWithError<string>} timestamp or error
 */
export async function getBlockTimestamp(
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
  } catch (err) {
    return NEW_ERROR("getBlockTimestamp: " + errMsg(err));
  }
}
