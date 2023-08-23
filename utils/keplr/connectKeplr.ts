import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { CosmosNetwork } from "@/config/interfaces/networks";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";

/**
 * @notice connects to keplr and returns client and address
 * @param {CosmosNetwork} cosmosNetwork cosmos network to connect to
 * @returns {PromiseWithError<{client: SigningStargateClient, address: string}>} client and address or error
 */
export async function connectToKeplr(
  cosmosNetwork: CosmosNetwork
): PromiseWithError<{ client: SigningStargateClient; address: string }> {
  if (!window.keplr) {
    return NEW_ERROR("connectToKeplr: keplr not installed");
  }
  try {
    await window.keplr.enable(cosmosNetwork.chainId);
    const offlineSigner = window.keplr.getOfflineSigner(cosmosNetwork.chainId);
    const accounts = await offlineSigner.getAccounts();
    if (!accounts.length) {
      return NEW_ERROR("connectToKeplr: no accounts found");
    }
    const client = await SigningStargateClient.connectWithSigner(
      cosmosNetwork.rpcUrl,
      offlineSigner,
      {
        gasPrice: GasPrice.fromString(
          "300000" + cosmosNetwork.nativeCurrency.baseName
        ),
      }
    );
    return NO_ERROR({ client, address: accounts[0].address });
  } catch (err) {
    return NEW_ERROR("connectToKeplr: " + (err as Error).message);
  }
}
