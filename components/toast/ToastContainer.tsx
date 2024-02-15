import { ToastContext } from "./ToastContext";
import { Toast } from "./Toast";
import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./container.module.scss";
export interface ToastItem {
  toastID?: string;
  state?: "neutral" | "success" | "failure";
  primary: string;
  secondary?: string;
  duration?: number;
}

export const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = (toast: ToastItem) => {
    const {
      toastID = new Date().getTime().toString(),
      state = "neutral",
      primary,
      secondary,
      duration = 5000,
    } = toast;

    return setToasts((currentToasts) => [
      ...currentToasts,
      {
        toastID,
        state,
        primary,
        secondary,
        duration,
      },
    ]);
  };

  const dismiss = (id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.toastID !== id)
    );
  };

  const contextValue = { add };
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className={`${styles["toast-container"]} ${styles["top-right"]}`}>
          {toasts.map((toast) => (
            <Toast
              key={toast.toastID}
              onClose={() => dismiss(toast.toastID!)}
              toast={toast}
            />
          ))}
        </div>,
        document.querySelector("#toast-root")!
      )}
    </ToastContext.Provider>
  );
};
