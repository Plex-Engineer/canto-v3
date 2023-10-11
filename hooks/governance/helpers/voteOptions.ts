export enum VotingOption {
  YES = "Yes",
  NO = "No",
  ABSTAIN = "Abstain",
  VETO = "Veto",
  NONE = "None",
}
export const VoteStatus = {
  passed: "PROPOSAL_STATUS_PASSED",
  votingOngoing: "PROPOSAL_STATUS_VOTING_PERIOD",
};
/**
 * @notice converts a voting option to a number
 * @param {VotingOption} option option to convert
 * @returns {number} voting option as number
 * @dev 1 = yes, 2 = abstain, 3 = no, 4 = veto
 */
export function voteOptionToNumber(option: VotingOption): number {
  switch (option) {
    case VotingOption.YES:
      return 1;
    case VotingOption.ABSTAIN:
      return 2;
    case VotingOption.NO:
      return 3;
    case VotingOption.VETO:
      return 4;
    default:
      return 0;
  }
}
