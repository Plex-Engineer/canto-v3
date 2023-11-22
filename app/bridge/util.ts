import { BaseNetwork } from "@/config/interfaces";
import { ETHEREUM_VIA_GRAVITY_BRIDGE } from "@/config/networks";
import { maxBridgeAmountInUnderlying } from "@/hooks/bridge/helpers/amounts";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { BridgingMethod } from "@/transactions/bridge";
import { convertToBigNumber } from "@/utils/formatting";
import { connectToKeplr } from "@/utils/keplr";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import { getNetworkInfoFromChainId, isCosmosNetwork } from "@/utils/networks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// this code sets the signer address, and the addresses for the bridge in and bridge out
// it also gets the network info from the chain id
// and sets the testnet to true if the network is a testnet

export default function useBridgeCombo(type: "in" | "out") {
  // router info
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // query params
  const bridgeDirection = () => {
    const direction = searchParams.get("direction");

    if (direction === "in") return "in";
    if (direction === "out") return "out";
    return "in";
  };

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // bridge hooks
  const { txStore, signer } = useCantoSigner();
  const [onTestnet, setOnTestnet] = useState<boolean>(false);
  const bridgeOut = useBridgeOut({
    testnet: onTestnet,
  });
  const bridgeIn = useBridgeIn({
    testnet: onTestnet,
  });
  const bridge = type === "in" ? bridgeIn : bridgeOut;

  useEffect(() => {
    async function getKeplrInfoForBridge() {
      const network = bridgeIn.selections.fromNetwork;
      if (!network || !isCosmosNetwork(network)) return;
      const keplrClient = await connectToKeplr(network.chainId);
      bridgeIn.setState("cosmosAddress", keplrClient.data?.address);
    }
    getKeplrInfoForBridge();
  }, [bridgeIn.selections.fromNetwork]);

  useEffect(() => {
    const { data: network, error } = getNetworkInfoFromChainId(
      signer?.chain.id ?? 1
    );
    if (error) {
      console.log(error);
      return;
    }
    setOnTestnet(network.isTestChain);
  }, [signer?.chain.id]);

  useEffect(() => {
    // set the signer address
    bridgeIn.setState("ethAddress", signer?.account.address);
    bridgeOut.setState("ethAddress", signer?.account.address);
  }, [signer?.account.address]);

  const [amount, setAmount] = useState<string>("");
  const [maxBridgeAmount, setMaxBridgeAmount] = useState<string>("0");

  // big number amount
  const amountAsBigNumberString = (
    convertToBigNumber(amount, bridge.selections.token?.decimals ?? 18).data ??
    "0"
  ).toString();

  // validate user input amount
  const amountCheck = validateWeiUserInputTokenAmount(
    amountAsBigNumberString,
    "1",
    maxBridgeAmount,
    bridge.selections.token?.symbol ?? "",
    bridge.selections.token?.decimals ?? 0
  );

  useEffect(() => {
    async function getMaxAmount() {
      setMaxBridgeAmount(
        await maxBridgeAmountInUnderlying(
          bridge.selections.token,
          bridge.selections.toNetwork?.id ?? ""
        )
      );
    }
    getMaxAmount();
  }, [
    bridge.selections.token?.id,
    bridge.selections.toNetwork?.id,
    bridge.selections.token?.balance,
  ]);

  // transaction that will do the bridging
  async function bridgeTx() {
    // get flow
    const flow = bridge.bridge.newBridgeFlow({
      amount: amountAsBigNumberString,
    });
    // add flow to store
    txStore?.addNewFlow({
      txFlow: flow,
      signer: signer,
      onSuccessCallback: () => setIsConfirmationModalOpen(false),
    });
  }

  // check to see if bridging will be possible with the current parameters
  const canBridge = bridge.bridge.validateParams({
    amount: amountAsBigNumberString,
  });

  // if confirmation is open
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // cosmos address props
  const cosmosProps =
    bridge.selections.method === BridgingMethod.IBC &&
    bridge.direction === "out" &&
    bridge.selections.toNetwork &&
    isCosmosNetwork(bridge.selections.toNetwork)
      ? {
          cosmosAddress: {
            addressName:
              bridge.selections.toNetwork.id === ETHEREUM_VIA_GRAVITY_BRIDGE.id
                ? "Gravity Bridge"
                : undefined,
            chainId: bridge.selections.toNetwork.chainId,
            addressPrefix: bridge.selections.toNetwork.addressPrefix,
            currentAddress: bridge.addresses.getReceiver() ?? "",
            setAddress: (address: string) =>
              bridge.setState("inputCosmosAddress", address),
          },
        }
      : {};

  // get network name to display in modal
  const networkName = (network: BaseNetwork | null) => {
    if (network) {
      if (isCosmosNetwork(network) && network.altName) {
        return network.altName;
      }
      return network.name;
    }
    return "";
  };

  return {
    // router info
    pathName,
    router,
    searchParams,
    // query params
    bridgeDirection,
    createQueryString,
    // bridge hooks
    txStore,
    signer,
    onTestnet,
    bridgeOut,
    bridgeIn,
    amount,
    setAmount,
    maxBridgeAmount,
    setMaxBridgeAmount,
    amountAsBigNumberString,
    amountCheck,
    bridgeTx,
    canBridge,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    cosmosProps,
    networkName,
    bridge,
  };
}
