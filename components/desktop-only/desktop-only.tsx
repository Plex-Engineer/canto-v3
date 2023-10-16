import React from "react";
import Text from "../text";
import Container from "../container/container";
import styles from "./desktop-only.module.scss";
const DesktopOnly = () => {
  return (
    <Container
      className={styles.desktopOnly}
      backgroundColor="var(--card-background-color)"
      center={{
        horizontal: true,
        vertical: true,
      }}
    >
      <Text font="proto_mono">
        This site is not available on mobile yet.
        <br /> Please visit on a desktop browser.
      </Text>
    </Container>
  );
};

export default DesktopOnly;
