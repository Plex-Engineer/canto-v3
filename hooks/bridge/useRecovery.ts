import { ethToGravity } from "@gravity-bridge/address-converter";
import { useEffect, useState } from "react";
import BRIGDE_OUT_TOKENS from "@/config/jsons/bridgeOutTokens.json";
import BRIDGE_IN_TOKENS from "@/config/jsons/bridgeInTokens.json";
import { BridgingMethod, newCantoBridgeFlow } from "@/transactions/bridge";
import {
  CANTO_MAINNET_EVM,
  ETH_MAINNET,
  GRAVITY_BRIDGE,
} from "@/config/networks";
import { areEqualAddresses } from "@/utils/address";
import useTokenBalances from "../helpers/useTokenBalances";
import { BridgeToken } from "./interfaces/tokens";
import useCantoSigner from "../helpers/useCantoSigner";
import BigNumber from "bignumber.js";

interface RecoveryReturn {
  userGravityTokens: BridgeToken[];
  recoverGravityToken: (
    token: BridgeToken,
    chainFeePercent: number,
    bridgeFee: string
  ) => void;
}

const gravityTokens = getGravityTokens();
export default function useRecovery(): RecoveryReturn {
  const { signer, txStore } = useCantoSigner();
  const [userGravityTokens, setUserGravityTokens] = useState<BridgeToken[]>([]);

  const gravityTokenBalances = useTokenBalances(
    GRAVITY_BRIDGE.chainId,
    [],
    "",
    ethToGravity(signer?.account.address ?? "")
  );

  useEffect(() => {
    const userTokens: any[] = [];
    gravityTokens.forEach((token) => {
      if (gravityTokenBalances[token.gravityNativeName]) {
        userTokens.push({
          ...token,
          balance: gravityTokenBalances[token.gravityNativeName],
        });
      }
    });
    setUserGravityTokens(userTokens);
  }, [gravityTokenBalances]);

  function recoverGravityToken(
    token: BridgeToken,
    chainFeePercent: number,
    bridgeFee: string
  ) {
    if (!signer?.account.address) return;
    // get the amount of tokens to bridge with fees
    const tokenBalance = new BigNumber(token.balance ?? "0");
    if (tokenBalance.isLessThanOrEqualTo(0)) return;

    // get amount of tokens minus bridge fee
    const amountMinusBridgeFee = tokenBalance.minus(bridgeFee);
    if (amountMinusBridgeFee.isLessThanOrEqualTo(0)) return;
    // use chain fee percent to get the amount of tokens to bridge
    const amountMinusBridgeAndChainFee = amountMinusBridgeFee
      .dividedBy(1 + chainFeePercent / 100)
      .integerValue();

    const flow = newCantoBridgeFlow({
      from: {
        chainId: CANTO_MAINNET_EVM.chainId,
        account: signer.account.address,
      },
      to: {
        chainId: ETH_MAINNET.chainId,
        account: signer.account.address,
      },
      method: BridgingMethod.GRAVITY_BRIDGE,
      token: { data: token, amount: amountMinusBridgeAndChainFee.toString() },
      gravityBridgeFees: {
        chainFee: amountMinusBridgeFee
          .minus(amountMinusBridgeAndChainFee)
          .toString(),
        bridgeFee,
      },
    });
    txStore?.addNewFlow({
      txFlow: flow,
      ethAccount: signer.account.address,
    });
  }

  return {
    userGravityTokens,
    recoverGravityToken,
  };
}

type GravityToken = BridgeToken & {
  gravityNativeName: string;
};
function getGravityTokens(): GravityToken[] {
  /** get viable tokens to recover */
  const gravityBridgeOutTokens = BRIGDE_OUT_TOKENS.chainTokenList[
    "canto-mainnet"
  ]?.filter((token) => {
    let isGravityToken = false;
    token.bridgeMethods.forEach((method) => {
      if (method.methods.includes(BridgingMethod.GRAVITY_BRIDGE)) {
        isGravityToken = true;
      }
    });
    return isGravityToken;
  });

  /** get gravity tokens */
  const gravTokenList =
    BRIDGE_IN_TOKENS.chainTokenList[
      GRAVITY_BRIDGE.chainId as keyof typeof BRIDGE_IN_TOKENS.chainTokenList
    ];
  if (!gravTokenList || !Array.isArray(gravTokenList)) return [];

  /** get gravity tokens with native names */
  const gravityTokens = gravityBridgeOutTokens?.map((gbridgeOutTok) => {
    const gravEthToken = (gravTokenList as any[]).find((gToken) =>
      areEqualAddresses(gbridgeOutTok.ibcDenom ?? "", gToken.ibcDenom)
    );
    return {
      ...gbridgeOutTok,
      gravityNativeName: gravEthToken.nativeName,
      bridgeMethods: gbridgeOutTok.bridgeMethods.filter((method) =>
        method.methods.includes(BridgingMethod.GRAVITY_BRIDGE)
      ),
    };
  });

  return gravityTokens as GravityToken[];
}
