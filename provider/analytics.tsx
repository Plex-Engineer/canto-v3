"use client";

import { BridgingMethodName } from "@/transactions/bridge";
import { TransactionFlowType } from "@/transactions/flows";
import { CantoFETxType } from "@/transactions/interfaces";
import { CTokenLendingTxTypes } from "@/transactions/lending";
import { CantoDexTxTypes } from "@/transactions/pairs/cantoDex";
import { AmbientTxType } from "@/transactions/pairs/ambient";
import posthog from "posthog-js";

// (BRIDGE/LP/LENDING/...)
type AnalyticsTransactionFlowCategory = TransactionFlowType;
// (SUPPLY/WITHDRAW/GBRIDGE/LAYERZERO/LPANDSTAKE/...)
type AnalyticsTransactionFlowType =
  | CantoDexTxTypes
  | AmbientTxType
  | CTokenLendingTxTypes
  | BridgingMethodName
  | string;


export type AnalyticsBridgeData = {
  bridgeFrom: string;
  bridgeTo: string;
  bridgeAsset: string;
  bridgeAmount: string;
}

export type AnalyticsCantoLPData = {
  lpType?: string;
  cantoLp?: string;
  cantoLpToken1?: string;
  cantoLpToken2?: string;
  cantoLpAmount1?: string;
  cantoLpAmount2?: string;
  cantoLpBalance1?: string;
  cantoLpBalance2?: string;
  cantoLpTokenAmount?: string;
  cantoLpTokenBalance?: string;
  cantoLpExpectedAmount1?: string;
  cantoLpStakedBalance?: string;
  cantoLpUnstakedBalance?: string;
  cantoLpExpectedAmount2?: string;
  cantoLpSlippage?: Number;
  cantoLpDeadline?: string;
  cantoLpStakeStatus?: boolean;
}

type AnalyticsAmbientLPPositionData = {
  ambientLPPositionId?: string;
  ambientLpLiquidity?: string;
  ambientLpMinRangePrice?: string;
  ambientLpMaxRangePrice?: string;
}

export type AnalyticsAmbientLPData = {
  lpType?: string;
  ambientLp?: string;
  ambientLpBaseToken?: string;
  ambientLpQuoteToken?: string;
  ambientLpBaseAmount?: string;
  ambientLpQuoteAmount?: string;
  ambientLpBaseBalance?: string;
  ambientLpQuoteBalance?: string;
  ambientLpCurrentPrice?: string;
  ambientLpMinExecPrice?: string;
  ambientLpMaxExecPrice?: string;
  ambientLpExpectedBaseAmount?: string;
  ambientLpExpectedQuoteAmount?: string;
  ambientLpFee?: string;
  ambientLpIsAdvanced?: boolean;
  ambientLPPositions?: AnalyticsAmbientLPPositionData[];
} & AnalyticsAmbientLPPositionData

export type AnalyticsLMData = {
  lmType?: string;
  lmToken?: string;
  lmAmount?: string;
  lmCollateralStatus?: boolean;
  lmWalletBalance?: string;
  lmSuppliedAmount?: string;
  lmBorrowedAmount?: string;
  lmAccountLiquidityRemaining?: string;
}

export type AnalyticsTransactionFlowData = AnalyticsBridgeData | AnalyticsCantoLPData | AnalyticsAmbientLPData | AnalyticsLMData;

// tx types (approve/mint/swap/...)
type AnalyticsTransactionType = CantoFETxType;

export type AnalyticsTransactionFlowInfo = {
  txFlowId: string;
  txFlowCategory: AnalyticsTransactionFlowCategory;
  txFlowType?: AnalyticsTransactionFlowType;
  txFlowData?: AnalyticsTransactionFlowData;
  txCount: number;
  txList: string[];
};

type AnalyticsTransactionFlowParams = AnalyticsTransactionFlowInfo & {
  txType?: AnalyticsTransactionType;
  txNetwork?: string;
  txSuccess?: boolean;
  txHash?: string;
  txRetryTimeInSeconds?: Number;
  txsGenerateError?: string;
  txError?: string;
};

class AnalyticsWrapper {
  constructor() {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
    });
  }
  actions = {
    identify: (account: string, props: object) => {
      posthog.identify(account, props);
    },
    reset: () => {
      posthog.reset();
    },
    people: {
      registerWallet: (account: string) => {
        posthog.register({ account: account });
      },
    },
    events: {
      pageOpened: (pageName: string) => {
        posthog.capture("$pageview", {
          pageName: pageName,
        });
      },
      connections: {
        walletConnect: (connected: boolean) => {
          if (connected) {
            posthog.capture("Wallet Connected");
          } else {
            posthog.capture("Wallet Disconnected");
          }
        },
      },
      themeChanged: (theme: string) => {
        posthog.capture("Theme Changed", {
          theme
        });
      },
      transactionModalOpened: () => {
        posthog.capture("Transaction Modal Opened");
      },
      externalLinkClicked: (params: object) => {
        posthog.capture("External Link Clicked", params);
      },
      maxClicked: (maxName: string) => {
        posthog.capture(`${maxName} Max Clicked`);
      },
      liquidityPool: {
        addLPClicked: (params: object) => {
          posthog.capture("Add LP Clicked", params);
        },
        manageLPClicked: (params: AnalyticsCantoLPData | AnalyticsAmbientLPData) => {
          posthog.capture("Manage LP Clicked", params);
        },
        tabSwitched: (tab: string) => {
          posthog.capture("LP Tab Switched", {
            tab,
          });
        },
        cantoDexLpModal: {
          manageLPClicked: (params: object) => {
            posthog.capture("Canto LP Modal Manage LP Clicked", params);
          },
          stakeLPClicked: (params: object) => {
            posthog.capture("Canto LP Modal Stake LP Clicked", params);
          },
        },
        ambientDexLpModal: {
          advanceClicked: (params: object) => {
            posthog.capture("Ambient LP Modal Advanced Clicked", params);
          },
        },
      },
      lendingMarket: {
        limitClicked: (limit: number) => {
          posthog.capture("LM Modal Limit Clicked", {
            limit,
          });
        },
        supplyClicked: (params: AnalyticsLMData) => {
          posthog.capture("Supply LM Clicked", params);
        },
        borrowClicked: (params: AnalyticsLMData) => {
          posthog.capture("Borrow LM Clicked", params);
        },
        tabSwitched: (tab: string) => {
          posthog.capture("LM Tab Switched", {
            tab,
          });
        },
      },
      transactionFlows: {
        started: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture("Transaction Flow Started", params);
        },
        success: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture("Transaction Flow Success", params);
        },
        retry: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture("Transaction Flow Retry", params);
        },
        generateTransactionsError: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture("Generate Transactions Error", params);
        },
        tokensImported: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture("Tokens Imported", params);
        },
        explorerViewed: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture("Explorer Viewed", params);
        },
        transaction: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture(
            params.txSuccess ? "Transaction Success" : "Transaction Error",
            params
          );
        },
      },
    },
  };
}

const NewAnalyticsWrapper = new AnalyticsWrapper();
export default NewAnalyticsWrapper;
