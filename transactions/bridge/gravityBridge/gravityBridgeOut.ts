import { hashMessage } from "@ethersproject/hash";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";
import { signatureToPubkey } from "@hanchon/signature-to-pubkey";

export async function gravityBridgeOutTx() {
  try {
    const accounts = await window?.ethereum?.request({
      method: "eth_requestAccounts",
    });
    // account has no key, create one
    const message = "Verify Public Key";
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, accounts[0], ""],
    });
    // Compress the key, since the client expects
    // public keys to be compressed.
    const uncompressedPk = recoverPublicKey(hashMessage(message), signature);
    const hexPk = computePublicKey(uncompressedPk, true);
    const pk = Buffer.from(hexPk.replace("0x", ""), "hex").toString("base64");
    console.log(pk);
  } catch (err) {
    console.log(err);
  }

  try {
    const accounts = await window?.ethereum?.request({
      method: "eth_requestAccounts",
    });
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [accounts[0], "generate_pubkey"],
    });
    console.log(
      signatureToPubkey(
        signature,
        Buffer.from([
          50, 215, 18, 245, 169, 63, 252, 16, 225, 169, 71, 95, 254, 165, 146,
          216, 40, 162, 115, 78, 147, 125, 80, 182, 25, 69, 136, 250, 65, 200,
          94, 178,
        ])
      )
    );
  } catch (err) {
    console.log(err);
  }
}
