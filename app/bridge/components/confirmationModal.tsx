import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Input from "@/components/input/input";
import Text from "@/components/text";
import Image from "next/image";
import React, { ReactNode } from "react";
import styles from "../bridge.module.scss";
import PopUp from "@/components/popup/popup";

interface Props {
  imgUrl: string;
  addresses: {
    from: string | null;
    to: string | null;
    name: string | null;
  };
  token?: {
    name: string;
    url: string;
  };
  fromNetwork: string;
  toNetwork: string;
  amount: string;
  type: "in" | "out";
  confirmation: {
    canConfirm: boolean;
    onConfirm: () => void;
  };
  cosmosAddress?: {
    currentAddress: string;
    setAddress: (address: string) => void;
  };
  extraDetails?: ReactNode;
}
const ConfirmationModal = (props: Props) => {
  return (
    <div className={styles["confirmation-container"]}>
      <Text size="lg" font="proto_mono">
        Confirmation
      </Text>

      <Image src={props.imgUrl} alt={"props"} width={60} height={60} />

      <Text size="md" font="proto_mono">
        Bridge {props.token?.name} {props.type}{" "}
        {props.type == "in" ? "from" : "to"} {props.addresses?.name}
      </Text>
      {props.extraDetails && (
        <Container
          width="100%"
          style={{
            alignItems: "flex-end",
          }}
        >
          <PopUp content={props.extraDetails} width="300px">
            {/* <Icon
          icon={{
            url: "/check.svg",
            size: 24,
          }}
        /> */}
            <span className={styles.infoPop}>
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
          </PopUp>
        </Container>
      )}
      <Container
        width="100%"
        height="100%"
        center={{
          horizontal: true,
        }}
      >
        <Container gap={16} width="100%">
          <Container width="100%" direction="row" gap={"auto"}>
            <Text size="sm" theme="secondary-dark">
              from
            </Text>
            <PopUp
              width="min-content"
              content={<Text size="sm">{props.addresses.from}</Text>}
            >
              <Text size="sm">
                {props.fromNetwork + " : "}
                {props.addresses.from?.slice(0, 6) +
                  "..." +
                  props.addresses.from?.slice(-4)}
              </Text>
            </PopUp>
          </Container>
          <Container width="100%" direction="row" gap={"auto"}>
            <Text size="sm" theme="secondary-dark">
              to
            </Text>
            {props.addresses.to ? (
              <PopUp
                width="min-content"
                content={<Text size="sm">{props.addresses.to}</Text>}
              >
                <Text size="sm">
                  {props.toNetwork + " : "}
                  {props.addresses.to
                    ? props.addresses.to?.slice(0, 6) +
                      "..." +
                      props.addresses.to?.slice(-4)
                    : "..."}
                </Text>
              </PopUp>
            ) : (
              <Text size="sm">
                {props.toNetwork + " : "}
                {props.addresses.to
                  ? props.addresses.to?.slice(0, 6) +
                    "..." +
                    props.addresses.to?.slice(-4)
                  : "..."}
              </Text>
            )}
          </Container>
          <Container width="100%" direction="row" gap={"auto"}>
            <Text size="sm" theme="secondary-dark">
              amount
            </Text>
            <Text size="sm">
              {props.amount == "" ? "0.00" : props.amount}
              {` ${props.token?.name}`}
            </Text>
          </Container>
        </Container>
      </Container>
      {props.cosmosAddress && (
        <Container width="100%">
          <Input
            type={"text"}
            placeholder={props.addresses.name + " address"}
            value={props.cosmosAddress.currentAddress}
            onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
              props.cosmosAddress?.setAddress(e.target.value);
            }}
          />
        </Container>
      )}
      <Button
        width={"fill"}
        onClick={() => {
          props.confirmation.onConfirm();
        }}
        disabled={!props.confirmation.canConfirm}
      >
        Confirm Bridge {props.type}
      </Button>
      {/* <Text size="x-sm" font="rm_mono" theme="secondary-dark">
        By completing bridge in, you are transferring your assets from Ethereum
        (
        {props.addresses.from?.slice(0, 6) +
          "..." +
          props.addresses.from?.slice(-4)}
        ) to CANTO (
        {props.addresses.to?.slice(0, 6) +
          "..." +
          props.addresses.to?.slice(-4)}
        )
      </Text> */}
    </div>
  );
};

export default ConfirmationModal;
