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

export type AnalyticsTransactionFlowData =
  | {
      // bridge info
      bridgeFrom: string;
      bridgeTo: string;
      bridgeAsset: string;
      bridgeAmount: string;
    }
  | {
      // canto dex info
      cantoLp?: string;
      cantoLpToken1?: string;
      cantoLpToken2?: string;
      cantoLpAmount1?: string;
      cantoLpAmount2?: string;
      cantoLpBalance1?: string;
      cantoLpBalance2?: string;
      cantoLpTokenAmount?: string;
      cantoLpTokenBalance?: string;
      cantoLpExpectedToken1?: string;
      cantoLpStakedBalance?: string;
      cantoLpUnstakedBalance?: string;
      cantoLpExpectedToken2?: string;
      cantoLpSlippage?: Number;
      cantoLpDeadline?: string;
      cantoLpStakeStatus?: boolean;
    }
  | {
      // ambient info
      ambientLp?: string;
      ambientPositionId?: string;
      ambientLpBaseToken?: string;
      ambientLpQuoteToken?: string;
      ambientLpBaseAmount?: string;
      ambientLpQuoteAmount?: string;
      ambientLpBaseBalance?: string;
      ambientLpQuoteBalance?: string;
      ambientLpCurrentPrice?: string;
      ambientLpMinRangePrice?: string;
      ambientLpMaxRangePrice?: string;
      ambientLpMinExecPrice?: string;
      ambientLpMaxExecPrice?: string;
      ambientLpLiquidity?: string;
      ambientLpFee?: string;
    }
  | {
      // lending info
      lmToken?: string;
      lmAmount?: string;
      lmCollateralStatus?: boolean;
      lmWalletBalance?: string;
      lmSuppliedAmount?: string;
      lmBorrowedAmount?: string;
      lmAccountLiquidityRemaining?: string;
    };

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
  txSuccess?: boolean;
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
        posthog.capture("Page Opened", {
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
        manageLPClicked: (params: object) => {
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
          posthog.capture("Lending Market Modal Limit Clicked", {
            limit,
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
