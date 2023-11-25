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
import { displayAmount, formatBalance, formatBigBalance } from "@/utils/formatting/balances.utils";
import BigNumber from "bignumber.js";
import { formatPercent } from "@/utils/formatting";
import Table from "@/components/table/table";
import Splash from "@/components/splash/splash";

export default function StakingPage() {

  const {txStore,signer,chainId} = useCantoSigner();

  const { isLoading,validators, apr, userStaking, selection, transaction } = useStaking({
    chainId: chainId,
    userEthAddress: signer?.account.address,
  });
  console.log(isLoading);
  console.log(validators);
  console.log(apr);
  //console.log((BigNumber(validators[1].tokens).dividedBy(new BigNumber(10).pow(18))).toString());
  // console.log(userStaking);
  // console.log(selection);
  // console.log(transaction);
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
      <Container>
      <Table
            title=""
            headers={[
              { value: "Name", ratio: 2 },
              { value: "Validator Total", ratio: 1 },
              { value: "Comission %", ratio: 1 },
              { value: "Voting Participation", ratio: 1 },
              { value: "Delegators", ratio: 1 },
              { value: "", ratio: 1 },
            ]}
            content={[...validators.map((validator,index)=>{
              return(
                [
                  <Container key={`name_${index}`}>{validator.description.moniker}</Container>,
                  <Container key={`tokens_${index}`} direction="row" center={{horizontal: true, vertical:true}} gap="auto">
                    <Text >{(BigNumber(validator.tokens).dividedBy(new BigNumber(10).pow(18))).toNumber().toFixed(2)  } </Text>
                    <div>{" "}</div>
                    <Icon
                      icon={{
                        url: "./tokens/canto.svg",
                        size: 16,
                      }}
                    />
                  </Container>,
                  <Container key={`commission_${index}`}>{validator.commission}</Container>,
                  <Container key={`participation_${index}`}>95%</Container>,
                  <Container key={`delegators_${index}`}>1000</Container>,
                  <Container key={`button_${index}`}>
                    <Button>DELEGATE</Button>
                  </Container>

                ]
              )
            }

            )]}
            />
        <div></div>
      </Container>
      <h1>Staking Page</h1>
      {/* <BoxedBackground /> */}

      
    </div>
  );
}
