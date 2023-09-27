import styles from "./highlightCard.module.scss";
import Button from "@/components/button/button";
import Image from "next/image";
import Item from "./item";
import Icon from "@/components/icon/icon";
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
            <Icon
              themed
              icon={{
                url: "/tokens/note.svg",
                size: 24,
              }}
            />
          }
        />
        <Item
          name="Amount Staked"
          value={props.token.amountStaked ?? "0"}
          postChild={
            <Icon
              themed
              icon={{
                url: "/tokens/note.svg",
                size: 24,
              }}
            />
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
          onClick={props.token.supply}
        >
          Stake note
        </Button>

        <Button
          fontFamily="proto_mono"
          width={"fill"}
          height={"large"}
          fontSize={"lg"}
          onClick={props.token.borrow}
        >
          borrow note
        </Button>
      </div>
    </div>
  );
};

export default HighlightCard;
