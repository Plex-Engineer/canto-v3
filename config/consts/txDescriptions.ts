import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { Pair } from "@/hooks/pairs/interfaces/pairs";

export const TX_DESCRIPTIONS = {
  ADD_LIQUIDITY: (pair: Pair, amount1: string, amount2: string) => ({
    title: `Add Liquidity To ${pair.symbol}`,
    description: `Add ${amount1} ${pair.token1.symbol} and ${amount2} ${pair.token2.symbol} to ${pair.symbol}`,
  }),
  APPROVE_TOKEN: (tokenSymbol: string, spender: string) => ({
    title: `Approve ${tokenSymbol}`,
    description: `Give the ${spender} approval to move ${tokenSymbol}`,
  }),
  BRIDGE: (
    tokenSymbol: string,
    amount: string,
    fromNetwork: string,
    toNetwork: string,
    method: string
  ) => ({
    title: `Send ${tokenSymbol} to ${toNetwork} from ${fromNetwork}`,
    description: `Send ${amount} ${tokenSymbol} to ${toNetwork} from ${fromNetwork} through ${method}`,
  }),
  CONVERT_ERC20: (tokenSymbol: string, amount: string) => ({
    title: `Convert ${tokenSymbol}`,
    description: `Convert ${amount} ${tokenSymbol} to native token`,
  }),
  CONVERT_COIN: (tokenSymbol: string, amount: string) => ({
    title: `Convert ${tokenSymbol}`,
    description: `Convert ${amount} ${tokenSymbol} from native token to ERC20 token`,
  }),
  CTOKEN_LENDING: (
    txType: CTokenLendingTxTypes,
    tokenSymbol: string,
    amount: string
  ) => ({
    title: `${txType} ${tokenSymbol}`,
    description: `${txType} ${amount} ${tokenSymbol} ${
      txType === CTokenLendingTxTypes.SUPPLY ||
      txType === CTokenLendingTxTypes.REPAY
        ? "to"
        : "from"
    } the lending market`,
  }),
  CTOKEN_COLLATERALIZE: (tokenSymbol: string, collateralize: boolean) => ({
    title: `${
      collateralize ? "Collateralize" : "Uncollateralize"
    } ${tokenSymbol}`,
    description: `${
      collateralize ? "Collateralize" : "Uncollateralize"
    } ${tokenSymbol} in the lending market`,
  }),
  GENERATE_PUBLIC_KEY: () => ({
    title: "Generate Public Key",
    description: "Generate a public key",
  }),
  OFT_DEPOSIT_OR_WITHDRAW: (
    tokenSymbol: string,
    amount: string,
    deposit: boolean
  ) => ({
    title: `${deposit ? "Wrap" : "Unwrap"} ${tokenSymbol}`,
    description: `${deposit ? "Wrap" : "Unwrap"} ${amount} ${tokenSymbol} ${
      deposit ? "to" : "from"
    } ${tokenSymbol} OFT`,
  }),
  REMOVE_LIQUIDITY: (pair: Pair, amount: string) => ({
    title: `Remove Liquidity From ${pair.symbol}`,
    description: `Remove ${amount} ${pair.symbol} from ${pair.symbol}`,
  }),
  WRAP_ETH: (amount: string) => ({
    title: "Wrap ETH",
    description: `Wrap ${amount} ETH to WETH`,
  }),
};
