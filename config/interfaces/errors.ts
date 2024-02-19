import { BaseError } from "viem";
///
/// Types for error handling
///
export type ReturnWithError<T> = {
  data: T;
  error: Error | null;
};
export type PromiseWithError<T> = Promise<ReturnWithError<T>>;

export type Validation =
  | {
      error: true;
      reason: string;
    }
  | {
      error: false;
    };

///
/// Error handling functions
///
export const NO_ERROR = <T>(data: T): ReturnWithError<T> => ({
  data,
  error: null,
});

// creating new error objects
export function NEW_ERROR<T>(msg: string): ReturnWithError<T>;
export function NEW_ERROR<T>(
  functionName: string,
  err: Error | string | any
): ReturnWithError<T>;
export function NEW_ERROR<T>(
  arg1: string,
  arg2?: Error | string | any
): ReturnWithError<T> {
  if (arg2) {
    return {
      data: null as T,
      error: new Error(arg1 + "::" + errMsg(arg2)),
    };
  }
  return {
    data: null as T,
    error: new Error(arg1),
  };
}

export const errMsg = (error: any): string => {
  if(error instanceof BaseError){
    return error.details
  }
  if (error.message) {
    return error.message;
  }
  return error;
};
