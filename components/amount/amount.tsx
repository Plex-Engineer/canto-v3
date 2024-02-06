import { formatBalance } from "@/utils/formatting";
import Icon from "../icon/icon";
import Text from "../text";
import styles from "./amount.module.scss";
import Container from "../container/container";
import { useMemo, useState } from "react";
import clsx from "clsx";
import Spacer from "../layout/spacer";
import { validateNonWeiUserInputTokenAmount } from "@/utils/math";
import Analytics from "@/provider/analytics";
interface Props {
  IconUrl: string;
  title: string;
  symbol: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>, max: boolean) => void;
  decimals: number;
  value: string;
  min: string;
  max: string;
  limit?: {
    limitName: string;
    limit: string;
  };
  extraNode?: React.ReactNode;
  maxName?: string;
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
    }
    const decimalsPart = parts[1];
    if (decimalsPart.length > decimals) {
      return `${parts[0]}.${decimalsPart.slice(0, decimals)}~`;
    }
    return amount;
  }

  //commify and formatAmount
  function displayAmount(amount: string, decimals: number) {
    return formatAmount(commify(amount), decimals);
  }

  // deal with error inputs
  const inputError = useMemo(
    () =>
      validateNonWeiUserInputTokenAmount(
        props.value,
        props.min,
        props.limit?.limit ?? props.max,
        props.symbol,
        props.decimals
      ),
    [
      props.value,
      props.max,
      props.min,
      props.decimals,
      props.symbol,
      props.limit?.limit,
    ]
  );

  return (
    <Container
      direction="row"
      className={clsx(styles.container, {
        [styles.focused]: focused,
        [styles.error]: inputError.error && props.value,
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
      <Container
        direction="row"
        gap={6}
        className={styles.balance}
        width="100%"
      >
        <Text size="xx-sm" theme="secondary-dark">
          {props.limit ? `${props.limit.limitName}: ` : "Balance: "}
          {formatBalance(props.limit?.limit ?? props.max, props.decimals, {
            commify: true,
            symbol: props.symbol,
          })}
        </Text>
        {props.extraNode ? (
          <div className={styles.extra}>{props.extraNode}</div>
        ) : (
          <span
            className={styles.max}
            onClick={() => {
              Analytics.actions.events.maxClicked(
                props.maxName ?? "Max Button"
              );
              props.onChange(
                {
                  target: {
                    value: formatBalance(
                      props.limit?.limit ?? props.max,
                      props.decimals,
                      {
                        precision: props.decimals,
                      }
                    ),
                  },
                } as any,
                true
              );
            }}
          >
            <Text size="xx-sm" weight="bold">
              {`(${props.limit?.limitName ?? "max"})`}
            </Text>
          </span>
        )}
      </Container>
      <Spacer width="20px" />
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        value={focused ? commify2(props.value) : displayAmount(props.value, 4)}
        onChange={(e) => {
          e.target.value = decommify(e.target.value);
          if (e.target.value === "" || e.target.value.match(/^\d*\.?\d*$/)) {
            props.onChange(e, false);
          }
        }}
        className={styles.input}
        placeholder="0.0"
        min={props.min}
        max={props.max}
        step="any"
        required
        autoComplete="off"
      />
      <span
        className={styles["error-message"]}
        style={{
          opacity: inputError.error && props.value ? 1 : 0,
        }}
      >
        {inputError.error ? inputError.reason : ""}
      </span>
    </Container>
  );
};

export default Amount;
