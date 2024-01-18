import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import styles from "./tokenCard.module.scss";

interface Props {
  //   stats: {
  //     name: string;
  //     value: string;
  //   }[];
  //   items: {
  //     name: string;
  //     value: string;
  //   }[];

  cToken?: CTokenWithUserData;
  onClick: () => void;
}
const TokenCard = (props: Props) => {
  if (!props.cToken) {
    <div className={styles.loading}></div>;
  }
  return <div className={styles.container}>TokenCard</div>;
};

export default TokenCard;
