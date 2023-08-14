import { useState } from "react";
import { MAIN_BRIDGE_NETWORKS, TEST_BRIDGE_NETWORKS } from "./config/networks";
import { CANTO_MAINNET, CANTO_TESTNET } from "@/config/networks";
import BRIDGE_IN_TOKEN_LIST from "@/config/jsons/bridgeInTokens.json";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces/errors";
import {
  BridgeHookInputParams,
  BridgeHookReturn,
  BridgeHookState,
} from "./interfaces/hookParams";
import useAutoSelect from "../helpers/useAutoSelect";
import { BaseNetwork } from "@/config/interfaces/networks";
import { BridgeToken, BridgingMethod } from "./interfaces/tokens";
import { Transaction } from "@/config/interfaces/transactions";
import { bridgeInGravity } from "./transactions/gravityBridge";
import { bridgeLayerZero } from "./transactions/layerZero";

export default function useBridgeIn(
  props: BridgeHookInputParams
): BridgeHookReturn {
  // initial state with props
  const initialState: BridgeHookState = {
    // all options
    availableNetworks: props.testnet
      ? TEST_BRIDGE_NETWORKS
      : MAIN_BRIDGE_NETWORKS,
    availableTokens: [],
    availableMethods: [],
    // default selections
    toNetwork: props.testnet ? CANTO_TESTNET : CANTO_MAINNET,
    fromNetwork: null,
    selectedToken: null,
    selectedMethod: null,
  };

  // state of the entire hook that will be exposed
  const [state, setState] = useState<BridgeHookState>(initialState);

  ///
  /// internal hooks
  ///

  // will autoselect the first available network (only network can have default since loaded once)
  useAutoSelect(state.availableNetworks, setNetwork, props.defaults?.networkId);
  // will autoselect the first available token
  useAutoSelect(state.availableTokens, setToken);
  // will autoselect the first available method
  useAutoSelect(state.availableMethods, setMethod);

  ///
  /// internal functions
  ///

  function getNetwork(id: string): ReturnWithError<BaseNetwork> {
    const network = state.availableNetworks.find(
      (network) => network.id === id
    );
    return network
      ? NO_ERROR(network)
      : NEW_ERROR("useBridgeIn::getNetwork: network not found:" + id);
  }
  function getToken(id: string): ReturnWithError<BridgeToken> {
    const token = state.availableTokens.find((token) => token.id === id);
    return token
      ? NO_ERROR(token)
      : NEW_ERROR("useBridgeIn::getToken: token not found:" + id);
  }

  ///
  /// external setter functions
  ///

  // sets network and finds tokens for that network
  function setNetwork(id: string): void {
    //make sure new network was actually selected
    if (state.fromNetwork?.id === id) return;
    
    const { data: network, error: networkError } = getNetwork(id);
    if (networkError) {
      throw new Error("useBridgeIn::setNetwork::" + networkError.message);
    }
    const tokens = BRIDGE_IN_TOKEN_LIST.chainTokenList[
      network.id as keyof typeof BRIDGE_IN_TOKEN_LIST.chainTokenList
    ] as BridgeToken[];
    if (!tokens || tokens.length === 0) {
      throw new Error(
        "useBridgeIn::setNetwork: No tokens available for network: " +
          network.id
      );
    }
    setState((prevState) => ({
      ...prevState,
      fromNetwork: network,
      availableTokens: tokens,
      // reset token and method selections
      selectedToken: null,
      availableMethods: [],
      selectedMethod: null,
    }));
  }

  // sets selected token and loads bridging methods for that token
  function setToken(id: string): void {
    //make sure new token was actually selected
    if (state.selectedToken?.id === id) return;

    const { data: token, error: tokenError } = getToken(id);
    if (tokenError) {
      throw new Error("useBridgeIn::setToken::" + tokenError.message);
    }
    const bridgeMethods = token.bridgeMethods;
    if (!bridgeMethods || bridgeMethods.length === 0) {
      throw new Error(
        "useBridgeIn::setToken: No bridging methods available for token: " +
          token.id
      );
    }
    setState((prevState) => ({
      ...prevState,
      selectedToken: token,
      availableMethods: bridgeMethods as BridgingMethod[],
      // reset method selection
      selectedMethod: null,
    }));
  }

  // sets selected bridging method only it actually exists on the token
  function setMethod(selectMethod: string): void {
    const method = selectMethod as BridgingMethod;
    //make sure new method was actually selected
    if (method === state.selectedMethod) return;

    if (!state.availableMethods.includes(method)) {
      throw new Error("useBridgeIn::setMethod: Invalid method: " + method);
    }
    setState((prevState) => ({
      ...prevState,
      selectedMethod: method,
    }));
  }

  ///
  /// external functions
  ///
  async function bridgeIn(
    ethAccount: string,
    amount: string
  ): PromiseWithError<Transaction[]> {
    // check basic parameters to make sure they exist
    if (!state.selectedToken) {
      return NEW_ERROR("useBridgeIn::bridgeIn: no token selected");
    }
    if (!state.fromNetwork || !state.toNetwork) {
      return NEW_ERROR("useBridgeIn::bridgeIn: network undefined");
    }

    let transactions: ReturnWithError<Transaction[]>;
    // check the selected method to figure out how to create tx
    switch (state.selectedMethod) {
      case BridgingMethod.GRAVITY_BRIDGE:
        transactions = await bridgeInGravity(
          Number(state.fromNetwork.chainId),
          ethAccount,
          state.selectedToken,
          amount
        );
        break;
      case BridgingMethod.LAYER_ZERO:
        transactions = await bridgeLayerZero(
          state.fromNetwork,
          state.toNetwork,
          ethAccount,
          state.selectedToken,
          amount
        );
        break;
      case BridgingMethod.IBC: {
        transactions = NEW_ERROR("useBridgeIn::bridgeIn: IBC not implemented");
        break;
      }
      default:
        transactions = NEW_ERROR(
          "useBridgeIn::bridgeIn: invalid method: " + state.selectedMethod
        );
        break;
    }
    if (transactions.error) {
      return NEW_ERROR("useBridgeIn::bridgeIn::" + transactions.error.message);
    }
    return transactions;
  }

  return {
    testnet: props.testnet ?? false,
    allOptions: {
      networks: state.availableNetworks,
      tokens: state.availableTokens,
      methods: state.availableMethods,
    },
    selections: {
      toNetwork: state.toNetwork,
      fromNetwork: state.fromNetwork,
      token: state.selectedToken,
      method: state.selectedMethod,
    },
    setters: {
      network: setNetwork,
      token: setToken,
      method: setMethod,
    },
    bridge: bridgeIn,
  };
}
