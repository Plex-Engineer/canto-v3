import styles from "./highlightCard.module.scss";
import Button from "@/components/button/button";
import Image from "next/image";
import Item from "./item";
import Icon from "@/components/icon/icon";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { displayAmount } from "@/utils/formatting";
import Text from "@/components/text";
import InfoPop from "@/components/infopop/infopop";
import PopUp from "@/components/popup/popup";
import Container from "@/components/container/container";
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
          name={cToken.underlying.symbol + " Balance"}
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
          value={formattedAmount(cToken.userDetails?.balanceOfCToken ?? "0")}
          name={
            <Container key={"popkey"} direction="row" gap={10}>
              <Text font="proto_mono">{cToken.symbol + " Balance"}</Text>
              <InfoPop>
                <Text>
                  cNOTE is collateralized NOTE. Supply NOTE to receive cNOTE or
                  buy it directly on{" "}
                  <a
                    style={{ textDecoration: "underline" }}
                    href="https://app.slingshot.finance/swap/Canto/canto_0xee602429ef7ece0a13e4ffe8dbc16e101049504c"
                    target="_blank"
                  >
                    Slingshot
                  </a>
                </Text>
              </InfoPop>
            </Container>
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
