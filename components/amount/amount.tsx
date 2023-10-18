import { formatBalance } from "@/utils/tokenBalances.utils";
import Icon from "../icon/icon";
import Text from "../text";
import styles from "./amount.module.scss";
import Container from "../container/container";
import { useState } from "react";
import clsx from "clsx";
import Spacer from "../layout/spacer";
interface Props {
  IconUrl: string;
  title: string;
  symbol: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  decimals: number;
  value: string;
  max: string;
  limitName?: string;
  error?: boolean;
  errorMessage?: string;
}
const Amount = (props: Props) => {
  const [focused, setFocused] = useState(false);

  function commify(str: string) {
    const parts = str.split(".");
    return (
      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (parts[1] ? "." + parts[1] : "")
    );
  }

  function commify2(str: string) {
    if (str[0] == ".") {
      return (str = "" + str);
    }
    if (str[str.length - 1] == ".") {
      return commify(str.slice(0, str.length - 1)) + ".";
    }

    const parts = str.split(".");
    return (
      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (parts[1] ? "." + parts[1] : "")
    );
  }

  function decommify(str: string) {
    return str.replace(/,/g, "");
  }
  //   shows only up to 4 decimals and ~ if there are more
  function formatAmount(amount: string, decimals: number) {
    const parts = amount.split(".");
    if (parts.length === 1) {
      return amount;
    } else {
      const decimalsPart = parts[1];
      if (decimalsPart.length > decimals) {
        return `${parts[0]}.${decimalsPart.slice(0, decimals)}~`;
      } else {
        return amount;
      }
    }
  }

  //commify and formatAmount
  function displayAmount(amount: string, decimals: number) {
    return formatAmount(commify(amount), decimals);
  }

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
          {props.limitName ? "Limit: " : "Balance: "}
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
            {`(${props.limitName ?? "max"})`}
          </Text>
        </span>
      </Container>
      <Spacer width="20px" />
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={focused ? commify2(props.value) : displayAmount(props.value, 4)}
        onChange={(e) => {
          e.target.value = decommify(e.target.value);
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
