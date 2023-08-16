import { Transaction } from "@/config/interfaces/transactions";
import { createMsgsConvertCoin } from "@/utils/cosmos/transactions/messages/convertCoin";
import { createMsgsConvertERC20 } from "@/utils/cosmos/transactions/messages/convertERC20";

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
export const _convertERC20Tx = (
  chainId: number,
  tokenAddress: string,
  amount: string,
  ethSender: string,
  cantoReceiver: string
): Transaction => {
  const convertERC20Tx = createMsgsConvertERC20({
    contract_address: tokenAddress,
    amount,
    cantoReceiver: cantoReceiver,
    ethSender: ethSender,
  });
  return {
    chainId,
    description: "Convert ERC20",
    type: "COSMOS",
    msg: convertERC20Tx,
  };
};

const _convertCoinTx = (
  chainId: number,
  cantoSender: string,
  ethReceiver: string,
  tokenDenom: string,
  amount: string
): Transaction => {
  const convertCoinTx = createMsgsConvertCoin({
    cantoSender,
    ethReceiver,
    amount,
    denom: tokenDenom,
  });
  return {
    chainId,
    description: "Convert Coin",
    type: "COSMOS",
    msg: convertCoinTx,
  };
};
