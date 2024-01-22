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
import BigNumber from "bignumber.js";

interface Props {
  cToken: CTokenWithUserData;
  precisionInValues?: number;
  onSupply: () => void;
}
const VivacityCard = ({ cToken, onSupply, precisionInValues }: Props) => {
  const formattedAmount = (amount: string) => {
    return displayAmount(amount, cToken.underlying.decimals, {
      precision: precisionInValues,
    });
  };
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
          name="Supply APY"
          value={cToken.supplyApy + "%"}
          theme="primary-light"
        />
      </div>
      <div className={styles.amounts}>
        <Container width="100%" gap={10}>
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
        </Container>
        <Item
          name="Note Supplied"
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
      </div>
    </div>
  );
};

export default VivacityCard;
