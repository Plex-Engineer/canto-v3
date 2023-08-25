import {
  isBridgeInToken,
  isBridgeOutToken,
} from "@/utils/tokens/bridgeTokens.utils";
import { isERC20Token, isIBCToken } from "@/utils/tokens/tokens.utils";

describe("token interface tests", () => {
  it("test ERC20 objects", () => {
    const tokens = [
      {
        token: {
          id: "0x000000",
          chainId: 1,
          address: "0x000000",
          name: "Test Token",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
        },
        error: false,
      },
      {
        token: {},
        error: true,
      },
      {
        token: {
          chainId: 1,
          address: "0x000000",
          name: "Test Token With no id",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
        },
        error: true,
      },
    ];
    tokens.forEach((t) => {
      expect(!isERC20Token(t.token)).toBe(t.error);
    });
  });

  it("test IBC token objects", () => {
    const tokens = [
      {
        token: {
          id: "0x000000",
          chainId: 1,
          name: "Test Token",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
          ibcDenom: "ibc/0000",
          nativeName: "native0000",
        },
        error: false,
      },
      {
        token: {},
        error: true,
      },
      {
        token: {
          id: "0x000000",
          chainId: 1,
          name: "Test Token With missing IBC Native Name",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
          ibcDenom: "ibc/0000",
        },
        error: true,
      },
    ];
    tokens.forEach((t) => {
      expect(!isIBCToken(t.token)).toBe(t.error);
    });
  });

  describe("test Bridge In Token Objects", () => {
    const tokens = [
      {
        token: {
          id: "0x000000",
          chainId: 1,
          address: "0x000000",
          name: "Test Token",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
          bridgeMethods: ["1"],
        },
        error: false,
      },
      {
        token: {},
        error: true,
      },
      {
        token: {
          id: "0x000000",
          chainId: 1,
          address: "0x000000",
          name: "Test Token With wrong bridge method property",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
          bridgeMethods: [
            {
              chainId: 1,
              methods: ["1"],
            },
          ],
        },
        error: true,
      },
    ];
    tokens.forEach((t) => {
      expect(!isBridgeInToken(t.token)).toBe(t.error);
    });
  });

  describe("test Bridge Out Token Objects", () => {
    const tokens = [
      {
        token: {
          id: "0x000000",
          chainId: 1,
          address: "0x000000",
          name: "Test Token With wrong bridge method property",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
          bridgeMethods: ["1"],
        },
        error: true,
      },
      {
        token: {},
        error: true,
      },
      {
        token: {
          id: "0x000000",
          chainId: 1,
          address: "0x000000",
          name: "Test Token With correct bridge method property",
          symbol: "TT",
          decimals: 18,
          icon: "https://test.com/icon.png",
          bridgeMethods: [
            {
              chainId: 1,
              methods: ["1"],
            },
          ],
        },
        error: false,
      },
    ];
    tokens.forEach((t) => {
      expect(!isBridgeOutToken(t.token)).toBe(t.error);
    });
  });
});
