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
      <input
        className={styles.slider}
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(parseInt(e.target.value))}
        step={props.step}
      />
      <div className={styles.label}>{props.label}</div>
    </div>
  );
};

export default Slider;
