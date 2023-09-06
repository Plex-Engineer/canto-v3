import Button from "@/components/button/button";
import React, { useState } from "react";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";
import useTransactionStore from "@/stores/transactionStore";
import { useWalletClient } from "wagmi";
import Container from "@/components/container/container";

const TransactionBox = () => {
  // // const [txIndex, setTxIndex] = useState<number>(0);
  // // const { data: signer } = useWalletClient();

  // // const transactionStore = useTransactionStore();
  // // return (
  // //   <div>
  // //     <Text size="lg" font="proto_mono">
  // //       TRANSACTIONS
  // //     </Text>

  // //     <div
  // //       style={{
  // //         display: "flex",
  // //         flexDirection: "column",
  // //       }}
  // //     >
  // //       <TxItem flow={transactionStore?.transactionFlows[txIndex]} />
  // //       {transactionStore.transactionFlows.length === 0 ? (
  // //         <Text>No transactions</Text>
  // //       ) : (
  // //         transactionStore.transactionFlows.map((tx, idx) => (
  // //           <Button
  // //             width={"fill"}
  // //             key={idx}
  // //             onClick={() => {
  // //               setTxIndex(idx);
  // //             }}
  // //           >
  // //             {tx.transactions.map((tx) => tx.tx.description).join(", ")}
  // //           </Button>
  // //         ))
  // //       )}
  // //       <Spacer height="30px" />
  // //       <div
  // //         style={{
  // //           display: "flex",
  // //           flexDirection: "row",
  // //         }}
  // //       >
  // //         <Button
  // //           onClick={() => {
  // //             if (txIndex !== 0) setTxIndex((prev) => prev - 1);
  // //           }}
  // //         >
  // //           Backward
  // //         </Button>
  // //         <Spacer width="20px" />
  // //         <Text>
  // //           Current page: {txIndex + 1}{" "}
  // //           {"  Title: " + transactionStore?.transactionFlows?.[txIndex]?.title}
  // //         </Text>
  // //         <Spacer width="20px" />
  // //         <Button
  // //           onClick={() => {
  // //             if (
  // //               transactionStore &&
  // //               txIndex !== transactionStore.transactionFlows.length - 1
  // //             )
  // //               setTxIndex((prev) => prev + 1);
  // //           }}
  // //         >
  // //           Forward
  // //         </Button>
  // //       </div>
  // //     </div>
  // //     <Container direction="row">
  // //       <Button onClick={() => transactionStore?.clearTransactions()}>
  // //         CLEAR ALL TRANSACTIONS
  // //       </Button>
  // //       <Button
  // //         color={"accent"}
  // //         onClick={() =>
  // //           transactionStore?.performTransactions(signer, {
  // //             txListIndex: txIndex,
  // //           })
  // //         }
  // //       >
  // //         RETRY TRANSACTION
  // //       </Button>
  // //     </Container>
  // //   </div>
  // );
};

export default TransactionBox;
