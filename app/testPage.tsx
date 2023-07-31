"use client";
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
      {signer && (
        <button
          onClick={() =>
            bridgeOut.bridge(signer?.account.address, "100").then((val) => {
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
