import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import {
  getProviderWithoutSigner,
  getRpcUrlFromChainId,
} from "../evm/helpers.utils";
import { ERC20_ABI } from "@/config/abis";
import { Contract } from "web3";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import BigNumber from "bignumber.js";

export async function getCirculatingNote(
  chainId: number,
  noteAddress: string
): PromiseWithError<string> {
  // get rpc
  const { data: rpcUrl, error } = getRpcUrlFromChainId(chainId);
  if (error) return NEW_ERROR("getCirculatingNote" + errMsg(error));

  // get contract
  const noteContract = new Contract(
    ERC20_ABI,
    noteAddress,
    getProviderWithoutSigner(rpcUrl)
  );

  // circulating note will be equal to the max hex value minus balance of the accountant
  const accountantAddress = getCantoCoreAddress(chainId, "accountant");
  if (!accountantAddress)
    return NEW_ERROR("getCirculatingNote: accountant address not found");
  try {
    const accountantBalance = await noteContract.methods
      .balanceOf(accountantAddress)
      .call();
    const circulatingNote = new BigNumber(
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    ).minus(accountantBalance as number);
    return NO_ERROR(circulatingNote.toString());
  } catch (err) {
    return NEW_ERROR("getCirculatingNote: " + errMsg(err));
  }
}
