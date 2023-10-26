import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { getNetworkInfoFromChainId, isCosmosNetwork } from "../networks.utils";

/**
 * @notice connects to keplr and returns client and address
 * @param {string} cosmosChainId cosmos chain id to connect to
 * @returns {PromiseWithError<{client: SigningStargateClient, address: string}>} client and address or error
 */
export async function connectToKeplr(
  cosmosChainId: string
): PromiseWithError<{ client: SigningStargateClient; address: string }> {
  if (!window.keplr) {
    return NEW_ERROR("connectToKeplr: keplr not installed");
  }
  try {
    // get network and make sure it's cosmos
    const { data: network, error } = getNetworkInfoFromChainId(cosmosChainId);
    if (error) throw error;
    if (!isCosmosNetwork(network)) throw Error("invalid cosmos network");

    // try to connect
    await window.keplr.enable(network.chainId);
    const offlineSigner = window.keplr.getOfflineSigner(network.chainId);
    const accounts = await offlineSigner.getAccounts();
    if (!accounts.length) {
      return NEW_ERROR("connectToKeplr: no accounts found");
    }
    const client = await SigningStargateClient.connectWithSigner(
      network.rpcUrl,
      offlineSigner,
      {
        gasPrice: GasPrice.fromString(
          "300000" + network.nativeCurrency.baseName
        ),
      }
    );
    return NO_ERROR({ client, address: accounts[0].address });
  } catch (err) {
    return NEW_ERROR("connectToKeplr: " + errMsg(err));
  }
}
