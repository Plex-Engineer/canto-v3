import Text from "../text";
import styles from "./toggleGroup.module.scss";
import {Posthog} from "../../app/posthog"
interface Props {
  options: string[];
  selected: string;
  setSelected: (selected: string) => void;
}
const ToggleGroup = (props: Props) => {
  return (
    <div className={styles.container} data-count={props.options.length}>
      <div
        className={styles.bg}
        style={{
          width: `calc(${100 / props.options.length}% - 3px)`,
          left: `${
            (props.options.indexOf(props.selected) * 100) / props.options.length
          }%`,
        }}
      ></div>
      {props.options.map((option, index) => {
        return (
          <div
            key={index}
            className={`${styles.option} ${
              props.selected === option ? styles.selected : ""
            }`}
            onClick={() => {
              Posthog.events.lpInterfaceActions.setFilter(option)
              props.setSelected(option)
            }}
          >
            <Text key={option} size="sm">
              {option}
            </Text>
          </div>
        );
      })}
    </div>
  );
};

export default ToggleGroup;
