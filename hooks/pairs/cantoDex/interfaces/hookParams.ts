import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import {
  NewTransactionFlow,
  ReturnWithError,
  Validation,
} from "@/config/interfaces";
import { CantoDexPairWithUserCTokenData } from "./pairs";
import { CantoDexTransactionParams } from "./pairsTxTypes";

export interface CantoDexHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface CantoDexHookReturn {
  isLoading: boolean;
  pairs: CantoDexPairWithUserCTokenData[];
  position: UserLMPosition;
  transaction: {
    validateParams: (txParams: CantoDexTransactionParams) => Validation;
    createNewPairsFlow: (
      params: CantoDexTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
    newClaimRewardsFlow: () => NewTransactionFlow;
  };
}
