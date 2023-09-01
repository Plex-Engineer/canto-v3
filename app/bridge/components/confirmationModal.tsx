import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Input from "@/components/input/input";
import Text from "@/components/text";
import Image from "next/image";
import React from "react";
import styles from "../bridge.module.scss";

interface Props {
  imgUrl: string;
  addresses: {
    from?: string;
    to?: string;
    name?: string;
  };
  fromNetwork: string;
  toNetwork: string;
  amount: string;
  type: "in" | "out";
  onConfirm: () => void;
}
const ConfirmationModal = (props: Props) => {
  const [cosmosAddress, setCosmosAddress] = React.useState<string>("");
  return (
    <div className={styles["confirmation-container"]}>
      <Image src={props.imgUrl} alt={"props"} width={60} height={60} />
      <Text size="lg" font="proto_mono">
        Confirmation
      </Text>
      <Text size="md" font="proto_mono">
        Bridge {props.type}
      </Text>
      <Container gap={4} width="100%">
        <Container width="100%" direction="row" gap={"auto"}>
          <Text size="sm" theme="secondary-dark">
            from
          </Text>
          <Text size="sm">
            {props.fromNetwork + " : "}
            {props.addresses.from?.slice(0, 6) +
              "..." +
              props.addresses.from?.slice(-4)}
          </Text>
        </Container>
        <Container width="100%" direction="row" gap={"auto"}>
          <Text size="sm" theme="secondary-dark">
            to
          </Text>
          <Text size="sm">
            {props.toNetwork + " : "}
            {props.addresses.to?.slice(0, 6) +
              "..." +
              props.addresses.to?.slice(-4)}
          </Text>
        </Container>
        <Container width="100%" direction="row" gap={"auto"}>
          <Text size="sm" theme="secondary-dark">
            amount
          </Text>
          <Text size="sm">{props.amount}</Text>
        </Container>
      </Container>

      {props.type === "out" && (
        <Container width="100%">
          <Input
            type={"text"}
            placeholder={props.addresses.name + " address"}
            value={cosmosAddress}
            onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
              setCosmosAddress(e.target.value);
            }}
          />
        </Container>
      )}

      <Button
        width={"fill"}
        onClick={() => {
          props.onConfirm;
        }}
      >
        Confirm Bridging {props.type}
      </Button>
      <Text size="x-sm" font="rm_mono" theme="secondary-dark">
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
      </Text>
    </div>
  );
};

export default ConfirmationModal;
