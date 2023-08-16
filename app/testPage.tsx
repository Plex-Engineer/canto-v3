"use client";
import { OSMOSIS } from "@/config/networks";
import { bridgeMethodToString } from "@/hooks/bridge/interfaces/tokens";
import { txIBCOut } from "@/hooks/bridge/transactions/ibc";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useTransactionStore from "@/stores/transactionStore";
import { useWalletClient } from "wagmi";

export default function TestPage() {
  const { data: signer } = useWalletClient();
  const bridgeOut = useBridgeOut({ testnet: false });
  const bridgeIn = useBridgeIn({ testnet: true });
  const transactionStore = useTransactionStore();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
      <div
        style={{ display: "flex", flexBasis: "column", gap: "2rem" }}
        key={"in"}
      >
        <button
          onClick={() =>
            txIBCOut(
              7700,
              "eth address",
              "cosmos address",
              OSMOSIS,
              {
                address: "",
                ibcDenom:
                  "ibc/F4FA8E78509CC7899084B948754B29532ECC6C8A4052C1223414B49F5DC0B3ED",
              },
              "1",
              true
            ).then((val) => {
              console.log(val)
              transactionStore.addTransactions(val.data, signer);
            })
          }
        >
          RECOVERY
        </button>
        <h1>Bridge In</h1>
        <div>
          <h1>Networks</h1>
          <ul>
            {bridgeIn.allOptions.networks.map((network) => (
              <div key={network.id}>
                <li
                  style={{
                    fontWeight: `${
                      network.id === bridgeIn.selections.fromNetwork?.id
                        ? "bold"
                        : ""
                    }`,
                  }}
                >
                  name: {network.name}
                </li>
                <button
                  style={{ background: "lightblue" }}
                  onClick={() => {
                    bridgeIn.setters.network(network.id);
                  }}
                >
                  select
                </button>
              </div>
            ))}
          </ul>
        </div>
        <div>
          <h1>Tokens</h1>
          <ul>
            {bridgeIn.allOptions.tokens.map((token) => (
              <div key={token.id}>
                <li
                  style={{
                    fontWeight: `${
                      token.id === bridgeIn.selections.token?.id ? "bold" : ""
                    }`,
                  }}
                >
                  name: {token.name}
                </li>
                <button
                  style={{ background: "lightblue" }}
                  onClick={() => {
                    bridgeIn.setters.token(token.id);
                  }}
                >
                  select
                </button>
              </div>
            ))}
          </ul>
        </div>
        <div>
          <h1>Methods</h1>
          <ul>
            {bridgeIn.allOptions.methods.map((method) => (
              <div key={method.toString()}>
                <li
                  style={{
                    fontWeight: `${
                      method === bridgeIn.selections.method ? "bold" : ""
                    }`,
                  }}
                >
                  name: {bridgeMethodToString(method)}
                </li>
                <button
                  style={{ background: "lightblue" }}
                  onClick={() => {
                    bridgeIn.setters.method(method);
                  }}
                >
                  select
                </button>
              </div>
            ))}
          </ul>
        </div>
        {signer && (
          <button
            style={{ background: "black", color: "white" }}
            onClick={() =>
              bridgeIn.bridge(signer?.account.address, "10").then((val) => {
                if (val.error) {
                  console.log(val.error);
                  return;
                }
                transactionStore.addTransactions(val.data, signer);
              })
            }
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
              <div key={token.id}>
                <li
                  style={{
                    fontWeight: `${
                      token.id === bridgeOut.selections.token?.id ? "bold" : ""
                    }`,
                  }}
                >
                  name: {token.name}
                </li>
                <button
                  style={{ background: "lightblue" }}
                  onClick={() => {
                    bridgeOut.setters.token(token.id);
                  }}
                >
                  select
                </button>
              </div>
            ))}
          </ul>
        </div>
        <div>
          <h1>Networks</h1>
          <ul>
            {bridgeOut.allOptions.networks.map((network) => (
              <div key={network.id}>
                <li
                  style={{
                    fontWeight: `${
                      network.id === bridgeOut.selections.toNetwork?.id
                        ? "bold"
                        : ""
                    }`,
                  }}
                >
                  name: {network.name}
                </li>
                <button
                  style={{ background: "lightblue" }}
                  onClick={() => {
                    bridgeOut.setters.network(network.id);
                  }}
                >
                  select
                </button>
              </div>
            ))}
          </ul>
        </div>
        <div>
          <h1>Methods</h1>
          <ul>
            {bridgeOut.allOptions.methods.map((method) => (
              <div key={method.toString()}>
                <li
                  style={{
                    fontWeight: `${
                      method === bridgeOut.selections.method ? "bold" : ""
                    }`,
                  }}
                >
                  name: {bridgeMethodToString(method)}
                </li>
                <button
                  style={{ background: "lightblue" }}
                  onClick={() => {
                    bridgeOut.setters.method(method);
                  }}
                >
                  select
                </button>
              </div>
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
                  transactionStore.addTransactions(val.data, signer);
                })
            }
          >
            bridge out
          </button>
        )}
      </div>
      {transactionStore.transactions.map((txList, idx) => (
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
            </ul>
          ))}
        </ul>
      ))}
    </div>
  );
}
