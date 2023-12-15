import Text from "@/components/text";
import styles from './VotingInfoBox.module.scss';
import Container from "@/components/container/container";
import { formatBalance } from "@/utils/formatting/balances.utils";
import Icon from "@/components/icon/icon";
import { VoteData, calculateVotePercentages } from "@/utils/gov/formatData";
import RadioButton from "../RadioButton/RadioButton";
import { VoteOption } from "@/hooks/gov/interfaces/voteOptions";
import { useState } from "react";

export function VotingInfoBox({isActive,value, selectedVote,isSelected, votesData, color1, color2, isHighest, onClick }
  :{isActive: boolean,value: VoteOption, selectedVote: VoteOption | null, isSelected: boolean, votesData: VoteData,
  color1: string, color2:string, isHighest: boolean, onClick: ()=> void} ){


    //const votesData = calculateVotePercentages(proposal.final_vote);

    const [isHovered, setIsHovered] = useState(false);
    const [isChecked,setIsChecked] = useState(false);
    function getVotesInfo(value:VoteOption, votesData: VoteData): {votePercentage: string, voteAmount: string}{
      if(value==VoteOption.YES){
        return {votePercentage: votesData.Yes, voteAmount: votesData.YesAmount};
      }
      if(value==VoteOption.NO){
        return {votePercentage: votesData.No, voteAmount: votesData.NoAmount};
      }
      if(value==VoteOption.ABSTAIN){
        return {votePercentage: votesData.Abstain, voteAmount: votesData.AbstainAmount};
      }
      if(value==VoteOption.VETO){
        return {votePercentage: votesData.Veto, voteAmount: votesData.VetoAmount};
      }
      return {votePercentage: "", voteAmount: ""};
      
    }
  

  const getHoverStyle = () => {
    if(isSelected && isActive){
      return { backgroundColor: color2 };
    }
    if (isHovered && isActive) {
      return {backgroundColor: color2, opacity:"50%"};
    }
    if(isHighest){
      return {backgroundColor: color2};
    }
    return {};
  };
  // const getCheckedStyle = ()=>{
    
  // }
  const handleBoxClick = () => {
    // Check if the current box is already selected, if so, deselect it
    if (isChecked) {
      onClick();
    } else {
      onClick();
    }
  };
  return (
        <div className={styles.proposalInfoVoting} onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {setIsHovered(false);
                            }}
        onClick={()=>{
          onClick();}}
        style={getHoverStyle()} >


        { isActive && <div className={styles.radioBtnContainer}><RadioButton value={value} isActive={isActive} 
          onClick={() => {selectedVote=value}
          } selectedValue={selectedVote} checkedColor={color1}></RadioButton> </div>   
              }
            
            
            <div className={styles.votingInfoRow1}>
            
           
              <div style={{display: "flex", flexDirection: "row", justifyContent:"space-around"}}> <div style={{ backgroundColor: color1, margin:"10px 5px 0px 10px" }}></div> <div><Text font="proto_mono">{value}</Text></div></div>
              
            </div>
            <div className={styles.votingInfoRow2}>
                <div className={styles.infoRow1First}><Text font="proto_mono">{getVotesInfo(value,votesData).votePercentage}%</Text></div>
                <div className={styles.infoRow1First}>
                      <Container
                          direction="row"
                          gap={6}
                          center={{
                            vertical: true,
                          }}
                        >
                          <Text font="proto_mono" opacity={0.4} size="x-sm">{formatBalance(getVotesInfo(value,votesData).voteAmount, 2, {
                            commify: true,
                          })}</Text>
                          <Icon
                            icon={{
                              url: "/tokens/canto.svg",
                              size: 16,
                            }}
                            themed={true}
                          />

                        </Container>
                  </div>
            </div>
          </div>
    )
}