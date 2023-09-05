import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";

export const TX_DESCRIPTIONS = {
  APPROVE_TOKEN: (tokenSymbol: string, spender: string) =>
    `Approve ${tokenSymbol} for ${spender}`,
  BRIDGE: (
    tokenSymbol: string,
    amount: string,
    fromNetwork: string,
    toNetwork: string
  ) => `Bridge ${amount} ${tokenSymbol} from ${fromNetwork} to ${toNetwork}`,
  CONVERT_ERC20: (tokenSymbol: string, amount: string) =>
    `Convert ${amount} ${tokenSymbol} to native token`,
  CONVERT_COIN: (tokenSymbol: string, amount: string) =>
    `Convert ${amount} ${tokenSymbol} to ECR20 token`,

  CTOKEN_LENDING: (
    txType: CTokenLendingTxTypes,
    tokenSymbol: string,
    amount: string
  ) => `${txType} ${amount} ${tokenSymbol}`,
  CTOKEN_COLLATERALIZE: (tokenSymbol: string, collateralize: boolean) => `
    ${collateralize ? "Collateralize" : "Decollateralize"} ${tokenSymbol}`,
  GENERATE_PUBLIC_KEY: () => `Generate public key`,
  OFT_DEPOSIT_OR_WITHDRAW: (
    tokenSymbol: string,
    amount: string,
    deposit: boolean
  ) =>
    `${deposit ? "Deposit" : "Withdraw"} ${amount} ${tokenSymbol} ${
      deposit ? "to" : "from"
    } OFT`,
  WRAP_ETH: (amount: string) => `Wrap ${amount} ETH to WETH`,
};
