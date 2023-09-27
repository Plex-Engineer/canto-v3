import Text from "@/components/text";
import styles from "./highlightCard.module.scss";
import Button from "@/components/button/button";
import Spacer from "@/components/layout/spacer";
import Image from "next/image";
interface Props {
  token: {
    name: string;
    imgUrl: string;
    supplyAPR: string;
    borrowAPR: string;
    walletBalance?: string;
    amountStaked?: string;
    outStandingDebt?: string;
    supply: () => void;
    borrow: () => void;
  };
}
const HighlightCard = (props: Props) => {
  return (
    <div className={styles.container}>
      <Image
        className={styles.logo}
        src={props.token.imgUrl}
        alt={"logo"}
        height={200}
        width={200}
      />
      <div className={styles.header}>
        <Item name="Asset" value={props.token.name} theme="primary-light" />
        <Item
          name="Supply APR"
          value={props.token.supplyAPR}
          theme="primary-light"
        />
        <Item
          name="Borrow APR"
          value={props.token.borrowAPR}
          theme="primary-light"
        />
      </div>
      <div className={styles.amounts}>
        <Item
          name="Wallet Balance"
          value={props.token.walletBalance ?? "0"}
          postChild={
            <Image height={24} width={24} src="/tokens/note.svg" alt="eth" />
          }
        />
        <Item
          name="Amount Staked"
          value={props.token.amountStaked ?? "0"}
          postChild={
            <Image height={24} width={24} src="/tokens/note.svg" alt="eth" />
          }
        />
        <Item
          name="Outstanding Debt"
          value={props.token.outStandingDebt ?? "0"}
        />
      </div>

      <div className={styles.actions}>
        <Button
          fontFamily="proto_mono"
          width={"fill"}
          height={"large"}
          fontSize={"lg"}
        >
          Stake note
        </Button>

        <Button
          fontFamily="proto_mono"
          width={"fill"}
          height={"large"}
          fontSize={"lg"}
        >
          borrow note
        </Button>
      </div>
    </div>
  );
};

export default HighlightCard;

type ItemProps = {
  name: string;
  value: string;
  postChild?: React.ReactNode;
  theme?:
    | "primary-light"
    | "primary-dark"
    | "secondary-light"
    | "secondary-dark"
    | undefined;
};
const Item = ({ name, value, theme, postChild }: ItemProps) => (
  <div className={styles.item}>
    <Text className={styles.title} theme={theme} font="proto_mono">
      {name}
    </Text>
    <Text className={styles.value} theme={theme} font="proto_mono">
      {value}{" "}
      {postChild && <span className={styles.postChild}>{postChild}</span>}
    </Text>
  </div>
);
