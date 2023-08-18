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
import { checkPubKey, ethToCantoAddress } from "@/utils/address.utils";
import { CANTO_MAINNET } from "@/config/networks";
import { getBlockTimestamp } from "../ibc";
import { getCosmosAPIEndpoint } from "@/config/consts/apiUrls";
import { Transaction } from "@/config/interfaces/transactions";

// will return keplr transaction to perform, this assums that the user has already signed and is connected
export async function ibcInKeplr(
  keplrClient: SigningStargateClient,
  cosmosNetwork: CosmosNetwork,
  cosmosSender: string,
  ethReceiver: string,
  ibcToken: IBCToken,
  amount: string
): PromiseWithError<Transaction[]> {
  // make parameter checks
  const { data: hasPubKey, error: checkPubKeyError } = await checkPubKey(
    ethReceiver,
    CANTO_MAINNET.chainId as number
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
      getCosmosAPIEndpoint(CANTO_MAINNET.chainId as number).data
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
        return await signAndBroadcastIBCKeplr(keplrClient, {
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
