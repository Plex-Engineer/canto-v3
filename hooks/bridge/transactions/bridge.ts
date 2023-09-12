import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { BridgeTransactionParams } from "../interfaces/hookParams";
import { Transaction } from "@/config/interfaces/transactions";
import { BridgingMethod } from "../interfaces/bridgeMethods";
import { isCosmosNetwork, isEVMNetwork } from "@/utils/networks.utils";
import { bridgeInGravity } from "./methods/gravityBridge";
import { bridgeLayerZero } from "./methods/layerZero";
import { ibcInKeplr } from "./keplr/ibcKeplr";
import { txIBCOut } from "./methods/ibc";
import { isERC20Token, isIBCToken } from "@/utils/tokens/tokens.utils";
import { getTokenBalance } from "@/utils/evm/erc20.utils";
import { fetchBalance } from "wagmi/actions";
import { getCosmosTokenBalance } from "@/utils/cosmos/cosmosBalance.utils";
import { IBCToken } from "@/config/interfaces/tokens";
import { convertToBigNumber } from "@/utils/tokenBalances.utils";

/**
 * @notice creates a list of transactions that need to be made for bridging into canto
 * @param {BridgeTransactionParams} params parameters for bridging in
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeInTx(
  params: BridgeTransactionParams
): PromiseWithError<Transaction[]> {
  // create tx list
  let transactions: ReturnWithError<Transaction[]>;

  // check the selected method to figure out how to create tx
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      // check to make sure EVM network is selected
      if (!isEVMNetwork(params.from.network)) {
        return NEW_ERROR(
          "bridgeInTx: gravity bridge only works for EVM networks"
        );
      }
      // check to make sure token is an ERC20 token
      if (!isERC20Token(params.token.data)) {
        return NEW_ERROR("bridgeInTx: gravity bridge only works for ERC20");
      }
      transactions = await bridgeInGravity(
        params.from.network.chainId,
        params.from.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.LAYER_ZERO:
      // check to make sure EVM networks are selected
      if (
        !(isEVMNetwork(params.from.network) && isEVMNetwork(params.to.network))
      ) {
        return NEW_ERROR("bridgeInTx: layer zero only works for EVM networks");
      }
      // check to make sure token is an ERC20 token
      if (!isERC20Token(params.token.data)) {
        return NEW_ERROR("bridgeInTx: layer zero only works for ERC20");
      }
      transactions = await bridgeLayerZero(
        params.from.network,
        params.to.network,
        params.from.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.IBC: {
      // check to make sure cosmos network is selected
      if (!isCosmosNetwork(params.from.network)) {
        return NEW_ERROR("bridgeInTx: IBC only works for Cosmos networks");
      }
      // check to make sure token is an IBC token
      if (!isIBCToken(params.token.data)) {
        return NEW_ERROR("bridgeInTx: IBC only works for IBC tokens");
      }
      transactions = await ibcInKeplr(
        params.from.network,
        params.from.account,
        params.to.account,
        params.token.data,
        params.token.amount
      );
      break;
    }
    default:
      return NEW_ERROR("bridgeInTx: invalid method: " + params.method);
  }
  if (transactions.error) {
    return NEW_ERROR("bridgeInTx::" + transactions.error);
  }
  return transactions;
}

/**
 * @notice creates a list of transactions that need to be made for bridging out of canto
 * @param {BridgeTransactionParams} params parameters for bridging out
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeOutTx(
  params: BridgeTransactionParams
): PromiseWithError<Transaction[]> {
  // create tx list
  let transactions: ReturnWithError<Transaction[]>;

  // check the selected method to figure out how to create tx
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return NEW_ERROR("bridgeOutTx: GBRIDGE not implemented");
    case BridgingMethod.LAYER_ZERO:
      // check to make sure EVM networks are selected
      if (
        !(isEVMNetwork(params.from.network) && isEVMNetwork(params.to.network))
      ) {
        return NEW_ERROR("bridgeOutTx: layer zero only works for EVM networks");
      }
      // check to make sure token is an ERC20 token
      if (!isERC20Token(params.token.data)) {
        return NEW_ERROR("bridgeOutTx: layer zero only works for ERC20");
      }
      transactions = await bridgeLayerZero(
        params.from.network,
        params.to.network,
        params.from.account,
        params.token.data,
        params.token.amount
      );
      break;
    case BridgingMethod.IBC: {
      // check to make sure EVM to Cosmos networks are selected
      if (
        !(
          isEVMNetwork(params.from.network) &&
          isCosmosNetwork(params.to.network)
        )
      ) {
        return NEW_ERROR(
          "bridgeOutTx: IBC only works from canto to cosmos networks"
        );
      }
      // check to make sure token is an IBC token
      if (!isIBCToken(params.token.data)) {
        return NEW_ERROR("bridgeOutTx: IBC only works for IBC tokens");
      }
      transactions = await txIBCOut(
        params.from.network.chainId,
        params.from.account,
        params.to.account,
        params.to.network,
        params.token.data,
        params.token.amount
      );
      break;
    }
    default:
      return NEW_ERROR("bridgeOutTx: invalid method: " + params.method);
  }
  if (transactions.error) {
    return NEW_ERROR("bridgeOutTx::" + transactions.error);
  }
  return transactions;
}

export async function validateBridgeInTxParams(
  params: BridgeTransactionParams
): PromiseWithError<{
  valid: boolean;
  error?: string;
}> {
  // balance will depend on the method used
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE: {
      // get token balance for user
      const { data: userTokenBalance, error: userTokenBalanceError } =
        await getTokenBalance(
          params.token.data.chainId,
          params.token.data.address ?? "",
          params.from.account
        );
      if (userTokenBalanceError) {
        return NEW_ERROR("validateBridgeTxParams::" + userTokenBalanceError);
      }
      // add to the total balance if there is not enough && it is a native wrapped token
      let totalBalance = userTokenBalance;
      if (
        params.token.data.nativeWrappedToken &&
        userTokenBalance.lt(params.token.amount)
      ) {
        // get native balance as well
        const nativeBalance = await fetchBalance({
          address: params.from.account as `0x${string}`,
          chainId: params.token.data.chainId,
        });
        totalBalance = totalBalance.plus(nativeBalance.value.toString());
      }
      if (totalBalance.lt(params.token.amount)) {
        return NO_ERROR({ valid: false, error: "insufficient funds" });
      }
      return NO_ERROR({ valid: true });
    }
    case BridgingMethod.IBC: {
      // if ibc in then we need to check native balance of the token on the cosmos chain
      const { data: cosmosBalance, error: cosmosBalanceError } =
        await getCosmosTokenBalance(
          params.token.data.chainId.toString(),
          params.from.account,
          (params.token.data as IBCToken).nativeName
        );
      if (cosmosBalanceError) {
        return NEW_ERROR("validateBridgeTxParams::" + cosmosBalanceError);
      }
      if (convertToBigNumber(cosmosBalance).data.lt(params.token.amount)) {
        return NO_ERROR({ valid: false, error: "insufficient funds" });
      }
      return NO_ERROR({ valid: true });
    }
    case BridgingMethod.LAYER_ZERO:
      // we need to check if the user has enough tokens to make the bridge tx
      let tokenAddress = params.token.data.address;
      if (
        params.token.data.isOFT &&
        params.token.data.isOFTProxy &&
        params.token.data.oftUnderlyingAddress
      ) {
        tokenAddress = params.token.data.oftUnderlyingAddress;
      }
      const { data: userTokenBalance, error: userTokenBalanceError } =
        await getTokenBalance(
          params.token.data.chainId,
          tokenAddress ?? "",
          params.from.account
        );
      if (userTokenBalanceError) {
        return NEW_ERROR("validateBridgeTxParams::" + userTokenBalanceError);
      }
      // might still need to grab native token balance if also a wrapper around native token (native OFT)
      let totalBalance = userTokenBalance;
      if (
        totalBalance.lt(params.token.amount) &&
        params.token.data.nativeWrappedToken
      ) {
        // get native balance as well
        const nativeBalance = await fetchBalance({
          address: params.from.account as `0x${string}`,
          chainId: params.token.data.chainId,
        });
        totalBalance = totalBalance.plus(nativeBalance.value.toString());
      }
      if (totalBalance.lt(params.token.amount)) {
        return NO_ERROR({ valid: false, error: "insufficient funds" });
      }
      return NO_ERROR({ valid: true });

    default: {
      return NO_ERROR({ valid: false, error: "invalid method" });
    }
  }
}

//TODO: implement
/**
 * @notice validates the parameters for bridging out
 * @param {BridgeTransactionParams} params parameters for bridging out
 * @returns {PromiseWithError<{valid: boolean, error?: string}>} whether the parameters are valid or not
 */
export async function validateBridgeOutTxParams(
  params: BridgeTransactionParams
): PromiseWithError<{
  valid: boolean;
  error?: string;
}> {
  // balance will depend on the method used
  switch (params.method) {
    case BridgingMethod.GRAVITY_BRIDGE:
      return NEW_ERROR("validateBridgeOutTxParams: GBRIDGE not implemented");
    case BridgingMethod.IBC:
      return NEW_ERROR("validateBridgeOutTxParams: GBRIDGE not implemented");
    case BridgingMethod.LAYER_ZERO:
      return NEW_ERROR("validateBridgeOutTxParams: GBRIDGE not implemented");
    default:
      return NO_ERROR({ valid: false, error: "invalid method" });
  }
}
