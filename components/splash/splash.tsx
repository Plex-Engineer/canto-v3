"use client";

import Rive from "@rive-app/react-canvas";

interface Props {
  height?: string;
  width?: string;
  color?: "primary" | "accent" | "dark";
}
const Splash = (props: Props) => {
  //   if mobile only
  if (!window.matchMedia("(min-width: 768px)").matches) {
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
          src="anims/loading.riv"
          stateMachines={["loop"]}
          style={{
            filter:
              props.color == "primary"
                ? "invert(var(--light-mode))"
                : props.color == "accent"
                  ? "invert(0)"
                  : "invert(var(--dark-mode))",
            height: "400px",
            width: "400px",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Rive
        // src="anims/hey-ho.riv"
        src="anims/loading.riv"
        stateMachines={["loop"]}
        style={{
          filter:
            props.color == "primary"
              ? "invert(var(--light-mode))"
              : props.color == "accent"
                ? "invert(0)"
                : "invert(var(--dark-mode))",
          height: props.height || "800px",
          width: props.width || "800px",
        }}
      />
    </div>
  );
};

export default Splash;
