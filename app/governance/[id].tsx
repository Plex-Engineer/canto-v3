
import { useRouter } from 'next/router';

const ProposalPage = () => {
  const router = useRouter();
  const { id } = router.query;


  return (
    <div>
      {/* Proposal details */}
      <div>Proposal Modal Page for Proposal {id} </div>
    </div>
  );
};

export default ProposalPage;
