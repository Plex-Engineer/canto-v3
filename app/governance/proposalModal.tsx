import Button from "@/components/button/button"
import Modal from "@/components/modal/modal"
import { Proposal } from "@/hooks/governance/interfaces/proposalParams"
import useTransactionStore from "@/stores/transactionStore"
import useStore from "@/stores/useStore"
import { mapProposalStatus } from "@/utils/gov/proposalUtils"
import { useWalletClient } from "wagmi";
import { NewTransactionFlow } from "@/config/interfaces/transactions";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { VotingOption } from "@/hooks/governance/helpers/voteOptions";
import { castVoteTest, voteTxParams } from "@/hooks/governance/transactions/vote"
import { useSingleProposal } from "@/hooks/governance/singleProposalData"

interface ProposalModalParams{
    proposal: Proposal,
    onClose : () => void,
    isOpen: boolean,
    //onVote: (params:voteTxParams) => void;
}

export const ProposalModal = (props:ProposalModalParams) =>{


    const {proposal,loading,error,voteTx} = useSingleProposal(props.proposal?.proposal_id);
    const { data: signer } = useWalletClient();
    const txStore = useStore(useTransactionStore, (state) => state);



    if(error){
        return (<Modal onClose={props.onClose} open={props.isOpen} >
            Error while fetching proposal Data
        </Modal>);
    }
    const voting_end_time = proposal? proposal.voting_end_time: "";
     
    console.log(proposal?.status);
    
    return (
        <Modal onClose={props.onClose} open={props.isOpen}>
            {props.proposal && (
            <>
                {/* <h2>{selectedProposal.title}</h2> */}
                <div>
                <p>Proposal ID: {proposal?.proposal_id}</p>
                </div>
                <div>
                <p>Status: {mapProposalStatus(proposal?.status)}</p>
                </div>
                <Button
                color="primary"
                disabled={new Date() > new Date(voting_end_time)}
                onClick={
                    ()=>castVoteTest({
                        proposal_id: Number(proposal?.proposal_id),
                        voteOption: VotingOption.YES,
                        signer: signer,
                        txStore : txStore 
                    })
                }
                >
                Vote
                </Button>
            </>
            )}
        </Modal>
    );
        
}