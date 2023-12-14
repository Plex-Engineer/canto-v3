"use client";

import { BridgingMethod } from "@/transactions/bridge";
import { TransactionFlowType } from "@/transactions/flows";
import { CantoFETxType } from "@/transactions/interfaces";
import { CTokenLendingTxTypes } from "@/transactions/lending";
import { CantoDexTxTypes } from "@/transactions/pairs/cantoDex";
import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
});

// (BRIDGE/LP/LENDING/...)
type PostHogParentFlowType = TransactionFlowType;
// (SUPPLY/WITHDRAW/GBRIDGE/LAYERZERO/LPANDSTAKE/...)
type PostHogFlowType = CantoDexTxTypes | CTokenLendingTxTypes | BridgingMethod;
// tx types (approve/mint/swap/...)
type PostHogFlowTxType = CantoFETxType;

type TxCapture = {
  success: boolean;
  flowId: string;
  parentType: PostHogParentFlowType;
  flowType: PostHogFlowType;
  txType: PostHogFlowTxType;
  txParams?: object; //{token: object, amount: string, method: BridgeMethod}
  txHash?: string;
  error?: string;
};

class PosthogWrapper {
  constructor() {}
  actions = {
    identify: (id: string) => {
      posthog.identify(id);
    },
    reset: () => {
      posthog.reset();
    },
    people: {
      set: (props: { [key: string]: string | number | boolean | null }) => {
        posthog.setPersonProperties(props);
      },
      registerWallet: (account: string) => {
        posthog.register({ distinct_id: account, wallet: account });
      },
    },
    events: {
      pageOpened: (pageName: string) => {
        posthog.capture("Page Opened", {
          pageName: pageName,
        });
      },
      setTheme: (theme: string) => {
        posthog.capture("Theme Set To", {
          theme: theme,
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
      flows: {
        started: (flowType: TransactionFlowType, flowId: string) =>
          posthog.capture("Flow Started", { flowType, flowId }),
        success: (flowType: TransactionFlowType, flowId: string) =>
          posthog.capture("Flow Success", { flowType, flowId }),
        transaction: (txCapture: TxCapture) =>
          posthog.capture(
            txCapture.success ? "Transaction Success" : "Transaction Error",
            txCapture
          ),
      },
    },
  };
}

export default PosthogWrapper;
