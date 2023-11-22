import { UserLMPosition } from "@/hooks/lending/interfaces/userPositions";
import { CantoDexPairWithUserCTokenData } from "./pairs";
import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";
import { Validation } from "@/config/interfaces";
import { NewTransactionFlow } from "@/transactions/flows";

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
    newCantoDexLPFlow: (
      params: CantoDexTransactionParams
    ) => NewTransactionFlow;
    newClaimRewardsFlow: () => NewTransactionFlow;
  };
}
