import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import {
  coin,
  DeliverTxResponse,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { IBCToken } from "../../interfaces/tokens";
import { CosmosNetwork } from "@/config/interfaces/networks";
import IBC_CHANNELS from "@/config/jsons/ibcChannels.json";
import { checkPubKeyETH, ethToCantoAddress } from "@/utils/address.utils";
import { CANTO_MAINNET_COSMOS } from "@/config/networks";
import { getBlockTimestamp } from "../methods/ibc";
import { Transaction } from "@/config/interfaces/transactions";
import { getCosmosAPIEndpoint } from "@/utils/networks.utils";
import { connectToKeplr } from "@/utils/keplr/connectKeplr";

/**
 * @notice creates a list of transactions that need to be made for IBC in to canto using keplr
 * @dev will try to connect to keplr if not already done so
 * @param {CosmosNetwork} cosmosNetwork network to ibc from
 * @param {string} cosmosSender cosmos address to send from
 * @param {string} ethReceiver eth address to send to on canto
 * @param {IBCToken} ibcToken token to send
 * @param {string} amount amount to send
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function ibcInKeplr(
  cosmosNetwork: CosmosNetwork,
  cosmosSender: string,
  ethReceiver: string,
  ibcToken: IBCToken,
  amount: string
): PromiseWithError<Transaction[]> {
  // check if we can obtain the keplr client
  const { data: keplrClient, error: clientError } = await connectToKeplr(
    cosmosNetwork
  );
  if (clientError) {
    return NEW_ERROR("ibcInKeplr::" + clientError.message);
  }
  // check that client has the same address as the cosmosSender
  if (keplrClient.address !== cosmosSender) {
    return NEW_ERROR(
      "ibcInKeplr: keplr address does not match cosmos sender: " +
        keplrClient.address +
        " != " +
        cosmosSender
    );
  }

  // make parameter checks
  const { data: hasPubKey, error: checkPubKeyError } = await checkPubKeyETH(
    ethReceiver,
    CANTO_MAINNET_COSMOS.chainId
  );
  if (checkPubKeyError) {
    return NEW_ERROR("ibcInKeplr::" + checkPubKeyError.message);
  }
  if (!hasPubKey) {
    return NEW_ERROR(
      "ibcInKeplr: no public key found for eth address: " + ethReceiver
    );
  }

  // get canto address from ethReceiver
  const { data: cantoReceiver, error: ethToCantoError } =
    await ethToCantoAddress(ethReceiver);
  if (ethToCantoError) {
    return NEW_ERROR("ibcInKeplr::" + ethToCantoError.message);
  }

  // get the channel number from the network
  const ibcChannel =
    IBC_CHANNELS[cosmosNetwork.id as keyof typeof IBC_CHANNELS];

  // check if chennel was found
  if (!ibcChannel || !ibcChannel.toCanto) {
    return NEW_ERROR("ibcInKeplr: invalid channel id: " + cosmosNetwork.id);
  }

  // get block timeout timestamp
  const { data: blockTimestamp, error: timestampError } =
    await getBlockTimestamp(
      getCosmosAPIEndpoint(CANTO_MAINNET_COSMOS.chainId).data
    );
  if (timestampError) {
    return NEW_ERROR("ibcInKeplr::" + timestampError.message);
  }

  return NO_ERROR([
    {
      chainId: cosmosNetwork.chainId,
      description: "IBC In",
      type: "KEPLR",
      tx: async () => {
        return await signAndBroadcastIBCKeplr(keplrClient.client, {
          cosmosAccount: cosmosSender,
          cantoReceiver: cantoReceiver,
          amount: amount,
          denom: ibcToken.nativeName,
          channelToCanto: ibcChannel.toCanto,
          timeoutTimestamp: Number(blockTimestamp),
          memo: "ibcInKeplr",
        });
      },
    },
  ]);
}

interface IBCKeplrParams {
  cosmosAccount: string;
  cantoReceiver: string;
  amount: string;
  denom: string;
  channelToCanto: string;
  timeoutTimestamp: number;
  memo: string;
}
/**
 * @notice signs and broadcasts an IBC transaction using keplr
 * @param {SigningStargateClient} keplrClient keplr client to use
 * @param {IBCKeplrParams} params parameters for the transaction
 * @returns {PromiseWithError<DeliverTxResponse>} response from the transaction or error
 */
async function signAndBroadcastIBCKeplr(
  keplrClient: SigningStargateClient,
  params: IBCKeplrParams
): PromiseWithError<DeliverTxResponse> {
  try {
    const ibcResponse = await keplrClient.sendIbcTokens(
      params.cosmosAccount,
      params.cantoReceiver,
      coin(params.amount, params.denom),
      "transfer",
      params.channelToCanto,
      undefined,
      params.timeoutTimestamp,
      "auto",
      params.memo
    );
    return NO_ERROR(ibcResponse);
  } catch (err) {
    return NEW_ERROR("signAndBroadcastIBCKeplr::" + (err as Error).message);
  }
}
