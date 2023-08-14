import localFont from "next/font/local";

const rm_mono = localFont({
  src: "../fonts/rm-mono-regular.ttf",
  weight: "300",
  style: "normal",
});

const proto_mono = localFont({
  src: "../fonts/proto-mono-regular.ttf",
  weight: "300",
  style: "normal",
});

interface Props {
  name?: "rm_mono" | "proto_mono";
  weight?: "regular" | "bold";
  size?: "xx-sm" | "x-sm" | "sm" | "reg" | "lg" | "x-lg";
  theme?:
    | "primary-light"
    | "primary-dark"
    | "secondary-light"
    | "secondary-dark";
  color?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const sizes = {
  "xx-sm": 12,
  "x-sm": 14,
  sm: 16,
  reg: 18,
  lg: 20,
  "x-lg": 24,
};

const themes = {
  "primary-light": "var(--text-light-color)",
  "primary-dark": "var(--text-dark-color)",
  "secondary-light": "var(--card-subtle-color, #CACACA)",
  "secondary-dark": "var(--text-dark-40-color)",
};

const Text = ({ name, weight, size, children, color, theme, style }: Props) => {
  return (
    <p
      style={{
        fontFamily:
          name == "proto_mono"
            ? proto_mono.style.fontFamily
            : rm_mono.style.fontFamily,
        fontWeight: weight,
        fontSize: sizes[size ?? "reg"],
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
