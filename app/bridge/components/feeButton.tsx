import Text from "@/components/text";
import style from "./feeButton.module.scss";
import clsx from "clsx";
import Spacer from "@/components/layout/spacer";
interface Props {
  title: string;
  subtext: string;
  subtext2: string;

  priceInUSD: string;
  priceInUSDFormatted: string;
  onClick?: () => void;
  active?: boolean;
}

const FeeButton = ({
  title,
  subtext,
  subtext2,
  priceInUSD,
  priceInUSDFormatted,
  onClick,
  active,
}: Props) => {
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
      <Text font="proto_mono">{priceInUSD}</Text>
      <Text size="x-sm" theme="secondary-dark">
        {priceInUSDFormatted}
      </Text>
    </div>
  );
};

export default FeeButton;
