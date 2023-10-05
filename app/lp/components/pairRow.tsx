import Button from "@/components/button/button";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";
import { PairWithUserCTokenData } from "@/hooks/pairs/interfaces/pairs";
import { formatPercent } from "@/utils/formatting.utils";
import { displayAmount } from "@/utils/tokenBalances.utils";
import {
  addTokenBalances,
  convertTokenAmountToNote,
  divideBalances,
} from "@/utils/tokens/tokenMath.utils";
import Image from "next/image";

export const UserPairRow = ({
  pair,
  onAddLiquidity,
  onRemoveLiquidity,
}: {
  pair: PairWithUserCTokenData;
  onAddLiquidity: (pairAddress: string) => void;
  onRemoveLiquidity: (pairAddress: string) => void;
}) => {
  if (!pair.clmData?.userDetails) return [];
  // add staked and wallet balance
  const totalUserLpTokens = addTokenBalances(
    pair.clmData.userDetails.supplyBalanceInUnderlying,
    pair.clmData.userDetails.balanceOfUnderlying
  );
  const { data: totalUserLPValue, error } = convertTokenAmountToNote(
    totalUserLpTokens,
    pair.lpPrice
  );
  if (error) return [];
  const userPoolShare = divideBalances(totalUserLpTokens, pair.totalSupply);
  return [
    <div key={pair.address + "symbol"}>
      <Image src={pair.logoURI} width={54} height={54} alt="logo" />
      <Spacer width="10px" />

      <Text>{pair.symbol}</Text>
    </div>,
    <Text key={pair.address + "apr"}>{pair.clmData?.distApy + "%"}</Text>,

    <Text key={pair.address + "share"}>{formatPercent(userPoolShare)}</Text>,
    <Text key={pair.address + "value"}>
      {displayAmount(totalUserLPValue.toString(), 18, {
        precision: 2,
      })}
      <Spacer width="5px" />

      <Icon
        themed
        icon={{
          url: "/tokens/note.svg",
          size: 16,
        }}
      />
    </Text>,
    <Text key={pair.address + "totalUserTokens"}>
      {displayAmount(totalUserLpTokens, pair.decimals)}
    </Text>,
    <Text key={pair.address + "userStake"}>
      {displayAmount(
        pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
        pair.decimals
      )}
    </Text>,
    <Text key={pair.address + "rewards"}>
      {displayAmount(pair.clmData?.userDetails?.rewards ?? "0", 18)}
    </Text>,
    <div key={pair.address + "edit"}>
      <Button onClick={() => onAddLiquidity(pair.address)} color="secondary">
        Add Liquidity
      </Button>
      <Spacer width="10px" />
      <Button
        onClick={() => onRemoveLiquidity(pair.address)}
        color="secondary"
        disabled={totalUserLPValue.eq(0)}
      >
        Remove Liquidity
      </Button>
    </div>,
  ];
};

export const GeneralPairRow = ({
  pair,
  onAddLiquidity,
}: {
  pair: PairWithUserCTokenData;
  onAddLiquidity: (pairAddress: string) => void;
}) => [
  <div key={pair.address + "symbol"}>
    <Image src={pair.logoURI} width={54} height={54} alt="logo" />
    <Spacer width="10px" />
    <Text>{pair.symbol}</Text>
  </div>,
  <Text key={pair.address + "apr"}>{pair.clmData?.distApy + "%"}</Text>,

  <Text key={pair.address + "tvl"}>
    {displayAmount(pair.tvl, 18, {
      precision: 2,
    })}
    <Spacer width="5px" />
    <Icon
      themed
      icon={{
        url: "/tokens/note.svg",
        size: 16,
      }}
    />
  </Text>,
  <Text key={pair.address + "type"}>
    {pair.stable ? "Stable" : "Volatile"}
  </Text>,
  <div key={pair.address + "edit"}>
    <Button onClick={() => onAddLiquidity(pair.address)}>Add Liquidity</Button>
  </div>,
];
