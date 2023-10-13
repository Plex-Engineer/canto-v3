import Button from "@/components/button/button";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";
import { AmbientPair } from "@/hooks/pairs/ambient/interfaces/ambientPairs";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { formatPercent } from "@/utils/formatting.utils";
import { displayAmount } from "@/utils/tokenBalances.utils";
import {
  addTokenBalances,
  convertTokenAmountToNote,
  divideBalances,
  percentOfAmount,
} from "@/utils/tokens/tokenMath.utils";
import Image from "next/image";

export const UserCantoDexPairRow = ({
  pair,
  onManage,
}: {
  pair: CantoDexPairWithUserCTokenData;
  onManage: (pairAddress: string) => void;
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
      <Icon
        style={{ marginLeft: "5px" }}
        themed
        icon={{
          url: "/tokens/note.svg",
          size: 16,
        }}
      />
    </Text>,
    // <Text key={pair.address + "totalUserTokens"}>
    //   {displayAmount(totalUserLpTokens, pair.decimals)}
    // </Text>,
    // <Text key={pair.address + "userStake"}>
    //   {displayAmount(
    //     pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
    //     pair.decimals
    //   )}
    // </Text>,
    <Text key={pair.address + "rewards"}>
      {displayAmount(pair.clmData?.userDetails?.rewards ?? "0", 18)}
    </Text>,
    <div key={pair.address + "edit"}>
      <Button onClick={() => onManage(pair.address)} color="secondary">
        Manage LP
      </Button>
    </div>,
  ];
};

export const GeneralCantoDexPairRow = ({
  pair,
  onAddLiquidity,
}: {
  pair: CantoDexPairWithUserCTokenData;
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
    <Icon
      style={{ marginLeft: "5px" }}
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
    <Button onClick={() => onAddLiquidity(pair.address)}>Add LP</Button>
  </div>,
];

export const GeneralAmbientPairRow = ({
  pair,
  onAddLiquidity,
}: {
  pair: AmbientPair;
  onAddLiquidity: (pairAddress: string) => void;
}) => [
  <div key={pair.address + "symbol"}>
    <Image src={pair.base.logoURI} width={30} height={54} alt="logo" />
    <Spacer width="10px" />
    <Text>{pair.symbol}</Text>
  </div>,
  <Text key={pair.symbol + "apr"}>{"0.00%"}</Text>,
  <Text key={pair.address + "tvl"}>
    {displayAmount(pair.liquidity.tvl, 18, {
      precision: 2,
    })}
    <Icon
      style={{ marginLeft: "5px" }}
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
  <div key={"action"}>
    <Button key={"action item"} onClick={() => onAddLiquidity(pair.address)}>
      Add LP
    </Button>
  </div>,
];

export const UserAmbientPairRow = ({
  pair,
  onManage,
}: {
  pair: AmbientPair;
  onManage: (pairAddress: string) => void;
}) => {
  return [
    <div key={pair.address + "symbol"}>
      <Image src={pair.base.logoURI} width={30} height={54} alt="logo" />
      <Spacer width="10px" />
      <Text>{pair.symbol}</Text>
    </div>,
    <Text key={pair.symbol + "apr"}>{"0.00%"}</Text>,
    <Text key={pair.symbol + "pool share"}>
      {formatPercent(
        divideBalances(
          pair.userDetails?.defaultRangePosition.liquidity ?? "0",
          pair.liquidity.rootLiquidity
        )
      )}
    </Text>,
    <Text key={pair.symbol + "value"}>
      {displayAmount(
        percentOfAmount(
          pair.liquidity.tvl,
          Number(
            divideBalances(
              pair.userDetails?.defaultRangePosition.liquidity ?? "0",
              pair.liquidity.rootLiquidity
            )
          )
        ).data,
        18
      )}
      <Icon
        style={{ marginLeft: "5px" }}
        themed
        icon={{
          url: "/tokens/note.svg",
          size: 16,
        }}
      />
    </Text>,
    <Text key={pair.symbol + "rewards"}>{"0"}</Text>,
    <div key={"action"}>
      <Button
        color="secondary"
        key={"action item"}
        onClick={() => onManage(pair.address)}
      >
        Manage LP
      </Button>
    </div>,
  ];
};
