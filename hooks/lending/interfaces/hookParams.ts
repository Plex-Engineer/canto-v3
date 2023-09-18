import { ReturnWithError, NewTransactionFlow } from "@/config/interfaces";
import { CTokenLendingTransactionParams } from "./lendingTxTypes";
import { CTokenWithUserData } from "./tokens";
import { UserLMPosition } from "./userPositions";

export interface LendingHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface LendingHookReturn {
  tokens: CTokenWithUserData[];
  position: UserLMPosition;
  loading: boolean;
  cNote: CTokenWithUserData;
  transaction: {
    canPerformLendingTx: (
      txParams: CTokenLendingTransactionParams
    ) => ReturnWithError<boolean>;
    createNewLendingFlow: (
      params: CTokenLendingTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
