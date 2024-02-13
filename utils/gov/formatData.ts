import { VoteOption } from "@/transactions/gov";

const proposalTypes = {
  "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal": "Software Upgrade",
  "/cosmos.params.v1beta1.ParameterChangeProposal": "Parameter Change",
  "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal":
    "Community Pool Spend",
  "/canto.govshuttle.v1.LendingMarketProposal": "Lending Market",
  "/cosmos.gov.v1beta1.TextProposal": "Text",
  "/canto.erc20.v1.RegisterCoinProposal": "Register Coin",
  "/ibc.core.client.v1.ClientUpdateProposal": "Client Update Proposal",
};

export function formatProposalStatus(status: string): string | undefined {
  switch (status) {
    case "PROPOSAL_STATUS_ACTIVE":
      return "ACTIVE";
    case "PROPOSAL_STATUS_PASSED":
      return "PASSED";
    case "PROPOSAL_STATUS_REJECTED":
      return "REJECTED";
    case "PROPOSAL_STATUS_FAILED":
      return "FAILED";
    case "PROPOSAL_STATUS_DEPOSIT_PERIOD":
      return "DEPOSIT";
    case "PROPOSAL_STATUS_VOTING_PERIOD":
      return "ACTIVE";
    case "PROPOSAL_STATUS_UNSPECIFIED":
      return undefined;
    default:
      return undefined;
  }
}

export function formatProposalType(type_url: string) {
  return (proposalTypes as any)[type_url] || "Proposal type not found";
}
interface FinalTallyResult {
  yes: string;
  abstain: string;
  no: string;
  no_with_veto: string;
}

export interface VoteData {
  [VoteOption.YES]: {
    amount: string;
    percentage: string;
  };
  [VoteOption.ABSTAIN]: {
    amount: string;
    percentage: string;
  };
  [VoteOption.NO]: {
    amount: string;
    percentage: string;
  };
  [VoteOption.VETO]: {
    amount: string;
    percentage: string;
  };
}

export function calculateVotePercentages(
  finalTallyResult: FinalTallyResult
): VoteData {
  // Destructure the vote counts from the object
  const { yes, abstain, no, no_with_veto } = finalTallyResult;

  const factor = BigInt(1e18);
  // Convert the vote counts to BigInts
  const yesVotes = BigInt(yes);
  const abstainVotes = BigInt(abstain);
  const noVotes = BigInt(no);
  const noWithVetoVotes = BigInt(no_with_veto);

  const yesNumber =
    Number(yesVotes / factor) + Number(yesVotes % factor) / Number(factor);
  const abstainNumber =
    Number(abstainVotes / factor) +
    Number(abstainVotes % factor) / Number(factor);
  const noNumber =
    Number(noVotes / factor) + Number(noVotes % factor) / Number(factor);
  const noWithVetoNumber =
    Number(noWithVetoVotes / factor) +
    Number(noWithVetoVotes % factor) / Number(factor);

  const totalVotesBigInt = yesVotes + noVotes + abstainVotes + noWithVetoVotes;

  if (totalVotesBigInt == 0n) {
    return {
      [VoteOption.YES]: {
        amount: "0",
        percentage: "0",
      },
      [VoteOption.ABSTAIN]: {
        amount: "0",
        percentage: "0",
      },
      [VoteOption.NO]: {
        amount: "0",
        percentage: "0",
      },
      [VoteOption.VETO]: {
        amount: "0",
        percentage: "0",
      },
    };
  }

  // Calculate percentages and format them as strings
  const yesPercentage = (
    Number((yesVotes * BigInt(10000)) / totalVotesBigInt) / 100
  ).toFixed(2);
  const abstainPercentage = (
    Number((abstainVotes * BigInt(1000000)) / totalVotesBigInt) / 10000
  ).toFixed(2);
  const noPercentage = (
    Number((noVotes * BigInt(10000)) / totalVotesBigInt) / 100
  ).toFixed(2);
  const noWithVetoPercentage = (
    Number((noWithVetoVotes * BigInt(10000)) / totalVotesBigInt) / 100
  ).toFixed(2);

  // Convert the vote counts to strings with two decimal places
  const yesString = yesNumber.toFixed(2);
  const abstainString = abstainNumber.toFixed(2);
  const noString = noNumber.toFixed(2);
  const noWithVetoString = noWithVetoNumber.toFixed(2);

  return {
    [VoteOption.YES]: {
      amount: yesString,
      percentage: yesPercentage,
    },
    [VoteOption.ABSTAIN]: {
      amount: abstainString,
      percentage: abstainPercentage,
    },
    [VoteOption.NO]: {
      amount: noString,
      percentage: noPercentage,
    },
    [VoteOption.VETO]: {
      amount: noWithVetoString,
      percentage: noWithVetoPercentage,
    },
  };
}

export function formatTime(
  input: string,
  includeSeconds?: boolean,
  includeDay?: boolean
): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const suffixes = ["th", "st", "nd", "rd"];

  const date = new Date(input);
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);

  // Determine the appropriate day suffix
  const daySuffix =
    day % 10 < 4 && day % 100 !== 11 && day % 100 !== 12 && day % 100 !== 13
      ? suffixes[day % 10]
      : suffixes[0];

  return `${months[monthIndex]} ${day},${year} ${hours % 12 || 12}:${minutes} ${
    hours >= 12 ? "PM" : "AM"
  }`;
}
