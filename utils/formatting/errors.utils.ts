/**
 * @notice Formats an error message to be more readable
 * @param {string} errorMsg Error message to format
 * @returns {string} Formatted error message
 */
export function formatError(errorMsg: string): string {
  // errors will look like "functionName::functionName: error message"
  const split = errorMsg.split(":");
  return "Error:" + split[split.length - 1];
}
