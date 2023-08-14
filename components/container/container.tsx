interface Props {
  children: React.ReactNode;
  margin?: "xx-sm" | "x-sm" | "sm" | "reg" | "lg" | "x-lg";
  padding?: "xx-sm" | "x-sm" | "sm" | "reg" | "lg" | "x-lg";
  width?: string;
  height?: string;
  backgroundColor?: string;
  direction?: "row" | "column";
  gap?: number;
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
      }}
    >
      {props.children}
    </div>
  );
};

export default Container;
