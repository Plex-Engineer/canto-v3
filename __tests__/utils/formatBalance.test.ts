import { formatBalance } from "@/utils/formatting";

describe("formatBalance tests", () => {
  it("should format balance with no options", () => {
    const params = [
      {
        amount: "1000000000000000000",
        decimals: 18,
        expected: "1",
      },
      {
        amount: "1000000000000000001",
        decimals: 18,
        expected: "1.00",
      },
      {
        amount: "1010000000000000001",
        decimals: 18,
        expected: "1.01",
      },
      {
        amount: "10200000000000000000",
        decimals: 18,
        expected: "10.2",
      },
      {
        amount: "563123456789123456789",
        decimals: 18,
        expected: "563",
      },
      {
        amount: "5631234567891234567890",
        decimals: 18,
        expected: "5631",
      },
      {
        amount: "1",
        decimals: 18,
        expected: "0.000000000000000001",
      },
      {
        amount: "123456",
        decimals: 6,
        expected: "0.123",
      },
      {
        amount: "888888",
        decimals: 6,
        expected: "0.888",
      },
      {
        amount: "45",
        decimals: 6,
        expected: "0.000045",
      },
      {
        amount: "-1",
        decimals: 6,
        expected: "0",
      },
      {
        amount: "10000000000",
        decimals: 0,
        expected: "10000000000",
      },
      {
        amount: "-10000000000",
        decimals: 0,
        expected: "0",
      },
      {
        amount: "0.001",
        decimals: -3,
        expected: "1",
      },
      {
        amount: "0.001",
        decimals: -2,
        expected: "0.1",
      },
      {
        amount: "0.00000000000099",
        decimals: -12,
        expected: "0.99",
      },
    ];
    params.forEach((p) => {
      expect(formatBalance(p.amount, p.decimals, { short: false })).toBe(
        p.expected
      );
    });
  });
  it("should format balance with options", () => {
    const params = [
      {
        amount: "1000000000000000000",
        decimals: 18,
        options: {
          symbol: "TOKEN",
          precision: 2,
          commify: true,
        },
        expected: "1 TOKEN",
      },
      {
        amount: "1000000000000000000000",
        decimals: 18,
        options: {
          symbol: "TOKEN",
          commify: true,
        },
        expected: "1,000 TOKEN",
      },
      {
        amount: "123456000000",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: true,
        },
        expected: "123,456 TOKEN",
      },
      {
        amount: "123456123456",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: true,
          precision: 6,
        },
        expected: "123,456.123456 TOKEN",
      },
      {
        amount: "123456999999",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: true,
          precision: 2,
        },
        expected: "123,456.99 TOKEN",
      },
      {
        amount: "123456999999",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: true,
          precision: -1,
        },
        expected: "123,456 TOKEN",
      },
      {
        amount: "123456999999",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: false,
          precision: -100,
        },
        expected: "123456 TOKEN",
      },
      {
        amount: "123456999999",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: false,
          precision: 100,
        },
        expected: "123456.999999 TOKEN",
      },
      {
        amount: "99999999999999999999999999",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: true,
          precision: 6,
          short: false,
        },
        expected: "99,999,999,999,999,999,999.999999 TOKEN",
      },
      {
        amount: "1234567000000",
        decimals: 6,
        options: {
          symbol: "TOKEN",
          commify: false,
          precision: 2,
          short: true,
        },
        expected: "1.23M TOKEN",
      },
      {
        amount: "1000000000000000",
        decimals: 0,
        options: {
          symbol: "TOKEN",
          commify: true,
          precision: 2,
          short: true,
        },
        expected: "1,000.00T TOKEN",
      },
    ];
    params.forEach((p) => {
      expect(formatBalance(p.amount, p.decimals, p.options)).toBe(p.expected);
    });
  });
});
