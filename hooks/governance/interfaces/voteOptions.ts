export enum VoteOption {
  YES = "Yes",
  NO = "No",
  ABSTAIN = "Abstain",
  VETO = "Veto",
  NONE = "None",
}
/**
 * @notice converts a voting option to a number
 * @param {VoteOption} option option to convert
 * @returns {number} voting option as number
 * @dev 1 = yes, 2 = abstain, 3 = no, 4 = veto
 */
export function voteOptionToNumber(option: VoteOption): number {
  switch (option) {
    case VoteOption.YES:
      return 1;
    case VoteOption.ABSTAIN:
      return 2;
    case VoteOption.NO:
      return 3;
    case VoteOption.VETO:
      return 4;
    default:
      return 0;
  }
}
