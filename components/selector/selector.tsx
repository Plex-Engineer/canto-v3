import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Modal from "@/components/modal/modal";
import Text from "@/components/text";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import styles from "./selector.module.scss";
import Spacer from "@/components/layout/spacer";
import clsx from "clsx";

export interface Item {
  id: string;
  icon: string;
  name: string;
  secondary?: number | string;
}

interface Props {
  title: string;
  activeItem?: Item;
  items: Item[];
  onChange: (itemId: string) => void;
  groupedItems?: {
    main: Item;
    items: Item[];
  }[];
}
const Selector = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    setIsExpanded(false);
  }, [isOpen]);

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
        <div
          className={styles["scroll-view"]}
          style={{
            overflowY:
              isExpanded || props.groupedItems == undefined
                ? "scroll"
                : "hidden",
          }}
        >
          <Spacer height="10px" />

          <div className={clsx(styles["items-list"])}>
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
                  props.onChange(item.id);
                  setIsOpen(false);
                }}
              >
                <Image src={item.icon} alt={item.name} width={30} height={30} />
                <Container direction="row" gap={"auto"} width="100%">
                  <Text size="md" font="proto_mono">
                    {item.name}
                  </Text>
                  <Text size="md" font="proto_mono">
                    {item.secondary}
                  </Text>
                </Container>
              </Container>
            ))}
            {props.groupedItems?.map(
              (group) =>
                group.items.length !== 0 && (
                  <Container
                    key={group.main.name}
                    width="100%"
                    direction="row"
                    gap={20}
                    center={{
                      vertical: true,
                    }}
                    className={styles.item}
                    onClick={() => {
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    <Image
                      src={group.main.icon}
                      alt={group.main.name}
                      width={30}
                      height={30}
                    />
                    <Text size="md" font="proto_mono">
                      {group.main.name} {group.main.secondary}
                    </Text>
                    <div
                      style={{
                        transform: !isExpanded
                          ? "rotate(-90deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <Icon
                        icon={{
                          url: "dropdown.svg",
                          size: 24,
                        }}
                      />
                    </div>
                  </Container>
                )
            )}
          </div>

          <Container
            className={clsx(styles["grp-items"])}
            style={{
              transform: isExpanded ? "translateX(0)" : "translateX(100%)",
            }}
          >
            <Container
              direction="row"
              gap={20}
              className={styles.item}
              width="100%"
              center={{
                vertical: true,
              }}
              onClick={() => {
                setIsExpanded(false);
              }}
            >
              <div
                style={{
                  transform: "rotate(90deg)",
                }}
              >
                <Icon
                  icon={{
                    url: "dropdown.svg",
                    size: 24,
                  }}
                />
              </div>
              <Text size="md" font="proto_mono">
                Back
              </Text>
            </Container>
            {props.groupedItems != undefined &&
              props.groupedItems.map((group) =>
                group.items.map((item) => (
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
                      props.onChange(item.id);
                      setIsOpen(false);
                    }}
                  >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={30}
                      height={30}
                    />
                    <Text size="md" font="proto_mono">
                      {item.name} {item.secondary}
                    </Text>
                  </Container>
                ))
              )}
          </Container>
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
            src={props.activeItem?.icon ?? ""}
            alt={props.activeItem?.name + " icon"}
            width={30}
            height={30}
          />
          <Text size="md" font="proto_mono">
            {props.activeItem?.name ?? "SELECT ITEM"}
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
