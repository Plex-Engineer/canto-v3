import React, { useEffect } from "react";
import Text from "../text";
import styles from "./toast.module.scss";
import { ToastItem } from "./ToastContainer";

interface Props{
  toast: ToastItem;
  onClose : () => void;
}

export const Toast = ({
  toast,
  onClose
}: Props) => {
  useEffect(() => {
    if (!toast.autoClose || !toast.autoCloseDuration) return;
      const timeout = setTimeout(() => onClose(), toast.autoCloseDuration);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={styles["toast"]} >
        <Text>{toast.message}</Text> 
        <button onClick={onClose} className="toast-close" >x</button>
    </div>
  );
};

