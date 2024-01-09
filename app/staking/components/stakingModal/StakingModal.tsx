"use client";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import {
  UserUnbondingDelegation,
  Validator,
  ValidatorWithDelegations,
} from "@/hooks/staking/interfaces/validators";
import { GetWalletClientResult } from "wagmi/actions";
import styles from "./StakingModal.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { formatBalance } from "@/utils/formatting/balances.utils";
import Input from "@/components/input/input";
import Button from "@/components/button/button";
import { ChangeEvent, SetStateAction, useState } from "react";
import Tabs from "@/components/tabs/tabs";
import { StakingTxTypes } from "@/hooks/staking/interfaces/stakingTxTypes";
import { StakingTabs } from "../stakingTab/StakingTabs";
import { getBalanceForValidator } from "@/hooks/staking/helpers/userStaking";
import Selector, { Item } from "@/components/selector/selector";
import Amount from "@/components/amount/amount";

export interface StakingModalParams {
  validator: Validator | null;
  userStaking?: {
    validators: ValidatorWithDelegations[];
    unbonding: UserUnbondingDelegation[];
    cantoBalance: string;
  };
  signer: GetWalletClientResult | undefined;
  onConfirm: (
    validator: Validator | null,
    inputAmount: string,
    selectedTx: StakingTxTypes,
    validatorToRedelegate: Validator | null | undefined
  ) => void;
  validators: Validator[];
}
export const StakingModal = (props: StakingModalParams) => {
  const [inputAmount, setInputAmount] = useState("");
  const [maxClicked, setMaxClicked] = useState(false);

  const [selectedTx, setSelectedTx] = useState<StakingTxTypes>(
    StakingTxTypes.DELEGATE
  );
  const [activeTab, setActiveTab] = useState("delegate");
  const [validatorToRedelegate, setValidatorToRedelegate] =
    useState<Validator | null>();

  const splicedValidators = props.validators.filter(
    (validator) =>
      validator.operator_address !== props.validator?.operator_address
  );

  const dropdownItems = splicedValidators.map((validator) => {
    return {
      name: validator.description.moniker,
      icon: "/tokens/canto.svg",
      id: validator.operator_address,
    };
  });

  const handleTabChange = (tab: string) => {
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
  if (!props.validator) {
    return;
  }
  //console.log(props.userStaking);

  let userDelegationBalance: string | null = "0";

  if (props.userStaking?.validators) {
    userDelegationBalance = getBalanceForValidator(
      props.userStaking?.validators,
      props.validator.operator_address
    );
  }
  //const getUserDelegationBalance =
  const userMaxBalance = userDelegationBalance ? userDelegationBalance : "0";

  const userCantoBalance =
    props.userStaking && props.userStaking.cantoBalance
      ? props.userStaking.cantoBalance
      : "0";

  const maxBalance =
    selectedTx == StakingTxTypes.DELEGATE ? userCantoBalance : userMaxBalance;
  const userStakedValidatorsAddressList = props.userStaking?.validators.map(
    (validatorWithDelegation) => validatorWithDelegation.operator_address
  );
  const hasUserStaked = userStakedValidatorsAddressList
    ? userStakedValidatorsAddressList.includes(props.validator.operator_address)
    : false;

  const limits = {};

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
              {formatBalance(
                props.userStaking && props.userStaking.cantoBalance
                  ? props.userStaking.cantoBalance
                  : "0",
                18,
                { commify: true, precision: 2 }
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
        <Text>Delegation</Text>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: "5px" }}>
            <Text>
              {formatBalance(
                userDelegationBalance ? userDelegationBalance : "0",
                18,
                { commify: true, precision: 2 }
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
          {formatBalance(props.validator.commission, -2, {
            commify: true,
            precision: 2,
          })}
          %
        </Text>
      </div>
      <Spacer height="20px"></Spacer>
      {hasUserStaked && (
        <StakingTabs
          handleTabChange={handleTabChange}
          activeTab={activeTab}
        ></StakingTabs>
      )}
      <Spacer height="20px"></Spacer>
      {selectedTx == StakingTxTypes.REDELEGATE && (
        <div>
          <Selector
            title=""
            items={dropdownItems}
            activeItem={
              validatorToRedelegate
                ? {
                    name: validatorToRedelegate?.description.moniker,
                    icon: "/tokens/canto.svg",
                    id: validatorToRedelegate.operator_address,
                  }
                : {
                    name: "Select Validator",
                    icon: "loader.svg",
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
          />

          <Spacer height="20px"></Spacer>
        </div>
      )}
      <div className={styles.modalInfoRow}>
        <div>
          <Text>Enter Amount</Text>
        </div>
        <div className={styles.modalInfoRow2}>
          {/* <div>
            <Text opacity={0.4}>
              Balance:{" "}
              {formatBalance(maxBalance, 18, { commify: true, precision: 2 })}{" "}
            </Text>
          </div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() =>
              setInputAmount(
                formatBalance(maxBalance, 18, { commify: true, precision: 2 })
              )
            }
          >
            <Text opacity={1}>(max)</Text>
          </div> */}
        </div>
      </div>
      <div>
        {/* <Input
          height={"lg"}
          type="number"
          onChange={(e) => {
            setInputAmount(e.target.value);
          }}
          placeholder={Number(0.0).toString()}
          value={inputAmount.toString()}
          error={Number(inputAmount) < 0}
          errorMessage="Amount must be greater than 0"
        /> */}
        <Amount
          IconUrl={"/tokens/canto.svg"}
          title={""}
          symbol={""}
          onChange={(val, wasMax) => {
            wasMax ? setMaxClicked(true) : setMaxClicked(false);
            setInputAmount(val.target.value);
          }}
          decimals={18}
          value={inputAmount}
          min={""}
          max={maxBalance}
        ></Amount>
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
            props.onConfirm(
              props.validator,
              inputAmount,
              selectedTx,
              validatorToRedelegate
            );
          }}
          disabled={
            Number(inputAmount) <= 0 ||
            (selectedTx == StakingTxTypes.REDELEGATE &&
              !validatorToRedelegate) ||
            Number(inputAmount) >
              Number(
                formatBalance(maxBalance, 18, { commify: true, precision: 2 })
              )
          }
        >
          {selectedTx}
        </Button>
      </div>
    </Container>
  );
};
