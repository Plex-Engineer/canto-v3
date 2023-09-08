"use client";

import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import Container from "@/components/container/container";
import Tabs from "@/components/tabs/tabs";
import styles from "./bridge.module.scss";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { connectToKeplr } from "@/utils/keplr/connectKeplr";
import {
  getNetworkInfoFromChainId,
  isCosmosNetwork,
} from "@/utils/networks.utils";
import { useWalletClient } from "wagmi";
import Bridging from "./bridging";
import { checkLZBridgeStatus } from "@/hooks/bridge/transactions/methods/layerZero";

export default function BridgePage() {
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [onTestnet, setOnTestnet] = useState<boolean>(false);
  const { data: signer } = useWalletClient();
  const bridgeOut = useBridgeOut({
    testnet: onTestnet,
  });
  const bridgeIn = useBridgeIn({
    testnet: onTestnet,
  });
  const transactionStore = useStore(useTransactionStore, (state) => state);

  useEffect(() => {
    async function getKeplrInfoForBridge() {
      const network = bridgeIn.selections.fromNetwork;
      if (!network || !isCosmosNetwork(network)) return;
      const keplrClient = await connectToKeplr(network);
      bridgeIn.setState("cosmosAddress", keplrClient.data?.address);
    }
    getKeplrInfoForBridge();
  }, [bridgeIn.selections.fromNetwork]);

  useEffect(() => {
    const { data: network, error } = getNetworkInfoFromChainId(
      signer?.chain.id ?? 1
    );
    if (error) {
      console.log(error);
      return;
    }
    setOnTestnet(network.isTestChain);
  }, [signer?.chain.id]);

  useEffect(() => {
    // set the signer address
    bridgeIn.setState("ethAddress", signer?.account.address);
    bridgeOut.setState("ethAddress", signer?.account.address);
  }, [signer?.account.address]);

  function BridgeOut() {
    return (
      <>
        <div className={styles["network-selection"]}></div>
        <div className={styles["token-selection"]}></div>
      </>
    );
  }

  function TxHistory() {
    return (
      <>
        <div className="transaction-list"></div>
      </>
    );
  }

  function TxRecovery() {
    return (
      <>
        <div className="recovery-list"></div>
      </>
    );
  }

  return (
    <>
      <AnimatedBackground initSize="400px" direction={direction} time={20} />
      <Container
        height="100vm"
        layer={1}
        backgroundColor="background: var(--card-background-color, #C1C1C1)"
        center={{
          horizontal: true,
          vertical: true,
        }}
      >
        <Container
          height="500px"
          width="700px"
          backgroundColor="var(--card-sub-surface-color, #DFDFDF)"
        >
          <Tabs
            tabs={[
              {
                title: "BRIDGE IN",
                content: (
                  <Bridging
                    hook={bridgeIn}
                    params={{
                      signer: signer,
                      transactionStore: transactionStore,
                    }}
                  />
                ),
                onClick: () => setDirection("in"),
              },
              {
                title: "BRIDGE OUT",
                content: (
                  <Bridging
                    hook={bridgeOut}
                    params={{
                      signer: signer,
                      transactionStore: transactionStore,
                    }}
                  />
                ),
                onClick: () => setDirection("out"),
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
