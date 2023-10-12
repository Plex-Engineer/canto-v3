import { formatBalance } from "@/utils/tokenBalances.utils";
import Icon from "../icon/icon";
import Text from "../text";
import styles from "./amount.module.scss";
import Container from "../container/container";
import { useState } from "react";
import clsx from "clsx";
interface Props {
  IconUrl: string;
  title: string;
  max: string;
  symbol: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  decimals: number;
  value: string;
  error?: boolean;
  errorMessage?: string;
}
const Amount = (props: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <Container
      direction="row"
      className={clsx(styles.container, {
        [styles.focused]: focused,
        [styles.error]: props.error,
      })}
    >
      <Container
        direction="row"
        gap={8}
        center={{
          vertical: true,
        }}
      >
        <Icon
          icon={{
            url: props.IconUrl,
            size: 32,
          }}
        />
        <Text font="proto_mono">{props.title}</Text>
      </Container>
      <Container direction="row" gap={6} className={styles.balance}>
        <Text size="xx-sm" theme="secondary-dark">
          Balance :{" "}
          {formatBalance(props.max, props.decimals, {
            commify: true,
          })}{" "}
          {props.symbol}
        </Text>

        <span
          className={styles.max}
          onClick={() => {
            props.onChange({
              target: {
                value: formatBalance(props.max, props.decimals, {
                  precision: props.decimals,
                }),
              },
            } as any);
          }}
        >
          <Text size="xx-sm" weight="bold">
            (max)
          </Text>
        </span>
      </Container>
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={props.value}
        onChange={(e) => {
          if (e.target.value === "" || e.target.value.match(/^\d*\.?\d*$/)) {
            props.onChange(e);
          }
        }}
        className={styles.input}
        placeholder="0.0"
        min="0"
        max={props.max}
        step="any"
        required
        autoComplete="off"
      />
      <span
        className={styles["error-message"]}
        style={{
          opacity: props.error ? 1 : 0,
        }}
      >
        {props.errorMessage}
      </span>
    </Container>
  );
};

export default Amount;
