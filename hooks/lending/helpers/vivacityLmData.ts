import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { isValidEthAddress } from "@/utils/address";
import {
  CERC20_ABI,
  ERC20_ABI,
  CNOTE_ABI,
  VCNOTE_ABI,
  LENDING_LEDGER_REWARDS_ABI,
} from "@/config/abis";
import { multicall } from "wagmi/actions";
import BigNumber from "bignumber.js";
import { getVivacityAddress } from "@/config/consts/vivacityAddresses";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { Vivacity } from "@/transactions/lending";

/**
 * @notice Gets all user data from clmLens and general api
 * @param {string} userEthAddress address to get data for
 * @param {number} chainId chainId to get data for
 * @returns {PromiseWithError<Vivacity.VCNoteWithUserData>}
 */
export async function getVivacityLMData(
  userEthAddress: string,
  chainId: number
): PromiseWithError<{ vcNote?: Vivacity.VCNoteWithUserData }> {
  // get data from clmLens and general api
  const [vcNote, userVCNote] = await Promise.all([
    getVCNoteData(chainId),
    getUserVCNoteData(userEthAddress, chainId),
  ]);

  // check general error first
  if (vcNote.error) {
    return NEW_ERROR("getVivacityLMData::" + errMsg(vcNote.error));
  }

  // return general data if no user
  if (!userEthAddress) {
    return NO_ERROR({ vcNote: vcNote.data });
  }

  // there will be an error if no address is provided (if user is present, return error)
  if (userVCNote.error && userEthAddress) {
    return NEW_ERROR("getVivacityLMData::" + errMsg(userVCNote.error));
  }
  const bnExchangeRate = new BigNumber(vcNote.data.exchangeRate ?? "0");
  const bnCTokenBalance = new BigNumber(userVCNote.data.balanceOfCToken ?? "0");
  const supplyBalanceInUnderlying = bnCTokenBalance
    .multipliedBy(bnExchangeRate)
    .integerValue(BigNumber.ROUND_DOWN);
  // since user is present, combine the data
  const combinedVCNoteData = {
    ...vcNote.data,
    userDetails: {
      ...userVCNote.data,
      supplyBalanceInUnderlying: supplyBalanceInUnderlying.toString(),
    },
  };

  return NO_ERROR({ vcNote: combinedVCNoteData });
}

/**
 * @notice Gets note data from vivacity lm
 * @param {number} chainId Whether to use testnet or mainnet
 * @returns {PromiseWithError<Vivacity.VCNote>}
 */
export async function getVCNoteData(
  chainId: number
): PromiseWithError<Vivacity.VCNote> {
  try {
    // get all addresses depending on chainId
    const [noteAddress, cNoteAddress, vcNoteAddress] = [
      getCantoCoreAddress(chainId, "note"),
      getCantoCoreAddress(chainId, "cNote"),
      getVivacityAddress(chainId, "vcNote"),
    ];

    // make sure addresses exist
    if (!noteAddress || !cNoteAddress || !vcNoteAddress) {
      throw Error("getVCNoteData: chainId not supported");
    }

    // use multicall to save eth calls to node
    const contractCalls = [
      {
        address: vcNoteAddress as `0x${string}`,
        abi: VCNOTE_ABI,
        functionName: "exchangeRateCurrent",
      },
      {
        address: cNoteAddress as `0x${string}`,
        abi: CNOTE_ABI,
        functionName: "exchangeRateCurrent",
      },
      {
        address: cNoteAddress as `0x${string}`,
        abi: CNOTE_ABI,
        functionName: "supplyRatePerBlock",
      },
    ] as const;
    const [
      vcNoteExchangeRateCurrent,
      cNoteExchangeRateCurrent,
      cNoteSupplyRate,
    ] = await multicall({
      chainId,
      contracts: contractCalls,
    });

    // check all results are present and successful
    if (
      !(
        vcNoteExchangeRateCurrent &&
        cNoteExchangeRateCurrent &&
        cNoteSupplyRate &&
        vcNoteExchangeRateCurrent.status === "success" &&
        cNoteExchangeRateCurrent.status === "success" &&
        cNoteSupplyRate.status === "success"
      )
    ) {
      throw Error("getVCNoteData: multicall error");
    }
    const bnVCNoteExchangeRate = new BigNumber(
      vcNoteExchangeRateCurrent.result.toString()
    );
    const bnCNoteExchangeRate = new BigNumber(
      cNoteExchangeRateCurrent.result.toString()
    );
    const bnCNoteSupplyRate = new BigNumber(cNoteSupplyRate.result.toString());
    const vcNoteToNoteExchangeRate = bnVCNoteExchangeRate
      .multipliedBy(bnCNoteExchangeRate)
      .dividedBy(new BigNumber(10).pow(36));
    const cNoteSupplyRateFormatted = bnCNoteSupplyRate
      .dividedBy(new BigNumber(10).pow(18))
      .toString();
    const supplyApyRounded =
      Math.ceil(getAPY(Number(cNoteSupplyRateFormatted)) * 100) / 100;
    // format results
    const vcNote = {
      address: vcNoteAddress,
      decimals: 18,
      name: "Vivacity Collateralized NOTE",
      symbol: "vcNOTE",
      supplyApy: supplyApyRounded.toString(),
      exchangeRate: vcNoteToNoteExchangeRate.toString(),
      price: "1000000000000000000",
      underlying: {
        address: noteAddress,
        decimals: 18,
        logoURI:
          "https://raw.githubusercontent.com/Plex-Engineer/public-assets/main/icons/tokens/note.svg",
        name: "Note",
        symbol: "NOTE",
      },
    };

    return NO_ERROR(vcNote);
  } catch (err) {
    return NEW_ERROR("getVCNoteData: " + errMsg(err));
  }
}

/**
 * @notice Gets user vcNote data from vivacity lm
 * @param {string} userEthAddress Ethereum address of user
 * @param {number} chainId Whether to use testnet or mainnet
 * @returns {PromiseWithError<Vivacity.UserVCNoteDetails>}
 */
export async function getUserVCNoteData(
  userEthAddress: string,
  chainId: number
): PromiseWithError<Vivacity.UserVCNoteDetails> {
  try {
    if (!isValidEthAddress(userEthAddress)) {
      throw Error("getUserVCNoteData: invalid userEthAddress");
    }
    // get all addresses depending on chainId
    const [
      noteAddress,
      cNoteAddress,
      vcNoteAddress,
      lendingLedgerRewardsAddress,
    ] = [
      getCantoCoreAddress(chainId, "note"),
      getCantoCoreAddress(chainId, "cNote"),
      getVivacityAddress(chainId, "vcNote"),
      getVivacityAddress(chainId, "lendingLedgerRewards"),
    ];
    // make sure addresses exist
    if (
      !noteAddress ||
      !cNoteAddress ||
      !vcNoteAddress ||
      !lendingLedgerRewardsAddress
    ) {
      throw Error("getUserVCNoteData: chainId not supported");
    }

    // use multicall to save eth calls to node
    const contractCalls = [
      {
        address: noteAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [userEthAddress],
      },
      {
        address: noteAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [userEthAddress, vcNoteAddress as `0x${string}`],
      },
      {
        address: vcNoteAddress as `0x${string}`,
        abi: CERC20_ABI,
        functionName: "balanceOf",
        args: [userEthAddress],
      },
      {
        address: vcNoteAddress as `0x${string}`,
        abi: CERC20_ABI,
        functionName: "balanceOfUnderlying",
        args: [userEthAddress],
      },
      {
        address: lendingLedgerRewardsAddress as `0x${string}`,
        abi: LENDING_LEDGER_REWARDS_ABI,
        functionName: "estimatedRewards",
        args: [
          vcNoteAddress as `0x${string}`,
          userEthAddress,
          0n,
          2n ** 256n - 1n,
        ],
      },
    ] as const;
    const [
      balanceOfUnderlyingNote,
      underlyingAllowanceNote,
      balanceOfVCNote,
      cNoteSupplyBalance,
      lendingLedgerRewards,
    ] = await multicall({
      chainId,
      contracts: contractCalls,
    });

    // check all results are present and successful
    if (
      !(
        balanceOfUnderlyingNote &&
        underlyingAllowanceNote &&
        balanceOfVCNote &&
        cNoteSupplyBalance &&
        balanceOfUnderlyingNote.status === "success" &&
        underlyingAllowanceNote.status === "success" &&
        balanceOfVCNote.status === "success" &&
        cNoteSupplyBalance.status === "success"
      )
    ) {
      throw Error("getUserVCNoteData: multicall error");
    }
    // format results
    const vcNote = {
      chainId,
      cTokenAddress: vcNoteAddress,
      balanceOfCToken: balanceOfVCNote.result.toString(),
      balanceOfUnderlying: balanceOfUnderlyingNote.result.toString(),
      rewards: lendingLedgerRewards.result?.toString() ?? "0",
      supplyBalanceInUnderlying: cNoteSupplyBalance.result.toString(),
      underlyingAllowance: underlyingAllowanceNote.result.toString(),
    };

    return NO_ERROR(vcNote);
  } catch (err) {
    return NEW_ERROR("getUserVCNoteData: " + errMsg(err));
  }
}

const secondsPerBlock = 5.8;
const blocksPerDay = 86400 / secondsPerBlock;
const daysPerYear = 365;

function getAPY(blockRate: number): number {
  return (
    (Math.pow(Number(blockRate) * blocksPerDay + 1, daysPerYear) - 1) * 100
  );
}
