import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "../networks";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const GRAVITY_BRIDGE_ETH_ADDRESS =
  "0xa4108aA1Ec4967F8b52220a4f7e94A8201F2D906";
export const WETH_MAINNET_ADDRESS =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
export const PUB_KEY_BOT_ADDRESS =
  "canto1efrhdukv096tmjs7r80m8pqkr3udp9g0uadjfv";

// Canto Core Addresses
const COMPTROLLER_ADDRESS = {
  mainnet: "0x5E23dC409Fc2F832f83CEc191E245A191a4bCc5C",
  testnet: "0x9514c07bC6e80B652e4264E64f589C59065C231f",
};
const CLM_LENS_ADDRESS = {
  mainnet: "0x03957b7D741F0788163e8E382B1Bd7944BcDd560",
  testnet: "0x33c2E2FA0588789119EbDF892eB1e2aDdDcbc8c4",
};
const C_NOTE_ADDRESS = {
  mainnet: "0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C",
  testnet: "0x04E52476d318CdF739C38BD41A922787D441900c",
};
const WCANTO_ADDRESS = {
  mainnet: "0x826551890Dc65655a0Aceca109aB11AbDbD7a07B",
  testnet: "0x04a72466De69109889Db059Cb1A4460Ca0648d9D",
};
const ROUTER_ADDRESS = {
  mainnet: "0xa252eEE9BDe830Ca4793F054B506587027825a8e",
  testnet: "0x463e7d4DF8fE5fb42D024cb57c77b76e6e74417a",
};

type ContractName = "comptroller" | "clmLens" | "cNote" | "router" | "wcanto";
type ChainType = "mainnet" | "testnet";
export function getCLMAddress(
  chainId: number,
  contractName: ContractName
): string | null {
  // make sure on canto chain id
  let chainType: ChainType;
  if (chainId === CANTO_MAINNET_EVM.chainId) chainType = "mainnet";
  else if (chainId === CANTO_TESTNET_EVM.chainId) chainType = "testnet";
  else return null;
  // get address based on contract name
  switch (contractName) {
    case "comptroller":
      return COMPTROLLER_ADDRESS[chainType];
    case "clmLens":
      return CLM_LENS_ADDRESS[chainType];
    case "cNote":
      return C_NOTE_ADDRESS[chainType];
    case "router":
      return ROUTER_ADDRESS[chainType];
    case "wcanto":
      return WCANTO_ADDRESS[chainType];
    default:
      return null;
  }
}
