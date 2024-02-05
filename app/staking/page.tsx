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
import { formatPercent } from "@/utils/formatting";
import Table from "@/components/table/table";
import Splash from "@/components/splash/splash";
import {
  GenerateMyStakingTableRow,
  GenerateUnbondingDelegationsTableRow,
  GenerateValidatorTableRow,
} from "./components/validatorTableRow";
import { useMemo, useState } from "react";
import { StakingModal } from "./components/stakingModal/StakingModal";
import { Validator } from "@/hooks/staking/interfaces/validators";
import Modal from "@/components/modal/modal";
import {
  StakingTransactionParams,
  StakingTxTypes,
} from "@/transactions/staking";
import { NEW_ERROR, Validation } from "@/config/interfaces";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import { GetWalletClientResult } from "wagmi/actions";
import Input from "@/components/input/input";
import { PAGE_NUMBER } from "@/config/consts/config";
import { Pagination } from "@/components/pagination/Pagination";
import { levenshteinDistance } from "@/utils/staking/searchUtils";
import { WalletClient } from "wagmi";
import Analytics from "@/provider/analytics";
import clsx from "clsx";

export default function StakingPage() {
  // connected user info
  const { txStore, signer, chainId } = useCantoSigner();

  // staking hook
  const { isLoading, validators, apr, userStaking, selection, transaction } =
    useStaking({
      chainId: chainId,
      userEthAddress: signer?.account.address,
    });

  // handle txs
  function handleRewardsClaimClick(
    signer: GetWalletClientResult | undefined,
    validatorAddresses: string[]
  ) {
    if (signer && signer.account) {
      const newFlow = transaction.newStakingFlow({
        chainId: chainId,
        ethAccount: signer.account.address,
        txType: StakingTxTypes.CLAIM_REWARDS,
        validatorAddresses: validatorAddresses,
      });
      txStore?.addNewFlow({
        txFlow: newFlow,
        ethAccount: signer.account.address,
      });
    }
    return NEW_ERROR("signer not available");
  }

  const stakingTxParams = (
    signer: WalletClient,
    inputAmount: string,
    txType: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ): StakingTransactionParams | null => {
    return selection.validator
      ? txType == StakingTxTypes.REDELEGATE
        ? {
            chainId: chainId,
            ethAccount: signer.account.address,
            txType: StakingTxTypes.REDELEGATE,
            validator: selection.validator,
            newValidatorAddress: validatorToRedelegate
              ? validatorToRedelegate.operator_address
              : "",
            newValidatorName: validatorToRedelegate?.description.moniker,
            amount: (
              convertToBigNumber(inputAmount, 18).data ?? "0"
            ).toString(),
          }
        : txType == StakingTxTypes.DELEGATE ||
            txType == StakingTxTypes.UNDELEGATE
          ? {
              chainId: chainId,
              ethAccount: signer.account.address,
              txType: txType,
              validator: selection.validator,
              amount: (
                convertToBigNumber(inputAmount, 18).data ?? "0"
              ).toString(),
              nativeBalance: userStaking?.cantoBalance ?? "0",
            }
          : null
      : null;
  };

  function handleStakingTxClick(
    inputAmount: string,
    txType: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) {
    if (signer) {
      const txParams = stakingTxParams(
        signer,
        inputAmount,
        txType,
        validatorToRedelegate
      );
      if (txParams) {
        const newFlow = transaction.newStakingFlow(txParams);
        txStore?.addNewFlow({
          txFlow: newFlow,
          ethAccount: signer.account.address,
        });
      }
    }
  }
  function canConfirmTx(
    inputAmount: string,
    txType: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ): Validation {
    if (signer) {
      const txParams = stakingTxParams(
        signer,
        inputAmount,
        txType,
        validatorToRedelegate
      );
      if (txParams) {
        return transaction.validateTxParams(txParams);
      }
    }
    return { error: true, reason: "signer not available" };
  }

  // filers and search
  const [currentFilter, setCurrentFilter] = useState<string>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
        ? [...activeValidators]
            .sort((a, b) => {
              return levenshteinDistance(searchQuery, a.description.moniker) >
                levenshteinDistance(searchQuery, b.description.moniker)
                ? 1
                : -1;
            })
            .filter(
              (e) => levenshteinDistance(searchQuery, e.description.moniker) < 6
            )
        : [...inActiveValidators]
            .sort((a, b) => {
              return levenshteinDistance(searchQuery, a.description.moniker) >
                levenshteinDistance(searchQuery, b.description.moniker)
                ? 1
                : -1;
            })
            .filter(
              (e) => levenshteinDistance(searchQuery, e.description.moniker) < 6
            );
    }
    return currentFilter == "ACTIVE" ? activeValidators : inActiveValidators;
  }, [currentFilter, activeValidators, inActiveValidators, searchQuery]);

  const totalPages = useMemo(
    () => Math.ceil(filteredValidators.length / PAGE_NUMBER),
    [filteredValidators.length]
  );

  const paginatedvalidators: Validator[] = filteredValidators.slice(
    (currentPage - 1) * PAGE_NUMBER,
    currentPage * PAGE_NUMBER
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
  const handlePageClick = (index: number) => {
    setCurrentPage(index);
  };

  function handleClick(validator: Validator) {
    selection.setValidator(validator.operator_address);
  }

  return isLoading ? (
    <Splash themed />
  ) : (
    <div className={styles.container}>
      <div>
        <Spacer height="20px" />
      </div>
      <Text size="x-lg" font="proto_mono" className={styles.title}>
        STAKING
      </Text>
      <Spacer height="20px" />
      <Container direction="row" gap={20} width="100%">
        <Container gap={20} width="100%">
          {userStaking && userStaking.unbonding.length > 0 && (
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
                {
                  value: <Text opacity={0.4}>Undelegation</Text>,
                  ratio: 2,
                },
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
                  GenerateUnbondingDelegationsTableRow(
                    userStakingElement,
                    index
                  )
                ),
              ]}
            />
          )}
          {hasUserStaked && userStaking && (
            <Table
              title="My Staking"
              headers={[
                {
                  value: (
                    <div style={{ width: "300px" }}>
                      <Text opacity={0.4} font="rm_mono">
                        Name
                      </Text>
                    </div>
                  ),
                  ratio: 5,
                },
                {
                  value: <Text opacity={0.4}>My Stake</Text>,
                  ratio: 3,
                },
                {
                  value: (
                    <Text opacity={0.4} font="rm_mono">
                      Total Stake
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
                  value: <div />,
                  ratio: 3,
                },
              ]}
              content={[
                ...userStaking.validators
                  .filter(
                    (e) =>
                      Number(formatBalance(e.userDelegation.balance, 18)) >
                      0.0000001
                  )
                  .sort((a, b) =>
                    b.userDelegation.balance.localeCompare(
                      a.userDelegation.balance
                    )
                  )
                  .map((userStakingElement, index) =>
                    GenerateMyStakingTableRow(userStakingElement, index, () =>
                      handleClick(userStakingElement)
                    )
                  ),
              ]}
            />
          )}
          {validators.length > 0 && (
            <Table
              title={"VALIDATORS"}
              secondary={
                <Container
                  direction="row"
                  gap={20}
                  width="100%"
                  style={{
                    justifyContent: "flex-end",
                  }}
                >
                  <Input
                    height={38}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={"Search..."}
                  />
                  <Container width="200px">
                    <ToggleGroup
                      options={["ACTIVE", "INACTIVE"]}
                      selected={currentFilter}
                      setSelected={(value) => {
                        Analytics.actions.events.staking.tabSwitched(value);
                        setCurrentFilter(value);
                        setCurrentPage(1);
                        setSearchQuery("");
                      }}
                    />
                  </Container>
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
                {
                  value: (
                    <Text opacity={0.4} font="rm_mono">
                      Total Stake
                    </Text>
                  ),
                  ratio: 4,
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
                  value: <div />,
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
                      <Pagination
                        key="pagination"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePageClick={handlePageClick}
                      />,
                    ]
                  : [
                      <Container
                        key="noData"
                        height="400px"
                        center={{
                          horizontal: true,
                          vertical: true,
                        }}
                      >
                        <Text font="proto_mono" size="lg">
                          NO {currentFilter} VALIDATORS FOUND
                        </Text>
                      </Container>,
                    ]
              }
              isPaginated={true}
            />
          )}
        </Container>
        <Container className={styles.infoCard}>
          <Container direction="column" width="100%" height="100%">
            <div className={styles.infoBox}>
              <div>
                <Text font="rm_mono">Total Staked </Text>
              </div>
              <Container direction="row" center={{ vertical: true }}>
                <div style={{ marginRight: "5px" }}>
                  <Text font="proto_mono" size="title">
                    {displayAmount(
                      totalStaked ? totalStaked.toFixed(2) : "0",
                      0
                    )}
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
            <Spacer height="20px" />
            <Button
              width={"fill"}
              height="large"
              onClick={() =>
                handleRewardsClaimClick(signer, allUserValidatorsAddresses)
              }
              disabled={!signer || !hasUserStaked}
            >
              Claim Rewards
            </Button>
          </Container>
        </Container>
      </Container>

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
          validator={selection.validator}
          cantoBalance={userStaking?.cantoBalance ?? "0"}
          validators={validators}
          onConfirm={(amount, selectedTx, validatorToRedelegate) =>
            handleStakingTxClick(amount, selectedTx, validatorToRedelegate)
          }
          txValidation={(amount, selectedTx, validatorToRedelegate) =>
            canConfirmTx(amount, selectedTx, validatorToRedelegate)
          }
        />
      </Modal>
    </div>
  );
}
