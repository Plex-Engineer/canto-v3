import React from "react";
import Text from "../text";
import styles from "./price.module.scss";
import clsx from "clsx";

interface Props {
  title: string;
  price: string;
  onPriceChange: (price: string) => void;
  description: string;
}
const Price = (props: Props) => {
  const ref = React.useRef<any>(null);
  const [focused, setFocused] = React.useState(false);
  return (
    <div
      className={clsx(styles.container, focused ? styles.focused : "")}
      onClick={() => {
        ref.current.focus();
      }}
      onFocus={
        focused
          ? () => {}
          : () => {
              setFocused(true);
            }
      }
      onBlur={() => setFocused(false)}
    >
      <Text theme="secondary-dark" size="sm">
        {props.title}
      </Text>
      <input
        ref={ref}
        className={styles.input}
        value={props.price}
        onChange={(e) => props.onPriceChange(e.target.value)}
      />
      <Text size="sm" theme="secondary-dark">
        {props.description}
      </Text>
    </div>
  );
};

export default Price;
