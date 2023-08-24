import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Modal from "@/components/modal/modal";
import Text from "@/components/text";
import Image from "next/image";
import React, { use, useMemo, useState } from "react";
import styles from "./selector.module.scss";

export interface Item {
  iconUrl: string;
  name: string;
  balance?: number;
}

interface Props {
  title: string;
  activeItem: Item;
  items: Item[];
  onChange: (item: Item) => void;
}
const Selector = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  //   useMemo(() => {
  //     props.onChange(props.activeItem);
  //   }, [props]);

  return (
    <>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width="30rem"
        height="36rem"
      >
        <Text size="lg" font="proto_mono">
          {props.title}
        </Text>
        <div className={styles["items-list"]}>
          {props.items.map((item) => (
            <Container
              key={item.name}
              width="100%"
              direction="row"
              gap={20}
              center={{
                vertical: true,
              }}
              className={styles.item}
              onClick={() => {
                props.onChange(item);
                setIsOpen(false);
              }}
            >
              <Image
                src={item.iconUrl}
                alt={item.name}
                width={30}
                height={30}
              />
              <Text size="md" font="proto_mono">
                {item.name}
              </Text>
            </Container>
          ))}
        </div>
      </Modal>
      <Button
        color="secondary"
        width="fill"
        height="large"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Container
          width="100%"
          direction="row"
          gap={20}
          center={{
            vertical: true,
          }}
        >
          <Image
            src={props.activeItem.iconUrl}
            alt={props.activeItem.name + " icon"}
            width={30}
            height={30}
          />
          <Text size="md" font="proto_mono">
            {props.activeItem.name}
          </Text>
        </Container>
        <Icon
          icon={{
            url: "dropdown.svg",
            size: 24,
          }}
        />
      </Button>
    </>
  );
};

export default Selector;
