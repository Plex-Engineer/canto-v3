import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import {
  BridgeHookInputParams,
  BridgeHookReturn,
  BridgeHookState,
  BridgeHookTxParams,
} from "./interfaces/hookParams";
import BRIDGE_OUT_TOKENS from "@/config/jsons/bridgeOutTokens.json";
import { useState } from "react";
import useAutoSelect from "../helpers/useAutoSelect";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { BaseNetwork } from "@/config/interfaces/networks";
import { BridgeOutToken, isBridgeOutToken } from "./interfaces/tokens";
import { BridgingMethod } from "./interfaces/bridgeMethods";
import { MAIN_BRIDGE_NETWORKS, TEST_BRIDGE_NETWORKS } from "./config/networks";
import { Transaction } from "@/config/interfaces/transactions";
import useTokenBalances from "../helpers/useTokenBalances";
import { bridgeOutTx } from "./transactions/bridge";
import { isERC20TokenList } from "@/config/interfaces/tokens";

export default function useBridgeOut(
  props: BridgeHookInputParams
): BridgeHookReturn {
  // initial state with props
  const initialState = {
    // all options
    availableTokens: BRIDGE_OUT_TOKENS.chainTokenList[
      props.testnet ? "canto-testnet" : "canto-mainnet"
    ] as BridgeOutToken[],
    availableNetworks: [],
    availableMethods: [],
    // default selections
    fromNetwork: props.testnet ? CANTO_TESTNET_EVM : CANTO_MAINNET_EVM,
    toNetwork: null,
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
    isERC20TokenList(state.availableTokens) ? state.availableTokens : [],
    props.userEthAddress,
    props.userCosmosAddress
  );

  // will autoselect the first available token if there are any
  useAutoSelect(state.availableTokens, setToken);
  // will autoselect the first available network if there are any
  useAutoSelect(state.availableNetworks, setNetwork);
  // will autoselect the first available method if there are any
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
      : NEW_ERROR("useBridgeOut::getNetwork: network not found:" + id);
  }
  function getToken(id: string): ReturnWithError<BridgeOutToken> {
    const token = state.availableTokens.find((token) => token.id === id);
    if (!isBridgeOutToken(token)) {
      throw new Error("useBridgeOut::getToken: invalid token type: " + id);
    }
    return token
      ? NO_ERROR(token)
      : NEW_ERROR("useBridgeOut::getToken: token not found:" + id);
  }

  ///
  /// external setter functions
  ///

  // sets selected token and loads the available networks it can be bridge to
  function setToken(id: string): void {
    //make sure new token was actually selected
    if (state.selectedToken?.id === id) return;

    const { data: token, error: tokenError } = getToken(id);
    if (tokenError) {
      throw new Error("useBridgeOut::setToken::" + tokenError.message);
    }
    // get the supoprted networks from the token
    const supportedNetworkIds = token.bridgeMethods.map((method: any) => {
      return method.chainId;
    });
    if (supportedNetworkIds.length === 0) {
      throw new Error(
        "useBridgeOut::setToken: no supported networks for token: " + id
      );
    }
    // get the networks from the ids
    const supportedNetworks = (
      props.testnet ? TEST_BRIDGE_NETWORKS : MAIN_BRIDGE_NETWORKS
    ).filter((network) => supportedNetworkIds.includes(network.id));
    if (supportedNetworks.length === 0) {
      throw new Error(
        "useBridgeOut::setToken: found no supported networks from ids"
      );
    }
    // set the token state, and reset the network and method states
    setState((prevState) => ({
      ...prevState,
      selectedToken: token,
      availableNetworks: supportedNetworks,
      toNetwork: null,
      availableMethods: [],
      selectedMethod: null,
    }));
  }

  // sets selected network and loads the available methods for bridging
  function setNetwork(id: string): void {
    //make sure new network was actually selected
    if (state.toNetwork?.id === id) return;

    const { data: network, error: networkError } = getNetwork(id);
    if (networkError) {
      throw new Error("useBridgeOut::setNetwork: invalid network id: " + id);
    }
    if (!state.selectedToken) {
      throw new Error(
        "useBridgeOut::setNetwork: must select token before network"
      );
    }
    // get the supported methods from the token and network combination
    const supportedMethods = (
      state.selectedToken.bridgeMethods as {
        chainId: string;
        methods: BridgingMethod[];
      }[]
    ).find((method: any) => method.chainId === network.id)?.methods;
    if (!supportedMethods) {
      throw new Error(
        "useBridgeOut::setNetwork: no supported methods for network: " + id
      );
    }
    setState((prevState) => ({
      ...prevState,
      toNetwork: network,
      availableMethods: supportedMethods,
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
      throw new Error("setMethod: Invalid method: " + method);
    }
    setState((prevState) => ({
      ...prevState,
      selectedMethod: method,
    }));
  }

  ///
  /// external functions
  ///
  async function bridgeOut(
    params: BridgeHookTxParams
  ): PromiseWithError<Transaction[]> {
    // check basic parameters to make sure they exist
    if (!state.selectedToken) {
      return NEW_ERROR("useBridgeOut::bridgeOut: no token selected");
    }
    if (!state.toNetwork || !state.fromNetwork) {
      return NEW_ERROR("useBridgeOut::bridgeOut: no network selected");
    }
    const { data: transactions, error: transactionsError } = await bridgeOutTx({
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
      return NEW_ERROR("useBridgeOut::bridgeOut::" + transactionsError.message);
    }
    return NO_ERROR(transactions);
  }

  return {
    direction: "out",
    testnet: props.testnet ?? false,
    allOptions: {
      tokens: state.availableTokens.map((token) => {
        const balance = userTokenBalances[token.id];
        return balance !== undefined ? { ...token, balance } : token;
      }),
      networks: state.availableNetworks,
      methods: state.availableMethods,
    },
    selections: {
      toNetwork: state.toNetwork,
      fromNetwork: state.fromNetwork,
      token: state.selectedToken,
      method: state.selectedMethod,
    },
    setters: {
      token: setToken,
      network: setNetwork,
      method: setMethod,
    },
    bridge: bridgeOut,
  };
}
