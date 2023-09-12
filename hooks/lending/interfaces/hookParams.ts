import { ReturnWithError } from "@/config/interfaces/errors";
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
  canPerformLendingTx: (
    txParams: CTokenLendingTransactionParams
  ) => ReturnWithError<boolean>;
  error: unknown;
}
