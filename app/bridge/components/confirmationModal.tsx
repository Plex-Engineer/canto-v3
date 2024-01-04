import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Input from "@/components/input/input";
import Text from "@/components/text";
import Image from "next/image";
import React from "react";
import styles from "../bridge.module.scss";
import PopUp from "@/components/popup/popup";
import { connectToKeplr } from "@/utils/keplr";
import { formatError } from "@/utils/formatting";
import InfoPop from "@/components/infopop/infopop";
import Modal from "@/components/modal/modal";

interface Props {
  open: boolean;
  onClose: () => void;
  imgUrl: string;
  addresses: {
    from: string | null;
    to: string | null;
  };
  token?: {
    name: string;
    url: string;
  };
  fromNetwork: string;
  toNetwork: string;
  amount: string;
  fees?: {
    tokenFees: {
      key: string;
      value: string;
    }[];
    totalFees?: string;
  };
  type: "in" | "out";
  confirmation: {
    canConfirm: boolean;
    onConfirm: () => void;
  };
  cosmosAddress?: {
    chainId: string;
    addressPrefix: string;
    currentAddress: string;
    setAddress: (address: string) => void;
  };
  showGravityPortalMsg?: boolean;
}
const ConfirmationModal = (props: Props) => {
  const [keplrError, setKeplrError] = React.useState<string>("");
  return (
    <Modal
      open={props.open}
      width="30rem"
      height="min-content"
      onClose={props.onClose}
    >
      <div className={styles["confirmation-container"]}>
        <Text size="lg" font="proto_mono">
          Confirmation
        </Text>

        <Image src={props.imgUrl} alt={"props"} width={60} height={60} />

        <Container direction="row" gap={10}>
          <Text size="md" font="proto_mono">
            {`Bridge ${props.token?.name} ${props.type} ${
              props.type === "in"
                ? "from " + props.fromNetwork
                : "to " + props.toNetwork
            }`}
          </Text>
          {props.showGravityPortalMsg && (
            <InfoPop>
              <Text size="x-sm">
                To bridge your tokens to Ethereum through Gravity Bridge, first
                ensure that you have an IBC wallet like Keplr.
                <br />
                <br />
                Next, enter your Gravity Bridge address (from Keplr) below and
                confirm.
                <br />
                <br />
                Once completed, you can transfer your tokens from Gravity Bridge
                to Ethereum using the{" "}
                <a
                  style={{ textDecoration: "underline" }}
                  href="https://bridge.blockscape.network/"
                >
                  Gravity Bridge Portal
                </a>
              </Text>
            </InfoPop>
          )}
        </Container>

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
              <Text size="sm">{props.amount}</Text>
            </Container>
            {props.fees && (
              <div className={styles["extra-info"]}>
                {props.fees.tokenFees.map((fee) => (
                  <Container
                    width="100%"
                    direction="row"
                    gap={"auto"}
                    key={fee.key}
                  >
                    <Text size="x-sm" theme="secondary-dark">
                      {fee.key}
                    </Text>
                    <Text size="x-sm">{fee.value}</Text>
                  </Container>
                ))}
                {props.fees.totalFees && (
                  <>
                    <div
                      style={{
                        width: "100%",
                        border: "1px dotted var(--text-dark-40-color)",
                      }}
                    />
                    <Container width="100%" direction="row" gap={"auto"}>
                      <Text size="x-sm" theme="secondary-dark" weight="bold">
                        total fee
                      </Text>
                      <Text size="x-sm" weight="bold">
                        {props.fees.totalFees}
                      </Text>
                    </Container>
                  </>
                )}
              </div>
            )}
          </Container>
        </Container>
        {props.cosmosAddress && (
          <Container width="100%">
            <Input
              type={"text"}
              placeholder={`address: (${props.cosmosAddress.addressPrefix}...)`}
              value={props.cosmosAddress.currentAddress}
              onChange={function (
                e: React.ChangeEvent<HTMLInputElement>
              ): void {
                props.cosmosAddress?.setAddress(e.target.value);
              }}
              height={"md"}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: "5px",
              }}
            >
              <Text size="xx-sm" color="var(--extra-failure-color, #ff0000)">
                {keplrError}
              </Text>
              <div
                style={{ display: "flex", flexDirection: "row", gap: "5px" }}
              >
                <Text
                  size="xx-sm"
                  weight="bold"
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    paddingTop: "3px",
                  }}
                >
                  <a
                    onClick={async () => {
                      const { data, error } = await connectToKeplr(
                        props.cosmosAddress?.chainId ?? ""
                      );
                      if (error) {
                        setKeplrError(formatError(error.message));
                      } else {
                        setKeplrError("");
                        props.cosmosAddress?.setAddress(data.address);
                      }
                    }}
                  >
                    Connect to Keplr
                  </a>
                </Text>
                <InfoPop>
                  <Text size="xx-sm">
                    {`manually enter your ${props.toNetwork} address or click "Connect to Keplr"`}
                  </Text>
                </InfoPop>
              </div>
            </div>
          </Container>
        )}

        <Button
          width={"fill"}
          onClick={() => {
            props.confirmation.onConfirm();
          }}
          disabled={!props.confirmation.canConfirm}
        >
          Confirm Bridge{" "}
          {props.type.slice(0, 1).toUpperCase() + props.type.slice(1)}
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
    </Modal>
  );
};

export default ConfirmationModal;
