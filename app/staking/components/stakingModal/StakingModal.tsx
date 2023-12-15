"use client";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import { UserUnbondingDelegation, Validator, ValidatorWithDelegations } from "@/hooks/staking/interfaces/validators";
import { GetWalletClientResult } from "wagmi/actions";
import styles from "./StakingModal.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { formatBalance } from "@/utils/formatting/balances.utils";
import Input from "@/components/input/input";
import Button from "@/components/button/button";
import { SetStateAction, useState } from "react";
import Tabs from "@/components/tabs/tabs";
import { StakingTxTypes } from "@/hooks/staking/interfaces/stakingTxTypes";
import { StakingTabs } from "../stakingTab/StakingTabs";
import { getBalanceForValidator } from "@/hooks/staking/helpers/userStaking";
import Selector, { Item } from "@/components/selector/selector";


export interface StakingModalParams{
    validator: Validator | null,
    userStaking?: {
        validators: ValidatorWithDelegations[];
        unbonding: UserUnbondingDelegation[];
        cantoBalance: string;
      };
    signer: GetWalletClientResult | undefined, 
    onConfirm: (validator:Validator | null,inputAmount: string,selectedTx: StakingTxTypes, validatorToRedelegate: Validator | null | undefined )=>void,
    validators: Validator[]
}
export const StakingModal = (props : StakingModalParams) => {

    
    const [inputAmount, setInputAmount] = useState("");
    const [selectedTx,setSelectedTx] = useState<StakingTxTypes>(StakingTxTypes.DELEGATE);
    const [activeTab, setActiveTab] = useState('delegate');
    const [amount, setAmount] = useState('');
    const [validatorToRedelegate, setValidatorToRedelegate] = useState<Validator | null>();

    const dropdownItems = props.validators.map((validator)=>{
        return{
            name: validator.description.moniker,
            icon: "/tokens/canto.svg",
            id: validator.operator_address
        }
        
    });
    console.log(validatorToRedelegate);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setAmount('');
    if(tab=='delegate'){
        setSelectedTx(StakingTxTypes.DELEGATE);
    }if(tab=='undelegate'){
        setSelectedTx(StakingTxTypes.UNDELEGATE);
    }
    if(tab=='redelegate'){
        setSelectedTx(StakingTxTypes.REDELEGATE);
    }
  };
    if(!props.validator){
        return;
    }
    console.log(props.userStaking);

    let userDelegationBalance: string | null = "0";

    if(props.userStaking?.validators){
        userDelegationBalance = getBalanceForValidator(props.userStaking?.validators,props.validator.operator_address);
    }

    //const getUserDelegationBalance = 
    const userMaxBalance = userDelegationBalance? userDelegationBalance : "0";

    console.log(userMaxBalance);
    return (
        
            <Container className={styles.modalContainer}>
                <Spacer/>
                <Container className={styles.spacer}><Spacer ></Spacer></Container>
                <Spacer height="40px"/>
                <Text>{props.validator?.description.moniker}</Text>
                <Spacer height="20px"></Spacer>
                <div className={styles.modalInfoRow}>
                    <div><Text>Available Balance</Text></div>
                    <div>
                        <Text>
                            {formatBalance(props.validator.tokens,18,{commify:true})}
                            <Icon themed icon={{ url: "/tokens/canto.svg", size: 16 }} />
                        </Text>
                    </div>
                </div>
                <Spacer height="10px"></Spacer>
                <div className={styles.modalInfoRow}>
                    <Text>Delegation</Text>
                    <Text>
                        {formatBalance(props.validator.tokens,18,{commify:true})}
                        <Icon themed icon={{ url: "/tokens/canto.svg", size: 16 }} />
                    </Text>
                </div>
                <Spacer height="10px"></Spacer>
                <div className={styles.modalInfoRow}>
                    <Text>Commission</Text>
                    <Text>
                        {formatBalance(props.validator.commission,-2,{commify:true,precision:2})}%
                    </Text>
                </div>
                <Spacer height="20px"></Spacer>
                <StakingTabs handleTabChange={handleTabChange} activeTab={activeTab}></StakingTabs>
                <Spacer height="20px"></Spacer>
                {
                    (selectedTx==StakingTxTypes.REDELEGATE) && 
                    <div>
                        <Selector title=""  items={dropdownItems} activeItem={validatorToRedelegate ? 
                            {
                                name: validatorToRedelegate?.description.moniker,
                                icon: "/tokens/canto.svg",
                                id: validatorToRedelegate.operator_address
                            }
                            : 
                            {
                            name: "Select Validator",
                            icon: "loader.svg",
                            id: "",
                          }} 
                          groupedItems={[]} label={{text:"", width: "10px"}} onChange={(selectedValidator)=>{setValidatorToRedelegate(props.validators.find(e=>e.operator_address==selectedValidator))}} />
                            
                        
                        <Spacer height="20px"></Spacer>
                    </div>
                }
                <div className={styles.modalInfoRow}>
                    <div><Text>Enter Amount</Text></div>
                    <div className={styles.modalInfoRow2}>
                        <div>
                            <Text opacity={0.4}>Balance: {formatBalance(userMaxBalance ,18,{commify:true,precision:2})} </Text>
                        </div>
                        <div>
                            <Text opacity={1}>(max)</Text>
                        </div>
                        
                    </div>
                </div>
                <div>
                    <Input
                    height={"lg"}
                    type="number"
                    onChange={(e)=>{setInputAmount(e.target.value)}}
                    placeholder={Number(0.0).toString()}
                    value={inputAmount.toString()}
                    error={Number(inputAmount) < 0}
                    errorMessage="Amount must be greater than 0"/>
                    
                </div>
                
                <div style={{width: "100%"}} className={styles.modalInfoRow} >
                    <Text size="x-sm" color="#EE4B2B">
                        Please Note: Staking will lock up your funds for 21 days once you undelegate your staked canto, you will need to wait 21 days for your tokens to be liquid.
                    </Text>
                    
                </div>
                <Spacer height="20px"></Spacer>
                <div className={styles.buttonContainer}>
                    <Button width="fill" onClick={()=>{props.onConfirm(props.validator,inputAmount,selectedTx,validatorToRedelegate)}} disabled={Number(inputAmount)<=0 || 
                    (selectedTx==StakingTxTypes.REDELEGATE && !validatorToRedelegate)}>Delegate</Button>
                </div>

            </Container>
    );
}