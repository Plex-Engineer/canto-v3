import { BridgingMethod } from "@/transactions/bridge";
import { BridgeToken } from "./interfaces/tokens";
import { useState } from "react";
import LZ_CHAIN_IDS from "@/config/jsons/layerZeroChainIds.json";
import {
  BaseNetwork,
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces";
import { estimateOFTSendGasFee } from "@/transactions/bridge/layerZero/helpers";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import BigNumber from "bignumber.js";
import { isOFTToken } from "@/utils/tokens";
import useDebounceEffect from "@/utils/async/useDebounceEffect";
import { displayAmount } from "@/utils/formatting";

type BridgingFeesReturn =
  | {
      isLoading: true;
    }
  | { isLoading: false; error: string }
  | ({ isLoading: false; error: null } & FeesByMethod);

type FeesByMethod =
  | {
      method: BridgingMethod.LAYER_ZERO;
      description: string;
      gasFee: {
        amount: string;
        formattedAmount: string;
      };
      // if the fee is in the same denom as the token being bridged
      feeInBridgeToken: boolean;
    }
  | {
      // not implemented yet
      method: BridgingMethod.GRAVITY_BRIDGE | BridgingMethod.IBC | null;
    };

type BridgingFeesProps = {
  token: BridgeToken | null;
  method: BridgingMethod | null;
  fromNetwork: BaseNetwork | null;
  toNetwork: BaseNetwork | null;
};
/**
 * This hook will keep track of the current fees expected to be paid by the user for bridging
 * Includes gas fees (LZ), and bridging/chain fees (GBridge)
 */
export default function useBridgingFees({
  token,
  method,
  fromNetwork,
  toNetwork,
}: BridgingFeesProps): BridgingFeesReturn {
  // loading state
  const [isLoading, setIsLoading] = useState(false);
  // error state
  const [error, setError] = useState<string | null>(null);
  // current fee state based on method used
  const [fees, setFees] = useState<FeesByMethod>({ method: null });

  // props can change quickly and all at the same time, so debounce useEffect
  useDebounceEffect({
    legacyCallback: () => {
      // reset states (will always be called before callback)
      setIsLoading(true);
      setError(null);
      setFees({ method: null });
    },
    callback: () => {
      async function fetchFees() {
        // get fees
        const { data: fees, error } = await getFees({
          token,
          method,
          fromNetwork,
          toNetwork,
        });

        // set error or fees
        if (error) {
          setError(error.message);
        } else {
          setFees(fees);
        }
        // stop loading
        setIsLoading(false);
      }
      fetchFees();
    },
    dependencies: [token, method, fromNetwork?.id, toNetwork?.id],
    timeout: 1000,
  });

  return isLoading
    ? { isLoading }
    : error !== null
    ? { isLoading, error }
    : {
        isLoading,
        error,
        ...fees,
      };
}

async function getFees({
  method,
  token,
  toNetwork,
  fromNetwork,
}: BridgingFeesProps): PromiseWithError<FeesByMethod> {
  // check props to make sure they exist
  if (!(token && method && fromNetwork && toNetwork))
    return NEW_ERROR("Missing props");

  // return correct fees based on method
  switch (method) {
    case BridgingMethod.LAYER_ZERO:
      return getLZFees(token, fromNetwork, toNetwork);
    case BridgingMethod.GRAVITY_BRIDGE:
    case BridgingMethod.IBC:
    default:
      return NO_ERROR({ method: null });
  }
}
async function getLZFees(
  token: BridgeToken,
  fromNetwork: BaseNetwork,
  toNetwork: BaseNetwork
): PromiseWithError<FeesByMethod> {
  // check token for OFT
  if (!isOFTToken(token)) return NEW_ERROR("Invalid LZ Token");
  // get OFT gas estimation
  const toLZChainId = LZ_CHAIN_IDS[toNetwork.id as keyof typeof LZ_CHAIN_IDS];
  if (!toLZChainId) return NEW_ERROR("Invalid network id");
  const { data: gas, error } = await estimateOFTSendGasFee(
    token.chainId,
    toLZChainId,
    token.address,
    ZERO_ADDRESS,
    new BigNumber(1).multipliedBy(10 ** token.decimals).toString(),
    [1, 200000]
  );
  if (error) return NEW_ERROR(error.message);
  return NO_ERROR({
    method: BridgingMethod.LAYER_ZERO,
    description:
      "Gas will be higher than other transactions because you will be paying for gas on both the sending and receiving chains. The value shown here is an estimate and will vary with gas fees.",
    gasFee: {
      amount: gas.toString(),
      formattedAmount: displayAmount(
        gas.toString(),
        fromNetwork.nativeCurrency.decimals,
        {
          symbol: fromNetwork.nativeCurrency.symbol,
        }
      ),
    },
    feeInBridgeToken: !!token.nativeWrappedToken,
  });
}
