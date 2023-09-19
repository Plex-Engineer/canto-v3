import { ReturnWithError, NewTransactionFlow } from "@/config/interfaces";
import { CTokenLendingTransactionParams } from "./lendingTxTypes";
import { CTokenWithUserData } from "./tokens";
import { UserLMPosition } from "./userPositions";
import { CTokenType } from "../config/cTokenAddresses";

export interface LendingHookInputParams {
  chainId: number;
  cTokenType: CTokenType;
  userEthAddress?: string;
}

export interface LendingHookReturn {
  cTokens: CTokenWithUserData[];
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
