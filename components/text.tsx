"use client";
import { styled } from "styled-components";

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

const sizes: Record<string, number> = {
  "xx-sm": 12,
  "x-sm": 14,
  sm: 16,
  md: 18,
  lg: 20,
  "x-lg": 24,
  title: 32,
};

const themes: Record<string, string> = {
  "primary-light": "var(--text-light-color)",
  "primary-dark": "var(--text-dark-color)",
  "secondary-light": "var(--card-subtle-color, #CACACA)",
  "secondary-dark": "var(--text-dark-40-color)",
};

const semantics: Record<string, string> = {
  title: "h1",
  "x-lg": "h2",
  lg: "h3",
  md: "p",
  sm: "h4",
  "x-sm": "h5",
  "xx-sm": "h6",
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
    <Styled
      //   as={semantics[size ?? "md"]}
      color={color}
      $ktheme={theme}
      opacity={opacity}
      weight={weight}
      size={size}
      className={className}
      $kfont={font}
      style={style}
    >
      {children}
    </Styled>
  );
};

const Styled = styled.p<{
  $kfont?: string;
  color?: string;
  $ktheme?: string;
  opacity?: number;
  weight?: string;
  size?: "xx-sm" | "x-sm" | "sm" | "md" | "lg" | "x-lg" | "title";
}>`
  font-family: ${({ $kfont: kFont }) =>
    kFont == "proto_mono" ? "var(--proto-mono)" : "var(--rm-mono)"};
  opacity: ${({ opacity }) => opacity ?? 1};
  font-weight: ${({ weight }) => weight};
  font-size: ${({ size }) => sizes[size ?? "md"] + "px"};
  line-height: 140%;
  letter-spacing: -0.32px;
  color: ${({ $ktheme: kTheme, color }) =>
    color == null ? themes[kTheme ?? "primary-dark"] : color};
`;

export default Text;
