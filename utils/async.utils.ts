import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";

const DEFAULT_HEADER = {
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

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
  } catch (error) {
    return NEW_ERROR("tryFetch::" + (error as Error).message);
  }
}

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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
