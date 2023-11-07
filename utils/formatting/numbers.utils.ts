/**
 * @notice Formats a number into a percentage
 * @param {string} percent percentage to format
 * @returns {string} Formatted percentage
 */
export function formatPercent(percent: string): string {
  return (parseFloat(percent) * 100).toFixed(2) + "%";
}
