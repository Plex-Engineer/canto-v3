// how transactions are stored for the user (will allow retrying creating transactions)

import { TransactionFlowType } from ".";
import { BridgeTransactionParams } from "../bridge";
import {
  CantoFETxType,
  TransactionDescription,
  TransactionStatus,
  TransactionWithStatus,
} from "../interfaces";
import { AnalyticsTransactionFlowInfo } from "@/provider/analytics";
import {
  AmbientClaimRewardsTxParams,
  AmbientTransactionParams,
} from "../pairs/ambient";
import { CantoDexTransactionParams } from "../pairs/cantoDex";
import { ClaimDexComboRewardsParams } from "@/hooks/pairs/lpCombo/transactions/claimRewards";
import {
  CLMClaimRewardsTxParams,
  CTokenLendingTransactionParams,
} from "../lending";
import { StakingTransactionParams } from "../staking";
import { ProposalVoteTxParams } from "../gov";

// txType is the key for the txMap that will create the Transaction[] list
export type NewTransactionFlow = {
  title: string;
  icon: string;
  // for importing tokens from tx list
  tokenMetadata?: {
    chainId: number;
    address: string;
    symbol: string;
    decimals: number;
    icon: string;
  }[];
} & (
  | {
      txType: TransactionFlowType.BRIDGE;
      params: BridgeTransactionParams;
    }
  | {
      txType: TransactionFlowType.AMBIENT_LIQUIDITY_TX;
      params: AmbientTransactionParams;
    }
  | {
      txType: TransactionFlowType.AMBIENT_CLAIM_REWARDS_TX;
      params: AmbientClaimRewardsTxParams;
    }
  | {
      txType:
        | TransactionFlowType.CANTO_DEX_LP_TX
        | TransactionFlowType.CANTO_DEX_STAKE_LP_TX;
      params: CantoDexTransactionParams;
    }
  | {
      txType: TransactionFlowType.LP_COMBO_CLAIM_REWARDS_TX;
      params: ClaimDexComboRewardsParams;
    }
  | {
      txType: TransactionFlowType.CLM_CTOKEN_TX;
      params: CTokenLendingTransactionParams;
    }
  | {
      txType: TransactionFlowType.CLM_CLAIM_REWARDS_TX;
      params: CLMClaimRewardsTxParams;
    }
  | {
      txType: TransactionFlowType.STAKE_CANTO_TX;
      params: StakingTransactionParams;
    }
  | {
      txType: TransactionFlowType.VOTE_TX;
      params: ProposalVoteTxParams;
    }
);

///
/// Transaction Flows will include multiple transactions
/// Flow will have the title of the overal "transaction flow"
/// Flow will have a status
/// placeholder flows will only be called AFTER the first set of transactions are completed and successful
///
export type TransactionFlow = NewTransactionFlow & {
  id: string;
  status: TransactionStatus; //yes
  createdAt: number;
  transactions: TransactionWithStatus[]; //yes
  placeholderFlow?: NewTransactionFlowPlaceholder; //yes
  error?: string; //yes
  analyticsTransactionFlowInfo?: AnalyticsTransactionFlowInfo;
  onSuccessCallback?: () => void;
};

// user can be on different accounts to make transactions, so we need to map the transaction flows to the account
// index by account address
export type UserTransactionFlowMap = Map<string, TransactionFlow[]>;

// some transaction flows will have another set of transactions that rely on returned data from the first set of transactions
// there must be a placeholder to store this tx, and the paramters that will be needed to create this second set of transactions
export type NewTransactionFlowPlaceholder = {
  description: TransactionDescription;
  txFlowType: TransactionFlowType;
  params: object;
};

// create const to use for placeholder flows to show in modal
export const TX_PLACEHOLDER = (
  placeholder: NewTransactionFlowPlaceholder
): TransactionWithStatus => ({
  tx: {
    feTxType: CantoFETxType.NONE,
    fromAddress: "",
    chainId: 0,
    description: placeholder.description,
    type: "KEPLR",
    tx: async () => ({
      error: Error("placeholder tx"),
      data: null,
    }),
    getHash: () => ({
      error: Error("placeholder tx"),
      data: "",
    }),
  },
  status: "NONE",
});
