import {
  getGravityBridgeFeesFromToken,
  getGravityChainFeeInPercent,
} from "@/transactions/bridge/gravityBridge/gravityFees";
import { percentOfAmount } from "@/utils/math";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useState } from "react";
import { BridgeToken } from "./interfaces/tokens";

/**
 * Hook for getting and setting gravity bridge sendToEth fees
 */
interface GravityFeesProps {
  token: BridgeToken | null;
  amount: string;
}
type GravityFeesReturn = {
  isLoading: boolean;
  error: null | string;
  chainFee: {
    percent: number | null;
    amount: string | null;
  };
  bridgeFee: {
    options: {
      slow: string;
      medium: string;
      fast: string;
    } | null;
    selectedFee: string;
    setSelectedFee: (fee: string) => void;
  };
  maxBridgeAmount: string;
};
export default function useGravityFees(
  props: GravityFeesProps
): GravityFeesReturn {
  // error and loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // fee states
  const [chainFeePercent, setChainFeePercent] = useState<number | null>(null);
  const [bridgeFeeOptions, setBridgeFeeOptions] = useState<{
    slow: string;
    medium: string;
    fast: string;
  } | null>(null);
  const [selectedBridgeFee, setSelectedBridgeFee] = useState<string>("0");

  // on load, get gravity chain fee percent (will not change during session)
  useEffect(() => {
    async function gravityChainFee() {
      const { data, error } = await getGravityChainFeeInPercent();
      if (error) {
        setError(error.message);
      } else {
        setError(null);
        setChainFeePercent(data);
      }
      setIsLoading(false);
    }
    gravityChainFee();
  }, []);

  // whenever the token address changes, get the bridge fees
  useEffect(() => {
    async function gravityBridgeFees() {
      if (!props.token || !props.token.address) {
        setError("No token selected");
        return;
      }
      setIsLoading(true);
      setSelectedBridgeFee("0");
      const { data, error } = await getGravityBridgeFeesFromToken(
        props.token.address
      );
      if (error) {
        setError(error.message);
      } else {
        setError(null);
        setBridgeFeeOptions(data);
        setSelectedBridgeFee(data.fast);
      }
      setIsLoading(false);
    }
    gravityBridgeFees();
  }, [props.token?.id]);

  // calculate max bridge amount
  const maxBridgeAmount = useMemo(() => {
    if (!chainFeePercent || !props.token?.balance) return "0";
    // max will be determined balance / (1 + chainFeePercent) minus the selected bridge fee
    const max = new BigNumber(props.token.balance)
      .dividedBy(1 + chainFeePercent)
      .minus(selectedBridgeFee ?? "0");
    // return max if it is greater than 0, otherwise return 0
    return max.isGreaterThan(0) ? max.integerValue().toString() : "0";
  }, [props.token, selectedBridgeFee, chainFeePercent]);

  return {
    isLoading,
    error,
    chainFee: {
      percent: chainFeePercent,
      amount: chainFeePercent
        ? percentOfAmount(props.amount, chainFeePercent).data
        : null,
    },
    bridgeFee: {
      options: bridgeFeeOptions,
      selectedFee: selectedBridgeFee,
      setSelectedFee: setSelectedBridgeFee,
    },
    maxBridgeAmount,
  };
}
