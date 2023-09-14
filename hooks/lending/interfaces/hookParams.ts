import { ReturnWithError } from "@/config/interfaces/errors";
import { CTokenLendingTransactionParams } from "./lendingTxTypes";
import { CTokenWithUserData } from "./tokens";
import { UserLMPosition } from "./userPositions";
import { NewTransactionFlow } from "@/config/interfaces/transactions";

export interface LendingHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface LendingHookReturn {
  tokens: CTokenWithUserData[];
  position: UserLMPosition;
  loading: boolean;
  transaction: {
    canPerformLendingTx: (
      txParams: CTokenLendingTransactionParams
    ) => ReturnWithError<boolean>;
    createNewLendingFlow: (
      params: CTokenLendingTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
