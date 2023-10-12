import Image from "next/image";
import React from "react";
interface Props {
  icon: {
    url: string;
    size?: number;
  };
  color?: "primary" | "accent" | "dark";
  className?: string;
  themed?: boolean;
  style?: React.CSSProperties;
}

const Icon = (props: Props) => {
  return (
    <Image
      className={props.className}
      src={props.icon.url}
      style={{
        filter: props.themed
          ? props.color == "primary"
            ? "invert(var(--light-mode))"
            : props.color == "accent"
            ? "invert(0)"
            : "invert(var(--dark-mode))"
          : "",
        ...props.style,
      }}
      alt="icon"
      width={props.icon.size || 16}
      height={props.icon.size || 16}
      //   className={styles.icon}
    ></Image>
  );
};

export default Icon;
