import Button from "@/components/button/button";
import Modal from "@/components/modal/modal";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { useWalletClient } from "wagmi";
import { VoteOption } from "@/hooks/gov/interfaces/voteOptions";
import { NewTransactionFlow } from "@/config/interfaces";
import { TransactionFlowType } from "@/config/transactions/txMap";

interface ProposalModalParams {
  proposal: Proposal;
  onClose: () => void;
  isOpen: boolean;
}

export const ProposalModal = (props: ProposalModalParams) => {
  const { data: signer } = useWalletClient();
  const txStore = useStore(useTransactionStore, (state) => state);

  function castVoteTest(voteOption: VoteOption) {
    console.log("cast vote test");
    const newFlow: NewTransactionFlow = {
      icon: "",
      txType: TransactionFlowType.VOTE_TX,
      title: "Vote Tx",
      params: {
        chainId: 7700,
        ethAccount: signer?.account.address ?? "",
        proposalId: props.proposal.proposal_id,
        voteOption: voteOption,
      },
    };
    txStore?.addNewFlow({ txFlow: newFlow, signer });
  }

  return (
    <Modal onClose={props.onClose} open={props.isOpen}>
      {props.proposal && (
        <>
          <div>
            <p>Proposal ID: {props.proposal.proposal_id}</p>
          </div>
          <div>
            <p>Status: {props.proposal.status}</p>
          </div>
          <Button
            color="primary"
            disabled={props.proposal.status !== "PROPOSAL_STATUS_VOTING_PERIOD"}
            onClick={() => castVoteTest(VoteOption.YES)}
          >
            Vote
          </Button>
        </>
      )}
    </Modal>
  );
};
