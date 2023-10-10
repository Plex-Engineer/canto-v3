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

interface ProposalModalParams{
    proposal: Proposal | null,
    onClose : () => void,
    isOpen: boolean,
}



export const ProposalModal = (props:ProposalModalParams) =>{

    const { data: signer } = useWalletClient();
    const txStore = useStore(useTransactionStore, (state) => state);

    function castVoteTest(proposal_id:Number) {
        const voteFlow: NewTransactionFlow = {
        title: "cast vote for the proposal",
        icon: "",
        txType: TransactionFlowType.VOTE_TX,
        params: {
            chainId: signer?.chain.id,
            proposalId: proposal_id,
            voteOption: VotingOption.YES,
            ethSender: signer?.account.address,
        },
        };
        txStore?.addNewFlow({
        txFlow: voteFlow,
        signer: signer,
        });
    }
    return (
        <Modal onClose={props.onClose} open={props.isOpen}>
            {props.proposal && (
            <>
                {/* <h2>{selectedProposal.title}</h2> */}
                <div>
                <p>Proposal ID: {props.proposal.proposal_id}</p>
                </div>
                <div>
                <p>Status: {mapProposalStatus(props.proposal.status)}</p>
                </div>
                <Button
                color="primary"
                disabled={new Date() > new Date(props.proposal.voting_end_time)}
                onClick={()=>castVoteTest(Number(props.proposal?.proposal_id))}
                >
                Vote
                </Button>
            </>
            )}
        </Modal>
    );
        
}