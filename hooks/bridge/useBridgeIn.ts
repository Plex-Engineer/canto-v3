import { useEffect, useState } from "react";
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
import { BridgeInToken } from "./interfaces/tokens";
import { BridgingMethod } from "./interfaces/bridgeMethods";
import { Transaction } from "@/config/interfaces/transactions";
import useTokenBalances from "../helpers/useTokenBalances";
import { bridgeInTx } from "./transactions/bridge";
import { isERC20TokenList } from "@/utils/tokens/tokens.utils";
import {
  isBridgeInToken,
  isBridgeInTokenList,
} from "@/utils/tokens/bridgeTokens.utils";
import { convertToBigNumber } from "@/utils/tokenBalances.utils";

export default function useBridgeIn(
  props: BridgeHookInputParams
): BridgeHookReturn {
  // initial state with props
  const initialState = (testnet: boolean): BridgeHookState => ({
    // all options
    availableNetworks: testnet ? TEST_BRIDGE_NETWORKS : MAIN_BRIDGE_NETWORKS,
    availableTokens: [],
    availableMethods: [],
    // default selections
    toNetwork: testnet ? CANTO_TESTNET_EVM : CANTO_MAINNET_EVM,
    fromNetwork: null,
    selectedToken: null,
    selectedMethod: null,
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
    setState(initialState(props.testnet ?? false));
  }, [props.testnet]);

  // contains object mapping of the token balances
  const userTokenBalances = useTokenBalances(
    state.fromNetwork?.chainId,
    isERC20TokenList(state.availableTokens) ? state.availableTokens : [],
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
    // check if we have a balance for the token
    const balance = userTokenBalances[token.id];
    if (balance !== undefined) {
      return NO_ERROR({ ...token, balance });
    }
    return NO_ERROR(token);
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
  function canBridge(params: BridgeHookTxParams): ReturnWithError<boolean> {
    // check to make sure all parameters are defined and valid
    // check current state
    if (!state.selectedToken) {
      return NEW_ERROR("useBridgeIn::canBridge: no token selected");
    }
    if (!state.fromNetwork || !state.toNetwork) {
      return NEW_ERROR("useBridgeIn::canBridge: network undefined");
    }
    if (!state.selectedMethod) {
      return NEW_ERROR("useBridgeIn::canBridge: method undefined");
    }
    // check passed in parameters
    if (!params.sender) {
      return NEW_ERROR("useBridgeIn::canBridge: sender undefined");
    }
    if (!params.receiver) {
      return NEW_ERROR("useBridgeIn::canBridge: receiver undefined");
    }
    // make sure balance exists for token
    const balance = userTokenBalances[state.selectedToken.id];
    if (balance === undefined) {
      return NEW_ERROR(
        "useBridgeIn::canBridge: balance undefined for token: " +
          state.selectedToken.id
      );
    }
    // make sure amount it less than or equal to the token balance
    const { data: userAmount, error: bigNumberError } = convertToBigNumber(
      params.amount,
      state.selectedToken.decimals
    );
    if (bigNumberError) {
      return NEW_ERROR("useBridgeIn::canBridge::" + bigNumberError.message);
    }
    // token balance is already formatted with decimals
    const { data: tokenAmount, error: tokenBigNumberError } =
      convertToBigNumber(balance, 0);
    if (tokenBigNumberError) {
      return NEW_ERROR(
        "useBridgeIn::canBridge::" + tokenBigNumberError.message
      );
    }
    return NO_ERROR(userAmount.lte(tokenAmount) && userAmount.gt(0));
  }

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
      token: state.selectedToken ? getToken(state.selectedToken.id).data : null,
      method: state.selectedMethod,
    },
    setters: {
      network: setNetwork,
      token: setToken,
      method: setMethod,
    },
    bridge: {
      bridgeTx: bridgeIn,
      canBridge,
    },
  };
}
