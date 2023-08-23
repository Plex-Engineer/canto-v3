import React from "react";
interface Props {
  height?: string;
  width?: string;
}
const Spacer = ({ height, width }: Props) => {
  return (
    <div
      style={{
        height: height,
        width: width,
      }}
    ></div>
  );
};

export default Spacer;
