import React, { useState } from 'react';

export type Proposal = {
  proposal_id: number;
};

export type VoteOption = 'YES' | 'NO' | 'ABSTAIN' | 'NO_WITH_VETO';

export interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal;
  onVote: (voteOption: VoteOption) => void;
}

export const VotingModal: React.FC<VotingModalProps> = ({ isOpen, onClose, proposal, onVote }) => {
  const [selectedOption, setSelectedOption] = useState<VoteOption | null>(null);

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <h2>Proposal ID: {proposal.proposal_id}</h2>
      {/* <h3>{proposal.title}</h3>
      <p>{proposal.description}</p> */}

      <div>
        {(['YES', 'NO', 'ABSTAIN', 'NO_WITH_VETO'] as VoteOption[]).map(option => (
          <button key={option} onClick={() => setSelectedOption(option)}>
            {option}
          </button>
        ))}
      </div>

      <button disabled={!selectedOption} onClick={() => onVote(selectedOption as VoteOption)}>
        Vote
      </button>

      <button onClick={onClose}>Close</button>
    </div>
  );
};