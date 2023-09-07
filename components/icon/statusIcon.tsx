import Icon from "./icon";

interface Props {
  status: "NONE" | "PENDING" | "SIGNING" | "SUCCESS" | "ERROR";
  color?: "primary" | "accent" | "dark";
  className?: string;
  size?: number;
}

const StatusIcon = (props: Props) => {
  return (
    <Icon
      icon={{
        url:
          props.status === "SUCCESS"
            ? "check.svg"
            : props.status === "ERROR"
            ? "close.svg"
            : props.status === "PENDING" || props.status === "SIGNING"
            ? "loader.svg"
            : "",
        size: props.size,
      }}
      className={props.className}
      color={props.color}
    />
  );
};
export default StatusIcon;
