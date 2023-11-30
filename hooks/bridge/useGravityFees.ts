import {
  getGravityBridgeFeesFromToken,
  getGravityChainFeeInPercent,
} from "@/transactions/bridge/gravityBridge/gravityFees";
import { percentOfAmount } from "@/utils/math";
import BigNumber from "bignumber.js";
import { useEffect, useMemo, useState } from "react";

/**
 * Hook for getting and setting gravity bridge sendToEth fees
 */
interface GravityFeesProps {
  balance?: string;
  amount: string;
  address?: string;
}
interface GravityFeesReturn {
  isLoading: boolean;
  error: string | null;
  chainFee: string; // percent of amount
  bridgeFeeOptions: {
    slow: string;
    medium: string;
    fast: string;
  } | null; // options for speed
  selectedBridgeFee: string | null;
  setSelectedBridgeFee: (fee: string) => void;
  maxBridgeAmount: string;
}
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
      setIsLoading(true);
      setSelectedBridgeFee("0");
      if (!props.address) return;
      const { data, error } = await getGravityBridgeFeesFromToken(
        props.address
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
  }, [props.address]);

  // calculate max bridge amount
  const maxBridgeAmount = useMemo(() => {
    if (!chainFeePercent || !props.balance) return "0";
    // max will be determined balance / (1 + chainFeePercent) minus the selected bridge fee
    const max = new BigNumber(props.balance)
      .dividedBy(1 + chainFeePercent)
      .minus(selectedBridgeFee ?? "0");
    // return max if it is greater than 0, otherwise return 0
    return max.isGreaterThan(0) ? max.integerValue().toString() : "0";
  }, [props.balance, props.address, selectedBridgeFee, chainFeePercent]);

  const currentChainFee =
    percentOfAmount(props.amount, chainFeePercent ?? 0).data ?? "0";
  return {
    isLoading,
    error,
    chainFee: currentChainFee,
    bridgeFeeOptions,
    selectedBridgeFee,
    setSelectedBridgeFee,
    maxBridgeAmount,
  };
}
