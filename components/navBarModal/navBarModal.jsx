import React from "react";
import styles from "./navBarModal.module.scss"; // Add your modal styles
import Link from "next/link";
import Text from "../text";
import Button from "../button/button";

const MoreOptionsModal = ({ onClose, onSelect }) => {
  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <Link href="/staking" onClick={() => onSelect("staking")}>
          <Text size="sm">Staking</Text>
        </Link>
        <Link href="/governance" onClick={() => onSelect("governance")}>
          <Text size="sm">Governance</Text>
        </Link>
      </div>
      <Button className={styles.closeButton} onClick={onClose}>
        Close
      </Button>
    </div>
  );
};

export default MoreOptionsModal;
