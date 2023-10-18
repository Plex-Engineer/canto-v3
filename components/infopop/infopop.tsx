import React from "react";
import PopUp from "../popup/popup";
import Container from "../container/container";
import Text from "../text";
import styles from "./infopop.module.scss";

interface Props {
  children: React.ReactNode;
}
const InfoPop = (props: Props) => {
  return (
    <PopUp content={props.children} width="300px">
      <Container style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
        <span className={styles.container}>
          <Text
            theme="secondary-dark"
            size="sm"
            style={{
              textAlign: "right",
            }}
          >
            ?
          </Text>
        </span>
      </Container>
    </PopUp>
  );
};

export default InfoPop;
