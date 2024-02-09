import {
  convertNoteAmountToToken,
  convertTokenAmountToNote,
  greaterThan,
} from "@/utils/math";
import BigNumber from "bignumber.js";

describe("test tokenMath", () => {
  it("calculate note value of token balance", () => {
    const tokens = [
      {
        token: {
          amount: "1000000000000000000",
          price: "1000000000000000000",
        },
        expectedNoteValue: "1000000000000000000",
        error: false,
      },
      {
        token: {
          amount: "1000000",
          price: "1000000000000000000000000000000",
        },
        expectedNoteValue: "1000000000000000000",
        error: false,
      },
      {
        token: {
          amount: "some error",
          price: "1000000000000000000000000000000",
        },
        expectedNoteValue: "doesn't matter",
        error: true,
      },
      {
        token: {
          amount: "10000000000",
          price: "0",
        },
        expectedNoteValue: "doesn't matter",
        error: true,
      },
    ];
    tokens.forEach((token) => {
      const { data, error } = convertTokenAmountToNote(
        token.token.amount,
        token.token.price
      );
      if (token.error) {
        expect(data).toBeNull();
        expect(!!error).toEqual(token.error);
      } else {
        expect(error).toBeNull();
        expect(data).toEqual(new BigNumber(token.expectedNoteValue));
      }
    });
  });

  it("converts note value to token balance", () => {
    const tokens = [
      {
        token: {
          noteValue: "1000000000000000000",
          price: "1000000000000000000",
        },
        expectedTokenAmount: "1000000000000000000",
        error: false,
      },
      {
        token: {
          noteValue: "1000000000000000000",
          price: "1000000000000000000000000000000",
        },
        expectedTokenAmount: "1000000",
        error: false,
      },
      {
        token: {
          noteValue: "some error",
          price: "1000000000000000000000000000000",
        },
        expectedTokenAmount: "doesn't matter",
        error: true,
      },
    ];
    tokens.forEach((token) => {
      const { data, error } = convertNoteAmountToToken(
        token.token.noteValue,
        token.token.price
      );
      if (token.error) {
        expect(data).toBeNull();
        expect(!!error).toEqual(token.error);
      } else {
        expect(error).toBeNull();
        expect(data).toEqual(new BigNumber(token.expectedTokenAmount));
      }
    });
  });

  it("correctly identifies which value is greater in a comparison", () => {
    const amounts = [
      {
        amount1: "1000000000000000000",
        amount2: "1000000000000000000",
        expected: false,
      },
      {
        amount1: "1000000000000000000",
        amount2: "1000000000000000001",
        expected: false,
      },
      {
        amount1: "1000000000000000001",
        amount2: "1000000000000000000",
        expected: true,
      },
      {
        amount1: "1000000000000000000",
        amount2: "some error",
        expected: false,
      },
      {
        amount1: "some error",
        amount2: "1000000000000000000",
        expected: false,
      },
      {
        amount1: "1000000000000000001",
        decimals1: 18,
        amount2: "1000000000000000000",
        decimals2: 18,
        expected: true,
      },
      {
        amount1: "1000000000000000001",
        decimals1: 18,
        amount2: "2000000",
        decimals2: 6,
        expected: false,
      },
      {
        amount1: "1000000000000000001",
        decimals1: 6,
        amount2: "2000000",
        decimals2: 18,
        expected: true,
      },
    ];
    amounts.forEach((amount) => {
      expect(
        greaterThan(
          amount.amount1,
          amount.amount2,
          amount.decimals1,
          amount.decimals2
        )
      ).toEqual(amount.expected);
    });
  });
});
