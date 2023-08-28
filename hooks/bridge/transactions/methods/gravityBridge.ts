import { GRAVITY_BRIDGE_ABI, WETH_ABI } from "@/config/abis";
import {
  GRAVITY_BRIDGE_ETH_ADDRESS,
  PUB_KEY_BOT_ADDRESS,
  WETH_MAINNET_ADDRESS,
} from "@/config/consts/addresses";
import { CANTO_BOT_API_URL } from "@/config/consts/apiUrls";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { ERC20Token } from "@/config/interfaces/tokens";
import { Transaction } from "@/config/interfaces/transactions";
import {
  CANTO_MAINNET_COSMOS,
  CANTO_MAINNET_EVM,
  ETH_MAINNET,
} from "@/config/networks";
import {
  checkPubKeyCosmos,
  ethToCantoAddress,
  isValidCantoAddress,
  isValidEthAddress,
} from "@/utils/address.utils";
import { tryFetch } from "@/utils/async.utils";
import { getCantoBalance } from "@/utils/cosmos/cosmosBalance.utils";
import { createMsgsSend } from "@/utils/cosmos/transactions/messages/messageSend";
import {
  _approveTx,
  checkTokenAllowance,
  getTokenBalance,
} from "@/utils/evm/erc20.utils";
import { formatBalance } from "@/utils/tokenBalances.utils";
import BigNumber from "bignumber.js";

/**
 * @notice creates a list of transactions that need to be made for bridging into gravity bridge
 * @param {number} chainId chainId to begin bridging from
 * @param {string} ethSender eth sender address
 * @param {string} cantoReceiver canto receiver address
 * @param {ERC20Token} token token to bridge
 * @param {string} amount amount to bridge
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeInGravity(
  chainId: number,
  ethSender: string,
  cantoReceiver: string,
  token: ERC20Token,
  amount: string
): PromiseWithError<Transaction[]> {
  // check addresses
  if (!isValidEthAddress(ethSender)) {
    return NEW_ERROR("bridgeInGravity: invalid eth address: " + ethSender);
  }
  if (!isValidCantoAddress(cantoReceiver)) {
    return NEW_ERROR(
      "bridgeInGravity: invalid canto address: " + cantoReceiver
    );
  }

  // parameters look good, so create the tx list
  const txList: Transaction[] = [];

  // check if the user has a public key
  // check on Canto Mainnet
  const { data: hasPubKey, error: checkPubKeyError } = await checkPubKeyCosmos(
    cantoReceiver,
    CANTO_MAINNET_COSMOS.chainId
  );
  // if no pub key found or error fetching account
  if (!hasPubKey || checkPubKeyError) {
    const { data: cantoAddress, error: ethToCantoError } =
      await ethToCantoAddress(ethSender);
    if (ethToCantoError) {
      return NEW_ERROR("bridgeInGravity::" + ethToCantoError.message);
    }
    // check that the receiver and sender is the same address since EIP will be created
    if (cantoAddress !== cantoReceiver) {
      return NEW_ERROR(
        "bridgeInGravity: canto address and canto receiver are not the same: " +
          cantoAddress +
          " != " +
          cantoReceiver
      );
    }
    // get canto balance to see if enough canto for generating public key
    const { data: cantoBalance, error: balanceError } = await getCantoBalance(
      CANTO_MAINNET_COSMOS.chainId,
      cantoAddress
    );
    if (balanceError) {
      return NEW_ERROR("bridgeInGravity::" + balanceError.message);
    }
    const enoughCanto = new BigNumber(cantoBalance).gte("300000000000000000");
    // call api to send canto if not enough canto
    if (!enoughCanto) {
      const { error: botError } = await tryFetch(CANTO_BOT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Request-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": "true",
        },
        mode: "no-cors",
        body: JSON.stringify({
          cantoAddress: cantoAddress,
          hexAddress: ethSender,
        }),
      });
      if (botError) {
        return NEW_ERROR("bridgeInGravity::" + botError.message);
      }
    }

    // must add this to the transaction list to set the public key
    txList.push(
      _generatePubKeyTx(
        CANTO_MAINNET_EVM.chainId,
        cantoAddress,
        TX_DESCRIPTIONS.GENERATE_PUBLIC_KEY()
      )
    );
  }

  // check if dealing with WETH, since we might need to wrap ETH
  if (isWETH(token.address)) {
    // get WETH balance first, since we might not need to wrap yet
    const { data: wethBalance, error: balanceError } = await getTokenBalance(
      chainId,
      token.address,
      ethSender
    );
    if (balanceError) {
      return NEW_ERROR("bridgeInGravity::" + balanceError.message);
    }
    // check if we need to wrap ETH
    if (wethBalance.isLessThan(amount)) {
      // must wrap the right amount of ETH now
      txList.push(
        _wrapTx(
          chainId,
          token.address,
          amount,
          TX_DESCRIPTIONS.WRAP_ETH(formatBalance(amount, token.decimals))
        )
      );
    }
  }
  // check token allowance
  const { data: needAllowance, error: allowanceError } =
    await checkTokenAllowance(
      chainId,
      token.address,
      ethSender,
      GRAVITY_BRIDGE_ETH_ADDRESS,
      amount
    );
  if (allowanceError) {
    return NEW_ERROR("bridgeInGravity::" + allowanceError.message);
  }

  if (needAllowance) {
    txList.push(
      _approveTx(
        chainId,
        token.address,
        GRAVITY_BRIDGE_ETH_ADDRESS,
        amount,
        TX_DESCRIPTIONS.APPROVE_TOKEN(token.symbol, "Gravity Bridge")
      )
    );
  }

  // send to cosmos
  txList.push(
    _sendToCosmosTx(
      chainId,
      cantoReceiver,
      token.address,
      amount,
      TX_DESCRIPTIONS.BRIDGE(
        token.symbol,
        formatBalance(amount, token.decimals),
        ETH_MAINNET.name,
        CANTO_MAINNET_EVM.name
      )
    )
  );

  return NO_ERROR(txList);
}

/**
 * @notice checks if the token address is WETH
 * @dev Function assumes we are on ETH mainnet
 * @param {string} tokenAddress address to check if it is WETH
 * @returns {boolean} true if tokenAddress is WETH, false otherwise
 */
function isWETH(tokenAddress: string): boolean {
  return tokenAddress.toLowerCase() === WETH_MAINNET_ADDRESS.toLowerCase();
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */

const _sendToCosmosTx = (
  chainId: number,
  cantoReceiverAddress: string,
  tokenAddress: string,
  amount: string,
  description: string
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: GRAVITY_BRIDGE_ETH_ADDRESS,
  abi: GRAVITY_BRIDGE_ABI,
  method: "sendToCosmos",
  params: [tokenAddress, cantoReceiverAddress, amount],
  value: "0",
});

const _wrapTx = (
  chainId: number,
  wethAddress: string,
  amount: string,
  description: string
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: wethAddress,
  abi: WETH_ABI,
  method: "deposit",
  params: [],
  value: amount,
});

const _generatePubKeyTx = (
  chainId: number,
  cantoSender: string,
  description: string
): Transaction => {
  const pubKeyTx = createMsgsSend({
    fromAddress: cantoSender,
    destinationAddress: PUB_KEY_BOT_ADDRESS,
    amount: "1",
    denom: "acanto",
  });
  return {
    chainId,
    type: "COSMOS",
    description,
    msg: pubKeyTx,
  };
};
