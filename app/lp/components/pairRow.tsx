import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import InfoPop from "@/components/infopop/infopop";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { concLiquidityNoteValue } from "@/utils/ambient/liquidity.utils";
import { formatPercent } from "@/utils/formatting.utils";
import { displayAmount } from "@/utils/tokenBalances.utils";
import {
  addTokenBalances,
  convertTokenAmountToNote,
  divideBalances,
} from "@/utils/tokens/tokenMath.utils";
import BigNumber from "bignumber.js";
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
  pool,
  onAddLiquidity,
}: {
  pool: AmbientPool;
  onAddLiquidity: (poolAddress: string) => void;
}) => [
  <div key={pool.address + "symbol"}>
    <Image src={pool.logoURI} width={54} height={54} alt="logo" />
    <Spacer width="10px" />
    <Text>{pool.symbol}</Text>
  </div>,
  <Text key={pool.symbol + "apr"}>{formatPercent(pool.totals.apr)}</Text>,
  <Text key={pool.address + "tvl"}>
    {displayAmount(pool.totals.noteTvl, 18, {
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

  <Container key={"popkey"} direction="row" gap={10}>
    <Text key={pool.address + "type"}>
      {pool.stable ? "Concentrated" : "Volatile"}
    </Text>

    <InfoPop>
      <Text>
        This is a concentrated liquidity stable pool. The default range will be
        selected for optimal rewards.
      </Text>
    </InfoPop>
  </Container>,
  <div key={"action"}>
    <Button key={"action item"} onClick={() => onAddLiquidity(pool.address)}>
      Add LP
    </Button>
  </div>,
];

export const UserAmbientPairRow = ({
  pool,
  onManage,
}: {
  pool: AmbientPool;
  onManage: (poolAddress: string) => void;
}) => {
  const value = pool.userPositions.reduce((acc, position) => {
    return addTokenBalances(
      acc,
      concLiquidityNoteValue(
        position.concLiq,
        pool.stats.lastPriceSwap,
        position.bidTick,
        position.askTick,
        new BigNumber(10).pow(36 - pool.base.decimals).toString(),
        new BigNumber(10).pow(36 - pool.quote.decimals).toString()
      )
    );
  }, "0");
  return [
    <div key={pool.address + "symbol"}>
      <Image src={pool.logoURI} width={54} height={54} alt="logo" />
      <Spacer width="10px" />
      <Text>{pool.symbol}</Text>
    </div>,
    <Text key={pool.symbol + "apr"}>{formatPercent(pool.totals.apr)}</Text>,
    <Text key={pool.symbol + "pool share"}>
      {formatPercent(divideBalances(value, pool.totals.noteTvl))}
    </Text>,
    <Text key={pool.symbol + "value"}>
      {displayAmount(value, 18)}
      <Icon
        style={{ marginLeft: "5px" }}
        themed
        icon={{
          url: "/tokens/note.svg",
          size: 16,
        }}
      />
    </Text>,
    <Text key={pool.symbol + "rewards"}>{"0"}</Text>,
    <div key={"action"}>
      <Button
        color="secondary"
        key={"action item"}
        onClick={() => onManage(pool.address)}
      >
        Manage LP
      </Button>
    </div>,
  ];
};
