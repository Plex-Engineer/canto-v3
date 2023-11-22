import { CTokenWithUserData } from "./tokens";
import { UserLMPosition } from "./userPositions";
import { LendingMarketType } from "../config/cTokenAddresses";
import {
  CLMClaimRewardsTxParams,
  CTokenLendingTransactionParams,
} from "@/transactions/lending";
import { Validation } from "@/config/interfaces";
import { NewTransactionFlow } from "@/transactions/flows";

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
    validateParams: (txParams: CTokenLendingTransactionParams) => Validation;
    newLendingFlow: (
      txParams: CTokenLendingTransactionParams
    ) => NewTransactionFlow;
    newClaimRewardsFlow: (
      txParams: CLMClaimRewardsTxParams
    ) => NewTransactionFlow;
  };
}
