import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { EVMNetwork } from "@/config/interfaces/networks";
import { isValidEthAddress } from "@/utils/address.utils";
import { BridgeToken } from "../../interfaces/tokens";
import { Transaction } from "@/config/interfaces/transactions";
import LZ_CHAIN_IDS from "@/config/jsons/layerZeroChainIds.json";
import { encodePacked } from "web3-utils";
import BigNumber from "bignumber.js";
import { Contract } from "web3";
import { OFT_ABI } from "@/config/abis";
import { getProviderWithoutSigner } from "@/utils/evm/helpers.utils";
import { getTokenBalance } from "@/utils/evm/erc20.utils";
import { ZERO_ADDRESS } from "@/config/consts/addresses";

// do not need an eth receiver, since it will always be the same as the sender
export async function bridgeLayerZero(
  fromNetwork: EVMNetwork,
  toNetwork: EVMNetwork,
  ethSender: string,
  token: BridgeToken,
  amount: string
): PromiseWithError<Transaction[]> {
  // check all params
  if (!isValidEthAddress(ethSender)) {
    return NEW_ERROR("bridgeLayerZero: invalid eth address: " + ethSender);
  }
  const toLZChainId = LZ_CHAIN_IDS[toNetwork.id as keyof typeof LZ_CHAIN_IDS];
  if (!toLZChainId) {
    return NEW_ERROR("bridgeLayerZero: invalid lz chainId: " + toNetwork.id);
  }
  const toAddressBytes = encodePacked({ type: "bytes32", value: ethSender });
  const { data: gas, error: oftError } = await estimateOFTSendGasFee(
    fromNetwork.rpcUrl,
    toLZChainId,
    token.address,
    ethSender,
    amount,
    [1, 200000]
  );
  if (oftError) {
    return NEW_ERROR("bridgeLayerZero::" + oftError.message);
  }
  // all params are checked, so create tx list
  const txList: Transaction[] = [];

  // check if this is native/proxy OFT for deposit functionality
  // TODO: only works for Canto OFT
  if (fromNetwork.id.split("-")[0] === "canto") {
    const { data: oftBalance, error: balanceError } = await getTokenBalance(
      fromNetwork.chainId,
      token.address,
      ethSender
    );
    if (balanceError) {
      return NEW_ERROR("bridgeLayerZero::" + balanceError.message);
    }
    // if OFT balance is less than the amount, user must deposit
    if (oftBalance.lt(amount)) {
      txList.push(
        _oftDepositOrWithdrawTx(
          fromNetwork.chainId,
          true,
          token.address,
          new BigNumber(amount).minus(oftBalance).toString(),
          `Deposit ${amount} ${token.symbol} to OFT`
        )
      );
    }
  }
  // will need to call transfer from after depositing
  txList.push(
    _oftTransferTx(
      fromNetwork.chainId,
      toLZChainId,
      ethSender,
      toAddressBytes,
      token.address,
      amount,
      gas.toString(),
      `Bridge ${amount} ${token.symbol} from ${fromNetwork.name} to ${toNetwork.name}`
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
  description: string
): Transaction => ({
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
    [ethAddress, ZERO_ADDRESS, []],
  ],
  value: gas,
});

const _oftDepositOrWithdrawTx = (
  chainId: number,
  deposit: boolean,
  oftAddress: string,
  amount: string,
  description: string
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

export async function estimateOFTSendGasFee(
  fromRpc: string,
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
  const oftContract = new Contract(
    OFT_ABI,
    oftAddress,
    getProviderWithoutSigner(fromRpc)
  );
  const toAddressBytes = encodePacked({ type: "bytes32", value: account });
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
  } catch (error) {
    return NEW_ERROR("estimateOFTSendGasFee::" + (error as Error).message);
  }
}
