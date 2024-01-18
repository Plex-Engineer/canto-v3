import React from "react";
import styles from "./RadioButton.module.scss"; // Assuming you have a separate CSS module for styles
import { VoteOption } from "@/hooks/gov/interfaces/voteOptions";

interface Props {
  value: VoteOption;
  selectedValue: VoteOption | null;
  onClick: () => void;
  isActive: boolean;
  checkedColor: string;
}

export const RadioButton = (props: Props) => {
  const isSelected = props.value == props.selectedValue;

  const getStyles = () => {
    if (props.selectedValue == props.value) {
      return { backgroundColor: props.checkedColor, opacity: 1 };
    }
    return {};
  };
  const handleClick = () => {
    if (props.isActive) {
      props.onClick();
    }
  };

  return (
    <div
      className={styles.radioBtn2}
      onClick={handleClick}
      style={getStyles()}
    ></div>
  );
};

export default RadioButton;