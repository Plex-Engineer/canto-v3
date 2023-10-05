import styles from "./highlightCard.module.scss";
import Button from "@/components/button/button";
import Image from "next/image";
import Item from "./item";
import Icon from "@/components/icon/icon";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { displayAmount } from "@/utils/tokenBalances.utils";
interface Props {
  cToken: CTokenWithUserData;
  precisionInValues?: number;
  onSupply: () => void;
  onBorrow: () => void;
}
const HighlightCard = ({
  cToken,
  onBorrow,
  onSupply,
  precisionInValues,
}: Props) => {
  const formattedAmount = (amount: string) =>
    displayAmount(amount, cToken.underlying.decimals, {
      precision: precisionInValues,
    });
  return (
    <div className={styles.container}>
      <Image
        className={styles.logo}
        src={cToken.underlying.logoURI}
        alt={"logo"}
        height={200}
        width={200}
      />
      <div className={styles.header}>
        <Item
          name={
            <Icon
              icon={{
                url: cToken.underlying.logoURI,
                size: 24,
              }}
            />
          }
          value={"$" + cToken.underlying.name}
          theme="primary-light"
        />
        <Item
          name="Supply APR"
          value={cToken.supplyApy + "%"}
          theme="primary-light"
        />
        <Item
          name="Borrow APR"
          value={cToken.borrowApy + "%"}
          theme="primary-light"
        />
      </div>
      <div className={styles.amounts}>
        <Item
          name="Wallet Balance"
          value={formattedAmount(
            cToken.userDetails?.balanceOfUnderlying ?? "0"
          )}
          postChild={
            <Icon
              themed
              icon={{
                url: "/tokens/note.svg",
                size: 20,
              }}
            />
          }
        />
        <Item
          name="Amount Supplied"
          value={formattedAmount(
            cToken.userDetails?.supplyBalanceInUnderlying ?? "0"
          )}
          postChild={
            <Icon
              themed
              icon={{
                url: "/tokens/note.svg",
                size: 20,
              }}
            />
          }
        />
        <Item
          name="Amount Borrowed"
          value={formattedAmount(cToken.userDetails?.borrowBalance ?? "0")}
          postChild={
            <Icon
              themed
              icon={{
                url: "/tokens/note.svg",
                size: 20,
              }}
            />
          }
        />
      </div>

      <div className={styles.actions}>
        <Button
          fontFamily="proto_mono"
          width={"fill"}
          height={"large"}
          fontSize={"lg"}
          onClick={onSupply}
        >
          Supply note
        </Button>

        <Button
          fontFamily="proto_mono"
          width={"fill"}
          height={"large"}
          fontSize={"lg"}
          onClick={onBorrow}
        >
          borrow note
        </Button>
      </div>
    </div>
  );
};

export default HighlightCard;
