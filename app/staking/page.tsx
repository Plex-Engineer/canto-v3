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
import { GenerateValidatorTableRow } from "./components/validatorTableRow";
import { useState } from "react";
import { StakingModal } from "./components/stakingModal/StakingModal";
import { Validator } from "@/hooks/staking/interfaces/validators";
import Modal from "@/components/modal/modal";
import { NewTransactionFlow } from "@/config/interfaces/transactions/txFlows";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { StakingTxTypes } from "@/hooks/staking/interfaces/stakingTxTypes";
import { ethToCantoAddress } from "@/utils/address";


export default function StakingPage() {

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);


  function handleStakingClick(validator: Validator | null,inputAmount: string ){

    const newFlow: NewTransactionFlow = {
      icon: "",
      txType: TransactionFlowType.STAKE_CANTO_TX,
      title: "Vote Tx",
      params: {
        chainId: chainId,
        ethAccount: signer?.account.address ?? "",
        txType: StakingTxTypes.DELEGATE,
        validatorAddress: validator?.operator_address ?? "",
        amount: (
          convertToBigNumber(inputAmount, 18).data ?? "0"
        ).toString(),  
        validatorName: validator?.description.moniker ?? ""
      },
    };
    txStore?.addNewFlow({ txFlow: newFlow, signer });
  }

  const {txStore,signer,chainId} = useCantoSigner();


  

  const { isLoading,validators, apr, userStaking, selection, transaction } = useStaking({
    chainId: chainId,
    userEthAddress: signer?.account.address,
  });
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
  function handleClick(validator: Validator){
    setSelectedValidator(validator);
  }
  if(isLoading){
    return(
      <Splash></Splash>
    )
  }
  return (
    <div className={styles.container}>
      {/* <Text size="x-lg" font="proto_mono" className={styles.title}>
        Staking
      </Text>
      <Spacer height="20px" /> */}
      <Container direction="row" width="96%" >
        <div className={styles.infoBox}>
          <div>Total Staked</div>
          <Container direction="row" center={{vertical: true }}>
            <Text font="proto_mono" size='title'>0</Text>
            <Icon
            icon={{
              url: "./tokens/canto.svg",
              size: 24,
            }}
          />
            
            </Container>
        </div>
        <div className={styles.infoBox}>
          <div>APR</div>
          <Container direction="row" center={{vertical: true }}>
            <Text font="proto_mono" size='title'>{formatPercent((parseFloat(apr)/100).toString())}</Text>
            
            </Container>
        </div>
        <div className={styles.infoBox}>
          <div>Rewards</div>
          <Container direction="row" center={{vertical: true }}>
            <Text font="proto_mono" size='title'>0</Text>
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
            <Button>
              Claim Staking Rewards
            </Button>
          </div>
          
        </div>

      </Container>
      <Spacer height="40px"/>
      <Container width="100%">
          <Table
                title=""
                headers={[
                  { value: <Text opacity={0.4} font="rm_mono">Name</Text>, ratio: 6 },
                  { value: <Text opacity={0.4}>Validator Total</Text>, ratio: 4 },
                  { value: <Text opacity={0.4} font="rm_mono">Commission %</Text>, ratio: 3 },
                  { value: <Text opacity={0.4} font="rm_mono">Voting Participation</Text>, ratio: 5 },
                  { value: <Text opacity={0.4} font="rm_mono">Delegators</Text>, ratio: 3 },
                  { value: "", ratio: 4 },
                ]}
                content={[...validators.map((validator,index)=>
                  GenerateValidatorTableRow(validator,index,()=>handleClick(validator))
                )]}
            />
          <div></div>
      </Container>
      <h1>Staking Page</h1>
      {/* <BoxedBackground /> */}
      <Modal width="40%" onClose={()=>{setSelectedValidator(null)}} title={selectedValidator?.description.moniker} 
            closeOnOverlayClick={false}
            open={selectedValidator!=null}
        >
          <StakingModal validator={selectedValidator} signer= {signer} onConfirm={(selectedValidator,inputAmount) => handleStakingClick(selectedValidator,inputAmount)}></StakingModal>
      </Modal>
      

      
    </div>
  );
}
