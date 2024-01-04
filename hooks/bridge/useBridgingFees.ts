import { BridgingMethod } from "@/transactions/bridge";
import { BridgeToken } from "./interfaces/tokens";
import { useState } from "react";
import LZ_CHAIN_IDS from "@/config/jsons/layerZeroChainIds.json";
import {
  BaseNetwork,
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces";
import { estimateOFTSendGasFee } from "@/transactions/bridge/layerZero/helpers";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import BigNumber from "bignumber.js";
import { getTokenPriceInUSDC, isOFTToken } from "@/utils/tokens";
import useDebounceEffect from "@/utils/async/useDebounceEffect";
import { displayAmount } from "@/utils/formatting";
import {
  getGravityBridgeFeesFromToken,
  getGravityChainFeeInPercent,
} from "@/transactions/bridge/gravityBridge/gravityFees";
import { BridgeFeesByMethod } from "./interfaces/bridgeFees";
import { CONVERT_FEE, IBC_FEE } from "@/config/consts/fees";

export type BridgingFeesReturn =
  | {
      isLoading: true;
      ready: false;
    }
  | { isLoading: false; error: string; ready: false }
  | ({ isLoading: false; error: null; ready: true } & BridgeFeesByMethod);

type BridgingFeesProps = {
  direction: "in" | "out";
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
  direction,
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
  const [fees, setFees] = useState<BridgeFeesByMethod>({ method: null });

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
          direction,
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
    dependencies: [
      token?.id,
      method,
      fromNetwork?.id,
      toNetwork?.id,
      direction,
    ],
    timeout: 1000,
  });

  return isLoading
    ? { isLoading, ready: false }
    : error !== null
      ? { isLoading, error, ready: false }
      : {
          ready: true,
          isLoading,
          error,
          ...fees,
        };
}

async function getFees({
  direction,
  method,
  token,
  toNetwork,
  fromNetwork,
}: BridgingFeesProps): PromiseWithError<BridgeFeesByMethod> {
  // check props to make sure they exist
  if (!(token && method && fromNetwork && toNetwork))
    return NEW_ERROR("Missing props");

  // return correct fees based on method
  switch (method) {
    case BridgingMethod.LAYER_ZERO:
      return getLZFees(direction, token, fromNetwork, toNetwork);
    case BridgingMethod.GRAVITY_BRIDGE:
      return direction === "in"
        ? NO_ERROR({ method: null })
        : getGravityBridgeOutFees(token);
    case BridgingMethod.IBC:
      return direction === "in" ? NO_ERROR({ method: null }) : getIBCOutFees();
    default:
      return NO_ERROR({ method: null });
  }
}
async function getLZFees(
  direction: "in" | "out",
  token: BridgeToken,
  fromNetwork: BaseNetwork,
  toNetwork: BaseNetwork
): PromiseWithError<BridgeFeesByMethod> {
  try {
    // check token for OFT
    if (!isOFTToken(token)) throw new Error("Invalid token");
    // get OFT gas estimation
    const toLZChainId = LZ_CHAIN_IDS[toNetwork.id as keyof typeof LZ_CHAIN_IDS];
    if (!toLZChainId) throw new Error("Invalid network");
    const { data: gas, error } = await estimateOFTSendGasFee(
      token.chainId,
      toLZChainId,
      token.address,
      ZERO_ADDRESS,
      new BigNumber(1).multipliedBy(10 ** token.decimals).toString(),
      [1, 200000]
    );
    if (error) throw error;
    return NO_ERROR({
      direction,
      method: BridgingMethod.LAYER_ZERO,
      lzFee: {
        feeInBridgeToken: !!token.nativeWrappedToken,
        amount: gas.toString(),
        formattedAmount: displayAmount(
          gas.toString(),
          fromNetwork.nativeCurrency.decimals,
          {
            symbol: fromNetwork.nativeCurrency.symbol,
          }
        ),
        description:
          "Gas will be higher than other transactions because you will be paying for gas on both the sending and receiving chains. The value shown here is an estimate and will vary with gas fees.",
      },
    });
  } catch (err) {
    return NEW_ERROR("getLZFees", err);
  }
}
async function getGravityBridgeOutFees(
  token: BridgeToken
): PromiseWithError<BridgeFeesByMethod> {
  try {
    // check for token address (should always be there)
    if (!token.address) throw new Error("Invalid token");

    // get chain fee percent (doesn't matter what token this is)
    const { data: chainFeePercent, error: chainFeePercentError } =
      await getGravityChainFeeInPercent();
    if (chainFeePercentError) throw chainFeePercentError;

    // get bridge fees (depends on price of token and gas price on ETH)
    const { data: bridgeFees, error: bridgeFeesError } =
      await getGravityBridgeFeesFromToken(token.address);
    if (bridgeFeesError) throw bridgeFeesError;

    // get price of token to estimate fee prices
    const { data: price } = await getTokenPriceInUSDC(
      token.address,
      token.decimals
    );

    // return fees object
    return NO_ERROR({
      method: BridgingMethod.GRAVITY_BRIDGE,
      direction: "out",
      description: "gravity bridge fees",
      feeTokenPriceFormatted: price,
      chainFeePercent,
      bridgeFeeOptions: bridgeFees,
      gasFees: [
        { name: "convert coin", amount: CONVERT_FEE.amount },
        { name: "ibc transfer", amount: IBC_FEE.amount },
      ],
    });
  } catch (err) {
    return NEW_ERROR("getGravityBridgeOutFees", err);
  }
}
function getIBCOutFees(): ReturnWithError<BridgeFeesByMethod> {
  return NO_ERROR({
    method: BridgingMethod.IBC,
    direction: "out",
    gasFees: [
      { name: "convert coin", amount: CONVERT_FEE.amount },
      { name: "ibc transfer", amount: IBC_FEE.amount },
    ],
  });
}
