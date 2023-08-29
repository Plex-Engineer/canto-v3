import React from "react";
import styles from "./input.module.scss";

interface InputProps {
  type: "text" | "number" | "amount";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        {props.label}
      </label>
      <input
        type={props.type}
        value={props.value}
        onChange={props.onChange}
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
      />
      {props.error && (
        <span className={styles["error-message"]}>{props.errorMessage}</span>
      )}
    </div>
  );
};

export default Input;
