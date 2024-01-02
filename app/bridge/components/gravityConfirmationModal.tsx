import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Text from "@/components/text";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onReselectMethod: () => void;
  onClose: () => void;
}
const GravityConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  onReselectMethod,
}: Props) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <Icon
          icon={{
            url: "/warning.svg",
            size: 32,
          }}
          themed
          style={{
            translate: "0 1.5px",
          }}
        />
      }
    >
      <Text>
        Please be aware that using a wallet that does not support custom chains
        while bridging out, such as Rabby, may result in inaccessible funds.
        <Spacer height="10px" />
        We recommend Metamask for bridging out to Ethereum.
        <Spacer height="10px" />
        Alternatively, transfer funds to Gravity Bridge and use the Gravity
        Bridge Portal to transfer funds from Gravity to Ethereum.
      </Text>
      <Spacer height="20px" />
      <Container gap={20} direction="row" center={{ horizontal: true }}>
        <Button onClick={onConfirm}>CONTINUE</Button>{" "}
        <Button onClick={onReselectMethod}>USE GB PORTAL</Button>
      </Container>
    </Modal>
  );
};

export default GravityConfirmationModal;
