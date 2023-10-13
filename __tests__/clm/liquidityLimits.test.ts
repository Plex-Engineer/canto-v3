//@ts-nocheck
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import {
  cTokenBorrowLimit,
  cTokenWithdrawLimit,
  maxAmountForLendingTx,
} from "@/utils/clm/limits.utils";

describe("liquidity limits tests", () => {
  it("calculate max borrow limit in underlying", async () => {
    const params = [
      {
        cToken: { price: "1000000000000000000" }, // 1:1
        currentLiquidity: "1000000000000000000", // 1 NOTE
        percent: 100,
        expected: "1000000000000000000", // 1 TOKEN
        error: false,
      },
      {
        cToken: { price: "1000000000000000000" }, // 1:1
        currentLiquidity: "0",
        percent: 100,
        expected: "0",
        error: false,
      },
      {
        cToken: { price: "1000000000000000000" }, // 1:1
        currentLiquidity: "0",
        percent: 5,
        expected: "0",
        error: false,
      },
      {
        cToken: { price: "1000000000000000000000000000000" }, // 1:1 but 6 decimal token
        currentLiquidity: "100000000000000000000", // 100 NOTE
        percent: 100,
        expected: "100000000", // 100 TOKEN
        error: false,
      },
      {
        cToken: { price: "2000000000000000000000000000000" }, // 2:1 but 6 decimal token
        currentLiquidity: "100000000000000000000", // 100 NOTE
        percent: 100,
        expected: "50000000", // 50 TOKEN
        error: false,
      },
      {
        cToken: { price: "1000000000000000000000000000000" }, // 1:1 but 6 decimal token
        currentLiquidity: "100000000000000000000", // 100 NOTE
        percent: 50, // only 50 percent
        expected: "50000000", // 50 TOKEN
        error: false,
      },
      {
        cToken: { price: "1000000000000000000000000000000" }, // 1:1 but 6 decimal token
        currentLiquidity: "100000000000000000000", // 100 NOTE
        percent: 80, // only 80 percent
        expected: "80000000", // 80 TOKEN
        error: false,
      },
      {
        cToken: { price: "1000000000000000000000000000000" },
        currentLiquidity: "not a number",
        percent: 100,
        expected: "100000000",
        error: true,
      },
      {
        cToken: { price: "0" },
        currentLiquidity: "100000000000000000000",
        percent: 100,
        expected: "100000000",
        error: true,
      },
    ];
    params.forEach((p) => {
      const { data: maxBorrow, error: maxBorrowError } = cTokenBorrowLimit(
        p.cToken,
        p.currentLiquidity,
        p.percent
      );
      if (p.error) {
        expect(maxBorrowError).not.toBeNull();
        expect(maxBorrow).toBeNull();
      } else {
        expect(maxBorrowError).toBeNull();
        expect(maxBorrow?.toString()).toBe(p.expected);
      }
    });
  });

  it("calculate max withdraw limit in underlying", async () => {
    const params = [
      {
        description: "not collateral, 100% withdraw",
        cToken: {
          userDetails: {
            isCollateral: false,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "800000000000000000",
          price: "1000000000000000000",
        },
        currentLiquidity: "0", // shouldn't matter
        percent: 100,
        expected: "1000000000000000000", // supply balance
        error: false,
      },
      {
        description:
          "not collateral, 100% withdraw, with different percent and price (shouldn't matter)",
        cToken: {
          userDetails: {
            isCollateral: false,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "800000000000000000",
          price: "1",
        },
        currentLiquidity: "0", // shouldn't matter
        percent: 2,
        expected: "1000000000000000000", // supply balance
        error: false,
      },
      {
        description: "no collateral factor, 100% withdraw",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "0",
          price: "1",
        },
        currentLiquidity: "0", // shouldn't matter
        percent: 2,
        expected: "1000000000000000000", // supply balance
        error: false,
      },
      {
        description:
          "all liquidity comes from token, no borrows, 100% withdraw, price 1:1",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "500000000000000000",
          price: "1000000000000000000",
        },
        currentLiquidity: "500000000000000000", // should be half of the supply balance
        percent: 100,
        expected: "1000000000000000000", // supply balance
        error: false,
      },
      {
        description:
          "all liquidity comes from token, no borrows, 80% withdraw, price 1:1",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "500000000000000000",
          price: "1000000000000000000",
        },
        currentLiquidity: "500000000000000000", // should be half of the supply balance
        percent: 80,
        expected: "800000000000000000",
        error: false,
      },
      {
        description: "no liquidity left, price 1:1, no withdraw allowed",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "500000000000000000",
          price: "1000000000000000000",
        },
        currentLiquidity: "0",
        percent: 100,
        expected: "0",
        error: false,
      },
      {
        description: "some liquidity left, price 1:1",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "500000000000000000",
          price: "1000000000000000000",
        },
        currentLiquidity: "250000000000000000",
        percent: 100,
        expected: "500000000000000000",
        error: false,
      },
      {
        description:
          "all liquidity comes from token, no borrows, 100% withdraw, price 2:1, token has 6 decimals",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000",
          },
          collateralFactor: "500000000000000000",
          price: "1000000000000000000000000000000",
        },
        currentLiquidity: "500000000000000000",
        percent: 100,
        expected: "1000000", // supply balance
        error: false,
      },
      {
        description: "price error",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000",
          },
          collateralFactor: "500000000000000000",
          price: "0",
        },
        currentLiquidity: "500000000000000000",
        percent: 100,
        expected: "1000000", // supply balance
        error: true,
      },
      {
        description: "no user details",
        cToken: {
          collateralFactor: "500000000000000000",
          price: "1000000000000000000",
        },
        currentLiquidity: "500000000000000000",
        percent: 100,
        expected: "1000000", // supply balance
        error: true,
      },
    ];
    params.forEach((p) => {
      const { data: maxWithdraw, error: maxWithdrawError } =
        cTokenWithdrawLimit(p.cToken, p.currentLiquidity, p.percent);
      if (p.error) {
        expect(maxWithdrawError).not.toBeNull();
        expect(maxWithdraw).toBeNull();
      } else {
        expect(maxWithdrawError).toBeNull();
        expect(maxWithdraw?.toString()).toBe(p.expected);
      }
    });
  });
  // maximum calculations
  it("calculate max amount for lending supply transaction", () => {
    // all should just return user balance of underlying
    const params = [
      {
        description: "no user details, return 0",
        cToken: {},
        position: {},
        expected: "0",
      },
      {
        cToken: {
          userDetails: {
            balanceOfUnderlying: "1000000000000000000",
          },
        },
        position: {}, // position shouldn't matter
        expected: "1000000000000000000",
      },
      {
        cToken: {
          userDetails: {
            balanceOfUnderlying: "6767676767",
          },
        },
        position: {}, // position shouldn't matter
        expected: "6767676767",
      },
    ];
    params.forEach((p) => {
      expect(
        maxAmountForLendingTx(CTokenLendingTxTypes.SUPPLY, p.cToken, p.position)
      ).toBe(p.expected);
    });
  });
  it("calculate max amount for lending repay transaction", () => {
    // all should just return minimum of borrow balance and user balance of underlying
    const params = [
      {
        description: "no user details, return 0",
        cToken: {},
        position: {},
        expected: "0",
      },
      {
        cToken: {
          userDetails: {
            balanceOfUnderlying: "1000000000000000000",
            borrowBalance: "0",
          },
        },
        position: {}, // position shouldn't matter
        expected: "0",
      },
      {
        cToken: {
          userDetails: {
            balanceOfUnderlying: "1000000000000000000",
            borrowBalance: "10000",
          },
        },
        position: {}, // position shouldn't matter
        expected: "10000",
      },
      {
        cToken: {
          userDetails: {
            balanceOfUnderlying: "6767676767",
            borrowBalance: "1000000000000000000",
          },
        },
        position: {}, // position shouldn't matter
        expected: "6767676767",
      },
    ];
    params.forEach((p) => {
      expect(
        maxAmountForLendingTx(CTokenLendingTxTypes.REPAY, p.cToken, p.position)
      ).toBe(p.expected);
    });
  });
  it("calculate max amount for lending borrow transaction", () => {
    // all should just return borrow limit
    const params = [
      {
        description: "no user details, return 0",
        cToken: {},
        position: {},
        expected: "0",
      },
      {
        cToken: {
          price: "1000000000000000000",
          userDetails: {}, // shouldn't matter
        },
        position: { liquidity: "1000000000000000000" },
        expected: "1000000000000000000",
      },
      {
        cToken: {
          price: "1000000000000000000",
          userDetails: {}, // shouldn't matter
        },
        position: { liquidity: "0" },
        expected: "0",
      },
      {
        cToken: {
          price: "1000000000000000000000000000000",
          userDetails: {}, // shouldn't matter
        },
        position: { liquidity: "100000000000000000000" },
        expected: "100000000",
      },
      {
        cToken: {
          price: "2000000000000000000000000000000",
          userDetails: {}, // shouldn't matter
        },
        position: { liquidity: "100000000000000000000" },
        expected: "50000000",
      },
      {
        cToken: {
          price: "0",
          userDetails: {}, // shouldn't matter
        },
        position: { liquidity: "100000000000000000000" },
        expected: "0",
      },
    ];
    params.forEach((p) => {
      expect(
        maxAmountForLendingTx(CTokenLendingTxTypes.BORROW, p.cToken, p.position)
      ).toBe(p.expected);
    });
  });
  it("calculate max amount for lending withdraw transaction", () => {
    // all should just return withdraw limit
    const params = [
      {
        description: "no user details, return 0",
        cToken: {},
        position: {},
        expected: "0",
      },
      {
        description: "not collateral, 100% withdraw",
        cToken: {
          userDetails: {
            isCollateral: false,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "800000000000000000",
          price: "1000000000000000000",
        },
        position: {
          liquidity: "0",
        },
        expected: "1000000000000000000", // supply balance
      },
      {
        description:
          "not collateral, 100% withdraw, with different price (shouldn't matter)",
        cToken: {
          userDetails: {
            isCollateral: false,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "800000000000000000",
          price: "1",
        },
        position: {
          liquidity: "0",
        },
        expected: "1000000000000000000", // supply balance
      },
      {
        description: "no collateral factor, 100% withdraw",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "0",
          price: "1",
        },
        position: {
          liquidity: "0",
        },
        expected: "1000000000000000000", // supply balance
      },
      {
        description: "more liquidity than supply balance",
        cToken: {
          userDetails: {
            isCollateral: true,
            supplyBalanceInUnderlying: "1000000000000000000",
          },
          collateralFactor: "600000000000000000",
          price: "1000000000000000000",
        },
        position: {
          liquidity: "50000000000000000000000000000", // exceeds supply balance
        },
        expected: "1000000000000000000", // supply balance
      },
    ];
    params.forEach((p) => {
      expect(
        maxAmountForLendingTx(
          CTokenLendingTxTypes.WITHDRAW,
          p.cToken,
          p.position
        )
      ).toBe(p.expected);
    });
  });
});
