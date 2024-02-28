import { OFT_ABI } from "@/config/abis";
import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { newContractInstance } from "@/utils/evm";
import BigNumber from "bignumber.js";
import { encodePacked } from "web3-utils";
import Web3 from "web3";

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
  adapterParams: string // encoded bytes string
): PromiseWithError<BigNumber> {
  try {
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
        adapterParams
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

export function createLzAdapterParams(
  ethAddress: string,
  toCanto: boolean
): string {
  if (toCanto) {
    // airdrop native canto to user
    return encodePacked(
      {
        value: 2, // version
        type: "uint16",
      },
      {
        value: 200000, // gas amount
        type: "uint",
      },
      {
        value: "1000000000000000000", // native for dst chain (1 CANTO)
        type: "uint",
      },
      {
        value: ethAddress, // address for dst chain
        type: "address",
      }
    );
  }
  // return default adapter params
  return encodePacked(
    {
      value: 1, // version
      type: "uint16",
    },
    {
      value: 200000, // gas amount
      type: "uint",
    }
  );
}
