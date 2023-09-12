/**
 * Formats a timestamp into "moments ago" format
 * @param {number} timestamp Timestamp to format
 * @returns {string} Formatted timestamp
 */
export function dateToMomentsAgo(timestamp: number): string {
  const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

/**
 * Formats an error message to be more readable
 * @param {string} errorMsg Error message to format
 * @returns {string} Formatted error message
 */
export function formatError(errorMsg: string): string {
  // errors will look like "functionName::functionName: error message"
  const split = errorMsg.split(":");
  return "Error:" + split[split.length - 1];
}
