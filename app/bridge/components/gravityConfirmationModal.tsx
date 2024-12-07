import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Text from "@/components/text";
import { TX_SIGN_ERRORS } from "@/config/consts/errors";
import { GRAVITY_BRIGDE_EVM } from "@/config/networks";
import useScreenSize from "@/hooks/helpers/useScreenSize";
import { useState } from "react";
import { getNetwork, switchNetwork } from "wagmi/actions";

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
  const [addChainError, setAddChainError] = useState<string | null>(null);
  const { isMobile } = useScreenSize();

  async function handleConfirm() {
    try {
      if (!window.ethereum) throw new Error("No ethereum provider found");

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${GRAVITY_BRIGDE_EVM.chainId.toString(16)}`,
            chainName: GRAVITY_BRIGDE_EVM.name,
            rpcUrls: [GRAVITY_BRIGDE_EVM.rpcUrl],
            iconUrls: [GRAVITY_BRIGDE_EVM.icon],
            nativeCurrency: {
              name: GRAVITY_BRIGDE_EVM.nativeCurrency.name,
              symbol: GRAVITY_BRIGDE_EVM.nativeCurrency.symbol,
              decimals: GRAVITY_BRIGDE_EVM.nativeCurrency.decimals,
            },
          },
        ],
      });
      setAddChainError(null);
      onConfirm();
    } catch (err) {
      setAddChainError("Error: Wallet not supported");
    }
  }
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
        chains such as Metamask & Frame.
        <Spacer height="10px" />
        Rabby, Rainbow, and Coinbase wallet are not supported yet.
        <Spacer height="10px" />
        If you are not using a supported wallet, use the Gravity Bridge portal.
      </Text>
      <Spacer height="30px" />
      <Container gap={20} direction="row" center={{ horizontal: true }}>
        <Button onClick={handleConfirm} height={isMobile ? "large" : undefined}>
          {"I'm using a supported wallet"}
        </Button>{" "}
        <Button
          onClick={onReselectMethod}
          height={isMobile ? "large" : undefined}
        >
          {"Use Gravity Bridge Portal"}
        </Button>
      </Container>
      {addChainError && (
        <Text
          size="sm"
          style={{
            color: "var(--extra-failure-color, #ff0000)",
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {addChainError}
        </Text>
      )}
    </Modal>
  );
};

export default GravityConfirmationModal;
