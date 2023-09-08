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
import useRecovery from "@/hooks/bridge/useRecovery";
import { RecoveryTokens } from "@/utils/cosmos/nativeTokens.utils";
import Spacer from "@/components/layout/spacer";
import Button from "@/components/button/button";
import { convertNativeTokenTx } from "@/hooks/bridge/transactions/methods/recovery";
import { txIBCOut } from "@/hooks/bridge/transactions/methods/ibc";

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
  const recovery = useRecovery({
    ethAccount: signer?.account.address,
    chainId: signer?.chain.id,
  });

  const transactionStore = useStore(useTransactionStore, (state) => state);
  console.log(transactionStore);

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

  function TxHistory() {
    return (
      <>
        <div className="transaction-list"></div>
      </>
    );
  }

  interface RecoveryProps {
    tokens: RecoveryTokens;
  }
  function TxRecovery({ tokens }: RecoveryProps) {
    return (
      <section className={styles.container} style={{ overflowY: "scroll" }}>
        <div>
          <h1>---------------------------------------</h1>
          <h1>IBC Tokens</h1>
          <h1>---------------------------------------</h1>
          {tokens.ibc.map((token) => (
            <div key={token.token.denom}>
              <ul>
                <li>Token denom: {token.ibcPath?.base_denom}</li>
                <li>Token path: {token.ibcPath?.path}</li>
                <li>ibc denom: {token.token.denom}</li>
                <li>amount: {token.token.amount}</li>
                <li>From network: {token.ibcNetwork.name}</li>
                <Button
                  onClick={() => {
                    transactionStore?.addTransactions({
                      title: "IBC Out Recovery",
                      icon: token.ibcNetwork.icon,
                      txList: async () =>
                        await txIBCOut(
                          recovery.chainId,
                          recovery.ethAccount,
                          "osmosis",
                          token.ibcNetwork,
                          {
                            ibcDenom: token.token.denom,
                            symbol: token.ibcPath?.base_denom ?? "",
                            decimals: 0,
                            chainId: 0,
                            id: "",
                            name: "",
                            icon: "",
                            nativeName: ""
                          },
                          token.token.amount,
                          true
                        ),
                      ethAccount: signer?.account.address ?? "",
                      signer: signer,
                    });
                  }}
                >
                  IBC OUT
                </Button>
              </ul>
            </div>
          ))}
          <h1>---------------------------------------</h1>
          <h1>Convert Tokens</h1>
          <h1>---------------------------------------</h1>
          {tokens.convert.map((token) => (
            <div key={token.token.denom}>
              <ul>
                <li>Token denom: {token.ibcPath?.base_denom}</li>
                <li>Token path: {token.ibcPath?.path}</li>
                <li>ibc denom: {token.token.denom}</li>
                <li>amount: {token.token.amount}</li>
                <li>ERC20 on canto: {token.convertToken.name}</li>
                <Button
                  onClick={() => {
                    transactionStore?.addTransactions({
                      title: "Recover Native Token",
                      icon: token.convertToken.icon,
                      txList: async () =>
                        await convertNativeTokenTx(
                          recovery.chainId,
                          recovery.ethAccount,
                          token.convertToken,
                          token.token.amount
                        ),
                      ethAccount: signer?.account.address ?? "",
                      signer: signer,
                    });
                  }}
                >
                  Convert Coin
                </Button>
              </ul>
              <Spacer height="10px" />
            </div>
          ))}
        </div>
      </section>
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
              {
                title: "RECOVERY",
                content: <TxRecovery tokens={recovery.recoveryTokens} />,
                noShow: !recovery.hasRecoveryTokens,
              },
            ]}
          />
        </Container>
      </Container>
    </>
  );
}
