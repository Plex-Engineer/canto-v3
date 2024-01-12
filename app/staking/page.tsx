"use client";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import useStaking from "@/hooks/staking/useStaking";
import styles from "./staking.module.scss";
import Text from "@/components/text";
import Spacer from "@/components/layout/spacer";
import Container from "@/components/container/container";
import Button from "@/components/button/button";
import Icon from "@/components/icon/icon";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/formatting/balances.utils";
import BigNumber from "bignumber.js";
import { formatPercent } from "@/utils/formatting";
import Table from "@/components/table/table";
import Splash from "@/components/splash/splash";
import {
  GenerateMyStakingTableRow,
  GenerateUnbondingDelegationsTableRow,
  GenerateValidatorTableRow,
} from "./components/validatorTableRow";
import { useEffect, useMemo, useState } from "react";
import { StakingModal } from "./components/stakingModal/StakingModal";
import {
  UnbondingDelegation,
  Validator,
} from "@/hooks/staking/interfaces/validators";
import Modal from "@/components/modal/modal";

import {
  StakingTransactionParams,
  StakingTxTypes,
} from "@/hooks/staking/interfaces/stakingTxTypes";
import { ethToCantoAddress } from "@/utils/address";
import { NewTransactionFlow } from "@/transactions/flows/types";
import { TransactionFlowType } from "@/transactions/flows/flowMap";
import { NEW_ERROR } from "@/config/interfaces";
import Tabs from "@/components/tabs/tabs";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import { GetWalletClientResult } from "wagmi/actions";
import Input from "@/components/input/input";

export default function StakingPage() {
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [currentFilter, setCurrentFilter] = useState<string>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredValidatorsBySearch, setFilteredValidatorsBySearch] = useState<
    Validator[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  // const [selectedTx, setSelectedTx] = useState<StakingTxTypes>(
  //   StakingTxTypes.DELEGATE
  // );

  function handleStakingTxClick(
    validator: Validator | null,
    inputAmount: string,
    txType: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) {
    if (signer) {
      if (txType == StakingTxTypes.REDELEGATE) {
        const newFlow: NewTransactionFlow = {
          icon: "/canto.svg",
          txType: TransactionFlowType.STAKE_CANTO_TX,
          title: "Stake Canto",
          params: {
            chainId: chainId,
            ethAccount: signer?.account.address ?? "",
            txType: txType,
            validatorAddress: validator?.operator_address ?? "",
            newValidatorAddress: validatorToRedelegate
              ? validatorToRedelegate.operator_address
              : "",
            newValidatorName: validatorToRedelegate?.description.moniker,
            amount: (
              convertToBigNumber(inputAmount, 18).data ?? "0"
            ).toString(),
            validatorName: validator?.description.moniker ?? "",
          },
        };
        txStore?.addNewFlow({
          txFlow: newFlow,
          ethAccount: signer?.account.address,
        });
      }
      if (
        txType == StakingTxTypes.DELEGATE ||
        txType == StakingTxTypes.UNDELEGATE
      ) {
        const newFlow: NewTransactionFlow = {
          icon: "/canto.svg",
          txType: TransactionFlowType.STAKE_CANTO_TX,
          title: "Stake Canto",
          params: {
            chainId: chainId,
            ethAccount: signer?.account.address ?? "",
            txType: txType,
            validatorAddress: validator?.operator_address ?? "",
            amount: (
              convertToBigNumber(inputAmount, 18).data ?? "0"
            ).toString(),
            validatorName: validator?.description.moniker ?? "",
          },
        };
        txStore?.addNewFlow({
          txFlow: newFlow,
          ethAccount: signer?.account.address,
        });
      }
    }
  }

  const { txStore, signer, chainId } = useCantoSigner();

  const { isLoading, validators, apr, userStaking, selection, transaction } =
    useStaking({
      chainId: chainId,
      userEthAddress: signer?.account.address,
    });

  const allValidatorsAddresses = validators.map((validator) => {
    return validator.operator_address;
  });
  const allUserValidatorsAddresses: string[] = userStaking
    ? userStaking.validators.map((validator) => {
        return validator.operator_address;
      })
    : [];

  function createStakingParams(
    chainId: number,
    ethAccount: string,
    txType: StakingTxTypes,
    amount: string,
    validator1: Validator,
    validatorNew: Validator
  ) {
    if (txType == StakingTxTypes.CLAIM_REWARDS) {
      return {
        chainId: chainId,
        txType: txType,
        ethAccount: ethAccount,
        validatorAddresses: allValidatorsAddresses,
      };
    }
    if (
      txType == StakingTxTypes.DELEGATE ||
      txType == StakingTxTypes.UNDELEGATE
    ) {
      return {
        chainId: chainId,
        txType: txType,
        amount: amount,
        ethAccount: ethAccount,
        validatorAddress: validator1?.operator_address,
        validatorName: validator1?.description.moniker,
      };
    }
    if (txType == StakingTxTypes.REDELEGATE) {
      if (validatorNew) {
        return {
          chainId: chainId,
          txType: txType,
          amount: amount,
          ethAccount: ethAccount,
          validatorAddress: validator1?.operator_address,
          validatorName: validator1?.description.moniker,
          newValidatorAddress: validatorNew?.operator_address,
        };
      }
    }
  }

  // console.log(userStaking);
  // console.log(selection);
  // console.log(transaction);

  const validatorsWithRanks = useMemo(
    () =>
      validators
        .sort((a, b) => (BigInt(a.tokens) < BigInt(b.tokens) ? 1 : -1))
        .map((validator, index) => ({
          ...validator,
          rank: index + 1,
        })),
    [validators]
  );

  // const validatorsWithRanks = validators.map((validator, index) => ({
  //   ...validator,
  //   rank: index + 1, // Adding 1 to make the rank start from 1
  // }));

  const activeValidators = useMemo(
    () =>
      validators
        .filter((v) => v.jailed == false)
        .sort((a, b) => (BigInt(a.tokens) < BigInt(b.tokens) ? 1 : -1))
        .map((validator, index) => ({
          ...validator,
          rank: index + 1,
        })),
    [validators]
  ); //validatorsWithRanks.filter(v=>v.jailed==false);
  const inActiveValidators = useMemo(
    () =>
      validators
        .filter((v) => v.jailed == true)
        .sort((a, b) => (BigInt(a.tokens) < BigInt(b.tokens) ? 1 : -1))
        .map((validator, index) => ({
          ...validator,
          rank: index + 1,
        })),
    [validators]
  );

  const filteredValidators =
    currentFilter == "ACTIVE" ? activeValidators : inActiveValidators;

  const validatorTitleMap = new Map<string, string>();
  validatorTitleMap.set("ACTIVE", "VALIDATORS");
  validatorTitleMap.set("INACTIVE", "VALIDATORS");

  const handleSearch = () => {
    const searchQuery2 = searchQuery;
    const filteredListSearch = filteredValidators.filter((validator) =>
      validator.description.moniker
        .toLowerCase()
        .includes(searchQuery2.toLowerCase())
    );
    setFilteredValidatorsBySearch(filteredListSearch);
    setCurrentPage(1);
  };
  const pageSize = 20;
  const currentValidators =
    searchQuery == "" ? filteredValidators : filteredValidatorsBySearch;
  useEffect(() => {
    setTotalPages(Math.ceil(currentValidators.length / pageSize));
  }, [currentValidators.length, pageSize]);

  const paginatedvalidators: Validator[] = currentValidators.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const hasUserStaked: boolean | undefined =
    userStaking && userStaking.validators && userStaking.validators.length > 0;

  const totalStaked: number | undefined = hasUserStaked
    ? userStaking?.validators.reduce((sum, item) => {
        const amountNumber = parseFloat(
          formatBalance(item.userDelegation.balance, 18)
        );
        return sum + amountNumber;
      }, 0)
    : 0;

  const totalRewards: number | undefined = hasUserStaked
    ? userStaking?.validators.reduce((sum, item) => {
        const amountNumber = parseFloat(
          formatBalance(item.userDelegation.rewards, 18)
        );
        return sum + amountNumber;
      }, 0)
    : 0;

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const space = " ";
  const str = "search...";

  const unbondingDelegations: UnbondingDelegation[] =
    userStaking?.unbonding
      ?.map((unbondingEntry) => {
        const validatorAddress = unbondingEntry.validator_address;
        const validatorName = validators?.find(
          (e) => e.operator_address === validatorAddress
        )?.description.moniker;
        //const validatorName = validatorUnbonded?.description.moniker;

        const entries = unbondingEntry.entries.map((entry) => ({
          name: validatorName || "",
          completion_date: entry.completion_time,
          undelegation: entry.balance,
        }));

        return entries;
      })
      .flat() || [];

  // console.log(userStaking);
  // console.log(userStaking?.unbonding);
  // console.log(unbondingDelegations);

  function handleClick(validator: Validator) {
    setSelectedValidator(validator);
  }

  if (isLoading) {
    return <Splash></Splash>;
  }

  function handleRewardsClaimClick(
    signer: GetWalletClientResult | undefined,
    validatorAddresses: string[]
  ) {
    if (signer) {
      const newFlow: NewTransactionFlow = {
        icon: "/canto.svg",
        txType: TransactionFlowType.STAKE_CANTO_TX,
        title: "Rewards",
        params: {
          chainId: chainId,
          ethAccount: signer?.account.address,
          txType: StakingTxTypes.CLAIM_REWARDS,
          validatorAddresses: validatorAddresses,
        },
      };
      txStore?.addNewFlow({
        txFlow: newFlow,
        ethAccount: signer.account.address,
      });
    }
  }

  return (
    <div className={styles.container}>
      <Container direction="row" width="100%">
        <div className={styles.infoBoxButton}>
          <div className={styles.TitleStaking}>
            <Text size="title" font="proto_mono">
              STAKING
            </Text>
          </div>
        </div>
        <div className={styles.infoBox}>
          <div>
            <Text font="rm_mono">Total Staked </Text>
          </div>
          <Container direction="row" center={{ vertical: true }}>
            <div style={{ marginRight: "5px" }}>
              <Text font="proto_mono" size="title">
                {displayAmount(totalStaked ? totalStaked.toFixed(2) : "0", 0, {
                  commify: true,
                })}{" "}
              </Text>
            </div>
            <p>{space}</p>
            <Icon
              themed
              icon={{
                url: "./tokens/canto.svg",
                size: 24,
              }}
            />
          </Container>
        </div>
        <div className={styles.infoBox}>
          <div>
            <Text font="rm_mono">APR</Text>
          </div>
          <Container direction="row" center={{ vertical: true }}>
            <Text font="proto_mono" size="title">
              {formatPercent((parseFloat(apr) / 100).toString())}
            </Text>
          </Container>
        </div>
        <div className={styles.infoBox}>
          <div>
            <Text font="rm_mono">Rewards</Text>
          </div>
          <Container direction="row" center={{ vertical: true }}>
            <div style={{ marginRight: "5px" }}>
              <Text font="proto_mono" size="title">
                {totalRewards?.toFixed(5)}{" "}
              </Text>
              <Text> </Text>
            </div>
            <Icon
              themed
              icon={{
                url: "./tokens/canto.svg",
                size: 24,
              }}
            />
          </Container>
        </div>
        <div className={styles.infoBoxButton}>
          <div className={styles.ClaimBtn}>
            <Button
              width={500}
              height="large"
              onClick={() =>
                handleRewardsClaimClick(signer, allUserValidatorsAddresses)
              }
              disabled={!signer || !hasUserStaked}
            >
              Claim Staking Rewards
            </Button>
          </div>
        </div>
      </Container>
      <Spacer height="40px" />

      {hasUserStaked && userStaking && (
        <div className={styles.tableContainer}>
          <Container width="100%">
            <div className={styles.tableContainer2}>
              <Table
                title="My Staking"
                headers={[
                  {
                    value: (
                      <Text opacity={0.4} font="rm_mono">
                        Name
                      </Text>
                    ),
                    ratio: 5,
                  },
                  { value: <Text opacity={0.4}>My Stake</Text>, ratio: 3 },
                  {
                    value: (
                      <Text opacity={0.4} font="rm_mono">
                        Validator Total
                      </Text>
                    ),
                    ratio: 3,
                  },
                  {
                    value: (
                      <Text opacity={0.4} font="rm_mono">
                        Commission
                      </Text>
                    ),
                    ratio: 3,
                  },
                  {
                    value: (
                      <Text opacity={0.4} font="rm_mono">
                        Edit
                      </Text>
                    ),
                    ratio: 3,
                  },
                ]}
                content={[
                  ...userStaking.validators.map((userStakingElement, index) =>
                    GenerateMyStakingTableRow(userStakingElement, index, () =>
                      handleClick(userStakingElement)
                    )
                  ),
                ]}
              />
            </div>
          </Container>
          <Spacer height="40px" />
        </div>
      )}
      <Spacer height="40px" />

      {userStaking && userStaking.unbonding.length > 0 && (
        <div className={styles.tableContainer2}>
          <Table
            title="Unbonding Delegations"
            headers={[
              {
                value: (
                  <Text opacity={0.4} font="rm_mono">
                    Name
                  </Text>
                ),
                ratio: 3,
              },
              { value: <Text opacity={0.4}>Undelegation</Text>, ratio: 2 },
              {
                value: (
                  <Text opacity={0.4} font="rm_mono">
                    Completion Time
                  </Text>
                ),
                ratio: 5,
              },
            ]}
            content={[
              ...unbondingDelegations.map((userStakingElement, index) =>
                GenerateUnbondingDelegationsTableRow(userStakingElement, index)
              ),
            ]}
          />
          <Spacer height="40px" />
        </div>
      )}

      <Container width="100%" className={styles.tableContainer}>
        {/* <div className={styles.searchBarContainer2}>
          <div className={styles.searchBarContainer}>
            <div>
              <Input
                height={47}
                icon="/searchIcon.svg"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);

                  handleSearch();
                  //console.log("inside function");
                }}
                placeholder={str[0].toUpperCase() + str.slice(1)}
              />
                

            </div>
            <div style={{display:"flex",flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
              <Button shadow="none" onClick={() => {}} >
                <Icon
                  
                  themed
                  icon={{
                    url: "/searchIcon.svg",
                    size: 24,
                  }}
                />
              </Button>
            </div>
          </div>
        </div> */}

        <Table
          title={
            <div className={styles.tableTitleContainer}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "33%",
                }}
              >
                <Text font="proto_mono" size="lg">
                  {validatorTitleMap.get(currentFilter)}
                </Text>
              </div>
              <div className={styles.searchBarContainer}>
                {/* <div className={styles.searchIconContainer}>
                  <Icon
                    themed
                    icon={{
                      url: "/searchIcon.svg",
                      size: 24,
                    }}
                  />
                </div> */}
                <div>
                  <Input
                    height={40}
                    searchicon={true}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);

                      handleSearch();
                      //console.log("inside function");
                    }}
                    placeholder={str[0].toUpperCase() + str.slice(1)}
                    icon="/searchIcon.svg"
                  />
                </div>
                {/* <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Button height={40} shadow="none" onClick={() => {}}>
                    <Icon
                      themed
                      icon={{
                        url: "/searchIcon.svg",
                        size: 24,
                      }}
                    />
                  </Button>
                </div> */}
              </div>
            </div>
          }
          // secondary={
          //   <div className={styles.TabRow}>
          //     <div className={styles.Tab}>ACTIVE VALIDATORS</div>
          //     <div className={styles.Tab}>INACTIVE VALIDATORS</div>
          //   </div>
          // }
          secondary={
            <Container width="25%">
              <ToggleGroup
                options={["ACTIVE", "INACTIVE"]}
                selected={currentFilter}
                setSelected={(value) => {
                  setCurrentFilter(value);
                  setCurrentPage(1);
                  setSearchQuery("");
                }}
              />
            </Container>
          }
          headers={[
            {
              value: (
                <Text opacity={0.4} font="rm_mono">
                  Rank
                </Text>
              ),
              ratio: 2,
            },
            {
              value: (
                <Text opacity={0.4} font="rm_mono">
                  Name
                </Text>
              ),
              ratio: 6,
            },
            { value: <Text opacity={0.4}>Validator Total</Text>, ratio: 4 },
            {
              value: (
                <Text opacity={0.4} font="rm_mono">
                  Commission %
                </Text>
              ),
              ratio: 3,
            },
            {
              value: (
                <Text opacity={0.4} font="rm_mono">
                  Action
                </Text>
              ),
              ratio: 4,
            },
          ]}
          content={
            paginatedvalidators.length > 0
              ? [
                  ...paginatedvalidators.map((validator, index) =>
                    GenerateValidatorTableRow(validator, index, () =>
                      handleClick(validator)
                    )
                  ),
                  <div key="Pagination" className={styles.paginationContainer}>
                    <div className={styles.paginationButton1}>
                      <Button
                        onClick={handlePrevious}
                        disabled={currentPage == 1}
                        width={100}
                      >
                        Previous
                      </Button>
                    </div>
                    <div className={styles.paginationButton2}>
                      <Button
                        onClick={handleNext}
                        disabled={currentPage == totalPages}
                        width={100}
                      >
                        Next
                      </Button>
                    </div>
                  </div>,
                ]
              : [<div key="noData">NO VALIDATORS FOUND</div>]
          }
        />

        {/* <div className={styles.paginationContainer}>
          <div className={styles.paginationButton1}>
            <Button
              onClick={handlePrevious}
              disabled={currentPage == 1}
              width={100}
            >
              Previous
            </Button>
          </div>
          <div className={styles.paginationButton2}>
            <Button
              onClick={handleNext}
              disabled={currentPage == totalPages}
              width={100}
            >
              Next
            </Button>
          </div>
        </div> */}
        <Spacer height="80px" />
      </Container>
      {/* <Container>
        
      </Container> */}
      {/* <BoxedBackground /> */}
      <Modal
        width="32rem"
        onClose={() => {
          setSelectedValidator(null);
        }}
        title="STAKE"
        closeOnOverlayClick={false}
        open={selectedValidator != null}
      >
        <StakingModal
          validators={validators}
          userStaking={userStaking}
          validator={selectedValidator}
          signer={signer}
          onConfirm={(
            selectedValidator,
            inputAmount,
            selectedTx,
            validatorToRedelegate
          ) =>
            handleStakingTxClick(
              selectedValidator,
              inputAmount,
              selectedTx,
              validatorToRedelegate
            )
          }
        ></StakingModal>
      </Modal>
    </div>
  );
}
