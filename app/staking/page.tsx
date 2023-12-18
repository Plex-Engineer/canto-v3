"use client";
import AnimatedBackground from "@/components/animated_background/animatedBackground";
import BoxedBackground from "@/components/boxes_background/boxesBackground";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import useStaking from "@/hooks/staking/useStaking";
import styles from './staking.module.scss';
import Text from "@/components/text";
import Spacer from "@/components/layout/spacer";
import Container from "@/components/container/container";
import Button from "@/components/button/button";
import Icon from "@/components/icon/icon";
import { convertToBigNumber, displayAmount, formatBalance, formatBigBalance } from "@/utils/formatting/balances.utils";
import BigNumber from "bignumber.js";
import { formatPercent } from "@/utils/formatting";
import Table from "@/components/table/table";
import Splash from "@/components/splash/splash";
import { GenerateMyStakingTableRow, GenerateValidatorTableRow } from "./components/validatorTableRow";
import { useEffect, useState } from "react";
import { StakingModal } from "./components/stakingModal/StakingModal";
import { Validator } from "@/hooks/staking/interfaces/validators";
import Modal from "@/components/modal/modal";

import { StakingTransactionParams, StakingTxTypes } from "@/hooks/staking/interfaces/stakingTxTypes";
import { ethToCantoAddress } from "@/utils/address";
import { NewTransactionFlow } from "@/transactions/flows/types";
import { TransactionFlowType } from "@/transactions/flows/flowMap";
import { NEW_ERROR } from "@/config/interfaces";
import Tabs from "@/components/tabs/tabs";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import { GetWalletClientResult } from "wagmi/actions";


export default function StakingPage() {

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [selectedValidatorToRedelegate, setSelectedValidatorToRedelegate] = useState<Validator | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("ACTIVE");
  

  //const [selectedTx,setSelectedTx] = useState<StakingTxTypes>(StakingTxTypes.DELEGATE);

  
  

  function handleStakingTxClick(validator: Validator | null,inputAmount: string,txType: StakingTxTypes,validatorToRedelegate: Validator | null | undefined){

    if(txType==StakingTxTypes.REDELEGATE){
      const newFlow: NewTransactionFlow = {
        icon: "",
        txType: TransactionFlowType.STAKE_CANTO_TX,
        title: "Stake Canto",
        params: {
          chainId: chainId,
          ethAccount: signer?.account.address ?? "",
          txType: txType,
          validatorAddress: validator?.operator_address ?? "",
          newValidatorAddress: validatorToRedelegate?.operator_address,
          newValidatorName: validatorToRedelegate?.description.moniker,
          amount: (
            convertToBigNumber(inputAmount, 18).data ?? "0"
          ).toString(),  
          validatorName: validator?.description.moniker ?? ""
        },
      };
      txStore?.addNewFlow({ txFlow: newFlow, signer });
    }else{
      const newFlow: NewTransactionFlow = {
        icon: "",
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
          validatorName: validator?.description.moniker ?? ""
        },
      };
      txStore?.addNewFlow({ txFlow: newFlow, signer });
    }

    
  }

  const {txStore,signer,chainId} = useCantoSigner();


  

  const { isLoading,validators, apr, userStaking, selection, transaction } = useStaking({
    chainId: chainId,
    userEthAddress: signer?.account.address,
  });

  

  const allValidatorsAddresses = validators.map((validator)=>{return validator.operator_address});
  const allUserValidatorsAddresses: string[]  = userStaking? userStaking.validators.map((validator)=>{return validator.operator_address}) : [];

  function createStakingParams(chainId: number, ethAccount : string, txType: StakingTxTypes, amount: string, validator1: Validator, validatorNew: Validator){
      if(txType==StakingTxTypes.CLAIM_REWARDS){
        return {
          chainId: chainId,
          txType: txType,
          ethAccount: ethAccount,
          validatorAddresses: allValidatorsAddresses
          
        };
      }
      if(txType==StakingTxTypes.DELEGATE || txType==StakingTxTypes.UNDELEGATE){
        return {
          chainId: chainId,
          txType: txType,
          amount: amount,
          ethAccount: ethAccount,
          validatorAddress: validator1?.operator_address,
          validatorName: validator1?.description.moniker,
        };
      }
      if(txType== StakingTxTypes.REDELEGATE){
        if(validatorNew){
          return {
            chainId: chainId,
            txType: txType,
            amount: amount,
            ethAccount: ethAccount,
            validatorAddress: validator1?.operator_address,
            validatorName: validator1?.description.moniker,
            newValidatorAddress: validatorNew?.operator_address
          };
        }
        
      }
      
  }
  

  //console.log(userStaking?.validators);
  //console.log(isLoading);
  //console.log(validators);
  //console.log(apr);
  //console.log(userStaking);
  //console.log((BigNumber(validators[1].tokens).dividedBy(new BigNumber(10).pow(18))).toString());
  // console.log(userStaking);
  // console.log(selection);
  // console.log(transaction);
  if(validators){
    validators.sort((a, b) => {
      // Convert the string representation of tokens to BigInt
      let tokensA = BigInt(a.tokens);
      let tokensB = BigInt(b.tokens);
    
      // Compare the BigInt values
      if (tokensA < tokensB) return 1;
      if (tokensA > tokensB) return -1;
      return 0;
    });
  }
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(validators.length / pageSize));

  const activeValidators = validators.filter(v=>v.jailed==false);
  const inActiveValidators = validators.filter(v=>v.jailed==true);

  const filteredvalidators = (currentFilter=="ACTIVE")? activeValidators : inActiveValidators;

  
  const validatorTitleMap = new Map<string,string>();
  validatorTitleMap.set("ACTIVE","ACTIVE VALIDATORS");
  validatorTitleMap.set("INACTIVE","INACTIVE VALIDATORS");
  

  const paginatedvalidators = filteredvalidators.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const hasUserStaked: boolean | undefined = (userStaking && userStaking.validators && userStaking.validators.length>0);
  const totalStaked: number | undefined = hasUserStaked ? userStaking?.validators.reduce((sum, item) => {
    const amountNumber = parseFloat(formatBalance(item.userDelegation.balance,18)); 
    return sum + amountNumber;
  }, 0): 0;

  const totalRewards: number | undefined = hasUserStaked ? userStaking?.validators.reduce((sum , item) => {
    console.log(parseFloat(formatBalance(item.userDelegation.rewards,18)));
    const amountNumber = parseFloat(formatBalance(item.userDelegation.rewards,18));
    console.log(sum);
    return (sum + amountNumber);
  }, 0): 0;
  console.log();
  

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

  useEffect(() => {
    setTotalPages(Math.ceil(validators.length / pageSize));
  }, [validators.length, pageSize]);
  
  function handleClick(validator: Validator){
    setSelectedValidator(validator);
  }
  
  //console.log(hasUserStaked);
  if(isLoading){
    return(
      <Splash></Splash>
    )
  }
  function handleRewardsClaimClick(signer:GetWalletClientResult | undefined, validatorAddresses: string[])  {
    const newFlow: NewTransactionFlow = {
      icon: "",
      txType: TransactionFlowType.STAKE_CANTO_TX,
      title: "Stake Canto",
      params: {
        chainId: chainId,
        ethAccount: signer?.account.address,
        txType: StakingTxTypes.CLAIM_REWARDS,
        validatorAddresses: validatorAddresses
      },
    };
    txStore?.addNewFlow({ txFlow: newFlow, signer });
  }

  return (
    <div className={styles.container}>
      {/* <Text size="x-lg" font="proto_mono" className={styles.title}>
        Staking
      </Text>
      <Spacer height="20px" /> */}
      <Container direction="row" width="96%" >
        <div className={styles.infoBox}>
          <div><Text font="rm_mono">Total Staked </Text></div>
          <Container direction="row" center={{vertical: true }}>
            <Text font="proto_mono" size='title'>{totalStaked?.toFixed(2)}</Text>
            <Icon
            icon={{
              url: "./tokens/canto.svg",
              size: 24,
            }}
          />
            
            </Container>
        </div>
        <div className={styles.infoBox}>
          <div><Text font="rm_mono">APR</Text></div>
          <Container direction="row" center={{vertical: true }}>
            <Text font="proto_mono" size='title'>{formatPercent((parseFloat(apr)/100).toString())}</Text>
            
            </Container>
        </div>
        <div className={styles.infoBox}>
          <div><Text font="rm_mono">Rewards</Text></div>
          <Container direction="row" center={{vertical: true }}>
            <Text font="proto_mono" size='title'>{totalRewards?.toFixed(5)}</Text>
            <Icon
            icon={{
              url: "./tokens/canto.svg",
              size: 24,
            }}
          />
            
            </Container>
        </div>
        <div className={styles.infoBox}>
          <div className={styles.ClaimBtn}>
            <Button onClick={()=>handleRewardsClaimClick(signer, allUserValidatorsAddresses)} disabled={!signer || !hasUserStaked}>
            Claim Staking Rewards
            </Button>
          </div>
          
        </div>

      </Container>
      <Spacer height="40px"/>
      
      {hasUserStaked && userStaking && <div className={styles.tableContainer} ><Container width="100%" >
        <div className={styles.tableContainer2}>
          <Table
                title="My Staking"
                headers={[
                  { value: <Text opacity={0.4} font="rm_mono">Name</Text>, ratio: 5 },
                  { value: <Text opacity={0.4}>My Stake</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">Validator Total</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">% Share</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">Commission</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">Edit</Text>, ratio: 3 },
                ]}
                content={[...userStaking.validators.map((userStakingElement,index)=>
                  GenerateMyStakingTableRow(userStakingElement, index,()=>handleClick(userStakingElement))
                )]}
            />
          </div>
        </Container>
        <Spacer height="40px"/>
      </div>
      }
      <Spacer height="40px"/>
      <Container width="100%" className={styles.tableContainer} >
        <div>
          <Table
                title={validatorTitleMap.get(currentFilter)}
                // secondary={
                //   <div className={styles.TabRow}>
                //     <div className={styles.Tab}>ACTIVE VALIDATORS</div>
                //     <div className={styles.Tab}>INACTIVE VALIDATORS</div>
                //   </div>
                // }
                secondary={
                  <Container width="400px">
                    <ToggleGroup
                      options={["ACTIVE","INACTIVE"]}
                      selected={currentFilter}
                      setSelected={(value) => {
                        setCurrentFilter(value);
                      }}
                      
                    />
                  </Container>
                }
                headers={[
                  { value: <Text opacity={0.4} font="rm_mono">Name</Text>, ratio: 6 },
                  { value: <Text opacity={0.4}>Validator Total</Text>, ratio: 4 },
                  { value: <Text opacity={0.4} font="rm_mono">Commission %</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">Action</Text>, ratio: 4 },
                ]}
                content={[...paginatedvalidators.map((validator,index)=>
                  GenerateValidatorTableRow(validator,index,()=>handleClick(validator))
                )]}
            />
          </div>
          
            <div className={styles.paginationContainer}>
              <Button onClick={handlePrevious} disabled={currentPage === 1}>
                Previous
              </Button>
              <Button onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
            <Spacer height="80px" />
          
      </Container>
      {/* <Container>
        <Tabs 
          tabs={
            [
              {
                title:"Active Validators",
                content: (<div>
                  <div>
          <Table
                title="VALIDATORS"
                headers={[
                  { value: <Text opacity={0.4} font="rm_mono">Name</Text>, ratio: 6 },
                  { value: <Text opacity={0.4}>Validator Total</Text>, ratio: 4 },
                  { value: <Text opacity={0.4} font="rm_mono">Commission %</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">Delegators</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">Action</Text>, ratio: 4 },
                ]}
                content={[...paginatedvalidators.map((validator,index)=>
                  GenerateValidatorTableRow(validator,index,()=>handleClick(validator))
                )]}
            />
          </div>
                </div>)
              },
              {
                title:"InActive Validators",
                content: (<div></div>)
              }
            ]
          }
        >
          
        </Tabs>
      </Container> */}
      {/* <BoxedBackground /> */}
      <Modal width="40%" onClose={()=>{setSelectedValidator(null)}} title={selectedValidator?.description.moniker} 
            closeOnOverlayClick={false}
            open={selectedValidator!=null}
        >
          <StakingModal validators={validators} userStaking={userStaking} validator={selectedValidator} signer= {signer} onConfirm={(selectedValidator,inputAmount,selectedTx,validatorToRedelegate) => handleStakingTxClick(selectedValidator,inputAmount,selectedTx,validatorToRedelegate)}></StakingModal>
      </Modal>
      

      
    </div>
  );
}
