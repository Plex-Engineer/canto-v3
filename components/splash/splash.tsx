"use client";

import Rive from "@rive-app/react-canvas";

interface Props {
  height?: string;
  width?: string;
}
const Splash = (props: Props) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: " 100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Rive
        // src="anims/hey-ho.riv"
        src="anims/loading.riv"
        stateMachines={["loop"]}
        style={{
          height: props.height || "800px",
          width: props.width || "800px",
        }}
      />
    </div>
  );
};

export default Splash;
