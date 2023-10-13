interface Props {
  font?: "rm_mono" | "proto_mono";
  weight?: "normal" | "bold";
  size?: "xx-sm" | "x-sm" | "sm" | "md" | "lg" | "x-lg" | "title";
  opacity?: number;
  theme?:
    | "primary-light"
    | "primary-dark"
    | "secondary-light"
    | "secondary-dark";
  color?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  className?: string;
}

const sizes = {
  "xx-sm": 12,
  "x-sm": 14,
  sm: 16,
  md: 18,
  lg: 20,
  "x-lg": 24,
  title: 32,
};

const themes = {
  "primary-light": "var(--text-light-color)",
  "primary-dark": "var(--text-dark-color)",
  "secondary-light": "var(--card-subtle-color, #CACACA)",
  "secondary-dark": "var(--text-dark-40-color)",
};

const Text = ({
  font,
  weight,
  size,
  children,
  color,
  theme,
  style,
  opacity,
  className,
}: Props) => {
  return (
    <p
      className={className}
      style={{
        fontFamily:
          font == "proto_mono" ? "var(--proto-mono)" : "var(--rm-mono)",
        opacity: opacity ?? 1,
        fontWeight: weight,
        fontSize: sizes[size ?? "md"],
        lineHeight: "140%",
        letterSpacing: "-0.32px",
        color: color == null ? themes[theme ?? "primary-dark"] : color,
        ...style,
      }}
    >
      {children}
    </p>
  );
};

export default Text;
