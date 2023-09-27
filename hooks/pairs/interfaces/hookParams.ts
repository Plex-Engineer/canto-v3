import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import { PairWithUserCTokenData } from "./pairs";
import { PairsTransactionParams } from "./pairsTxTypes";
import {
  NewTransactionFlow,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces";

export interface PairsHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface PairsHookReturn {
  pairs: PairWithUserCTokenData[];
  position: UserLMPosition;
  amounts: {
    getOptimalAmount1: (
      amount: string,
      pair: PairWithUserCTokenData
    ) => PromiseWithError<string>;
    getOptimalAmount2: (
      amount: string,
      pair: PairWithUserCTokenData
    ) => PromiseWithError<string>;
  };
  selection: {
    pair: PairWithUserCTokenData | undefined;
    setPair: (pairAddress: string | null) => void;
  };
  transaction: {
    canPerformPairsTx: (
      txParams: PairsTransactionParams
    ) => ReturnWithError<boolean>;
    createNewPairsFlow: (
      params: PairsTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
