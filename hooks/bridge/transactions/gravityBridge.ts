import { GRAVITY_BRIDGE_ABI, WETH_ABI } from "@/config/abis";
import {
  GRAVITY_BRIDGE_ETH_ADDRESS,
  WETH_MAINNET_ADDRESS,
} from "@/config/consts/addresses";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { ERC20Token } from "@/config/interfaces/tokens";
import { Transaction } from "@/config/interfaces/transactions";
import { CANTO_MAINNET } from "@/config/networks";
import {
  checkPubKey,
  ethToCantoAddress,
  isValidEthAddress,
} from "@/utils/address.utils";
import {
  _approveTx,
  checkTokenAllowance,
  getTokenBalance,
} from "@/utils/evm/erc20.utils";

export async function bridgeInGravity(
  chainId: number,
  ethSender: string,
  token: ERC20Token,
  amount: string
): PromiseWithError<Transaction[]> {
  if (!isValidEthAddress(ethSender)) {
    return NEW_ERROR("bridgeInGravity: invalid eth address: " + ethSender);
  }
  const { data: cantoReceiverAddress, error: ethToCantoError } =
    await ethToCantoAddress(ethSender);
  if (ethToCantoError) {
    return NEW_ERROR(
      "bridgeInGravity::" + ethToCantoError.message
    );
  }
  // parameters look good, so create the tx list
  const txList: Transaction[] = [];

  // check if the user has a public key
  // check on Canto Mainnet
  const { data: hasPubKey, error: checkPubKeyError } = await checkPubKey(
    ethSender,
    CANTO_MAINNET.chainId as number
  );
  if (checkPubKeyError) {
    return NEW_ERROR(
      "bridgeInGravity::" + checkPubKeyError.message
    );
  }
  if (!hasPubKey) {
    // must add this to the transaction list to set the public key
    throw new Error("TODO: GENERATEPUBKEY");
    // const { data: pubKeyTx, error: pubKeyError } = await _generatePubKey(
    //   CANTO_MAINNET.chainId as number,
    //   ethSender
    // );
    // if (pubKeyError) {
    //   return NEW_ERROR(
    //     "bridgeInGravity::_generatePubKey: " + pubKeyError.message
    //   );
    // }
    // txList.push(...pubKeyTx);
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
      return NEW_ERROR(
        "bridgeInGravity::" + balanceError.message
      );
    }
    // check if we need to wrap ETH
    if (wethBalance.isLessThan(amount)) {
      // must wrap the right amount of ETH now
      txList.push(
        _wrapTx(chainId, token.address, amount, `Wrap ${amount} ETH to WETH`)
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
        `Approve ${token.symbol} for Gravity Bridge`
      )
    );
  }

  // send to cosmos
  txList.push(
    _sendToCosmosTx(
      chainId,
      cantoReceiverAddress,
      token.address,
      amount,
      `Bridge ${amount} ${token.symbol} to Canto`
    )
  );

  return NO_ERROR(txList);
}

/**
 * @dev Function assumes we are on ETH mainnet
 * @param tokenAddress address to check if it is WETH
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
