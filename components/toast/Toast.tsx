import React, { useEffect, useMemo, useState } from "react";
import Text from "../text";
import styles from "./toast.module.scss";
import { ToastItem } from "./ToastContainer";
import Icon from "../icon/icon";
import Container from "../container/container";

interface Props {
  toast: ToastItem;
  onClose: () => void;
}

export const Toast = ({ toast, onClose }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!toast.autoClose || !toast.autoCloseDuration) return;
    const timeout = setTimeout(() => {
      handleClose();
    }, toast.autoCloseDuration);
    return () => clearTimeout(timeout);
  }, []);

  function handleClose() {
    ref.current?.classList.add(styles["toast-close-animation"]);
    setTimeout(() => {
      onClose();
    }, 400);
  }

  return (
    <div
      className={`${styles["toast"]}  ${
        toast.success == null
          ? styles["toast-neutral"]
          : toast.success
            ? styles["toast-success"]
            : styles["toast-error"]
      }`}
      ref={ref}
    >
      <Icon
        className={styles["toast-icon"]}
        icon={{
          url:
            toast.success == null
              ? "/neutral.svg"
              : toast.success === true
                ? "/success.svg"
                : "/error.svg",
          size: {
            width: 28,
            height: 28,
          },
        }}
      />
      <div className={styles["toast-text"]}>
        <Text size="x-sm">{toast.primary}</Text>
        {toast.secondary && (
          <Text size="xx-sm" color="var(--toast-secondary-text-color)">
            {toast.secondary}
          </Text>
        )}
      </div>
      <Container className={styles["toast-close"]} onClick={handleClose}>
        <Icon
          icon={{
            url: "/close.svg",
            size: {
              width: 24,
              height: 24,
            },
          }}
          themed
        />
      </Container>
    </div>
  );
};
