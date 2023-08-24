import { useState } from "react";
import { MAIN_BRIDGE_NETWORKS, TEST_BRIDGE_NETWORKS } from "./config/networks";
import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
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
  BridgeHookTxParams,
} from "./interfaces/hookParams";
import useAutoSelect from "../helpers/useAutoSelect";
import { BaseNetwork } from "@/config/interfaces/networks";
import {
  BridgeInToken,
  isBridgeInToken,
  isBridgeInTokenList,
} from "./interfaces/tokens";
import { BridgingMethod } from "./interfaces/bridgeMethods";
import { Transaction } from "@/config/interfaces/transactions";
import useTokenBalances from "../helpers/useTokenBalances";

import { bridgeInTx } from "./transactions/bridge";

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
    toNetwork: props.testnet ? CANTO_TESTNET_EVM : CANTO_MAINNET_EVM,
    fromNetwork: null,
    selectedToken: null,
    selectedMethod: null,
  };

  // state of the entire hook that will be exposed
  const [state, setState] = useState<BridgeHookState>(initialState);

  ///
  /// internal hooks
  ///

  // contains object mapping of the token balances
  const userTokenBalances = useTokenBalances(
    state.fromNetwork?.chainId,
    state.availableTokens,
    props.userEthAddress,
    props.userCosmosAddress
  );
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
  function getToken(id: string): ReturnWithError<BridgeInToken> {
    const token = state.availableTokens.find((token) => token.id === id);
    if (!isBridgeInToken(token)) {
      return NEW_ERROR("useBridgeIn::getToken: invalid token type:" + id);
    }
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
    const tokens =
      BRIDGE_IN_TOKEN_LIST.chainTokenList[
        network.id as keyof typeof BRIDGE_IN_TOKEN_LIST.chainTokenList
      ];
    if (!tokens || tokens.length === 0) {
      throw new Error(
        "useBridgeIn::setNetwork: No tokens available for network: " +
          network.id
      );
    }
    // check token type to make sure they are all bridgeInTokens
    if (!isBridgeInTokenList(tokens)) {
      throw new Error(
        "useBridgeIn::setNetwork: Invalid token type for network: " + network.id
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
      availableMethods: bridgeMethods,
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
    params: BridgeHookTxParams
  ): PromiseWithError<Transaction[]> {
    // check basic parameters to make sure they exist
    if (!state.selectedToken) {
      return NEW_ERROR("useBridgeIn::bridgeIn: no token selected");
    }
    if (!state.fromNetwork || !state.toNetwork) {
      return NEW_ERROR("useBridgeIn::bridgeIn: network undefined");
    }
    const { data: transactions, error: transactionsError } = await bridgeInTx({
      from: {
        network: state.fromNetwork,
        account: params.sender,
      },
      to: {
        network: state.toNetwork,
        account: params.receiver,
      },
      token: {
        data: state.selectedToken,
        amount: params.amount,
      },
      method: state.selectedMethod,
    });
    if (transactionsError) {
      return NEW_ERROR("useBridgeIn::bridgeIn::" + transactionsError.message);
    }
    return NO_ERROR(transactions);
  }

  return {
    direction: "in",
    testnet: props.testnet ?? false,
    allOptions: {
      networks: state.availableNetworks,
      tokens: state.availableTokens.map((token) => {
        const balance = userTokenBalances[token.id];
        return balance !== undefined ? { ...token, balance } : token;
      }),
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
