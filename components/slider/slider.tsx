import Text from "../text";
import styles from "./slider.module.scss";

interface Props {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
  step: number;
  className?: string;
}
const Slider = (props: Props) => {
  return (
    <div className={styles.container}>
      <Text className={styles.label} font="proto_mono" size="sm">
        {props.label}
      </Text>

      <input
        className={styles.slider}
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(parseInt(e.target.value))}
        step={props.step}
      />
      <div className={styles.steps}>
        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>
        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
        <div className={styles.smallStep}></div>

        <div className={styles.step}></div>
      </div>
    </div>
  );
};

export default Slider;
