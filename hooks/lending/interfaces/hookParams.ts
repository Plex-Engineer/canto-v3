import { CTokenWithUserData } from "./tokens";
import { UserLMPosition } from "./userPositions";
import { LendingMarketType } from "../config/cTokenAddresses";
import {
  CLMClaimRewardsTxParams,
  CTokenLendingTransactionParams,
  Vivacity,
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
  vcNote: Vivacity.VCNoteWithUserData | undefined;
  position: UserLMPosition;
  isLoading: boolean;
  selection: {
    selectedCToken:
      | CTokenWithUserData
      | Vivacity.VCNoteWithUserData
      | undefined;
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
    validateVivacityParams: (
      txParams: Vivacity.CTokenLendingTransactionParams
    ) => Validation;
    newVivacityLendingFlow: (
      txParams: Vivacity.CTokenLendingTransactionParams
    ) => NewTransactionFlow;
    newVivacityClaimRewardsFlow: (
      txParams: Vivacity.ClaimRewardsTxParams
    ) => NewTransactionFlow;
  };
}
