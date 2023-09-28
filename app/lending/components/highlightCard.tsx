import styles from "./highlightCard.module.scss";
import Button from "@/components/button/button";
import Image from "next/image";
import Item from "./item";
import Icon from "@/components/icon/icon";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { formatBalance } from "@/utils/tokenBalances.utils";
interface Props {
  cToken: CTokenWithUserData;
  onSupply: () => void;
  onBorrow: () => void;
}
const HighlightCard = ({ cToken, onBorrow, onSupply }: Props) => {
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
          name="Asset"
          value={cToken.underlying.name}
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
          value={formatBalance(
            cToken.userDetails?.balanceOfUnderlying ?? "0",
            cToken.underlying.decimals,
            {
              commify: true,
            }
          )}
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
          value={formatBalance(
            cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
            cToken.underlying.decimals,
            {
              commify: true,
            }
          )}
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
          value={formatBalance(
            cToken.userDetails?.borrowBalance ?? "0",
            cToken.underlying.decimals,
            {
              commify: true,
            }
          )}
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
      </div>

      <div className={styles.actions}>
        <Button
          fontFamily="proto_mono"
          width={"fill"}
          height={"large"}
          fontSize={"lg"}
          onClick={onSupply}
        >
          Stake note
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
