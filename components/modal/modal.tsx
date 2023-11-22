import ReactDOM from "react-dom";
import styles from "./modal.module.scss";
import React, { useEffect } from "react";
import { useScrollLock } from "../utils/scrollLock";
import Icon from "../icon/icon";
import Container from "../container/container";
import Text from "../text";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  width?: string;
  height?: string;
  closeOnOverlayClick?: boolean;
  padded?: boolean;
}

const Modal = ({
  onClose,
  children,
  title,
  width = "32rem",
  height,
  open,
  padded = true,
  closeOnOverlayClick = true,
}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const { lockScroll, unlockScroll } = useScrollLock();

  function handleClose(e?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e?.stopPropagation();
    ref.current?.classList.add(styles.fadeout);
    setTimeout(() => {
      onClose();
    }, 400);
  }

  useEffect(() => {
    if (open) {
      lockScroll(0);
    } else {
      unlockScroll();
    }
  }, [open, lockScroll, unlockScroll]);

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={closeOnOverlayClick ? handleClose : undefined}
      ref={ref}
    >
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
        <div
          className={styles.modal}
          style={{
            padding: padded ? "15px" : "0px",
            width: width ? width : "auto",
          }}
        >
          <Container className={styles.close} onClick={handleClose}>
            <Icon
              themed
              icon={{
                url: "close.svg",
                size: 40,
              }}
            />
          </Container>

          {title && (
            <div className={styles.header}>
              <Text font="proto_mono" size="lg" className={styles.title}>
                {title}
              </Text>
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
