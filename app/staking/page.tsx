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
import { displayAmount, formatBalance } from "@/utils/formatting/balances.utils";
import BigNumber from "bignumber.js";
import { formatPercent } from "@/utils/formatting";

export default function StakingPage() {

  const {txStore,signer,chainId} = useCantoSigner();

  const { validators, apr, userStaking, selection, transaction } = useStaking({
    chainId: chainId,
    userEthAddress: signer?.account.address,
  });

  console.log(validators);
  console.log(apr);
  console.log(userStaking);
  console.log(selection);
  console.log(transaction);
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
      <h1>Staking Page</h1>
      {/* <BoxedBackground /> */}

      
    </div>
  );
}
