import React from "react";
import styles from "./input.module.scss";
import Text from "../text";

interface InputProps {
  type: "text" | "number" | "amount";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  backgroundColor?: string;
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
  autoFocus?: boolean;
  autoComplete?: string;
  pattern?: string;
  readOnly?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}
const Input = (props: InputProps) => {
  return (
    <div className={styles["input-container"]}>
      <label
        htmlFor={props.id}
        className={props.labelClassName}
        style={props.labelStyle}
      >
        <Text font="rm_mono" size="sm">
          {props.label}
        </Text>
      </label>
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
        className={props.className}
        disabled={props.disabled}
        name={props.name}
        id={props.id}
        maxLength={props.maxLength}
        min={props.min}
        max={props.max}
        step={props.step}
        required={props.required}
        autoFocus={props.autoFocus}
        autoComplete={props.autoComplete}
        pattern={props.pattern}
        readOnly={props.readOnly}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        style={{
          backgroundColor: props.error
            ? " #ff000017"
            : props.backgroundColor ?? "",
          border: props.error
            ? "1px solid var(--extra-failure-color, #ff0000)"
            : "",
          ...props.style,
          fontSize: props.type === "amount" ? "1.5rem" : "1rem",
        }}
      />

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
