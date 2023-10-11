"use client";
import { styled } from "styled-components";

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

const Toggle = ({ value, onChange }: Props) => {
  return (
    <Styled
      value={value}
      onClick={() => {
        onChange(!value);
      }}
    >
      <div className="toggle"></div>
    </Styled>
  );
};

export default Toggle;

const Styled = styled.div<{ value: boolean }>`
  display: inline-flex;
  height: 26px;
  width: 50px;
  padding: 3px 23px 3px 3px;
  align-items: center;
  cursor: pointer;
  border: 1px solid
    ${({ value }) =>
      !value ? "var(--text-dark-30-color)" : "var(--primary-90-color)"};
  position: relative;

  .toggle {
    transition: all 0.2s ease-in-out;
    left: ${({ value }) => (value ? "calc(100% - 22px)" : "1px")};
    top: 50%;
    transform: translateY(-50%);
    height: 90%;
    aspect-ratio: 1;
    position: absolute;
    background-color: ${({ value }) =>
      !value ? "var(--text-dark-30-color)" : "var(--primary-90-color)"};
  }
`;
