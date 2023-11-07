import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { getNetworkInfoFromChainId, isCosmosNetwork } from "../networks";

/**
 * @notice connects to keplr and returns client and address
 * @param {string} cosmosChainId cosmos chain id to connect to
 * @returns {PromiseWithError<{client: SigningStargateClient, address: string}>} client and address or error
 */
export async function connectToKeplr(
  cosmosChainId: string
): PromiseWithError<{ client: SigningStargateClient; address: string }> {
  try {
    if (!window.keplr) throw Error("keplr not installed");
    // get network and make sure it's cosmos
    const { data: network, error } = getNetworkInfoFromChainId(cosmosChainId);
    if (error) throw error;
    if (!isCosmosNetwork(network)) throw Error("invalid cosmos network");

    // try to connect
    await window.keplr.enable(network.chainId);
    const offlineSigner = window.keplr.getOfflineSigner(network.chainId);
    const accounts = await offlineSigner.getAccounts();
    if (!accounts.length) throw Error("no accounts found");

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
    return NEW_ERROR("connectToKeplr", err);
  }
}
