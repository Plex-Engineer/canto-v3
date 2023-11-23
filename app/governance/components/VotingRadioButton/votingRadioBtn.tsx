import React from 'react';
import styles from './votingRadioBtn.module.scss'; // Assuming you have a separate CSS module for styles
import { VoteOption } from "@/hooks/gov/interfaces/voteOptions";


interface Props {
    value: VoteOption;
    selectedValue: VoteOption | null;
    onChange:()=> void;
    isActive: boolean;
    //checkedColor : string;
    isChecked: boolean;
  }

const RadioButton = (props: Props) => {
  return (

        <div className={styles.radioBtn} >
            <input
                type="radio"
                name="voteOption"
                value={props.value}
                checked={props.isChecked}
                onChange={props.onChange}
                disabled={!props.isActive}
            />
            {/* <style>
                {`.${styles.radioBtn} input[type='radio']:checked:after {
                background-color: ${props.checkedColor} !important;
                }`}
        </style> */}
        </div>
    
  );
};

export default RadioButton;
