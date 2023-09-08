import LoadingIcon from "../loader/loading";
import Icon from "./icon";

interface Props {
  status: "NONE" | "PENDING" | "SIGNING" | "SUCCESS" | "ERROR";
  color?: "primary" | "accent" | "dark";
  className?: string;
  size?: number;
}

const StatusIcon = (props: Props) => {
  if (props.status === "PENDING" || props.status === "SIGNING")
    return <LoadingIcon size={props.size} />;
  return (
    <Icon
      icon={{
        url:
          props.status === "SUCCESS"
            ? "check.svg"
            : props.status === "ERROR"
            ? "close.svg"
            : "",
        size: props.size,
      }}
      className={props.className}
      color={props.color}
    />
  );
};
export default StatusIcon;
