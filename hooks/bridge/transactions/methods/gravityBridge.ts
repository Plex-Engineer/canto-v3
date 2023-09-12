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
  errMsg,
} from "@/config/interfaces/errors";
import { ERC20Token } from "@/config/interfaces/tokens";
import {
  Transaction,
  TransactionDescription,
  TransactionStatus,
} from "@/config/interfaces/transactions";
import {
  CANTO_MAINNET_COSMOS,
  CANTO_MAINNET_EVM,
  ETH_MAINNET,
} from "@/config/networks";
import {
  checkPubKeyCosmos,
  ethToCantoAddress,
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
import {
  BridgingMethod,
  getBridgeMethodInfo,
} from "../../interfaces/bridgeMethods";
import { getGBridgeQueueForUser } from "../../txHistory/gbridgeHistory";
import { fetchBlockNumber, fetchTransaction } from "wagmi/actions";

/**
 * @notice creates a list of transactions that need to be made for bridging into gravity bridge
 * @param {string} ethSender eth sender address
 * @param {ERC20Token} token token to bridge
 * @param {string} amount amount to bridge
 * @returns {PromiseWithError<Transaction[]>} list of transactions to make or error
 */
export async function bridgeInGravity(
  ethSender: string,
  token: ERC20Token,
  amount: string
): PromiseWithError<Transaction[]> {
  // check addresses
  if (!isValidEthAddress(ethSender)) {
    return NEW_ERROR("bridgeInGravity: invalid eth address: " + ethSender);
  }
  // check token chain
  if (token.chainId !== ETH_MAINNET.chainId) {
    return NEW_ERROR(
      "bridgeInGravity: token chain id does not match from network chain id"
    );
  }

  // gravity bridge is onlt used from ETH mainnet to canto, so convert the sender ethAddress to canto
  const { data: cantoReceiver, error: ethToCantoError } =
    await ethToCantoAddress(ethSender);
  if (ethToCantoError) {
    return NEW_ERROR("bridgeInGravity::" + errMsg(ethToCantoError));
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
    // get canto balance to see if enough canto for generating public key
    const { data: cantoBalance, error: balanceError } = await getCantoBalance(
      CANTO_MAINNET_COSMOS.chainId,
      cantoReceiver
    );
    if (balanceError) {
      return NEW_ERROR("bridgeInGravity::" + errMsg(balanceError));
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
          cantoAddress: cantoReceiver,
          hexAddress: ethSender,
        }),
      });
      if (botError) {
        return NEW_ERROR("bridgeInGravity::" + errMsg(botError));
      }
    }

    // must add this to the transaction list to set the public key
    txList.push(
      _generatePubKeyTx(
        CANTO_MAINNET_EVM.chainId,
        cantoReceiver,
        TX_DESCRIPTIONS.GENERATE_PUBLIC_KEY()
      )
    );
  }

  // check if dealing with WETH, since we might need to wrap ETH
  if (isWETH(token.address)) {
    // get WETH balance first, since we might not need to wrap yet
    const { data: wethBalance, error: balanceError } = await getTokenBalance(
      token.chainId,
      token.address,
      ethSender
    );
    if (balanceError) {
      return NEW_ERROR("bridgeInGravity::" + errMsg(balanceError));
    }
    // check if we need to wrap ETH
    if (wethBalance.isLessThan(amount)) {
      // must wrap the right amount of ETH now
      const amountToWrap = new BigNumber(amount).minus(wethBalance).toString();
      txList.push(
        _wrapTx(
          token.chainId,
          token.address,
          amountToWrap,
          TX_DESCRIPTIONS.WRAP_ETH(formatBalance(amountToWrap, token.decimals))
        )
      );
    }
  }

  // check token allowance
  const { data: hasAllowance, error: allowanceError } =
    await checkTokenAllowance(
      token.chainId,
      token.address,
      ethSender,
      GRAVITY_BRIDGE_ETH_ADDRESS,
      amount
    );
  if (allowanceError) {
    return NEW_ERROR("bridgeInGravity::" + errMsg(allowanceError));
  }
  // if no allowance, must approve
  if (!hasAllowance) {
    txList.push(
      _approveTx(
        token.chainId,
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
      token.chainId,
      cantoReceiver,
      token.address,
      amount,
      TX_DESCRIPTIONS.BRIDGE(
        token.symbol,
        formatBalance(amount, token.decimals),
        ETH_MAINNET.name,
        CANTO_MAINNET_EVM.name,
        getBridgeMethodInfo(BridgingMethod.GRAVITY_BRIDGE).name
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
  description: TransactionDescription
): Transaction => ({
  bridge: {
    type: BridgingMethod.GRAVITY_BRIDGE,
    lastStatus: "NONE",
  },
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
  description: TransactionDescription
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
  description: TransactionDescription
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

/**
 * Will check to see if gbridge has completed the transaction
 */
export async function checkGbridgeTxStatus(
  chainId: number,
  txHash: string
): PromiseWithError<{ status: TransactionStatus; completedIn: number }> {
  try {
    // get tx and block number
    const [transaction, currentBlock] = await Promise.all([
      fetchTransaction({ chainId, hash: txHash as `0x${string}` }),
      fetchBlockNumber({ chainId }),
    ]);

    // make sure transaction has actually succeeded
    if (!transaction.blockNumber)
      throw new Error("checkGbridgeTxStatus: transaction not complete");

    // can make an immediate check if it has been 96 blocks
    if (currentBlock - transaction.blockNumber >= 96) {
      return NO_ERROR({
        status: "SUCCESS",
        completedIn: 0,
      });
    }
    // check gbridge queue to see if transaction is confirmed there quicker than 96 blocks
    // // get the current gbridge queue for the user
    const { data: gbridgeQueue, error: gbridgeQueueError } =
      await getGBridgeQueueForUser(transaction.from);

    if (gbridgeQueueError)
      throw new Error("checkGbridgeTxStatus::" + errMsg(gbridgeQueueError));

    for (const event of gbridgeQueue.transactions) {
      if (
        Number(event.block_height) === Number(transaction.blockNumber) &&
        event.sender.toLowerCase() === transaction.from.toLowerCase()
      ) {
        // grab data from event
        if (event.confirmed === true) {
          return NO_ERROR({ status: "SUCCESS", completedIn: 0 });
        } else {
          return NO_ERROR({
            status: "PENDING",
            completedIn: Number(event.seconds_until_confirmed),
          });
        }
      }
    }
    // we made it through the whole gbridge queue and didn't find the transaction
    // this means gbridge hasn't picked it up yet
    return NO_ERROR({ status: "PENDING", completedIn: 0 });
  } catch (err) {
    return NEW_ERROR("checkGbridgeTxStatus::" + errMsg(err));
  }
}
