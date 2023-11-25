import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { newContractInstance } from "../evm";
import { ERC20_ABI } from "@/config/abis";
import { MAX_UINT256, getCantoCoreAddress } from "@/config/consts/addresses";
import BigNumber from "bignumber.js";

export async function getCirculatingNote(
  chainId: number,
  noteAddress: string
): PromiseWithError<string> {
  try {
    // get note contract
    const { data: noteContract, error: contractError } = newContractInstance<
      typeof ERC20_ABI
    >(chainId, noteAddress, ERC20_ABI);
    if (contractError) throw contractError;

    // circulating note will be equal to the max hex value minus balance of the accountant
    const accountantAddress = getCantoCoreAddress(chainId, "accountant");
    if (!accountantAddress) throw Error("accountant address not found");

    const accountantBalance = await noteContract.methods
      .balanceOf(accountantAddress)
      .call();
    const circulatingNote = new BigNumber(MAX_UINT256).minus(
      accountantBalance as number
    );
    return NO_ERROR(circulatingNote.toString());
  } catch (err) {
    return NEW_ERROR("getCirculatingNote", err);
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
  if (error) return NEW_ERROR("getCirculatingCNote", error);
  // get total supply
  const totalSupply = await cNoteContract.methods.totalSupply().call();

  // must subtract the cNote the accountant has
  const accountantAddress = getCantoCoreAddress(chainId, "accountant");
  if (!accountantAddress) throw Error("accountant address not found");

  const accountantBalance = await cNoteContract.methods
    .balanceOf(accountantAddress)
    .call();

  const circulatingCNote = new BigNumber(totalSupply as number).minus(
    accountantBalance as number
  );
  return NO_ERROR(circulatingCNote.toString());
}
