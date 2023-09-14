import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { EVMNetwork } from "@/config/interfaces/networks";
import { isValidEthAddress } from "@/utils/address.utils";
import {
  Transaction,
  TransactionDescription,
  TransactionStatus,
} from "@/config/interfaces/transactions";
import LZ_CHAIN_IDS from "@/config/jsons/layerZeroChainIds.json";
import { encodePacked } from "web3-utils";
import BigNumber from "bignumber.js";
import Web3, { Contract } from "web3";
import { OFT_ABI } from "@/config/abis";
import { getProviderWithoutSigner } from "@/utils/evm/helpers.utils";
import {
  _approveTx,
  checkTokenAllowance,
  getTokenBalance,
} from "@/utils/evm/erc20.utils";
import { ZERO_ADDRESS } from "@/config/consts/addresses";
import { OFTToken } from "@/config/interfaces/tokens";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import { formatBalance } from "@/utils/tokenBalances.utils";
import {
  BridgingMethod,
  getBridgeMethodInfo,
} from "../../interfaces/bridgeMethods";
import { getMessagesBySrcTxHash } from "@layerzerolabs/scan-client";
import { getNetworkInfoFromChainId } from "@/utils/networks.utils";
import { BridgeTransactionParams } from "../../interfaces/hookParams";
import { isOFTToken } from "@/utils/tokens/tokens.utils";
import { fetchBalance } from "wagmi/actions";

/**
 * @notice creates a list of transactions that need to be made for bridging through layer zero
 * @dev do not need an eth receiver, since it will always be the same as the sender
 * @param {EVMNetwork} fromNetwork network to send from
 * @param {EVMNetwork} toNetwork network to send to
 * @param {string} ethSender eth sender address
 * @param {ERC20Token} token token to bridge
 * @param {string} amount amount to bridge
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeLayerZero(
  fromNetwork: EVMNetwork,
  toNetwork: EVMNetwork,
  ethSender: string,
  token: OFTToken,
  amount: string
): PromiseWithError<Transaction[]> {
  // check all params
  if (!isValidEthAddress(ethSender)) {
    return NEW_ERROR("bridgeLayerZero: invalid eth address: " + ethSender);
  }
  // make sure token chain id is the same as the from network chain id
  if (token.chainId !== fromNetwork.chainId) {
    return NEW_ERROR(
      "bridgeLayerZero: token chain id does not match from network chain id"
    );
  }
  const toLZChainId = LZ_CHAIN_IDS[toNetwork.id as keyof typeof LZ_CHAIN_IDS];
  if (!toLZChainId) {
    return NEW_ERROR("bridgeLayerZero: invalid lz chainId: " + toNetwork.id);
  }

  const toAddressBytes = new Web3().eth.abi.encodeParameter(
    "address",
    ethSender
  );
  const { data: gas, error: oftError } = await estimateOFTSendGasFee(
    token.chainId,
    toLZChainId,
    token.address,
    ethSender,
    amount,
    [1, 200000]
  );
  if (oftError) {
    return NEW_ERROR("bridgeLayerZero::" + errMsg(oftError));
  }
  // all params are checked, so create tx list
  const txList: Transaction[] = [];

  // check if this is a proxy OFT (for deposit or allowance check)
  if (token.isOFTProxy) {
    // check if normal proxy OFT
    if (token.oftUnderlyingAddress) {
      // check if proxy has allowance for amount
      const { data: needAllowance, error: allowanceError } =
        await checkTokenAllowance(
          token.chainId,
          token.oftUnderlyingAddress,
          ethSender,
          token.address,
          amount
        );
      if (allowanceError) {
        return NEW_ERROR("bridgeLayerZero::" + errMsg(allowanceError));
      }
      // if allowance is less than the amount, user must approve
      if (!needAllowance) {
        txList.push(
          _approveTx(
            token.chainId,
            token.oftUnderlyingAddress,
            token.address,
            amount,
            TX_DESCRIPTIONS.APPROVE_TOKEN(token.symbol, "OFT Proxy")
          )
        );
      }
    } else {
      // must be a native OFT (check if we already have OFT balance)
      const { data: oftBalance, error: balanceError } = await getTokenBalance(
        token.chainId,
        token.address,
        ethSender
      );
      if (balanceError) {
        return NEW_ERROR("bridgeLayerZero::" + errMsg(balanceError));
      }
      // if OFT balance is less than the amount, user must deposit
      if (oftBalance.lt(amount)) {
        const amountToDeposit = new BigNumber(amount)
          .minus(oftBalance)
          .toString();
        txList.push(
          _oftDepositOrWithdrawTx(
            token.chainId,
            true,
            token.address,
            amountToDeposit,
            TX_DESCRIPTIONS.OFT_DEPOSIT_OR_WITHDRAW(
              token.symbol,
              formatBalance(amountToDeposit, token.decimals),
              true
            )
          )
        );
      }
    }
  }

  // will need to call transfer from after depositing
  txList.push(
    _oftTransferTx(
      token.chainId,
      toLZChainId,
      ethSender,
      toAddressBytes,
      token.address,
      amount,
      gas.toString(),
      TX_DESCRIPTIONS.BRIDGE(
        token.symbol,
        formatBalance(amount, token.decimals),
        fromNetwork.name,
        toNetwork.name,
        getBridgeMethodInfo(BridgingMethod.LAYER_ZERO).name
      )
    )
  );

  return NO_ERROR(txList);
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _oftTransferTx = (
  chainId: number,
  toLZChainId: number,
  ethAddress: string,
  toAddressBytes: string,
  tokenAddress: string,
  amount: string,
  gas: string,
  description: TransactionDescription
): Transaction => ({
  bridge: {
    lastStatus: "NONE",
    type: BridgingMethod.LAYER_ZERO,
  },
  description,
  chainId: chainId,
  type: "EVM",
  target: tokenAddress,
  abi: OFT_ABI,
  method: "sendFrom",
  params: [
    ethAddress,
    toLZChainId,
    toAddressBytes,
    amount,
    [ethAddress, ZERO_ADDRESS, "0x"],
  ],
  value: gas,
});

const _oftDepositOrWithdrawTx = (
  chainId: number,
  deposit: boolean,
  oftAddress: string,
  amount: string,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: oftAddress,
  abi: OFT_ABI,
  method: deposit ? "deposit" : "withdraw",
  params: deposit ? [] : [amount],
  value: deposit ? amount : "0",
});

/**
 * TRANSACTION HELPERS
 */

/**
 * @notice estimates the gas fee for sending OFT
 * @dev gas is paid for on both chains by the sender (in sending gas token)
 * @param {string} fromRpc rpc url of the network to send from
 * @param {number} toLZChainId chain id of the network to send to
 * @param {string} oftAddress address of the OFT token
 * @param {string} account address of the account to send to
 * @param {string} amount amount to send
 * @param {number[]} adapterParams adapter params for OFT
 * @returns {PromiseWithError<BigNumber>} gas fee for sending OFT or error
 */
async function estimateOFTSendGasFee(
  fromChainId: number,
  toLZChainId: number,
  oftAddress: string,
  account: string,
  amount: string,
  adapterParams: number[]
): PromiseWithError<BigNumber> {
  const formattedAdapterParams = encodePacked(
    { type: "uint16", value: adapterParams[0] },
    { type: "uint256", value: adapterParams[1] }
  );
  // get network
  const { data: fromNetwork, error: fromNetworkError } =
    getNetworkInfoFromChainId(fromChainId);

  if (fromNetworkError) {
    return NEW_ERROR(
      "estimateOFTSendGasFee::" + errMsg(fromNetworkError.message)
    );
  }
  const oftContract = new Contract(
    OFT_ABI,
    oftAddress,
    getProviderWithoutSigner(fromNetwork.rpcUrl)
  );
  const toAddressBytes = new Web3().eth.abi.encodeParameter("address", account);
  try {
    const gas = await oftContract.methods
      .estimateSendFee(
        toLZChainId,
        toAddressBytes,
        amount,
        false,
        formattedAdapterParams
      )
      .call();
    return NO_ERROR(new BigNumber(gas[0] as string));
  } catch (err) {
    return NEW_ERROR("estimateOFTSendGasFee::" + errMsg(err));
  }
}

/**
 * Will check status of ongoing LZ bridge
 */
export async function checkLZBridgeStatus(
  fromChainId: number,
  txHash: string
): PromiseWithError<{ status: TransactionStatus }> {
  try {
    // get network
    const { data: fromNetwork, error: fromNetworkError } =
      getNetworkInfoFromChainId(fromChainId);
    if (fromNetworkError) throw new Error(fromNetworkError.message);

    const fromLZId = LZ_CHAIN_IDS[fromNetwork.id as keyof typeof LZ_CHAIN_IDS];
    if (!fromLZId) {
      return NEW_ERROR(
        "checkLZBridgeStatus: invalid lz chainId: " + fromNetwork.id
      );
    }
    const { messages } = await getMessagesBySrcTxHash(fromLZId, txHash);
    if (messages.length === 0) return NO_ERROR({ status: "PENDING" });
    switch (messages[0].status) {
      case "INFLIGHT":
        return NO_ERROR({ status: "PENDING" });
      case "DELIVERED":
        return NO_ERROR({ status: "SUCCESS" });
      case "FAILED":
        return NO_ERROR({ status: "ERROR" });
      default:
        return NO_ERROR({ status: "NONE" });
    }
  } catch (err) {
    return NEW_ERROR("checkLZBridgeStatus::" + errMsg(err));
  }
}

/**
 * @notice validates the parameters for retrying bridging through layer zero
 * @param {BridgeTransactionParams} params parameters for bridging
 * @returns {PromiseWithError<{valid: boolean, error?: string}>} whether the parameters are valid or not
 */
export async function validateLayerZeroRetryParams(
  params: BridgeTransactionParams
): PromiseWithError<{
  valid: boolean;
  error?: string;
}> {
  if (!isOFTToken(params.token.data)) {
    return NEW_ERROR(
      "validateLayerZeroRetryParams: layer zero only works for OFT"
    );
  }
  // check if the user has enough tokens to make the bridge tx
  let tokenAddress = params.token.data.address;
  if (params.token.data.isOFTProxy && params.token.data.oftUnderlyingAddress) {
    tokenAddress = params.token.data.oftUnderlyingAddress;
  }
  const { data: userTokenBalance, error: userTokenBalanceError } =
    await getTokenBalance(
      params.token.data.chainId,
      tokenAddress,
      params.from.account
    );
  if (userTokenBalanceError) {
    return NEW_ERROR("validateLayerZeroRetryParams::" + userTokenBalanceError);
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
}
