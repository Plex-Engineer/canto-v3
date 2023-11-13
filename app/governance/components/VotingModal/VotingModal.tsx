import Button from "@/components/button/button";
import Modal from "@/components/modal/modal";
import { Proposal } from "@/hooks/gov/interfaces/proposal";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { useWalletClient } from "wagmi";
import { VoteOption } from "@/hooks/gov/interfaces/voteOptions";
import { NEW_ERROR, NewTransactionFlow } from "@/config/interfaces";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { useState } from "react";
import styles from './VotingModal.module.scss';
import useCantoSigner from "@/hooks/helpers/useCantoSigner";

interface ProposalModalParams {
  proposal: Proposal;
  onClose: () => void;
  isOpen: boolean;
}

export const ProposalModal = (props: ProposalModalParams) => {

  const { txStore, signer } = useCantoSigner();
  const [selectedVote, setSelectedVote] = useState<VoteOption | null>(null);

  function castVoteTest(voteOption: VoteOption | null) {
    if(!voteOption){
      return NEW_ERROR("Please select a vote option");
    }
    console.log("cast vote test");
    const newFlow: NewTransactionFlow = {
      icon: "",
      txType: TransactionFlowType.VOTE_TX,
      title: "Vote Tx",
      params: {
        chainId: signer?.chain.id,
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
          <div className={styles.checkBoxGroup}>
        {Object.values(VoteOption).map((option) => {
          const optionClass = `${styles.checkboxOption} ${
            styles['checkbox' + option.charAt(0).toUpperCase() + option.slice(1)]
          }`;
          return (
          <label key={option} className={optionClass} >
            <input
              type="radio"
              name="voteOption"
              value={option}
              checked={selectedVote === option}
              onChange={() => setSelectedVote(option)}
            />
            {option}
          </label>
        );
})}
          </div>
          <Button
            color="primary"
            disabled={(!selectedVote || !signer)}
            onClick={() => castVoteTest(selectedVote)}
          >
            Vote
          </Button>
          {/* <span
        className={styles["error-message"]}
        style={{
          opacity: errorMessage ? 1 : 0,
        }}
      >
        {props.errorMessage}
      </span> */}
        </>
      )}
    </Modal>
  );
};
