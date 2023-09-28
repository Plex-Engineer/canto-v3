import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
  errMsg,
} from "@/config/interfaces";

const DEFAULT_HEADER = {
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

/**
 * @notice implements try catch for fetch
 * @param {string} url url to fetch
 * @param {RequestInit} options options for fetch or default
 * @returns {PromiseWithError<T>} object of return type T or error
 */
export async function tryFetch<T>(
  url: string,
  options?: RequestInit
): PromiseWithError<T> {
  try {
    const response = await fetch(url, options ?? DEFAULT_HEADER);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return NO_ERROR<T>(data);
  } catch (err) {
    return NEW_ERROR("tryFetch::" + errMsg(err));
  }
}

/**
 * @notice will try to fetch from multiple endpoints until one is successful
 * @param {string[]} urls array of urls to try
 * @param {RequestInit} options fetch options or default
 * @returns {PromiseWithError<T>} object of return type T or error
 */
export async function tryFetchMultipleEndpoints<T>(
  urls: string[],
  options?: RequestInit
): PromiseWithError<T> {
  for (const url of urls) {
    const result = await tryFetch<T>(url, options);
    if (!result.error) {
      return result;
    }
  }
  return NEW_ERROR("tryFetchMultipleEndpoints: no endpoints were successful");
}

const MAX_TRIES = 5;
/**
 * @notice will try to fetch from an endpoint multiple times until successful
 * @param {string} url url to try
 * @param {number} numTries max number of tries
 * @param {RequestInit} options fetch options or default
 * @returns {PromiseWithError<T>} object of return type T or error
 */
export async function tryFetchWithRetry<T>(
  url: string,
  numTries?: number,
  options?: RequestInit
): PromiseWithError<T> {
  let numberOfTries = 0;
  while (numberOfTries < (numTries ?? MAX_TRIES)) {
    const result = await tryFetch<T>(url, options);
    if (!result.error) {
      return result;
    }
    numberOfTries++;
    await sleep(4000);
  }
  return NEW_ERROR(
    "tryFetchWithRetry: no response after " + numberOfTries + " tries"
  );
}

/**
 * @notice sleeps for ms
 * @param {number} ms milliseconds to sleep for
 * @returns {Promise<void>} void
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @notice will call async function, but timeout if takes too long
 * @param {() => Promise<T>} asyncPromise async function to call
 * @param {number} timeLimit time limit in milliseconds
 * @returns {PromiseWithError<T>} object of return type T or error
 */
export async function asyncCallWithTimeout<T>(
  asyncPromise: () => Promise<T>,
  timeLimit: number
): PromiseWithError<T> {
  try {
    let timeoutHandle: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise((_resolve) => {
      timeoutHandle = setTimeout(
        () => _resolve(Error("asyncCallWithTimeout: timeout")),
        timeLimit
      );
    });
    const result = await Promise.race([asyncPromise(), timeoutPromise]);
    if (result instanceof Error) {
      throw result;
    }
    return NO_ERROR<T>(result as T);
  } catch (err) {
    return {
      data: null as T,
      error: err as Error,
    };
  }
}
