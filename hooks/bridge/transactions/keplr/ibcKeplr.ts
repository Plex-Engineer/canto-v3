import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { coin, SigningStargateClient } from "@cosmjs/stargate";
import { IBCToken } from "../../interfaces/tokens";
import { CosmosNetwork } from "@/config/interfaces/networks";
import IBC_CHANNELS from "@/config/jsons/ibcChannels.json";
import { checkPubKey, ethToCantoAddress } from "@/utils/address.utils";
import { CANTO_MAINNET } from "@/config/networks";
import { getBlockTimestamp } from "../ibc";
import { getCosmosAPIEndpoint } from "@/config/consts/apiUrls";

///
/// keplr transactions will not go through the normal transaction store since not through metamask
///

export async function ibcInKeplr(
  keplrClient: SigningStargateClient,
  cosmosNetwork: CosmosNetwork,
  cosmosSender: string,
  ethReceiver: string,
  ibcToken: IBCToken,
  amount: string
): PromiseWithError<any> {
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

  const { data: successfulIBC, error: ibcError } =
    await signAndBroadcastIBCKeplr(keplrClient, {
      cosmosAccount: cosmosSender,
      cantoReceiver: cantoReceiver,
      amount: amount,
      denom: ibcToken.nativeName,
      channelToCanto: ibcChannel.toCanto,
      timeoutTimestamp: Number(blockTimestamp),
      memo: "ibcInKeplr",
    });
  if (ibcError) {
    return NEW_ERROR("ibcInKeplr::" + ibcError.message);
  }
  return NO_ERROR(successfulIBC);
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
): PromiseWithError<boolean> {
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
    if (ibcResponse.code === 0) {
      return NO_ERROR(true);
    } else {
      return NEW_ERROR("signAndBroadcastIBCKeplr::" + ibcResponse.rawLog);
    }
  } catch (err) {
    return NEW_ERROR("signAndBroadcastIBCKeplr::" + (err as Error).message);
  }
}
