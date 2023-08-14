export interface ReturnWithError<T> {
  data: T;
  error: Error | null;
}
export type PromiseWithError<T> = Promise<ReturnWithError<T>>;

export const NO_ERROR = <T>(data: T): ReturnWithError<T> => ({
  data,
  error: null,
});

export const NEW_ERROR = <T>(msg: string): ReturnWithError<T> => ({
  data: null as T,
  error: new Error(msg),
});
