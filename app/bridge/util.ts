import { BaseNetwork, Validation } from "@/config/interfaces";
import { maxBridgeAmountForToken } from "@/hooks/bridge/helpers/amounts";
import { BridgeHookReturn } from "@/hooks/bridge/interfaces/hookParams";
import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useBridgingFees, {
  BridgingFeesReturn,
} from "@/hooks/bridge/useBridgingFees";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { BridgingMethod } from "@/transactions/bridge";
import { convertToBigNumber } from "@/utils/formatting";
import { connectToKeplr } from "@/utils/keplr";
import { percentOfAmount, validateWeiUserInputTokenAmount } from "@/utils/math";
import { getNetworkInfoFromChainId, isCosmosNetwork } from "@/utils/networks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// this code sets the signer address, and the addresses for the bridge in and bridge out
// it also gets the network info from the chain id
// and sets the testnet to true if the network is a testnet

export interface BridgeComboReturn {
  // bridge direction
  Direction: {
    direction: "in" | "out";
    setDirection: (direction: "in" | "out") => void;
  };
  // bridge selections
  Amount: {
    amount: string;
    amountAsBigNumberString: string;
    setAmount: (amount: string) => void;
    maxBridgeAmount: string;
  };
  // transaction
  Transaction: {
    canBridge: Validation;
    bridgeTx: () => void;
  };
  Confirmation: {
    preConfirmCheck: Validation;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
  };
  networkName: (network: BaseNetwork | null) => string;
  cosmosProps:
    | {
        cosmosAddress: {
          addressName: string;
          chainId: string;
          addressPrefix: string;
          currentAddress: string;
          setAddress: (address: string) => void;
        };
      }
    | {};
  bridgeHook: BridgeHookReturn;
  feesHook: BridgingFeesReturn;
  feesSelection: {
    gravityBridge: {
      totalChainFee: string;
      selectedGBridgeFee: string;
      setSelectedGBridgeFee: (fee: string) => void;
    };
  };
}

export default function useBridgeCombo(): BridgeComboReturn {
  ///
  /// ROUTER AND PATH
  ///

  // router info (to get bridge direction)
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // query params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  ///
  /// DIRECTION
  ///

  // direction info
  const bridgeDirection = () => {
    const direction = searchParams.get("direction");

    if (direction === "in") return "in";
    if (direction === "out") return "out";
    return "in";
  };
  function setDirection(direction: "in" | "out") {
    router.push(pathName + "?" + createQueryString("direction", direction));
  }

  ///
  /// BRIDGE HOOKS
  ///

  // bridge hooks
  const { txStore, signer } = useCantoSigner();
  const connectedEthAddress = signer?.account.address ?? "";
  const currentChainId = signer?.chain.id;

  const [onTestnet, setOnTestnet] = useState<boolean>(false);
  const bridgeOut = useBridgeOut({
    testnet: onTestnet,
  });
  const bridgeIn = useBridgeIn({
    testnet: onTestnet,
  });
  const bridge = bridgeDirection() === "in" ? bridgeIn : bridgeOut;

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
      currentChainId ?? 1
    );
    if (error) {
      console.error(error);
      return;
    }
    setOnTestnet(network.isTestChain);
  }, [currentChainId]);

  useEffect(() => {
    // set the signer address
    bridgeIn.setState("ethAddress", connectedEthAddress);
    bridgeOut.setState("ethAddress", connectedEthAddress);
  }, [connectedEthAddress]);

  ///
  /// AMOUNT
  ///

  // user input amount
  const [amount, setAmount] = useState<string>("");

  // big number amount
  const amountAsBigNumberString = (
    convertToBigNumber(amount, bridge.selections.token?.decimals ?? 18).data ??
    "0"
  ).toString();

  ///
  /// FEES
  ///
  const bridgeFees = useBridgingFees({
    direction: bridge.direction,
    token: bridge.selections.token,
    method: bridge.selections.method,
    fromNetwork: bridge.selections.fromNetwork,
    toNetwork: bridge.selections.toNetwork,
  });
  const [selectedGBridgeFee, setSelectedGBridgeFee] = useState<string>("0");
  const gBridgeFees =
    bridgeFees.ready &&
    bridgeFees.method === BridgingMethod.GRAVITY_BRIDGE &&
    bridgeFees.direction === "out"
      ? {
          chainFee:
            percentOfAmount(amountAsBigNumberString, bridgeFees.chainFeePercent)
              .data ?? "0",
          bridgeFee: selectedGBridgeFee,
        }
      : {};
  // reset user selection when options change
  useEffect(() => {
    setSelectedGBridgeFee("0");
  }, [bridgeFees.ready]);

  ///
  /// TRANSACTIONS
  ///

  // get max bridge amount (estimation)
  const maxBridgeAmount = maxBridgeAmountForToken(
    bridge.selections.token,
    bridgeFees.ready ? bridgeFees : null,
    { gBridgeFee: selectedGBridgeFee }
  );

  // pre-confirm check (will check all data except for user input address for IBC out)
  const preConfirmCheck = (): Validation => {
    // validate amount
    const amountCheck = validateWeiUserInputTokenAmount(
      amountAsBigNumberString,
      "1",
      maxBridgeAmount,
      bridge.selections.token?.symbol ?? "",
      bridge.selections.token?.decimals ?? 0
    );
    if (amountCheck.error) return amountCheck;
    if (
      bridgeFees.ready &&
      bridgeFees.method === BridgingMethod.GRAVITY_BRIDGE &&
      selectedGBridgeFee === "0"
    ) {
      return {
        error: true,
        reason: "Please select a bridge fee",
      };
    }
    return { error: false };
  };

  const txParams = {
    amount: amountAsBigNumberString,
    ...gBridgeFees,
  };
  // check to see if bridging will be possible with the current parameters
  const canBridge = bridge.bridge.validateParams(txParams);

  // transaction that will do the bridging
  async function bridgeTx() {
    // get flow
    const flow = bridge.bridge.newBridgeFlow(txParams);
    // add flow to store
    txStore?.addNewFlow({
      txFlow: flow,
      ethAccount: connectedEthAddress,
      onSuccessCallback: () => setIsConfirmationModalOpen(false),
    });
  }

  ///
  /// CONFIRMATION MODAL
  ///

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
    Direction: {
      direction: bridgeDirection(),
      setDirection,
    },
    Amount: {
      amount,
      amountAsBigNumberString,
      setAmount,
      maxBridgeAmount,
    },
    Confirmation: {
      preConfirmCheck: preConfirmCheck(),
      isModalOpen: isConfirmationModalOpen,
      setIsModalOpen: setIsConfirmationModalOpen,
    },
    Transaction: {
      canBridge,
      bridgeTx,
    },
    networkName,
    cosmosProps,
    bridgeHook: bridge,
    feesHook: bridgeFees,
    feesSelection: {
      gravityBridge: {
        totalChainFee: gBridgeFees.chainFee ?? "0",
        selectedGBridgeFee,
        setSelectedGBridgeFee,
      },
    },
  };
}
