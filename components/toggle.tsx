"use client";
import { styled } from "styled-components";

interface Props {
  value: boolean;
  children?: React.ReactNode;
  onChange: (value: boolean) => void;
  scale?: number;
  color?: "primary" | "secondary";
}

const Toggle = ({
  value,
  onChange,
  children,
  scale,
  color = "primary",
}: Props) => {
  return (
    <Styled
      value={value}
      scale={scale || 1}
      color={color}
      onClick={() => {
        onChange(!value);
      }}
    >
      <div className="toggle">{children}</div>
    </Styled>
  );
};

export default Toggle;

const Styled = styled.div<{
  value: boolean;
  scale: number;
  color?: "primary" | "secondary";
}>`
  display: inline-flex;
  height: 26px;
  width: 50px;
  padding: 3px 23px 3px 3px;
  align-items: center;
  cursor: pointer;
  scale: ${({ scale }) => scale};
  border: 1px solid
    ${({ value, color }) =>
      color == "primary"
        ? !value
          ? "var(--text-dark-30-color)"
          : "var(--primary-90-color)"
        : "var(--card-surface-color)"};
  position: relative;

  .toggle {
    transition: all 0.2s ease-in-out;
    left: ${({ value }) => (value ? "calc(100% - 23px)" : "1px")};
    top: 50%;
    transform: translateY(-50%);
    height: 90%;
    aspect-ratio: 1;
    position: absolute;
    background-color: ${({ value, color }) =>
      color == "primary"
        ? !value
          ? "var(--text-dark-30-color)"
          : "var(--primary-90-color)"
        : "var(--card-surface-color)"};
  }
`;
