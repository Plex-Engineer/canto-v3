///
/// STANDARD ERROR MESSAGES FOR PAGES
///

export const TX_PARAM_ERRORS = {
  // general
  PARAM_MISSING: (paramName: string) => `${paramName} is missing`,
  PARAM_INVALID: (paramName: string) => `${paramName} is invalid`,
  // chain error
  CHAIN_NOT_SUPPORTED: (chainId: string | number) =>
    `Chain (${chainId}) not supported`,
  // AMOUNT ERRORS
  AMOUNT_NOT_A_NUMBER: () => "Amount must be a number",
  AMOUNT_TOO_HIGH: (formattedMax: string, tokenSymbol?: string) =>
    `Amount must be less than ${formattedMax} ${tokenSymbol ?? ""}`,
  AMOUNT_TOO_LOW: (formattedMin: string, tokenSymbol?: string) =>
    `Amount must be greater than ${formattedMin} ${tokenSymbol ?? ""}`,
  // BALANCE ERRORS
  NO_TOKEN_BALANCE: () => "You have 0 balance",
  // LP TRANSACTIONS
  SLIPPAGE: () => "Slippage must be between 0 and 100",
  DEADLINE: () => "Deadline must be greater than 0",
  // AMBIENT LP TRANSACTIONS
  POSITION_NOT_FOUND: (id: string) => `Position id ${id} not found`,
  RANGE_ERROR: () => "Lower price is greater than upper price",
  EXECUTION_PRICE_TOO_LOW: (min: boolean, price: string) =>
    `${
      min ? "Minimum" : "Maximum"
    } execution price must be greater than or equal to ${price}`,
  EXECUTION_PRICE_TOO_HIGH: (min: boolean, price: string) =>
    `${
      min ? "Minimum" : "Maximum"
    } execution price must be less than or equal to ${price}`,
};
export const TX_SIGN_ERRORS = {
  INCORRECT_TX_TYPE: (txType: string) => `Incorrect tx type ${txType}`,
  INVALID_CHAIN_ID: (chainId: string | number) => `Invalid chainId ${chainId}`,
  INCORRECT_CHAIN: () => "Incorrect chain",
  SWITCH_CHAIN_ERROR: () => "Error switching chains",
  MISSING_SIGNER: () => "No signer",
};
