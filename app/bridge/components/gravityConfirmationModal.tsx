import Button from "@/components/button/button";
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
    <Modal open={open} onClose={onClose} title="WARNING">
      <Spacer height="30px" />
      <Text>
        Please be aware that using a wallet that does not support custom chains
        while bridging out, such as Rabby, may result in inaccessible funds. We
        recommend Metamask for bridging out to Ethereum. Alternatively, transfer
        funds to Gravity Bridge and use the Gravity Bridge Portal to transfer
        funds from Gravity to Ethereum.
      </Text>
      <Spacer height="10px" />
      <Button onClick={onConfirm}>CONTINUE</Button>
      <Spacer height="10px" />
      <Button onClick={onReselectMethod}>USE GRAVITY BRIDGE PORTAL</Button>
    </Modal>
  );
};

export default GravityConfirmationModal;
