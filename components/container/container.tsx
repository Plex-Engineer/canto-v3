interface Props {
  children: React.ReactNode;
  margin?: "xx-sm" | "x-sm" | "sm" | "reg" | "lg" | "x-lg";
  padding?: "xx-sm" | "x-sm" | "sm" | "reg" | "lg" | "x-lg";
  width?: string;
  height?: string;
  backgroundColor?: string;
  direction?: "row" | "column";
  gap?: number;
  center?: {
    horizontal?: boolean;
    vertical?: boolean;
  };
  layer?: number;
}

const Container = (props: Props) => {
  return (
    <div
      style={{
        margin: props.margin,
        padding: props.padding,
        width: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor,
        display: "flex",
        flexDirection: props.direction ?? "column",
        gap: props.gap,
        justifyContent: props.center?.horizontal ? "center" : "unset",
        alignItems: props.center?.vertical ? "center" : "unset",
        zIndex: props.layer,
      }}
    >
      {props.children}
    </div>
  );
};

export default Container;
