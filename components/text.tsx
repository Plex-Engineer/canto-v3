import styled from "styled-components";

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
  role?: string;
  onClick?: () => void;
  responsive?: boolean;
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

const Text = styled.p<Props>`
  font-family: ${(props) =>
    props.font == "proto_mono" ? "var(--proto-mono)" : "var(--rm-mono)"};
  font-weight: ${(props) => props.weight ?? "normal"};
  line-height: 140%;
  letter-spacing: -0.32px;
  font-size: ${(props) => sizes[props.size ?? "md"]}px;
  color: ${(props) =>
    props.color
      ? props.color
      : props.theme != undefined
        ? themes[props.theme as keyof typeof themes]
        : themes["primary-dark"]};
  opacity: ${(props) => props.opacity ?? 1};

  @media screen and (max-width: 768px) {
    font-size: ${(props) =>
      !props.responsive
        ? sizes[props.size ?? "md"] - 4
        : sizes[props.size ?? "md"]}px;
  }
`;

export default Text;
