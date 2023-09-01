import { TransactionFlowWithStatus } from "@/config/interfaces/transactions";

interface TxBoxProps {
  flow?: TransactionFlowWithStatus;
}
const TxBox = ({ flow }: TxBoxProps) => {
  if (!flow || !flow.title) return <></>;
  return (
    <div>
      <h1>title: {flow.title}</h1>
      <h3>status: {flow.status}</h3>
      <ul>
        {flow.transactions.map((tx, idx) => (
          <div key={idx}>
            <li>tx - {idx}</li>
            <li>
              {idx}- description: {tx.tx.description}
            </li>
            <li>
              {idx}- status: {tx.status}
            </li>
            <li>
              {idx}-{" "}
              <a href={tx.txLink} style={{ cursor: "pointer", color: "blue" }}>
                link
              </a>
            </li>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default TxBox;
