import {
  RecoveryTokens,
  getRecoveryTokenList,
} from "@/utils/cosmos/nativeTokens.utils";
import { useEffect, useState } from "react";

interface RecoveryProps {
  chainId?: number;
  ethAccount?: string;
}
// only will work on canto chain
export default function useRecovery(props: RecoveryProps) {
  // native token list state
  const [recoveryTokens, setRecoveryTokens] = useState<RecoveryTokens>({
    convert: [],
    ibc: [],
  });

  // only call this when cantoAddress and cosmosChainId are changed (aka when props are changed)
  useEffect(() => {
    async function getTokens() {
      if (!props.chainId || !props.ethAccount) return;
      const { data, error } = await getRecoveryTokenList(
        props.chainId,
        props.ethAccount
      );
      if (error) {
        console.log(error);
        return;
      }
      setRecoveryTokens(data);
    }
    getTokens();
  }, [props.chainId, props.ethAccount]);

  return {
    recoveryTokens,
    hasRecoveryTokens:
      recoveryTokens.convert.length > 0 || recoveryTokens.ibc.length > 0,
    chainId: props.chainId ?? 0,
    ethAccount: props.ethAccount ?? "",
  };
}
