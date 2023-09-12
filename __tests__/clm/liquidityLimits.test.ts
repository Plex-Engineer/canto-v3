import { cTokenBorrowLimit } from "@/utils/clm/positions.utils";

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
        expected: "50000000", // 100 TOKEN
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
        //@ts-ignore
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
});
