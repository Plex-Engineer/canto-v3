import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { checkTokenAllowance } from "@/utils/tokens";
import { Transaction, TX_DESCRIPTIONS } from "../interfaces";
import { _approveTx } from ".";

/**
 * @notice creates a transaction to approve a token
 * @dev must be the same spender for all tokens
 * @param {number} chainId chainId to create transaction for
 * @param {string} ethAccount ethereum account of user
 * @param {{address: string; symbol: string;}[]} tokens token addresses to approve
 * @param {string[]} amounts amounts to approve for each token
 * @param {{ address: string; name: string }} spender ethereum spender
 * @returns {Transaction} transactions to approve tokens
 */
export async function createApprovalTxs(
  chainId: number,
  ethAccount: string,
  tokens: { address: string; symbol: string }[],
  amounts: string[],
  spender: { address: string; name: string }
): PromiseWithError<Transaction[]> {
  // make param checks
  if (tokens.length !== amounts.length) {
    return NEW_ERROR(
      "createApprovalTxs::tokenAddresses and amounts must be same length"
    );
  }
  /** create tx list */
  const txList: Transaction[] = [];
  // check allowance for each token
  const allowanceChecks = await Promise.all(
    tokens.map(async (token, index) =>
      checkTokenAllowance(
        chainId,
        token.address,
        ethAccount,
        spender.address,
        amounts[index]
      )
    )
  );
  if (allowanceChecks.some((check) => check.error)) {
    return NEW_ERROR("createApprovalTxs: error getting token allowances");
  }
  // create tx for each token that needs approval
  allowanceChecks.forEach((check, index) => {
    if (!check.data) {
      txList.push(
        _approveTx(
          chainId,
          ethAccount,
          tokens[index].address,
          spender.address,
          amounts[index],
          TX_DESCRIPTIONS.APPROVE_TOKEN(tokens[index].symbol, spender.name)
        )
      );
    }
  });
  // return tx list
  return NO_ERROR(txList);
}
