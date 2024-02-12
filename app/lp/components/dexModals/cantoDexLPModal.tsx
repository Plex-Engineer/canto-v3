"use client";
import Button from "@/components/button/button";
import { displayAmount, formatPercent } from "@/utils/formatting";
import { useState } from "react";
import Container from "@/components/container/container";
import { Validation } from "@/config/interfaces";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import styles from "./cantoDex.module.scss";
import Tabs from "@/components/tabs/tabs";
import { ModalItem } from "@/app/lending/components/modal/modal";
import { StakeLPModal } from "./stakeLPModal";
import {
  addTokenBalances,
  convertTokenAmountToNote,
  divideBalances,
} from "@/utils/math";
import { CantoDexTransactionParams } from "@/transactions/pairs/cantoDex";
import { AddLiquidityModal, createAddParams } from "./AddLiquidityModal";
import {
  RemoveLiquidityModal,
  createRemoveParams,
} from "./RemoveLiquidityModal";

interface ManageCantoDexLPProps {
  pair: CantoDexPairWithUserCTokenData;
  sendTxFlow: (params: Partial<CantoDexTransactionParams>) => void;
  validateParams: (params: Partial<CantoDexTransactionParams>) => Validation;
}
export const CantoDexLPModal = (props: ManageCantoDexLPProps) => {
  const [modalType, setModalType] = useState<"liquidity" | "stake" | "base">(
    "base"
  );

  const Liquidity = () => (
    <Container className={styles.container}>
      <Container
        direction="row"
        height="70px"
        center={{
          vertical: true,
        }}
        style={{
          cursor: "pointer",
          paddingLeft: "10px",
        }}
        onClick={() => setModalType("base")}
      >
        <div
          style={{
            rotate: "90deg",
            marginRight: "6px",
          }}
        >
          <Icon icon={{ url: "/dropdown.svg", size: 24 }} themed />
        </div>
        <Text font="proto_mono" size="lg">
          Liquidity
        </Text>
      </Container>

      <div className={styles["scroll-view"]}>
        <Tabs
          tabs={[
            {
              title: "Add",
              content: (
                <Container width="100%" key={props.pair.address + "add"}>
                  <AddLiquidityModal
                    pair={props.pair}
                    validateParams={(params) =>
                      props.validateParams(createAddParams(params))
                    }
                    sendTxFlow={(params) =>
                      props.sendTxFlow(createAddParams(params))
                    }
                  />
                </Container>
              ),
            },
            {
              title: "Remove",
              isDisabled:
                Number(
                  addTokenBalances(
                    props.pair.clmData?.userDetails
                      ?.supplyBalanceInUnderlying ?? "0",
                    props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
                  )
                ) === 0,
              content: (
                <Container
                  width="100%"
                  padding="sm"
                  key={props.pair.address + "remove"}
                >
                  <RemoveLiquidityModal
                    pair={props.pair}
                    validateParams={(params) =>
                      props.validateParams(createRemoveParams(params))
                    }
                    sendTxFlow={(params) =>
                      props.sendTxFlow(createRemoveParams(params))
                    }
                  />
                </Container>
              ),
            },
          ]}
        />
      </div>
    </Container>
  );

  const Base = () => {
    // total LP will be staked + unstaked balance
    const totalLP = addTokenBalances(
      props.pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
      props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
    );
    // position value will be total LP * price
    const { data: positionValue } = convertTokenAmountToNote(
      totalLP,
      props.pair.clmData?.price ?? "0"
    );
    // pool share determined by total value of LP and tvl
    const poolShare = divideBalances(
      positionValue?.toString() ?? "0",
      props.pair.tvl
    );

    return (
      <Container className={styles.baseContainer}>
        <Container gap={40} padding="md">
          <div className={styles.iconTitle}>
            <Icon icon={{ url: props.pair.logoURI, size: 100 }} />
            <Text size="lg" font="proto_mono">
              {props.pair.symbol}
            </Text>
          </div>
          <Container className={styles.card} padding="md" width="100%">
            <ModalItem
              name="Position Value"
              value={displayAmount(positionValue?.toString() ?? "0", 18)}
              note
            />
            <ModalItem
              name="Total # of LP Tokens"
              value={displayAmount(totalLP, props.pair.decimals)}
            />
            <ModalItem
              name="Staked LP Tokens"
              value={displayAmount(
                props.pair.clmData?.userDetails?.supplyBalanceInUnderlying ??
                  "0",
                props.pair.decimals
              )}
            />
            <ModalItem
              name="Unstaked LP Tokens"
              value={displayAmount(
                props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
                props.pair.decimals
              )}
            />
          </Container>
          <Container className={styles.card} padding="md" width="100%">
            <ModalItem
              name="Pool Liquidity"
              value={displayAmount(props.pair.tvl, 18)}
              note
            />
            <ModalItem name="Pool Share" value={formatPercent(poolShare)} />
          </Container>

          <Container gap={20} direction="row">
            <Button width="fill" onClick={() => setModalType("liquidity")}>
              Manage LP
            </Button>
            <Button
              disabled={Number(totalLP) === 0}
              width="fill"
              onClick={() => setModalType("stake")}
            >
              Manage Stake
            </Button>
          </Container>
        </Container>
      </Container>
    );
  };

  const modals = {
    liquidity: Liquidity(),
    stake: props.pair.clmData ? (
      <StakeLPModal
        onBack={() => setModalType("base")}
        clpToken={props.pair.clmData}
        transaction={{
          validateAmount: (amountLP, txType) =>
            props.validateParams({
              amountLP,
              txType,
            }),
          performTx: (amountLP, txType) =>
            props.sendTxFlow({
              txType,
              amountLP,
            }),
        }}
      />
    ) : (
      "Loading..."
    ),
    base: Base(),
  }[modalType];

  return <div>{modals}</div>;
};
