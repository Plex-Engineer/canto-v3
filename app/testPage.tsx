"use client";
import { bridgeMethodToString } from "@/hooks/bridge/interfaces/tokens";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useTransactionStore from "@/stores/transactionStore";
import { useWalletClient } from "wagmi";

export default function TestPage() {
  const { data: signer } = useWalletClient();
  const bridgeOut = useBridgeOut({ testnet: false });
  const transactionStore = useTransactionStore();
  console.log(transactionStore.transactions);
  return (
    <div>
      <div style={{ display: "flex", flexBasis: "column", gap: "2rem" }}>
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
      </div>
      {signer && (
        <button
          style={{ background: "black", color: "white" }}
          onClick={() =>
            bridgeOut.bridge(signer?.account.address, "842").then((val) => {
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
            </ul>
          ))}
        </ul>
      ))}
    </div>
  );
}
