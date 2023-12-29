import Text from "@/components/text";
import style from "./feeButton.module.scss";
import clsx from "clsx";
import BigNumber from "bignumber.js";

interface Props {
  title: string;
  subtext: string;
  subtext2: string;

  tokenSymbol: string;
  tokenAmount: string;
  tokenPrice?: string;
  onClick?: () => void;
  active?: boolean;
}

const FeeButton = ({
  title,
  subtext,
  subtext2,
  tokenSymbol,
  tokenAmount,
  tokenPrice,
  onClick,
  active,
}: Props) => {
  const tokenUSDValue = tokenPrice
    ? new BigNumber(tokenAmount).times(tokenPrice).toFixed(2)
    : "unavailable";
  return (
    <div
      className={clsx(style.container, active && style.active)}
      onClick={onClick}
    >
      <Text font="proto_mono">{title}</Text>
      <Text
        size="x-sm"
        theme="secondary-dark"
        style={{
          textAlign: "center",
        }}
      >
        {subtext}
      </Text>
      <Text
        size="x-sm"
        theme="secondary-dark"
        style={{
          textAlign: "center",
        }}
      >
        {subtext2}
      </Text>
      <div className={style.divider} />
      <Text font="proto_mono">{`${tokenAmount} ${tokenSymbol}`}</Text>
      <Text size="x-sm" theme="secondary-dark">
        {"$" + tokenUSDValue}
      </Text>
    </div>
  );
};

export default FeeButton;
