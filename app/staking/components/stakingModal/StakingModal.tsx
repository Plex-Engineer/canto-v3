"use client";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import {
  Validator,
  ValidatorWithDelegations,
} from "@/hooks/staking/interfaces/validators";
import styles from "./StakingModal.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { displayAmount } from "@/utils/formatting/balances.utils";
import Button from "@/components/button/button";
import { useMemo, useState } from "react";
import { StakingTxTypes } from "@/transactions/staking";
import { StakingTabs } from "../stakingTab/StakingTabs";
import Selector from "@/components/selector/selector";
import Amount from "@/components/amount/amount";
import { Validation } from "@/config/interfaces";
import { levenshteinDistance } from "@/utils/staking/searchUtils";

interface StakingModalParams {
  validator: ValidatorWithDelegations | null;
  cantoBalance: string;
  txValidation: (
    amount: string,
    selectedTx: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) => Validation;
  onConfirm: (
    amount: string,
    selectedTx: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) => void;
  validators: Validator[];
}
export const StakingModal = (props: StakingModalParams) => {
  const [inputAmount, setInputAmount] = useState("");

  const [selectedTx, setSelectedTx] = useState<StakingTxTypes>(
    StakingTxTypes.DELEGATE
  );
  const [activeTab, setActiveTab] = useState<
    "delegate" | "undelegate" | "redelegate"
  >("delegate");
  const [validatorToRedelegate, setValidatorToRedelegate] =
    useState<Validator | null>();
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownItems =
    searchQuery == ""
      ? props.validators
          .filter(
            (validator) =>
              validator.operator_address !==
                props.validator?.operator_address && validator.jailed == false
          )
          .map((validator) => {
            return {
              name: validator.description.moniker,
              id: validator.operator_address,
            };
          })
      : [...props.validators]
          .filter((validator) => validator.jailed == false)
          .sort((a, b) => {
            return levenshteinDistance(searchQuery, a.description.moniker) >
              levenshteinDistance(searchQuery, b.description.moniker)
              ? 1
              : -1;
          })
          .filter(
            (e) => levenshteinDistance(searchQuery, e.description.moniker) < 5
          )
          .map((validator) => {
            return {
              name: validator.description.moniker,
              id: validator.operator_address,
            };
          });

  const handleTabChange = (tab: "delegate" | "undelegate" | "redelegate") => {
    setActiveTab(tab);
    setInputAmount("");
    if (tab == "delegate") {
      setSelectedTx(StakingTxTypes.DELEGATE);
    }
    if (tab == "undelegate") {
      setSelectedTx(StakingTxTypes.UNDELEGATE);
    }
    if (tab == "redelegate") {
      setSelectedTx(StakingTxTypes.REDELEGATE);
    }
  };

  const txValidation = useMemo(
    () => props.txValidation(inputAmount, selectedTx, validatorToRedelegate),
    [inputAmount, selectedTx, validatorToRedelegate]
  );

  if (!props.validator) {
    return;
  }

  const userDelegationBalance = props.validator.userDelegation.balance;
  const maxAmount =
    selectedTx == StakingTxTypes.DELEGATE
      ? props.cantoBalance
      : userDelegationBalance;

  return (
    <Container className={styles.modalContainer}>
      <Spacer />
      <Container className={styles.spacer}>
        <Spacer></Spacer>
      </Container>
      <Spacer height="40px" />
      <Text weight="bold">{props.validator?.description.moniker}</Text>
      <Spacer height="20px"></Spacer>
      <div className={styles.modalInfoRow}>
        <div>
          <Text>Available Balance</Text>
        </div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: "5px" }}>
            <Text>
              {displayAmount(props.cantoBalance, 18, {
                short: false,
                precision: 2,
              })}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Icon themed icon={{ url: "/tokens/canto.svg", size: 16 }} />
          </div>
        </div>
      </div>
      <Spacer height="10px"></Spacer>
      <div className={styles.modalInfoRow}>
        <Text>Delegation</Text>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: "5px" }}>
            <Text>
              {displayAmount(
                userDelegationBalance ? userDelegationBalance : "0",
                18,
                { short: false, precision: 2 }
              )}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Icon themed icon={{ url: "/tokens/canto.svg", size: 16 }} />
          </div>
        </div>
      </div>
      <Spacer height="10px"></Spacer>
      <div className={styles.modalInfoRow}>
        <Text>Commission</Text>
        <Text>
          {displayAmount(props.validator.commission, -2, {
            commify: true,
            precision: 2,
          })}
          %
        </Text>
      </div>
      <Spacer height="20px"></Spacer>
      {userDelegationBalance !== "0" && (
        <StakingTabs handleTabChange={handleTabChange} activeTab={activeTab} />
      )}
      <Spacer height="20px"></Spacer>
      {selectedTx == StakingTxTypes.REDELEGATE && (
        <div>
          <Selector
            title="Redelegate"
            items={dropdownItems}
            activeItem={
              validatorToRedelegate
                ? {
                    name: validatorToRedelegate?.description.moniker,
                    id: validatorToRedelegate.operator_address,
                  }
                : {
                    name: "Select Validator",
                    id: "",
                  }
            }
            label={{ text: "", width: "10px" }}
            onChange={(selectedValidator) => {
              setValidatorToRedelegate(
                props.validators.find(
                  (e) => e.operator_address == selectedValidator
                )
              );
            }}
            searchProps={{
              setSearchQuery: setSearchQuery,
              searchQuery: searchQuery,
            }}
          />

          <Spacer height="20px"></Spacer>
        </div>
      )}
      <div className={styles.modalInfoRow}>
        <div>
          <Text>Enter Amount</Text>
        </div>
        <div className={styles.modalInfoRow2}></div>
      </div>
      <div>
        <Amount
          IconUrl={"/canto.svg"}
          title={"CANTO"}
          symbol={"CANTO"}
          onChange={(val) => {
            setInputAmount(val.target.value);
          }}
          decimals={18}
          value={inputAmount}
          min={"0"}
          max={maxAmount}
        />
      </div>
      <Spacer height="10px" />
      <div style={{ width: "100%" }} className={styles.modalInfoRow}>
        <Text size="x-sm" color="#EE4B2B">
          Please Note: Undelegation period is 21 days
        </Text>
      </div>
      <Spacer height="20px"></Spacer>
      <div className={styles.buttonContainer}>
        <Button
          width="fill"
          onClick={() => {
            props.onConfirm(inputAmount, selectedTx, validatorToRedelegate);
          }}
          disabled={txValidation.error}
        >
          {selectedTx}
        </Button>
      </div>
    </Container>
  );
};
