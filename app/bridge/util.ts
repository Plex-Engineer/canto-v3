import useBridgeIn from "@/hooks/bridge/useBridgeIn";
import useBridgeOut from "@/hooks/bridge/useBridgeOut";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { connectToKeplr } from "@/utils/keplr";
import { getNetworkInfoFromChainId, isCosmosNetwork } from "@/utils/networks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// this code sets the signer address, and the addresses for the bridge in and bridge out
// it also gets the network info from the chain id
// and sets the testnet to true if the network is a testnet

export default function useBridgeCombo() {
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
  };
}
