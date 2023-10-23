import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { newContractInstance } from "../evm/helpers.utils";
import { ERC20_ABI } from "@/config/abis";
import { MAX_UINT256, getCantoCoreAddress } from "@/config/consts/addresses";
import BigNumber from "bignumber.js";

export async function getCirculatingNote(
  chainId: number,
  noteAddress: string
): PromiseWithError<string> {
  // get note contract
  const { data: noteContract, error: contractError } = newContractInstance<
    typeof ERC20_ABI
  >(chainId, noteAddress, ERC20_ABI);
  if (contractError)
    return NEW_ERROR("getCirculatingNote: " + errMsg(contractError));

  // circulating note will be equal to the max hex value minus balance of the accountant
  const accountantAddress = getCantoCoreAddress(chainId, "accountant");
  if (!accountantAddress)
    return NEW_ERROR("getCirculatingNote: accountant address not found");
  try {
    const accountantBalance = await noteContract.methods
      .balanceOf(accountantAddress)
      .call();
    const circulatingNote = new BigNumber(MAX_UINT256).minus(
      accountantBalance as number
    );
    return NO_ERROR(circulatingNote.toString());
  } catch (err) {
    return NEW_ERROR("getCirculatingNote: " + errMsg(err));
  }
}

export async function getCirculatingCNote(
  chainId: number,
  cNoteAddress: string
): PromiseWithError<string> {
  // get cNote contract
  const { data: cNoteContract, error } = newContractInstance<typeof ERC20_ABI>(
    chainId,
    cNoteAddress,
    ERC20_ABI
  );
  if (error) return NEW_ERROR("getCirculatingCNote: " + errMsg(error));
  // get total supply
  const circulatingCNote = await cNoteContract.methods.totalSupply().call();
  return NO_ERROR(circulatingCNote.toString());
}
