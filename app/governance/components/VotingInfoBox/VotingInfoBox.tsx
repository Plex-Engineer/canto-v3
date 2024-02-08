import Text from "@/components/text";
import styles from "./VotingInfoBox.module.scss";
import Container from "@/components/container/container";
import { displayAmount } from "@/utils/formatting/balances.utils";
import Icon from "@/components/icon/icon";
import { VoteOption } from "@/transactions/gov";
import { useState } from "react";

export function VotingInfoBox({
  isActive,
  percentage,
  amount,
  value,
  isSelected,
  color,
  isHighest,
  onClick,
}: {
  isActive: boolean;
  percentage: string;
  amount: string;
  value: VoteOption;
  isSelected: boolean;
  color: string;
  isHighest: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const dimmedColor = color.replace(")", ",0.5)");
  const getHoverStyle = () => {
    if (isSelected && isActive) {
      return { backgroundColor: color, cursor: "pointer", opacity: 1 };
    }
    if (isHovered && isActive) {
      return {
        backgroundColor: dimmedColor,
        cursor: "pointer",
      };
    }
    if (isHighest && !isActive) {
      return { backgroundColor: dimmedColor };
    }
    return {};
  };

  return (
    <div
      className={styles.proposalInfoVoting}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={() => {
        onClick();
      }}
      style={getHoverStyle()}
    >
      {isActive && (
        <div className={styles.radioBtnContainer}>
          <div
            className={styles.radioBtn}
            style={isSelected ? { backgroundColor: color, opacity: 1 } : {}}
          />
        </div>
      )}

      <div className={styles.votingInfoRow1}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <div>
            <Text font="proto_mono" size="sm">
              {value}
            </Text>
          </div>
        </div>
      </div>
      <div className={styles.votingInfoRow2}>
        <div className={styles.infoRow1First}>
          <Text font="proto_mono">{percentage}%</Text>
        </div>
        <div className={styles.infoRow1First}>
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
      </div>
    </div>
  );
}
