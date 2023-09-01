import { convertNoteAmountToToken, convertTokenAmountToNote } from "@/utils/tokens/tokenMath.utils";
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
});
