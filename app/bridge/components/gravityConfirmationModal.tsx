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
    <Modal open={open} onClose={onClose}>
      <Container
        width="100%"
        center={{ horizontal: true }}
        style={{ margin: "20px 0", alignItems: "center" }}
      >
        <Icon
          icon={{
            url: "/warning.svg",
            size: 44,
          }}
          themed
        />
      </Container>
      <Text size="sm">
        Direct bridging to Ethereum only works for wallets that support custom
        chains such as Metamask & Frame. Rabby, Rainbow, and Coinbase wallet are
        not supported yet.
        <Spacer height="10px" />
        If you are not using a supported wallet, use the Gravity Bridge portal.
      </Text>
      <Spacer height="30px" />
      <Container gap={20} direction="row" center={{ horizontal: true }}>
        <Button onClick={onConfirm}>{"I'm using a supported wallet"}</Button>{" "}
        <Button onClick={onReselectMethod}>
          {"Use Gravity Bridge Portal"}
        </Button>
      </Container>
    </Modal>
  );
};

export default GravityConfirmationModal;
