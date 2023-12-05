"use client";
import Container from "@/components/container/container";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import { Validator } from "@/hooks/staking/interfaces/validators";
import { GetWalletClientResult } from "wagmi/actions";
import styles from "./StakingModal.module.scss";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { formatBalance } from "@/utils/formatting/balances.utils";
import Input from "@/components/input/input";
import Button from "@/components/button/button";
import { useState } from "react";

export const StakingModal = ({validator, signer, onConfirm}:{validator: Validator | null, signer: GetWalletClientResult | undefined, onConfirm: (validator:Validator | null,inputAmount: string )=>void}) => {

    
    const [inputAmount, setInputAmount] = useState("");
    if(!validator){
        return;
    }
    return (
        
            <Container className={styles.modalContainer}>
                <Spacer/>
                <Container className={styles.spacer}><Spacer ></Spacer></Container>
                <Spacer height="40px"/>
                <Text>{validator?.description.moniker}</Text>
                <Spacer height="20px"></Spacer>
                <div className={styles.modalInfoRow}>
                    <div><Text>Available Balance</Text></div>
                    <div>
                        <Text>
                            {formatBalance(validator.tokens,18,{commify:true})}
                            <Icon themed icon={{ url: "/tokens/canto.svg", size: 20 }} />
                        </Text>
                    </div>
                </div>
                <div className={styles.modalInfoRow}>
                    <Text>Delegation</Text>
                    <Text>
                        {formatBalance(validator.tokens,18,{commify:true})}
                        <Icon themed icon={{ url: "/tokens/canto.svg", size: 20 }} />
                    </Text>
                </div>
                <div className={styles.modalInfoRow}>
                    <Text>Commission</Text>
                    <Text>
                        {formatBalance(validator.commission,-2,{commify:true,precision:2})}%
                    </Text>
                </div>
                <div>
                    <Input
                    height={"lg"}
                    type="number"
                    onChange={(e)=>{setInputAmount(e.target.value)}}
                    placeholder={Number(0.0).toString()}
                    value={inputAmount.toString()}
                    error={Number(1) <= 0}
                    errorMessage="Deadline must be greater than 0 mins"/>
                    
                </div>
                <div className={styles.modalInfoRow}>
                    <Text>Enter Amount</Text>
                    <div >
                        <Text opacity={0.4}>Balance: {formatBalance(validator.commission,-2,{commify:true,precision:2})}</Text><Text opacity={1}>(max)</Text>
                    </div>
                </div>
                <div style={{width: "100%"}} className={styles.modalInfoRow} >
                    <Text size="sm">
                        Please Note: Staking will lock up your funds for 21 days once you undelegate your staked canto, you will need to wait 21 days for your tokens to be liquid.
                    </Text>
                    
                </div>
                <Spacer height="20px"></Spacer>
                <div className={styles.buttonContainer}>
                    <Button onClick={()=>{onConfirm(validator,inputAmount)}}>Delegate</Button>
                </div>

            </Container>
    );
}