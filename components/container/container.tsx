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

const Container = (props: Props) => {
  return (
    <div
      className={props.className}
      onClick={props.onClick}
      style={{
        margin: props.margin,
        padding: props.padding,
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
        alignItems: props.center?.vertical ? "center" : "unset",
        zIndex: props.layer,
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};

export default Container;
