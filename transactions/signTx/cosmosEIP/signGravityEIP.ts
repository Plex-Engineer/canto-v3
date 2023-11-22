import { NEW_ERROR, PromiseWithError } from "@/config/interfaces";
import { Transaction } from "@/transactions/interfaces";
import { GetWalletClientResult } from "wagmi/actions";
import { generateCosmosEIP712TxContext } from "./txContext";
import { createTxMsgSend } from "@evmos/transactions";
import { hashMessage } from "@ethersproject/hash";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";
import { gravityToEth } from "@gravity-bridge/address-converter";
import { createTxRaw } from "@evmos/proto";
import {
  generateEndpointBroadcast,
  generatePostBodyBroadcast,
} from "@evmos/provider";

export async function signCosmosEIP712Tx(
  tx: Transaction,
  signer?: GetWalletClientResult
): PromiseWithError<string> {
  try {
    const { data: context, error } = await generateCosmosEIP712TxContext(
      999999,
      signer.account.address
    );
    if (error) throw error;

    if (!context.senderObj.pubkey) {
      const accounts = await window?.ethereum?.request({
        method: "eth_requestAccounts",
      });

      // Handle errors if MetaMask fails to return any accounts.
      const message = "Verify Public Key";

      const signature = await window?.ethereum?.request({
        method: "personal_sign",
        params: [message, accounts[0], ""],
      });

      // Compress the key, since the client expects
      // public keys to be compressed.
      const uncompressedPk = recoverPublicKey(hashMessage(message), signature);

      const hexPk = computePublicKey(uncompressedPk, true);
      const pk = Buffer.from(hexPk.replace("0x", ""), "hex").toString("base64");
      context.senderObj.pubkey = pk;
    }
    const fee = {
      amount: "0",
      denom: "ugraviton",
      gas: "200000",
    };
    const txParams = {
      destinationAddress: "gravity1qqzky5czd8jtxp7k96w0d9th2vjxcxaeyxgjqz",
      amount: "1000000",
      denom: "ugraviton",
    };
    const txData = createTxMsgSend(
      {
        chain: context.chainObj,
        sender: context.senderObj,
        fee,
        memo: "signed with metamask",
      },
      txParams
    );
    const senderHexAddress = gravityToEth(context.senderObj.accountAddress);
    const eip712Payload = JSON.stringify(txData.eipToSign);

    const signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [senderHexAddress, eip712Payload],
    });

    const signatureBytes = Buffer.from(signature.replace("0x", ""), "hex");

    const { signDirect } = txData;
    const bodyBytes = signDirect.body.toBinary();
    const authInfoBytes = signDirect.authInfo.toBinary();

    const signedTx = createTxRaw(bodyBytes, authInfoBytes, [signatureBytes]);

    const postOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: generatePostBodyBroadcast(signedTx),
    };

    const broadcastEndpoint = `${"https://gravitychain.io:1317"}${generateEndpointBroadcast()}`;
    const broadcastPost = await fetch(broadcastEndpoint, postOptions);

    const response = await broadcastPost.json();
    console.log(response);
  } catch (err) {
    return NEW_ERROR("signCosmosEIP712Tx", err);
  }
}
