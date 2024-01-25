import Icon from "@/components/icon/icon";
import styles from "./item.module.scss";
import Text from "@/components/text";

type ItemProps = {
  name: string | React.ReactNode;
  value: string;
  symbol?: React.ReactNode;
  theme?:
    | "primary-light"
    | "primary-dark"
    | "secondary-light"
    | "secondary-dark"
    | undefined;

  color: string;
};

const Item = ({ name, value, theme, symbol, color }: ItemProps) => (
  <div className={styles.item}>
    {typeof name === "string" ? (
      <Text
        className={styles.title}
        color={color}
        theme={theme}
        size="sm"
        opacity={0.5}
        font="proto_mono"
      >
        {name}
      </Text>
    ) : (
      name
    )}
    <Text color={color} theme={theme} size="x-lg" font="proto_mono">
      {symbol && (
        <span className={styles.symbol}>
          {
            <Icon
              icon={{
                url: "/tokens/note.svg",
                size: 17,
              }}
              color="primary"
              style={
                theme
                  ? {}
                  : {
                      filter: color == "#ddd" ? "invert(1)" : "",
                    }
              }
              themed={theme ? true : false}
            />
          }
        </span>
      )}
      {value}
    </Text>
  </div>
);

export default Item;
