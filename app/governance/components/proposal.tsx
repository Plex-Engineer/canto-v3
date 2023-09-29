import React, { useState } from 'react';

interface ProposalProps {
  proposalData: any; // Change to the appropriate type for proposal data
}

function Proposal({ proposalData }: ProposalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="proposal-container">
      <div className="proposal">
        <h3>Title: {proposalData.title}</h3>
        <p>Status: {proposalData.status}</p>
        <button onClick={handleOpenModal}>Open Modal</button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Title: {proposalData.title}</h3>
            <p>Description: {proposalData.description}</p>
            <button onClick={
