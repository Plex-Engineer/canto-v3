import { BridgingMethod } from "@/transactions/bridge";

export type BridgeFeesByMethod =
  | LayerZeroFees
  | GravityBridgeFees
  | IBCFees
  | { method: null };

type LayerZeroFees = {
  method: BridgingMethod.LAYER_ZERO;
  lzFee: {
    description: string;
    amount: string;
    formattedAmount: string;
    // if the fee is in the same denom as the token being bridged
    feeInBridgeToken: boolean;
  };
};

type GravityBridgeFees = {
  method: BridgingMethod.GRAVITY_BRIDGE;
} & (
  | { direction: "in" }
  | {
      direction: "out";
      description: string;
      feeTokenPriceFormatted?: string;
      chainFeePercent: number;
      bridgeFeeOptions: {
        slow: string;
        medium: string;
        fast: string;
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
