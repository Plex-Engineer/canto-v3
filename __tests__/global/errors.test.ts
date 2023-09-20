import { NO_ERROR, NEW_ERROR, errMsg } from "../../config/interfaces";

describe("error interface tests", () => {
  it("should return a ReturnWithError object with no error", async () => {
    // data can be of any type
    const data = [
      { name: "John", age: 21 },
      25,
      "0000",
      undefined,
      null,
      {},
      [],
      ["a", "b", "c", 1, 2, 3],
    ];
    data.forEach(async (d) => {
      const errObj = NO_ERROR(d);
      expect(errObj.error).toBeNull();
      expect(errObj.data).toStrictEqual(d);
    });
  });

  it("should return a ReturnWithError object with an error", () => {
    const errorMsgs = ["This is an error", "This is another error", ""];
    errorMsgs.forEach((msg) => {
      const errObj = NEW_ERROR(msg);
      expect(errObj.data).toBeNull();
      expect(errObj.error).toBeInstanceOf(Error);
      expect(errObj.error?.message).toBe(msg);
    });
  });

  it("should return the error message from an Error object", () => {
    const errorObjs = [
      new Error("This is an error"),
      new Error("This is another error"),
      new Error(""),
      "This is an error",
      "",
      404,
    ];
    errorObjs.forEach((err) => {
      expect(errMsg(err)).toBe(err instanceof Error ? err.message : err);
    });
  });
});
