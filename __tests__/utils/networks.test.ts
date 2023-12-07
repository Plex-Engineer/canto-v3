import {
  getCosmosAPIEndpoint,
  getCosmosEIPChainObject,
  getNetworkInfoFromChainId,
  isCosmosNetwork,
  isEVMNetwork,
} from "@/utils/networks";
import * as NETWORKS from "@/config/networks";

describe("networks interface tests", () => {
  it("test EVM network objects", () => {
    const networks = [
      {
        network: NETWORKS.ETH_MAINNET,
        error: false,
      },
      {
        network: {},
        error: true,
      },
      {
        network: {
          ...NETWORKS.ETH_MAINNET,
          chainId: "1",
          name: "Wrong chainId type",
        },
        error: true,
      },
    ];
    networks.forEach((n) => {
      //@ts-ignore
      expect(!isEVMNetwork(n.network)).toBe(n.error);
    });
  });

  it("test Cosmos network objects", () => {
    const networks = [
      {
        network: NETWORKS.COSMOS_HUB,
        error: false,
      },
      {
        network: {},
        error: true,
      },
      {
        network: {
          ...NETWORKS.COSMOS_HUB,
          chainId: 1,
          name: "Wrong chainId type",
        },
        error: true,
      },
    ];
    networks.forEach((n) => {
      //@ts-ignore
      expect(!isCosmosNetwork(n.network)).toBe(n.error);
    });
  });
});

describe("network getters", () => {
  it("gets any supported network by the chainId", () => {
    const networks = [
      {
        chainId: 1,
        network: NETWORKS.ETH_MAINNET,
      },
      {
        chainId: "cosmoshub-4",
        network: NETWORKS.COSMOS_HUB,
      },
      {
        chainId: 7700,
        network: NETWORKS.CANTO_MAINNET_EVM,
      },
      {
        chainId: "canto_7700-1",
        network: NETWORKS.CANTO_MAINNET_COSMOS,
      },
      {
        chainId: "unknown",
        network: null,
      },
      {
        chainId: 0,
        network: null,
      },
    ];
    networks.forEach((n) => {
      expect(getNetworkInfoFromChainId(n.chainId).data).toStrictEqual(
        n.network
      );
    });
  });

  it("gets correct cosmos rest endpoint from chainId", () => {
    const networks = [
      {
        chainId: 1,
        endpoint: null,
      },
      {
        chainId: 7700,
        endpoint: NETWORKS.CANTO_MAINNET_COSMOS.restEndpoint,
      },
      {
        chainId: "canto_7700-1",
        endpoint: NETWORKS.CANTO_MAINNET_COSMOS.restEndpoint,
      },
      {
        chainId: "cosmoshub-4",
        endpoint: NETWORKS.COSMOS_HUB.restEndpoint,
      },
      {
        chainId: "unknown",
        endpoint: null,
      },
      {
        chainId: 0,
        endpoint: null,
      },
    ];
    networks.forEach((n) => {
      expect(getCosmosAPIEndpoint(n.chainId).data).toStrictEqual(n.endpoint);
    });
  });

  it("gets correct canto chain object for EIP712 signatures", () => {
    const networks = [
      {
        chainId: 1,
        chainObject: null,
      },
      {
        chainId: 7700,
        chainObject: {
          chainId: NETWORKS.CANTO_MAINNET_EVM.chainId,
          cosmosChainId: NETWORKS.CANTO_MAINNET_COSMOS.chainId,
        },
      },
      {
        chainId: 7701,
        chainObject: {
          chainId: NETWORKS.CANTO_TESTNET_EVM.chainId,
          cosmosChainId: NETWORKS.CANTO_TESTNET_COSMOS.chainId,
        },
      },
      {
        chainId: 999999,
        chainObject: {
          chainId: NETWORKS.GRAVITY_BRIGDE_EVM.chainId,
          cosmosChainId: NETWORKS.GRAVITY_BRIDGE.chainId,
        }
      },
      {
        chainId: "canto_7700-1",
        chainObject: null,
      },
      {
        chainId: "cosmoshub-4",
        chainObject: null,
      },
    ];
    networks.forEach((n) => {
      //@ts-ignore
      expect(getCosmosEIPChainObject(n.chainId).data).toStrictEqual(n.chainObject);
    });
  });
});
