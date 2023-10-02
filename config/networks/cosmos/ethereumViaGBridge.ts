import { GRAVITY_BRIDGE } from "./gravitybridge";
import { CosmosNetwork } from "../../interfaces";
import { ETH_MAINNET } from "..";

export const ETHEREUM_VIA_GRAVITY_BRIDGE: CosmosNetwork = {
    ...GRAVITY_BRIDGE,
    id: "ethereum-via-gravity-bridge",
    name: "Ethereum via Gravity Bridge",
    icon: ETH_MAINNET.icon,
    altName: "Ethereum",
}