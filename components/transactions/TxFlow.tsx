import React, { useEffect } from "react";
import styles from "./transactions.module.scss";
import Image from "next/image";
import Text from "../text";
import TxItem from "./TxItem";
import Spacer from "../layout/spacer";
import Button from "../button/button";
import { formatError } from "@/utils/formatting";
import { BridgeStatus } from "@/transactions/interfaces";
import {
  TRANSACTION_FLOW_MAP,
  TX_PLACEHOLDER,
  TransactionFlow,
} from "@/transactions/flows";

interface Props {
  txFlow?: TransactionFlow;
  onRetry: () => void;
  setBridgeStatus: (txIndex: number, status: BridgeStatus) => void;
  closeModal: () => void;
}

const TxFlow = (props: Props) => {
  const [canRetry, setCanRetry] = React.useState<{
    valid: boolean;
    error: string | undefined;
  }>({ valid: false, error: undefined });
  useEffect(() => {
    async function checkRetryParams() {
      if (props.txFlow?.status === "ERROR") {
        // check if we can retry
        const { data, error } = await TRANSACTION_FLOW_MAP[
          props.txFlow.txType
        ].validRetry(props.txFlow.params);
        if (error) {
          setCanRetry({ valid: false, error: error.message });
        }
        setCanRetry({
          valid: !data.error,
          error: data.error ? data.reason : undefined,
        });
      }
    }
    checkRetryParams();
  }, [props.txFlow?.status]);
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
          <Spacer height="30px" />

          <Text font="proto_mono" size="lg">
            {props.txFlow.title}
          </Text>
          <Spacer height="40px" />
          {props.txFlow?.error && (
            <Text>{formatError(props.txFlow.error)}</Text>
          )}
          {!props.txFlow.error && (
            <>
              {props.txFlow.transactions.map((tx, idx) => (
                <TxItem
                  key={idx}
                  tx={tx}
                  idx={idx + 1}
                  setBridgeStatus={(status) =>
                    props.setBridgeStatus(idx, status)
                  }
                />
              ))}
              {props.txFlow.placeholderFlow && (
                <TxItem
                  tx={TX_PLACEHOLDER(props.txFlow.placeholderFlow)}
                  idx={props.txFlow.transactions.length + 1}
                  setBridgeStatus={() => false}
                />
              )}
            </>
          )}
          {props.txFlow.status === "ERROR" && (
            <>
              <Spacer height="40px" />
              <Button disabled={!canRetry.valid} onClick={props.onRetry}>
                RETRY
              </Button>
            </>
          )}
          {props.txFlow.status === "SUCCESS" && (
            <>
              <Spacer height="40px" />
              <Button
                onClick={() => {
                  props.closeModal();
                  if (props.txFlow?.onSuccessCallback) {
                    props.txFlow.onSuccessCallback();
                  }
                }}
              >
                CLOSE
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TxFlow;
