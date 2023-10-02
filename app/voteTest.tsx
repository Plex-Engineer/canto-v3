import Button from "@/components/button/button";
import { NewTransactionFlow } from "@/config/interfaces";
import { TransactionFlowType } from "@/config/transactions/txMap";
import { VotingOption } from "@/hooks/governance/helpers/voteOptions";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { useWalletClient } from "wagmi";

export default function VoteTest() {
  const { data: signer } = useWalletClient();
  const txStore = useStore(useTransactionStore, (state) => state);

  function castVoteTest() {
    const voteFlow: NewTransactionFlow = {
      title: "cast vote test",
      icon: "",
      txType: TransactionFlowType.VOTE_TX,
      params: {
        chainId: signer?.chain.id,
        proposalId: 1,
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
    <div>
      <h1>Vote Test</h1>
      <Button onClick={castVoteTest}>VOTE TEST</Button>
    </div>
  );
}
