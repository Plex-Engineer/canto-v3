"use client";
import Button from "@/components/button/button";
import {
  BridgingMethod,
  bridgeMethodToString,
} from "@/hooks/bridge/interfaces/tokens";
import { getAllUserBridgeTransactionHistory } from "@/hooks/bridge/txHistory";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useStaking from "@/hooks/staking/useStaking";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { ethToCantoAddress } from "@/utils/address.utils";
import { createMsgsClaimStakingRewards } from "@/utils/cosmos/transactions/messages/staking/claimRewards";
import { createMsgsDelegate } from "@/utils/cosmos/transactions/messages/staking/delegate";
import { connectToKeplr } from "@/utils/keplr/connectKeplr";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useWalletClient } from "wagmi";

export default function TestPage() {
  const [cosmosAddress, setCosmosAddress] = useState<string>("");
  const [cantoAddress, setCantoAddress] = useState<string>("");
  const { data: signer } = useWalletClient();
  const bridgeOut = useBridgeOut({
    testnet: false,
    userEthAddress: signer?.account.address,
  });
  const bridgeIn = useBridgeIn({
    testnet: false,
    userEthAddress: signer?.account.address,
    userCosmosAddress: cosmosAddress,
  });
  const transactionStore = useStore(useTransactionStore, (state) => state);
  console.log(transactionStore?.transactions)

  useEffect(() => {
    async function getKeplrInfoForBridge() {
      const network = bridgeIn.selections.fromNetwork;
      const keplrClient = await connectToKeplr(bridgeIn.selections.fromNetwork);
      setCosmosAddress(keplrClient.data?.address);
    }
    getKeplrInfoForBridge();
  }, [bridgeIn.selections.fromNetwork]);

  useEffect(() => {
    async function getCantoAddress() {
      const cantoAddress = await ethToCantoAddress(signer?.account.address);
      if (cantoAddress.error) {
        console.log(cantoAddress.error);
        return;
      } else {
        setCantoAddress(cantoAddress.data);
      }
    }
    getCantoAddress();
  }, [signer?.account.address]);

  function formatParams(params: {
    ethAddress: string;
    userCosmosAddress: string;
    cantoAddress: string;
    method: BridgingMethod;
    amount: string;
  }) {
    switch (params.method) {
      case BridgingMethod.GRAVITY_BRIDGE:
        return {
          sender: params.ethAddress,
          receiver: params.cantoAddress,
          amount: params.amount,
        };
      case BridgingMethod.IBC:
        return {
          sender: params.userCosmosAddress,
          receiver: params.ethAddress,
          amount: params.amount,
        };
      case BridgingMethod.LAYER_ZERO:
        return {
          sender: params.ethAddress,
          receiver: params.ethAddress,
          amount: params.amount,
        };
    }
  }

  async function bridgeInTest() {
    const params = formatParams({
      ethAddress: signer?.account.address,
      userCosmosAddress: cosmosAddress,
      cantoAddress: cantoAddress,
    });
    bridgeIn
      .bridge(
        formatParams({
          ethAddress: signer?.account.address,
          userCosmosAddress: cosmosAddress,
          cantoAddress: cantoAddress,
          method: bridgeIn.selections.method,
          amount: "1000000000000000000",
        })
      )
      .then((val) => {
        if (val.error) {
          console.log(val.error);
          return;
        }
        transactionStore?.addTransactions(val.data, signer);
      });
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
      <button
        onClick={() => {
          const tx = createMsgsDelegate({
            delegatorCantoAddress: "canto address",
            validatorAddress: "validator address",
            amount: "1000000000000000000",
            denom: "acanto",
            undelegate: true,
          });
          transactionStore?.addTransactions(
            [
              {
                msg: tx,
                type: "COSMOS",
                chainId: 7700,
                description: "delegate",
              },
            ],
            signer
          );
        }}
      >
        STAKE
      </button>
      <button
        onClick={() => {
          const tx = createMsgsClaimStakingRewards({
            delegatorCantoAddress: "canto address",
            validatorAddresses: [],
          });
          transactionStore?.addTransactions(
            [
              {
                msg: tx,
                type: "COSMOS",
                chainId: 7700,
                description: "claim rewards",
              },
            ],
            signer
          );
        }}
      >
        STAKE Rewards
      </button>
      <div
        style={{ display: "flex", flexBasis: "column", gap: "2rem" }}
        key={"in"}
      >
        <h1>Bridge In</h1>
        <div>
          <h1>Networks</h1>
          <ul>
            {bridgeIn.allOptions.networks.map((network) => (
              <li key={network.id}>
                <Button
                  color={
                    network.id === bridgeIn.selections.fromNetwork?.id
                      ? "accent"
                      : "primary"
                  }
                  icon={{
                    url: network.icon,
                    position: "left",
                  }}
                  onClick={() => {
                    bridgeIn.setters.network(network.id);
                  }}
                >
                  {network.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h1>Tokens</h1>
          <ul>
            {bridgeIn.allOptions.tokens.map((token) => (
              <li key={token.id}>
                <Button
                  color={
                    token.id === bridgeIn.selections.token?.id
                      ? "accent"
                      : "primary"
                  }
                  icon={{
                    url: token.icon,
                    position: "left",
                  }}
                  onClick={() => {
                    bridgeIn.setters.token(token.id);
                  }}
                >
                  {token.name}
                  {"  "}
                  {formatUnits(BigInt(token.balance ?? 0), token.decimals)}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h1>Methods</h1>
          <ul>
            {bridgeIn.allOptions.methods.map((method) => (
              <li key={method.toString()}>
                <Button
                  color={
                    method === bridgeIn.selections.method ? "accent" : "primary"
                  }
                  onClick={() => {
                    bridgeIn.setters.method(method);
                  }}
                >
                  {bridgeMethodToString(method)}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {signer && (
          <button
            style={{ background: "black", color: "white" }}
            onClick={bridgeInTest}
          >
            bridge in
          </button>
        )}
      </div>
      <div
        style={{ display: "flex", flexBasis: "column", gap: "2rem" }}
        key={"out"}
      >
        <h1>Bridge Out</h1>
        <div>
          <h1>Tokens</h1>
          <ul>
            {bridgeOut.allOptions.tokens.map((token) => (
              <li key={token.id}>
                <Button
                  color={
                    token.id === bridgeOut.selections.token?.id
                      ? "primary"
                      : "secondary"
                  }
                  icon={{
                    url: token.icon,
                    position: "left",
                  }}
                  onClick={() => {
                    bridgeOut.setters.token(token.id);
                  }}
                >
                  {token.name}
                  {"  "}
                  {formatUnits(BigInt(token.balance ?? 0), token.decimals)}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h1>Networks</h1>
          <ul>
            {bridgeOut.allOptions.networks.map((network) => (
              <li key={network.id}>
                <Button
                  color={
                    network.id === bridgeOut.selections.toNetwork?.id
                      ? "primary"
                      : "secondary"
                  }
                  icon={{
                    url: network.icon,
                    position: "left",
                  }}
                  onClick={() => {
                    bridgeOut.setters.network(network.id);
                  }}
                >
                  {network.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h1>Methods</h1>
          <ul>
            {bridgeOut.allOptions.methods.map((method) => (
              <li key={method.toString()}>
                <Button
                  color={
                    method === bridgeOut.selections.method
                      ? "primary"
                      : "secondary"
                  }
                  onClick={() => {
                    bridgeOut.setters.method(method);
                  }}
                >
                  {bridgeMethodToString(method)}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {signer && (
          <button
            style={{ background: "black", color: "white" }}
            onClick={() =>
              bridgeOut
                .bridge(signer?.account.address, "1000000000000000000")
                .then((val) => {
                  if (val.error) {
                    console.log(val.error);
                    return;
                  }
                  transactionStore?.addTransactions(val.data, signer);
                })
            }
          >
            bridge out
          </button>
        )}
      </div>
      <button onClick={() => transactionStore?.clearTransactions()}>
        CLEAR ALL TRANSACTIONS
      </button>
      {transactionStore?.transactions.map((txList, idx) => (
        <ul key={idx}>
          <li>txList: {idx}</li>
          {txList.map((tx, idx2) => (
            <ul key={idx2}>
              <li>
                {idx2}- description: {tx.tx.description}
              </li>
              <li>
                {idx2}- status: {tx.status}
              </li>
              <li>
                {idx2}-{" "}
                <a
                  href={tx.txLink}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  link
                </a>
              </li>
              <li>
                <button
                  onClick={() => transactionStore?.clearTransactions(idx)}
                >
                  delete
                </button>
              </li>
            </ul>
          ))}
        </ul>
      ))}
    </div>
  );
}
