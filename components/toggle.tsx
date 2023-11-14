"use client";
import { styled } from "styled-components";

interface Props {
  value: boolean;
  children?: React.ReactNode;
  onChange: (value: boolean) => void;
  scale?: number;
}

const Toggle = ({ value, onChange, children, scale }: Props) => {
  return (
    <Styled
      value={value}
      scale={scale || 1}
      onClick={() => {
        onChange(!value);
      }}
    >
      <div className="toggle">{children}</div>
    </Styled>
  );
};

export default Toggle;

const Styled = styled.div<{ value: boolean; scale: number }>`
  display: inline-flex;
  height: 26px;
  width: 50px;
  padding: 3px 23px 3px 3px;
  align-items: center;
  cursor: pointer;
  scale: ${({ scale }) => scale};
  border: 1px solid
    ${({ value }) =>
      !value ? "var(--text-dark-30-color)" : "var(--primary-90-color)"};
  position: relative;

  .toggle {
    transition: all 0.2s ease-in-out;
    left: ${({ value }) => (value ? "calc(100% - 23px)" : "1px")};
    top: 50%;
    transform: translateY(-50%);
    height: 90%;
    aspect-ratio: 1;
    position: absolute;
    background-color: ${({ value }) =>
      !value ? "var(--text-dark-30-color)" : "var(--primary-90-color)"};
  }
`;
