import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";

export async function importERC20Token(token: {
  chainId: number;
  address: string;
  symbol: string;
  decimals: number;
  icon: string;
}): PromiseWithError<boolean> {
  try {
    // switch to correct chain
    await window.ethereum?.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + token.chainId.toString(16) }],
    });
    // add token to wallet
    const successfullAdd = await window.ethereum?.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol.slice(0, 11),
          decimals: token.decimals,
          image: token.icon,
        },
      },
    });
    return NO_ERROR(successfullAdd);
  } catch (err) {
    return NEW_ERROR("importToken", err);
  }
}
