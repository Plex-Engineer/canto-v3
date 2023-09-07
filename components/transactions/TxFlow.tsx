import React from "react";
import styles from "./transactions.module.scss";
import Image from "next/image";
import Text from "../text";
import TxItem from "./TxItem";
import Spacer from "../layout/spacer";
import { TransactionFlowWithStatus } from "@/config/interfaces/transactions";

interface Props {
  txFlow?: TransactionFlowWithStatus;
  onRetry: (txIdx: number) => void;
}

const TxFlow = (props: Props) => {
  return (
    <div className={styles.container}>
      {props.txFlow && (
        <>
          <Image
            src={props.txFlow.icon ?? ""}
            width={50}
            height={50}
            alt={"Transaction"}
          />
          <Spacer height="20px" />

          <Text font="proto_mono" size="lg">
            {props.txFlow.title}
          </Text>
          <Spacer height="40px" />
          {props.txFlow.transactions.map((tx, idx) => (
            <TxItem
              key={idx}
              tx={tx}
              idx={idx + 1}
              onRetry={() => props.onRetry(idx)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default TxFlow;
