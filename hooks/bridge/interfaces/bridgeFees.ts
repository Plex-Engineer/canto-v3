import { BridgingMethod } from "@/transactions/bridge";

export type BridgeFeesByMethod =
  | LayerZeroFees
  | GravityBridgeFees
  | IBCFees
  | { method: null };

type LayerZeroFees = {
  direction: "in" | "out";
  method: BridgingMethod.LAYER_ZERO;
  lzFee: {
    description: string;
    amount: string;
    formattedAmount: string;
    // if the fee is in the same denom as the token being bridged
    feeInBridgeToken: boolean;
  };
};
type FeeTier = {
  fee: string;
  usdValueFormatted: string;
};
type GravityBridgeFees = {
  method: BridgingMethod.GRAVITY_BRIDGE;
} & (
  | { direction: "in" }
  | {
      direction: "out";
      description: string;
      chainFeePercent: number;
      bridgeFeeOptions: {
        slow: FeeTier;
        medium: FeeTier;
        fast: FeeTier;
      };
      gasFees: TransactionGasFee[];
    }
);

type IBCFees = {
  method: BridgingMethod.IBC;
} & (
  | { direction: "in" }
  | {
      direction: "out";
      gasFees: TransactionGasFee[];
    }
);

type TransactionGasFee = {
  name: string;
  amount: string;
};
