import Text from "@/components/text";
import styles from './VotingInfoBox.module.scss';
import Container from "@/components/container/container";
import { formatBalance } from "@/utils/formatting/balances.utils";
import Icon from "@/components/icon/icon";
import { calculateVotePercentages } from "@/utils/gov/formatData";

export function VotingInfoBox(proposal : any ){


    const votesData = calculateVotePercentages(proposal.final_vote);

   
    return (
        <div className={styles.proposalInfoVoting}>
            
            
            <div className={styles.votingInfoRow1}>
            
           
              <div style={{display: "flex", flexDirection: "row", justifyContent:"space-around"}}> <div className={styles.circle} style={{ backgroundColor: "#FC5151", margin:"10px 5px 0px 10px" }}></div> <div><Text font="proto_mono">No</Text></div></div>
              
            </div>
            <div className={styles.votingInfoRow2}>
                <div className={styles.infoRow1First}><Text font="proto_mono">{votesData.no}%</Text></div>
                <div className={styles.infoRow1First}>
                      <Container
                          direction="row"
                          gap={6}
                          center={{
                            vertical: true,
                          }}
                        >
                          <Text font="proto_mono" opacity={0.4} size="x-sm">{formatBalance(votesData.noAmount, 2, {
                            commify: true,
                          })}</Text>
                          <Icon
                            icon={{
                              url: "./tokens/canto.svg",
                              size: 16,
                            }}
                          />

                        </Container>
                  </div>
            </div>
          </div>
    )
}