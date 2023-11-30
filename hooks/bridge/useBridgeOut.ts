import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import {
  BridgeHookInputParams,
  BridgeHookReturn,
  BridgeHookState,
  BridgeHookTxParams,
  HookSetterParam,
} from "./interfaces/hookParams";
import BRIDGE_OUT_TOKENS from "@/config/jsons/bridgeOutTokens.json";
import { useEffect, useState } from "react";
import useAutoSelect from "../helpers/useAutoSelect";
import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  ERC20Token,
} from "@/config/interfaces";
import { BaseNetwork } from "@/config/interfaces";
import { BridgeOutToken } from "./interfaces/tokens";
import {
  MAIN_BRIDGE_OUT_NETWORKS,
  TEST_BRIDGE_NETWORKS,
} from "./config/networks";
import useTokenBalances from "../helpers/useTokenBalances";
import { isERC20TokenList, isOFTToken, isBridgeOutToken } from "@/utils/tokens";
import { isValidEthAddress } from "@/utils/address";
import {
  BridgeTransactionParams,
  BridgingMethod,
  newCantoBridgeFlow,
  validateCantoBridgeTxParams,
} from "@/transactions/bridge";

export default function useBridgeOut(
  props: BridgeHookInputParams
): BridgeHookReturn {
  // initial state with props
  const initialState = (testnet: boolean): BridgeHookState => ({
    // all options
    availableTokens: BRIDGE_OUT_TOKENS.chainTokenList[
      testnet ? "canto-testnet" : "canto-mainnet"
    ] as BridgeOutToken[],
    availableNetworks: [],
    availableMethods: [],
    // default selections
    fromNetwork: testnet ? CANTO_TESTNET_EVM : CANTO_MAINNET_EVM,
    toNetwork: null,
    selectedToken: null,
    selectedMethod: null,
    // user addresses
    connectedEthAddress: null,
    connectedCosmosAddress: null,
    userInputCosmosAddress: null,
  });

  // state of the entire hook that will be exposed
  const [state, setState] = useState<BridgeHookState>(
    initialState(props.testnet ?? false)
  );

  ///
  /// internal hooks
  ///

  // if the user switches to testnet, we need to reset the state
  useEffect(() => {
    // don't reset connected addresses, just selections
    setState((prevState) => ({
      ...initialState(props.testnet ?? false),
      ...{
        connectedEthAddress: prevState.connectedEthAddress,
        connectedCosmosAddress: prevState.connectedCosmosAddress,
        userInputCosmosAddress: null,
      },
    }));
  }, [props.testnet]);

  // contains object mapping of the token balances
  const userTokenBalances = useTokenBalances(
    state.fromNetwork?.chainId,
    isERC20TokenList(state.availableTokens)
      ? (state.availableTokens.map((token) => {
          if (
            isOFTToken(token) &&
            token.isOFTProxy &&
            token.oftUnderlyingAddress
          ) {
            return { ...token, address: token.oftUnderlyingAddress };
          } else {
            return token;
          }
        }) as ERC20Token[])
      : [],
    state.connectedEthAddress,
    null
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
      return NEW_ERROR("useBridgeOut::getToken: invalid token type: " + id);
    }
    // check if we have a balance for the token
    const balance = userTokenBalances[token.id];
    if (balance !== undefined) {
      return NO_ERROR({ ...token, balance });
    }
    return NO_ERROR(token);
  }

  ///
  /// internal setter functions
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
      props.testnet ? TEST_BRIDGE_NETWORKS : MAIN_BRIDGE_OUT_NETWORKS
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

  // user address setters
  // pass in address of eth signer for transactions
  function setConnectedEthAddress(address: string): void {
    // check if valid address
    setState((prevState) => ({
      ...prevState,
      connectedEthAddress: isValidEthAddress(address) ? address : null,
    }));
  }
  // make sure this is called from the parent whenever cosmos network is selected
  function setConnectedCosmosAddress(address: string): void {
    // no need to connect to keplr for bridging out
    return;
  }
  // make sure this is called from the parent whenever cosmos address is changed
  function setUserInputCosmosAddress(address: string): void {
    // no need to check validity, this will be done inside any cosmos function
    setState((prevState) => ({
      ...prevState,
      userInputCosmosAddress: address,
    }));
  }

  ///
  /// external functions
  ///

  // get the sender based on current tx state
  function getSender(): string | null {
    if (!state.selectedMethod) return null;
    switch (state.selectedMethod) {
      case BridgingMethod.IBC:
      case BridgingMethod.LAYER_ZERO:
      case BridgingMethod.GRAVITY_BRIDGE:
        return state.connectedEthAddress;
      default:
        return null;
    }
  }
  // get the receiver based on current tx state
  function getReceiver(): string | null {
    if (!state.selectedMethod) return null;
    switch (state.selectedMethod) {
      case BridgingMethod.IBC:
        return state.userInputCosmosAddress;
      case BridgingMethod.LAYER_ZERO:
      case BridgingMethod.GRAVITY_BRIDGE:
        return state.connectedEthAddress;
      default:
        return null;
    }
  }

  // this function is exposed to the parent component to set the state
  function generalSetter(paramName: HookSetterParam, id: string): void {
    // checks will be done internally
    switch (paramName) {
      case "network":
        return setNetwork(id);
      case "token":
        return setToken(id);
      case "method":
        return setMethod(id);
      case "ethAddress":
        return setConnectedEthAddress(id);
      case "cosmosAddress":
        return setConnectedCosmosAddress(id);
      case "inputCosmosAddress":
        return setUserInputCosmosAddress(id);
      default:
        throw new Error(
          "useBridgeIn::generalSetter: invalid param: " + paramName
        );
    }
  }

  const bridgeTxParams = (
    params: BridgeHookTxParams
  ): BridgeTransactionParams => ({
    method: state.selectedMethod,
    from: {
      chainId: state.fromNetwork?.chainId ?? "",
      account: getSender() ?? "",
    },
    to: {
      chainId: state.toNetwork?.chainId ?? "",
      account: getReceiver() ?? "",
    },
    token: {
      data: getToken(state.selectedToken?.id ?? "").data,
      amount: params.amount,
    },
    ...(params.bridgeFee && params.chainFee
      ? {
          gravityBridgeFees: {
            bridgeFee: params.bridgeFee,
            chainFee: params.chainFee,
          },
        }
      : {}),
  });

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
      token: state.selectedToken ? getToken(state.selectedToken.id).data : null,
      method: state.selectedMethod,
    },
    addresses: {
      getSender,
      getReceiver,
    },
    setState: generalSetter,
    bridge: {
      validateParams: (params) =>
        validateCantoBridgeTxParams(bridgeTxParams(params)),
      newBridgeFlow: (params) => newCantoBridgeFlow(bridgeTxParams(params)),
    },
  };
}
