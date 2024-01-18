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
} from "@/transactions/staking/interfaces/stakingTxTypes";
import { ethToCantoAddress } from "@/utils/address";
import { NewTransactionFlow } from "@/transactions/flows/types";
import { TransactionFlowType } from "@/transactions/flows/flowMap";
import { NEW_ERROR, errMsg } from "@/config/interfaces";
import Tabs from "@/components/tabs/tabs";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import { GetWalletClientResult } from "wagmi/actions";
import Input from "@/components/input/input";
import { PAGE_NUMBER } from "@/config/consts/config";

export default function StakingPage() {
  const [currentFilter, setCurrentFilter] = useState<string>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  // const [filteredValidatorsBySearch, setFilteredValidatorsBySearch] = useState<
  //   Validator[]
  // >([]);
  const [currentPage, setCurrentPage] = useState(1);

  //const [totalPages, setTotalPages] = useState(1);

  function handleStakingTxClick(
    validator: Validator | null,
    inputAmount: string,
    txType: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) {
    if (signer) {
      if (txType == StakingTxTypes.REDELEGATE) {
        const { data: newFlow, error } = transaction.createNewStakingFlow({
          chainId: chainId,
          ethAccount: signer.account.address,
          txType: StakingTxTypes.REDELEGATE,
          validatorAddress: validator?.operator_address ?? "",
          newValidatorAddress: validatorToRedelegate
            ? validatorToRedelegate.operator_address
            : "",
          newValidatorName: validatorToRedelegate?.description.moniker,
          amount: (convertToBigNumber(inputAmount, 18).data ?? "0").toString(),
          validatorName: validator?.description.moniker ?? "0",
        });
        if (error) throw error;
        if (newFlow) {
          txStore?.addNewFlow({
            txFlow: newFlow,
            ethAccount: signer.account.address,
          });
        }
      }
      if (
        txType == StakingTxTypes.DELEGATE ||
        txType == StakingTxTypes.UNDELEGATE
      ) {
        const { data: newFlow, error } = transaction.createNewStakingFlow({
          chainId: chainId,
          ethAccount: signer.account.address,
          txType: txType,
          validatorAddress: validator?.operator_address ?? "",
          amount: (convertToBigNumber(inputAmount, 18).data ?? "0").toString(),
          validatorName: validator?.description.moniker ?? "0",
        });
        if (error) throw error;
        if (newFlow) {
          txStore?.addNewFlow({
            txFlow: newFlow,
            ethAccount: signer.account.address,
          });
        }
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

  const { activeValidators, inActiveValidators } = useMemo(() => {
    const unsortedActiveValidators: Validator[] = [];
    const unsortedInActiveValidators: Validator[] = [];

    validators.forEach((validator) => {
      const isJailed = validator.jailed === true;
      const unsortedValidators = isJailed
        ? unsortedInActiveValidators
        : unsortedActiveValidators;

      unsortedValidators.push(validator);
    });

    // Sort active and inactive validators based on tokens
    const sortedActiveValidators = unsortedActiveValidators.sort((a, b) =>
      BigInt(a.tokens) < BigInt(b.tokens) ? 1 : -1
    );
    const sortedInActiveValidators = unsortedInActiveValidators.sort((a, b) =>
      BigInt(a.tokens) < BigInt(b.tokens) ? 1 : -1
    );

    // Add ranks based on the sorted order
    const activeValidators = sortedActiveValidators.map((validator, index) => ({
      ...validator,
      rank: index + 1,
    }));

    const inActiveValidators = sortedInActiveValidators.map(
      (validator, index) => ({
        ...validator,
        rank: index + 1,
      })
    );

    return { activeValidators, inActiveValidators };
  }, [validators]);

  const filteredValidators = useMemo(() => {
    if (searchQuery != "") {
      setCurrentPage(1);
      return currentFilter == "ACTIVE"
        ? activeValidators.filter((validator) =>
            validator.description.moniker
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        : inActiveValidators.filter((validator) =>
            validator.description.moniker
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
    }
    return currentFilter == "ACTIVE" ? activeValidators : inActiveValidators;
  }, [searchQuery, currentFilter, activeValidators, inActiveValidators]);

  const pageSize = PAGE_NUMBER;

  const totalPages = useMemo(
    () => Math.ceil(filteredValidators.length / pageSize),
    [filteredValidators.length]
  );

  const paginatedvalidators: Validator[] = filteredValidators.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const hasUserStaked: boolean =
    userStaking && userStaking.validators && userStaking.validators.length > 0
      ? true
      : false;

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

  function handleClick(validator: Validator) {
    selection.setValidator(validator.operator_address);
  }

  function handleRewardsClaimClick(
    signer: GetWalletClientResult | undefined,
    validatorAddresses: string[]
  ) {
    if (signer && signer.account) {
      const { data: newFlow, error } = transaction.createNewStakingFlow({
        chainId: chainId,
        ethAccount: signer.account.address,
        txType: StakingTxTypes.CLAIM_REWARDS,
        validatorAddresses: validatorAddresses,
      });
      if (error) throw error;
      if (newFlow) {
        txStore?.addNewFlow({
          txFlow: newFlow,
          ethAccount: signer.account.address,
        });
      }
    }
    return NEW_ERROR("signer not available", errMsg("account not connected"));
  }
  const tabletobeLoaded = isLoading;

  // console.log(tabletobeLoaded);
  // console.log(paginatedvalidators);
  // console.log(activeValidators);
  // console.log(filteredValidators);

  return tabletobeLoaded ? (
    <Splash />
  ) : (
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
            <p> </p>
            <Icon
              themed
              icon={{
                url: "/tokens/canto.svg",
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
                url: "/tokens/canto.svg",
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
              ...userStaking.unbonding.map((userStakingElement, index) =>
                GenerateUnbondingDelegationsTableRow(userStakingElement, index)
              ),
            ]}
          />
          <Spacer height="40px" />
        </div>
      )}

      {validators.length > 0 && (
        <Container width="100%" className={styles.tableContainer}>
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
                    VALIDATORS
                  </Text>
                </div>
                <div className={styles.searchBarContainer}>
                  <div>
                    <Input
                      height={40}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        //console.log("inside function");
                      }}
                      placeholder={"Search..."}
                    />
                  </div>
                </div>
              </div>
            }
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
                    <div
                      key="Pagination"
                      className={styles.paginationContainer}
                    >
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
                : [
                    <div key="noData" className={styles.noValidatorContainer}>
                      <Text font="proto_mono" size="lg">
                        NO VALIDATORS FOUND
                      </Text>
                    </div>,
                  ]
            }
            isPaginated={true}
          />

          <Spacer height="80px" />
        </Container>
      )}

      <Modal
        width="32rem"
        onClose={() => {
          selection.setValidator(null);
        }}
        title="STAKE"
        closeOnOverlayClick={false}
        open={selection.validator != null}
      >
        <StakingModal
          validators={validators}
          userStaking={userStaking}
          validator={selection.validator}
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
        />
      </Modal>
    </div>
  );
}
