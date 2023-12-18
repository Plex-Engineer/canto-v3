"use client";

import { BridgingMethodName } from "@/transactions/bridge";
import { TransactionFlowType } from "@/transactions/flows";
import { CantoFETxType } from "@/transactions/interfaces";
import { CTokenLendingTxTypes } from "@/transactions/lending";
import { CantoDexTxTypes } from "@/transactions/pairs/cantoDex";
import posthog from "posthog-js";

// (BRIDGE/LP/LENDING/...)
type AnalyticsTransactionFlowCategory = TransactionFlowType;
// (SUPPLY/WITHDRAW/GBRIDGE/LAYERZERO/LPANDSTAKE/...)
type AnalyticsTransactionFlowType = CantoDexTxTypes | CTokenLendingTxTypes | BridgingMethodName | undefined;
export type AnalyticsTransactionFlowData = {
  // bridge info
  bridgeFrom: string;
  bridgeTo: string;
  bridgeAsset: string;
  bridgeAmount: string;
  // dex info
  // lending info
};

// tx types (approve/mint/swap/...)
type AnalyticsTransactionType = CantoFETxType;

export type AnalyticsTransactionFlowInfo = {
  txFlowId: string;
  txFlowCategory: AnalyticsTransactionFlowCategory;
  txFlowType: AnalyticsTransactionFlowType;
  txFlowData: AnalyticsTransactionFlowData;
  txCount: number;
  txList: string[];
}

type AnalyticsTransactionFlowParams = {
  txFlowId: string;
  txFlowCategory: AnalyticsTransactionFlowCategory;
  txFlowType: AnalyticsTransactionFlowType;
  txFlowData: AnalyticsTransactionFlowData;
  txCount: number;
  txList: string[];
  txType?: AnalyticsTransactionType;
  txSuccess?: boolean;
  txListError?:string;
  txError?: string;
};

class PosthogWrapper {
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
      posthog.identify(account,props);
    },
    reset: () =>{
      posthog.reset()
    },
    people: {
      registerWallet: (account: string) => {
        posthog.register({"account": account});
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
      transactionFlows: {
        started: (params : AnalyticsTransactionFlowParams) => {
          posthog.capture("Transaction Flow Started", params)
        },
        success: (params : AnalyticsTransactionFlowParams) => {
          posthog.capture("Transaction Flow Success",params)
        },
        error: (params : AnalyticsTransactionFlowParams) => {
          posthog.capture("Transaction Flow Error", params)
        },
        tokensImported: (params : AnalyticsTransactionFlowParams) => {
          posthog.capture("Tokens Imported", params)
        },
        explorerViewed: (params : AnalyticsTransactionFlowParams) => {
          posthog.capture("Explorer Viewed", params)
        },
        transaction: (params: AnalyticsTransactionFlowParams) => {
          posthog.capture(
            params.txSuccess ? "Transaction Success" : "Transaction Error",
            params
          )
        },
      },
    },
  };
}

export default new PosthogWrapper();;
