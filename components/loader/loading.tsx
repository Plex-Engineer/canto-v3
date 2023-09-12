import React from "react";
import Icon from "../icon/icon";
import styles from "./loading.module.scss";
import clsx from "clsx";
interface Props {
  size?: number;
  className?: string;
}
const LoadingIcon = ({ size, className }: Props) => {
  return (
    <Icon
      icon={{
        url: "loader.svg",
        size: size,
      }}
      className={clsx(styles.anim, className)}
    />
  );
};

export default LoadingIcon;
