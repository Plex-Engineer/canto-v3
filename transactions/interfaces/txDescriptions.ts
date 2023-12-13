import { CantoDexPair } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { CTokenLendingTxTypes } from "@/transactions/lending";

export const TX_DESCRIPTIONS = {
  ADD_LIQUIDITY: (pair: CantoDexPair, amount1: string, amount2: string) => ({
    title: `Add Liquidity To ${pair.symbol}`,
    description: `Add ${amount1} ${pair.token1.symbol} and ${amount2} ${pair.token2.symbol} to ${pair.symbol}`,
  }),
  ADD_AMBIENT_CONC_LIQ: () => ({
    title: "Add Concentrated Liquidity",
    description: "Add concentrated liquidity to the pool",
  }),
  APPROVE_TOKEN: (tokenSymbol: string, spender: string) => ({
    title: `Approve ${tokenSymbol}`,
    description: `Give ${spender} approval to move ${tokenSymbol}`,
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
  CLAIM_REWARDS: (amount: string, tokenSymbol: string, location: string) => ({
    title: `Claim ${location} Rewards`,
    description: `Claim ${amount} ${tokenSymbol} in ${location} rewards`,
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
      collateralize ? "Collateralize" : "Decollateralize"
    } ${tokenSymbol}`,
    description: `${
      collateralize ? "Collateralize" : "Decollateralize"
    } ${tokenSymbol} in the lending market`,
  }),
  DRIP_COMPTROLLER: () => ({
    title: "Drip Comptroller",
    description: "Drip WCANTO rewards to the lending market from the reservoir",
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
  REMOVE_AMBIENT_CONC_LIQ: () => ({
    title: "Remove Concentrated Liquidity",
    description: "Remove concentrated liquidity from the pool",
  }),
  REMOVE_LIQUIDITY: (pair: CantoDexPair, amount: string) => ({
    title: `Remove Liquidity From ${pair.symbol}`,
    description: `Remove ${amount} ${pair.symbol} from ${pair.symbol}`,
  }),
  WRAP_ETH: (amount: string) => ({
    title: "Wrap ETH",
    description: `Wrap ${amount} ETH to WETH`,
  }),
};
