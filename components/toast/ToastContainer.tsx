import { ToastContext } from "./ToastContext";
import { Toast } from "./Toast";
import { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./container.module.scss";
export interface ToastItem {
  toastId: string;
  success: boolean | undefined;
  primary: string;
  secondary?: string;
  autoClose: boolean;
  autoCloseDuration: number;
}

interface Props {
  children: React.ReactNode;
}

export const ToastContainer = ({ children }: Props) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = (toast: Partial<ToastItem>) => {
    const {
      toastId = new Date().getTime().toString(),
      success,
      primary = "Default toast message",
      secondary,
      autoClose = false,
      autoCloseDuration = 10000,
    } = toast;

    return setToasts((currentToasts) => [
      ...currentToasts,
      {
        toastId,
        success,
        primary,
        secondary,
        autoClose,
        autoCloseDuration,
      },
    ]);
  };

  const dismiss = (id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.toastId !== id)
    );
  };
  const contextValue = { add };
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {ReactDOM.createPortal(
        <div className={`${styles["toast-container"]} ${styles["top-right"]}`}>
          {toasts.map((toast) => (
            <Toast
              key={toast.toastId}
              onClose={() => dismiss(toast.toastId)}
              toast={toast}
            />
          ))}
        </div>,
        document.querySelector("#toast-root")!
      )}
    </ToastContext.Provider>
  );
};
