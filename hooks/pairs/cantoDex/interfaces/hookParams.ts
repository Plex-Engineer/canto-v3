import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import {
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import { CantoDexPairWithUserCTokenData } from "./pairs";
import { CantoDexTransactionParams } from "./pairsTxTypes";

export interface CantoDexHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface CantoDexHookReturn {
  pairs: CantoDexPairWithUserCTokenData[];
  position: UserLMPosition;
  transaction: {
    validateParams: (txParams: CantoDexTransactionParams) => ValidationReturn;
    createNewPairsFlow: (
      params: CantoDexTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
