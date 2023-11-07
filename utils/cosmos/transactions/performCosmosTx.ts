import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
} from "@/config/interfaces";
import { GetWalletClientResult } from "wagmi/actions";
import {
  getSenderObj,
  signAndBroadcastCosmosTransaction,
} from "./helpers.utils";
import { ethToCantoAddress } from "@/utils/address";
import { tryFetchWithRetry } from "@/utils/async";
import { checkOnRightChain } from "@/utils/evm";
import { getCosmosAPIEndpoint, getCosmosChainObject } from "@/utils/networks";

/**
 * @notice performs a cosmos transaction through metamask EIP712
 * @dev this only performs EIP712 transactions through eth wallet on Canto
 * @param {Transaction} tx Transaction parameters
 * @param {GetWalletClientResult} signer eth signer information, (wallet client)
 * @returns {string} txhash or error
 */
export async function performCosmosTransactionEIP(
  tx: Transaction,
  signer?: GetWalletClientResult
): PromiseWithError<string> {
  try {
    if (tx.type !== "COSMOS") throw Error("not cosmos tx");
    if (!signer) throw Error("no signer");
    if (typeof tx.chainId !== "number")
      throw Error("invalid chainId: " + tx.chainId);

    // switch chains if neccessary and get correct signer
    const { data: newSigner, error: chainError } = await checkOnRightChain(
      signer,
      tx.chainId
    );
    if (chainError || !newSigner) throw chainError;

    // need to obtain the eth signer canto address
    const { data: cantoAddress, error: ethToCantoError } =
      await ethToCantoAddress(newSigner.account.address);
    if (ethToCantoError) throw ethToCantoError;

    // create transaction context
    const { data: chainObj, error: chainObjError } = getCosmosChainObject(
      tx.chainId
    );
    if (chainObjError) throw chainObjError;

    // get sender object
    const { data: senderObj, error: senderObjError } = await getSenderObj(
      cantoAddress,
      tx.chainId,
      true
    );
    if (senderObjError) throw senderObjError;

    const { data: txData, error: txError } =
      await signAndBroadcastCosmosTransaction(
        {
          chain: chainObj,
          sender: senderObj,
          fee: tx.msg.fee,
          memo: "signed with metamask",
          ethAddress: newSigner.account.address,
        },
        tx.msg
      );
    if (txError) throw txError;

    if (txData.tx_response.code !== 0) throw Error(txData.tx_response.raw_log);

    return NO_ERROR(txData.tx_response.txhash);
  } catch (err) {
    return NEW_ERROR("performCosmosTransactionEIP", err);
  }
}

export async function waitForCosmosTx(
  chainId: string | number,
  txHash: string
): PromiseWithError<{
  status: string;
  error: any;
}> {
  const { data: endpoint, error: endpointError } =
    getCosmosAPIEndpoint(chainId);
  if (endpointError) {
    return NEW_ERROR("waitForTransaction", endpointError);
  }
  const { data: response, error: fetchError } = await tryFetchWithRetry<{
    tx_response: {
      code: number;
      raw_log: string;
    };
  }>(endpoint + "/cosmos/tx/v1beta1/txs/" + txHash, 5);
  if (fetchError) {
    return NEW_ERROR("waitForTransaction", fetchError);
  }
  return NO_ERROR({
    status: response.tx_response.code === 0 ? "success" : "fail",
    error: response.tx_response.raw_log,
  });
}
