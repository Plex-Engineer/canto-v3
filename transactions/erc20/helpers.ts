import { ERC20_ABI } from "@/config/abis";
import { Transaction, TransactionDescription } from "../interfaces";

export const _approveTx = (
  chainId: number,
  ethAccount: string,
  tokenAddress: string,
  spender: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  fromAddress: ethAccount,
  chainId: chainId,
  type: "EVM",
  target: tokenAddress,
  abi: ERC20_ABI,
  method: "approve",
  params: [spender, amount],
  value: "0",
});
