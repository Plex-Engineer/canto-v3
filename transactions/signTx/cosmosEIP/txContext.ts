import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { Chain, Sender } from "@/transactions/interfaces";
import { ethToCantoAddress } from "@/utils/address";
import { getCantoSenderObj } from "@/utils/cosmos";
import { getCosmosChainObject } from "@/utils/networks";

type Context = {
  chainObj: Chain;
  senderObj: Sender;
};
export async function generateCantoEIP712TxContext(
  chainId: number,
  ethAddress: string
): PromiseWithError<Context> {
  try {
    /** convert eth address to address on cosmos chain */
    const { data: cantoAddress, error: ethToCantoError } =
      await ethToCantoAddress(ethAddress);
    if (ethToCantoError) throw ethToCantoError;

    /** chain object */
    const { data: chainObj, error: chainObjError } =
      getCosmosChainObject(chainId);
    if (chainObjError) throw chainObjError;

    /** sender object */
    const { data: senderObj, error: senderObjError } = await getCantoSenderObj(
      cantoAddress,
      chainId
    );
    if (senderObjError) throw senderObjError;

    /** return context */
    return NO_ERROR({
      chainObj,
      senderObj,
    });
  } catch (err) {
    return NEW_ERROR("generateCosmosEIP712TxContexterror", err);
  }
}
