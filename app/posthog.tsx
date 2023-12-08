'use client'

import posthog from "posthog-js"

if(typeof window !== 'undefined'){
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!,{
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
    }
    )
}

type attributes = {
  [key: string]: string | number | true | null;
};

const actions = {
    identify: (id: string) => {
      posthog.identify(id);
    },
    reset: () =>{
      posthog.reset()
    },
    people: {
      set: (props: attributes) => {
        posthog.setPersonProperties(props)
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
      connections: {
        walletConnect: (connected: boolean) => {
          if (connected) {
            posthog.capture("Wallet Connected");
          } else {
            posthog.capture("Wallet Disconnected");
          }
        },
      },
    },
  };

  export const Posthog = actions;