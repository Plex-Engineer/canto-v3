import React, { useEffect } from "react";
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
    if (toast.duration == undefined) return;

    const timeout = setTimeout(() => {
      handleClose();
    }, toast.duration);
    return () => clearTimeout(timeout);
  }, [toast.duration]);

  function handleClose() {
    ref.current?.classList.add(styles["toast-close-animation"]);
    setTimeout(() => {
      onClose();
    }, 500);
  }

  return (
    <div
      className={`${styles["toast"]}  ${
        toast.state == "neutral"
          ? styles["toast-neutral"]
          : toast.state == "success"
            ? styles["toast-success"]
            : styles["toast-error"]
      }`}
      ref={ref}
    >
      <Icon
        className={styles["toast-icon"]}
        icon={{
          url:
            toast.state == "neutral"
              ? "/neutral.svg"
              : toast.state === "success"
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
