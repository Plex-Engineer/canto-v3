import { ReturnWithError, NewTransactionFlow } from "@/config/interfaces";
import { CTokenLendingTransactionParams } from "./lendingTxTypes";
import { CTokenWithUserData } from "./tokens";
import { UserLMPosition } from "./userPositions";
import { LendingMarketType } from "../config/cTokenAddresses";

export interface LendingHookInputParams {
  chainId: number;
  lmType: LendingMarketType;
  userEthAddress?: string;
}

export interface LendingHookReturn {
  cTokens: CTokenWithUserData[];
  position: UserLMPosition;
  isLoading: boolean;
  selection: {
    selectedCToken: CTokenWithUserData | undefined;
    setSelectedCToken: (cTokenAddress: string | null) => void;
  };
  transaction: {
    canPerformLendingTx: (
      txParams: CTokenLendingTransactionParams
    ) => ReturnWithError<boolean>;
    createNewLendingFlow: (
      params: CTokenLendingTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
