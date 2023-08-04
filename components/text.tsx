import localFont from "next/font/local";
import { styled } from "styled-components";

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

// const Text = styled.p<Props>`
//   font-family: ${(props) => props.name};
//   font-weight: ${(props) => props.weight};
//   font-size: ${(props) => props.size};
//   line-height: 140%;
//   letter-spacing: -0.32px;
// `;

//using inline

const Text = ({ name, weight, size, children }: Props) => {
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
      }}
    >
      {children}
    </p>
  );
};

export default Text;
