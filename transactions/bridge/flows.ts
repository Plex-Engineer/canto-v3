import { displayAmount } from "@/utils/formatting";
import { BridgeTransactionParams, BridgingMethod } from ".";
import { NewTransactionFlow, TransactionFlowType } from "../flows";
import { getNetworkInfoFromChainId, isCantoChainId } from "@/utils/networks";
import BRIDGE_IN_TOKENS from "@/config/jsons/bridgeInTokens.json";
import BRIDGE_OUT_TOKENS from "@/config/jsons/bridgeOutTokens.json";
import { IBCToken, OFTToken } from "@/config/interfaces";
import {
  BridgeInToken,
  BridgeOutToken,
  BridgeToken,
} from "@/hooks/bridge/interfaces/tokens";

export const newCantoBridgeFlow = (
  txParams: BridgeTransactionParams
): NewTransactionFlow => ({
  title: `Bridge ${displayAmount(
    txParams.token.amount,
    txParams.token.data.decimals,
    { symbol: txParams.token.data.symbol }
  )}`,
  icon: txParams.token.data.icon,
  txType: TransactionFlowType.BRIDGE,
  params: txParams,
  tokenMetadata: bridgeTokenMetadata(txParams),
});

// for importing tokens from tx list
const bridgeTokenMetadata = (txParams: BridgeTransactionParams) => {
  let tokenToAdd = txParams.token.data;
  // always add tokens to the receiving chain
  switch (txParams.method) {
    case BridgingMethod.LAYER_ZERO: {
      if (isCantoChainId(txParams.to.chainId as number)) {
        // add the underlying token on canto, not the OFT Proxy token
        const bridgeOutTokens = getBridgeOutTokenList(
          txParams.to.chainId as number
        );
        if (!bridgeOutTokens) return undefined;
        // match by symbol
        const matchedToken = bridgeOutTokens.find(
          (t) => t.symbol === tokenToAdd.symbol
        );
        const underlyingAddress = (matchedToken as OFTToken)
          .oftUnderlyingAddress;

        if (!underlyingAddress) return undefined;
        tokenToAdd = { ...tokenToAdd, address: underlyingAddress };
      }
      // address will always be the same on both chains if going from canto
      return checkAndReturnTokenMetadata(txParams.to.chainId, tokenToAdd);
    }
    case BridgingMethod.GRAVITY_BRIDGE:
      // match tokens by symbol, add token on receiving chain
      if (isCantoChainId(txParams.to.chainId as number)) {
        // match eth token to canto token
        // get token list from bridge out token list
        const bridgeOutTokens = getBridgeOutTokenList(
          txParams.to.chainId as number
        );
        if (!bridgeOutTokens) return undefined;

        // find matching token by symbol
        const cantoToken = bridgeOutTokens.find(
          (t) => t.symbol === tokenToAdd.symbol
        );
        if (!cantoToken) return undefined;
        tokenToAdd = cantoToken;
      } else {
        // match canto token to eth token
        // get token list from bridge in token list
        const bridgeInTokens = getBridgeInTokenList(txParams.to.chainId);
        if (!bridgeInTokens) return undefined;

        // find matching token by symbol
        const matchedToken = bridgeInTokens.find(
          (t) => t.symbol === tokenToAdd.symbol
        );
        if (!matchedToken) return undefined;
        tokenToAdd = matchedToken;
      }
      return checkAndReturnTokenMetadata(txParams.to.chainId, tokenToAdd);
    case BridgingMethod.IBC: {
      // going to cosmos chain (don't import tokens)
      if (!isCantoChainId(txParams.to.chainId as number)) return undefined;

      // going to canto, add ERC20 token on canto network
      // token will be a cosmos token, find ERC20 equivalent on Canto

      // get token list from bridge out token list
      const bridgeOutTokens = getBridgeOutTokenList(
        txParams.to.chainId as number
      );
      if (!bridgeOutTokens) return undefined;

      // find matching token by ibcDenom
      const cantoToken = (bridgeOutTokens as IBCToken[]).find(
        (t) => t.ibcDenom === (tokenToAdd as IBCToken).ibcDenom
      );
      if (!cantoToken) return undefined;

      // return token metadata
      return checkAndReturnTokenMetadata(
        txParams.to.chainId,
        cantoToken as BridgeToken
      );
    }
    default:
      return undefined;
  }
};

function checkAndReturnTokenMetadata(
  chainId: number | string,
  token: BridgeToken
):
  | {
      chainId: number;
      address: string;
      symbol: string;
      decimals: number;
      icon: string;
    }[]
  | undefined {
  return typeof chainId !== "number" || !token.address
    ? undefined
    : [
        {
          chainId: chainId,
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          icon: token.icon,
        },
      ];
}

function getBridgeOutTokenList(chainId: number) {
  // get correct network id for canto
  const network = getNetworkInfoFromChainId(chainId);
  if (network.error || !network.data) return null;

  // get token list from bridge out token list
  const bridgeOutTokens =
    BRIDGE_OUT_TOKENS.chainTokenList[
      network.data.id as keyof typeof BRIDGE_OUT_TOKENS.chainTokenList
    ];
  if (!bridgeOutTokens) return null;

  return bridgeOutTokens as BridgeOutToken[];
}
function getBridgeInTokenList(chainId: string | number) {
  // get network id
  const network = getNetworkInfoFromChainId(chainId);
  if (network.error || !network.data) return null;

  // get token list from bridge in token list
  const bridgeInTokens =
    BRIDGE_IN_TOKENS.chainTokenList[
      network.data.id as keyof typeof BRIDGE_IN_TOKENS.chainTokenList
    ];
  if (!bridgeInTokens) return null;
  return bridgeInTokens as BridgeInToken[];
}
