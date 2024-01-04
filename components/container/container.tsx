import { get } from "http";

interface Props {
  children: React.ReactNode;
  margin?: "xx-sm" | "x-sm" | "sm" | "md" | "lg" | "x-lg";
  padding?: "xx-sm" | "x-sm" | "sm" | "md" | "lg" | "x-lg";
  width?: string;
  height?: string;
  backgroundColor?: string;
  direction?: "row" | "column";
  gap?: number | "auto";
  center?: {
    horizontal?: boolean;
    vertical?: boolean;
  };
  layer?: number;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

function getMargin(margin: Props["margin"]) {
  switch (margin) {
    case "xx-sm":
      return "4px";
    case "x-sm":
      return "8px";
    case "sm":
      return "16px";
    case "md":
      return "24px";
    case "lg":
      return "32px";
    case "x-lg":
      return "48px";
    default:
      return margin;
  }
}
const Container = (props: Props) => {
  return (
    <div
      className={props.className}
      onClick={props.onClick}
      style={{
        margin: getMargin(props.margin),
        padding: getMargin(props.padding),
        width: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor,
        display: "flex",
        flexDirection: props.direction ?? "column",
        gap: props.gap,
        justifyContent:
          props.gap == "auto"
            ? "space-between"
            : props.center?.horizontal
              ? "center"
              : "unset",
        alignItems: props.center?.vertical ? "center" : "",
        zIndex: props.layer,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};

export default Container;
