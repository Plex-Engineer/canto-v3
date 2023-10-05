import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import { PairWithUserCTokenData } from "./pairs";
import { PairsTransactionParams } from "./pairsTxTypes";
import {
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";

export interface PairsHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface PairsHookReturn {
  pairs: PairWithUserCTokenData[];
  position: UserLMPosition;
  selection: {
    pair: PairWithUserCTokenData | undefined;
    setPair: (pairAddress: string | null) => void;
  };
  transaction: {
    validateParams: (txParams: PairsTransactionParams) => ValidationReturn;
    createNewPairsFlow: (
      params: PairsTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
