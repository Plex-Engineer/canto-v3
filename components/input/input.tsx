import React from "react";
import styles from "./input.module.scss";
import Text from "../text";
import clsx from "clsx";
import Button from "../button/button";
import { formatBalance } from "@/utils/formatting";

// if amount is true then add more required props
type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  backgroundColor?: string;
  height?: "sm" | "md" | "lg" | number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  labelClassName?: string;
  labelStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  name?: string;
  id?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
} & (
  | {
      type: "amount";
      balance: string;
      decimals: number;
    }
  | {
      type: "text";
    }
  | {
      type: "number";
    }
);

const Input = (props: InputProps) => {
  function getHeight(height: InputProps["height"]) {
    switch (height) {
      //   in px
      case "sm":
        return "30px";
      case "md":
        return "50px";
      case "lg":
        return "60px";
      default:
        return `${height}px`;
    }
  }

  return (
    <div
      className={styles["input-container"]}
      style={{
        height: getHeight(props.height),
      }}
    >
      <label
        htmlFor={props.id}
        className={props.labelClassName}
        style={props.labelStyle}
      >
        <Text font="rm_mono" size="sm">
          {props.label}
          {props.type === "amount" && (
            <span className={styles["balance"]}>
              Balance:{" "}
              {formatBalance(props.balance, props.decimals, {
                commify: true,
              })}
            </span>
          )}
        </Text>
      </label>
      <section>
        <input
          type={props.type}
          value={props.value}
          onChange={
            props.type === "amount"
              ? (e) => {
                  if (
                    e.target.value === "" ||
                    e.target.value.match(/^\d*\.?\d*$/)
                  ) {
                    props.onChange(e);
                  }
                }
              : props.onChange
          }
          placeholder={props.placeholder}
          className={clsx(props.className)}
          disabled={props.disabled}
          name={props.name}
          id={props.id}
          maxLength={props.maxLength}
          min={props.min}
          max={props.max}
          step={props.step}
          required={props.required}
          autoComplete="off"
          style={{
            height: getHeight(props.height),

            backgroundColor: props.error
              ? " #ff000017"
              : props.backgroundColor ?? "",
            border: props.error
              ? "1px solid var(--extra-failure-color, #ff0000)"
              : "",
            ...props.style,
            fontFamily: "var(--rm-mono)",
            fontSize: props.type === "amount" ? "1.5rem" : "1rem",
          }}
        />
        {props.type === "amount" && (
          <Button
            onClick={() => {
              props.onChange({
                target: {
                  value: formatBalance(props.balance, props.decimals, {
                    precision: props.decimals,
                  }),
                },
              } as any);
            }}
            height={Number(getHeight(props.height).slice(0, -2))}
          >
            MAX
          </Button>
        )}
      </section>

      <span
        className={styles["error-message"]}
        style={{
          opacity: props.error ? 1 : 0,
        }}
      >
        {props.errorMessage}
      </span>
    </div>
  );
};

export default Input;
