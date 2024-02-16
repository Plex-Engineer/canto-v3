import Text from "@/components/text";
import styles from "./VotingInfoBox.module.scss";
import Container from "@/components/container/container";
import { displayAmount } from "@/utils/formatting/balances.utils";
import Icon from "@/components/icon/icon";
import { VoteOption } from "@/transactions/gov";
import { useState } from "react";
import clsx from "clsx";

interface VotingOptionProps {
  amount: string;
  value: VoteOption;
  isSelected: boolean;
  color: string;
  onClick: () => void;
  borderColor: string;
}

export function VotingInfoBox({
  amount,
  value,
  isSelected,
  color,
  onClick,
  borderColor,
}: VotingOptionProps) {
  return (
    <div
      className={clsx(styles.proposalInfoVoting, styles[value])} //styles[value] is to apply different colors based on option type on Hover
      onClick={() => {
        onClick();
      }}
      style={
        isSelected
          ? {
              backgroundColor: color,
              cursor: "pointer",
              opacity: 1,
              border: "1px solid",
              borderColor: borderColor,
              boxShadow:
                "var(--box-shadow, 3px 3px 0px 0px rgba(17, 17, 17, 0.15))",
            }
          : { border: "1px solid var(--border-stroke-color, #b3b3b3)" }
      }
    >
      <div className={styles.optionName}>
        <Container direction="row">
          <div>
            <Text font="proto_mono" size="sm">
              {value}
            </Text>
          </div>
        </Container>
      </div>
      <Container
        direction="column"
        //className={styles.optionVotes}
        width="50%"
        center={{ vertical: true, horizontal: true }}
      >
        <div className={styles.optionVotes}>
          <Container
            direction="row"
            gap={6}
            center={{
              vertical: true,
            }}
          >
            <Text font="proto_mono" opacity={0.4} size="x-sm">
              {displayAmount(amount, 0, {
                commify: true,
                short: true,
              })}
            </Text>
            <Icon
              icon={{
                url: "/tokens/canto.svg",
                size: 14,
              }}
              themed={true}
            />
          </Container>
        </div>
      </Container>
    </div>
  );
}
