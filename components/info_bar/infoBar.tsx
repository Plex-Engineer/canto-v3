import Text from "../text";
import styles from "./info.module.scss";
import Marquee from "react-fast-marquee";

interface Props {
  values: {
    name: string;
    value: string;
    change: string;
    isPositive: boolean;
  }[];
}

const InfoBar = ({ values }: Props) => {
  return (
    <div className={styles.container}>
      <Marquee delay={1} pauseOnHover speed={20} autoFill>
        <div className={styles.content}>
          {values.map((value, idx) => (
            <div
              key={value.name}
              style={{
                display: "flex",
                gap: "5rem",
              }}
            >
              <div key={value.name} className={styles.item}>
                <Text color="var(--text-only-light" opacity={90} size="x-sm">
                  {value.name}
                </Text>
                <Text color="var(--text-only-light" opacity={90} size="x-sm">
                  {value.value}
                </Text>
                <Text
                  color={
                    value.isPositive
                      ? "var(--extra-success-color)"
                      : "var(--extra-failure-color)"
                  }
                  size="x-sm"
                >
                  {value.change}
                </Text>
              </div>

              <Text
                color="var(--text-only-light"
                opacity={90}
                key={value.name + " text"}
              >
                /
              </Text>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
};

export default InfoBar;
