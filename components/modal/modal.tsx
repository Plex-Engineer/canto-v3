import ReactDOM from "react-dom";
import styles from "./modal.module.scss";
import React, { useEffect } from "react";
import { useScrollLock } from "../utils/scrollLock";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  height?: string;
}

const Modal = ({ onClose, children, title, width, height, open }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const { lockScroll, unlockScroll } = useScrollLock();

  function handleClose(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    ref.current?.classList.add(styles.fadeout);
    setTimeout(() => {
      onClose();
    }, 400);
  }

  useEffect(() => {
    if (open) {
      lockScroll(8);
    } else {
      unlockScroll();
    }
  }, [open, lockScroll, unlockScroll]);

  const modalContent = (
    <div className={styles.overlay} onClick={handleClose} ref={ref}>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={styles.wrapper}
        style={{
          width: width ? width : "auto",
          height: height ? height : "auto",
        }}
      >
        <div className={styles.modal}>
          <img
            className={styles.close}
            onClick={handleClose}
            src="icons/close.svg"
            alt="close"
            height={20}
          />
          {title && (
            <div className={styles.header}>
              <h3 className={styles.title}>{title}</h3>
            </div>
          )}
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </div>
  );
  if (open) {
    return ReactDOM.createPortal(
      modalContent,
      document.querySelector("#modal-root")!
    );
  } else {
    return null;
  }
};

export default Modal;
