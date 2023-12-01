import { OFT_ABI } from "@/config/abis";
import {
  NEW_ERROR,
  NO_ERROR,
  OFTToken,
  PromiseWithError,
} from "@/config/interfaces";
import { newContractInstance } from "@/utils/evm";
import BigNumber from "bignumber.js";
import { encodePacked } from "web3-utils";
import Web3 from "web3";
import LZ_CHAIN_IDS from "@/config/jsons/layerZeroChainIds.json";
import { ZERO_ADDRESS } from "@/config/consts/addresses";

/**
 * @notice estimates the gas fee for sending OFT (general)
 * @param {OFTToken} token OFT token
 * @param {string} receivingChainId chain id of the network to send to
 * @returns {PromiseWithError<BigNumber>} gas fee for sending OFT or error
 */
export async function estimateOFTGasFeeFromTokenAndReceivingChainId(
  token: OFTToken | null,
  receivingChainId?: string
): PromiseWithError<BigNumber> {
  if (!token || !receivingChainId)
    return NEW_ERROR(
      "estimateOFTGasFeeFromTokenAndReceivingChainId: invalid token or receiving chain id"
    );
  const toLZChainId =
    LZ_CHAIN_IDS[receivingChainId as keyof typeof LZ_CHAIN_IDS];
  if (!toLZChainId)
    return NEW_ERROR(
      "estimateOFTGasFeeFromTokenAndReceivingChainId: invalid receiving chain id"
    );
  return await estimateOFTSendGasFee(
    token.chainId,
    toLZChainId,
    token.address,
    ZERO_ADDRESS,
    new BigNumber(1).multipliedBy(10 ** token.decimals).toString(),
    [1, 200000]
  );
}

/**
 * @notice estimates the gas fee for sending OFT
 * @dev gas is paid for on both chains by the sender (in sending gas token)
 * @param {string} fromEVMChainId EVM chain id of the network to send from
 * @param {number} toLZChainId LZ chain id of the network to send to
 * @param {string} oftAddress address of the OFT token
 * @param {string} account address of the account to send to
 * @param {string} amount amount to send
 * @param {number[]} adapterParams adapter params for OFT
 * @returns {PromiseWithError<BigNumber>} gas fee for sending OFT or error
 */
export async function estimateOFTSendGasFee(
  fromEVMChainId: number,
  toLZChainId: number,
  oftAddress: string,
  account: string,
  amount: string,
  adapterParams: number[]
): PromiseWithError<BigNumber> {
  try {
    const formattedAdapterParams = encodePacked(
      { type: "uint16", value: adapterParams[0] },
      { type: "uint256", value: adapterParams[1] }
    );
    // get contract instance
    const { data: oftContract, error: oftError } = newContractInstance<
      typeof OFT_ABI
    >(fromEVMChainId, oftAddress, OFT_ABI);
    if (oftError) throw oftError;

    const toAddressBytes = new Web3().eth.abi.encodeParameter(
      "address",
      account
    );
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
    return NEW_ERROR("estimateOFTSendGasFee" + err);
  }
}

export async function checkUseAdapterParams(
  chainId: number,
  oftAddress: string
): PromiseWithError<boolean> {
  try {
    // get contract instance
    const { data: oftContract, error } = newContractInstance<typeof OFT_ABI>(
      chainId,
      oftAddress,
      OFT_ABI
    );
    if (error) throw error;

    const adapterParams = await oftContract.methods
      .useCustomAdapterParams()
      .call();
    return NO_ERROR(adapterParams);
  } catch (err) {
    return NEW_ERROR("checkUseAdapterParams" + err);
  }
}
