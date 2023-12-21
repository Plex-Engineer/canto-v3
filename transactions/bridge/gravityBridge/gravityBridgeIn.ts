import {
  GRAVITY_BRIDGE_ETH_ADDRESS,
  WETH_MAINNET_ADDRESS,
} from "@/config/consts/addresses";
import { TX_PARAM_ERRORS } from "@/config/consts/errors";
import {
  ERC20Token,
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Validation,
} from "@/config/interfaces";
import { CANTO_MAINNET_EVM, ETH_MAINNET } from "@/config/networks";
import { generateCantoPublicKeyWithTx } from "@/transactions/cosmos/publicKey";
import {
  BridgeStatus,
  TX_DESCRIPTIONS,
  Transaction,
  TxCreatorFunctionReturn,
} from "@/transactions/interfaces";
import {
  areEqualAddresses,
  checkCantoPubKey,
  ethToCantoAddress,
  isValidEthAddress,
} from "@/utils/address";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import { getTokenBalance, isERC20Token } from "@/utils/tokens";
import BigNumber from "bignumber.js";
import { _sendToCosmosTx, _wrapTx } from "./txCreators";
import { displayAmount } from "@/utils/formatting";
import { createApprovalTxs } from "@/transactions/erc20";
import { BridgingMethod, getBridgeMethodInfo } from "..";
import { fetchBlockNumber, fetchTransaction } from "wagmi/actions";
import { getGBridgeQueueForUser } from "@/hooks/bridge/txHistory/gbridgeHistory";

type GravityBridgeInParams = {
  ethSender: string;
  token: ERC20Token;
  amount: string;
};

/**
 * @notice creates a list of transactions that need to be made for bridging into canto from gravity bridge
 * @dev only from Ethereum to Canto
 * @param {GravityBridgeInParams} txParams gbridge in parameters
 * @returns {PromiseWithError<TxCreatorFunctionReturn>} list of transactions to make or error
 */
export async function gravityBridgeInTx(
  txParams: GravityBridgeInParams
): PromiseWithError<TxCreatorFunctionReturn> {
  try {
    /** validate params */
    const validation = validateGravityBridgeInTxParams(txParams);
    if (validation.error) throw new Error(validation.reason);

    /** create transaction list */
    const txList: Transaction[] = [];

    /** convert sender address to canto address */
    const { data: cantoReceiver, error: ethToCantoError } =
      await ethToCantoAddress(txParams.ethSender);
    if (ethToCantoError) throw ethToCantoError;

    /** check if user has public key */
    const { data: hasPubKey, error: checkPubKeyError } = await checkCantoPubKey(
      cantoReceiver,
      CANTO_MAINNET_EVM.chainId
    );
    if (checkPubKeyError || !hasPubKey) {
      // error getting account or no public key available, so make a public key
      const { data: pubKeyTxs, error: pubKeyTxsError } =
        await generateCantoPublicKeyWithTx(
          CANTO_MAINNET_EVM.chainId,
          txParams.ethSender,
          cantoReceiver
        );
      if (pubKeyTxsError) throw pubKeyTxsError;
      txList.push(...pubKeyTxs);
    }

    /** check if WETH */
    if (areEqualAddresses(txParams.token.address, WETH_MAINNET_ADDRESS)) {
      // may need extra tx for wrapping eth to WETH
      const { data: wethBalance, error: wethBalanceError } =
        await getTokenBalance(
          txParams.token.chainId,
          txParams.token.address,
          txParams.ethSender
        );
      if (wethBalanceError) throw wethBalanceError;
      // check if user needs to wrap ETH
      if (wethBalance.isLessThan(txParams.amount)) {
        // user needs to wrap ETH
        const amountToWrap = new BigNumber(txParams.amount)
          .minus(wethBalance)
          .toString();
        // push tx
        txList.push(
          _wrapTx(
            txParams.token.chainId,
            txParams.ethSender,
            txParams.token.address,
            amountToWrap,
            TX_DESCRIPTIONS.WRAP_ETH(
              displayAmount(amountToWrap, txParams.token.decimals)
            )
          )
        );
      }
    }

    /** check token allowance */
    const { data: allowanceTxs, error: allowanceError } =
      await createApprovalTxs(
        txParams.token.chainId,
        txParams.ethSender,
        [{ address: txParams.token.address, symbol: txParams.token.symbol }],
        [txParams.amount],
        { address: GRAVITY_BRIDGE_ETH_ADDRESS, name: "Gravity Bridge" }
      );
    if (allowanceError) throw allowanceError;
    txList.push(...allowanceTxs);

    /** push sendToCosmos tx */
    txList.push(
      _sendToCosmosTx(
        txParams.token.chainId,
        txParams.ethSender,
        cantoReceiver,
        txParams.token.address,
        txParams.amount,
        TX_DESCRIPTIONS.BRIDGE(
          txParams.token.symbol,
          displayAmount(txParams.amount, txParams.token.decimals),
          ETH_MAINNET.name,
          CANTO_MAINNET_EVM.name,
          getBridgeMethodInfo(BridgingMethod.GRAVITY_BRIDGE).name
        )
      )
    );

    /** return tx list */
    return NO_ERROR({ transactions: txList });
  } catch (err) {
    return NEW_ERROR("gravityBridgeIn", err);
  }
}

export function validateGravityBridgeInTxParams(
  txParams: GravityBridgeInParams
): Validation {
  // check ethSender is valid
  if (!isValidEthAddress(txParams.ethSender)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("ethSender"),
    };
  }
  if (!isERC20Token(txParams.token)) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.PARAM_INVALID("token"),
    };
  }
  // make sure chain id of token is ETH_MAINNET
  if (txParams.token.chainId !== ETH_MAINNET.chainId) {
    return {
      error: true,
      reason: TX_PARAM_ERRORS.CHAIN_NOT_SUPPORTED(txParams.token.chainId),
    };
  }
  return validateWeiUserInputTokenAmount(
    txParams.amount,
    "1",
    txParams.token.balance ?? "0",
    txParams.token.symbol,
    txParams.token.decimals
  );
}

/**
 * Will check to see if gbridge has completed the transaction
 */
export async function checkGbridgeInTxStatus(
  txHash: string
): PromiseWithError<BridgeStatus> {
  try {
    // get tx and block number
    const [transaction, currentBlock] = await Promise.all([
      fetchTransaction({
        chainId: ETH_MAINNET.chainId,
        hash: txHash as `0x${string}`,
      }),
      fetchBlockNumber({ chainId: ETH_MAINNET.chainId }),
    ]);

    // make sure transaction has actually succeeded
    if (!transaction.blockNumber) throw new Error("transaction not complete");

    // can make an immediate check if it has been 96 blocks
    if (currentBlock - transaction.blockNumber >= 96) {
      return NO_ERROR({
        status: "SUCCESS",
        completedIn: undefined,
      });
    }
    // check gbridge queue to see if transaction is confirmed there quicker than 96 blocks
    // // get the current gbridge queue for the user
    const { data: gbridgeQueue, error: gbridgeQueueError } =
      await getGBridgeQueueForUser(transaction.from);

    if (gbridgeQueueError) throw gbridgeQueueError;

    for (const event of gbridgeQueue.transactions) {
      if (
        Number(event.block_height) === Number(transaction.blockNumber) &&
        areEqualAddresses(event.sender, transaction.from)
      ) {
        // grab data from event
        if (event.confirmed === true) {
          return NO_ERROR({ status: "SUCCESS", completedIn: undefined });
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
    return NO_ERROR({ status: "PENDING", completedIn: undefined });
  } catch (err) {
    return NEW_ERROR("checkGbridgeTxStatus" + err);
  }
}
