import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import {
  TX_DESCRIPTIONS,
  Transaction,
  TransactionDescription,
} from "@/transactions/interfaces";
import { getCantoBalance } from "@/utils/cosmos";
import BigNumber from "bignumber.js";
import { createMsgsSend } from "../messages/messageSend";
import { PUB_KEY_BOT_ADDRESS } from "@/config/consts/addresses";
import { getCantoCosmosNetwork } from "@/utils/networks";

export async function generateCantoPublicKeyWithTx(
  chainId: number,
  ethAddress: string,
  cantoAddress: string
): PromiseWithError<Transaction[]> {
  try {
    // get canto cosmos network
    const cantoNetwork = getCantoCosmosNetwork(chainId);
    if (!cantoNetwork) throw new Error("invalid chainId");
    // get current canto balance to see if enough canto for public key gen
    const { data: cantoBalance, error: cantoBalanceError } =
      await getCantoBalance(cantoNetwork.chainId, cantoAddress);
    if (cantoBalanceError) throw cantoBalanceError;

    const enoughCanto = new BigNumber(cantoBalance).gte("300000000000000000");

    // call on api to get canto for the account
    if (!enoughCanto) {
      const CANTO_DUST_BOT_API_URL = process.env.NEXT_PUBLIC_CANTO_DUST_BOT_URL;
      if (!CANTO_DUST_BOT_API_URL) throw new Error("invalid dust bot url");
      const botResponse = await fetch(CANTO_DUST_BOT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          canto_address: cantoAddress,
          eth_address: ethAddress,
        }),
      });
      if (!botResponse.ok) throw new Error(await botResponse.text());
    }
    return NO_ERROR([
      _generatePubKeyTx(
        chainId,
        cantoAddress,
        TX_DESCRIPTIONS.GENERATE_PUBLIC_KEY()
      ),
    ]);
  } catch (err) {
    return NEW_ERROR("generateCantoPublicKeyWithTx", err);
  }
}

const _generatePubKeyTx = (
  chainId: number,
  cantoSender: string,
  description: TransactionDescription
): Transaction => {
  const pubKeyTx = createMsgsSend({
    fromAddress: cantoSender,
    destinationAddress: PUB_KEY_BOT_ADDRESS,
    amount: "1",
    denom: "acanto",
  });
  return {
    chainId,
    type: "COSMOS",
    description,
    msg: pubKeyTx,
  };
};
