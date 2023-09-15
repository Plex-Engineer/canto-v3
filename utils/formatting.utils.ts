/**
 * @notice Formats a timestamp into "moments ago" format
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
 * @notice Formats a number into a percentage
 * @param {number} seconds seconds to format
 * @returns {string} Formatted percentage
 */
export function formatSecondsToMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes > 1) {
    return minutes.toString() + " minutes";
  } else if (minutes === 1) {
    return "1 minute";
  } else {
    return seconds.toString() + " seconds";
  }
}

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
