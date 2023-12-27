import { getEthTransactionLink } from "../helpers";
import { getNetworkInfoFromChainId } from "@/utils/networks";

const layerzeroMainnetScanUrl = "https://layerzeroscan.com";
const layerzeroTestnetScanUrl = "https://testnet.layerzeroscan.com";


export const getLayerZeroTransactionlink = (chainId: string | number) => {
    if (getNetworkInfoFromChainId(chainId).data.isTestChain) {
        return getEthTransactionLink(layerzeroTestnetScanUrl)
    }
    return getEthTransactionLink(layerzeroMainnetScanUrl)
}
