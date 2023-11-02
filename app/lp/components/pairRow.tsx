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
    <Container
      key={pair.address}
      direction="row"
      gap={10}
      style={{
        padding: "0 16px",
      }}
      center={{
        vertical: true,
        horizontal: true,
      }}
    >
      <Icon icon={{ url: pair.logoURI, size: 54 }} />
      <Text theme="primary-dark" key={pair.address + "symbol"}>
        {pair.symbol}
      </Text>
    </Container>,
    <Text key={pair.address + "apr"}>
      {(pair.clmData?.distApy ?? "0.00") + "%"}
    </Text>,

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
    <Container
      key={pair.address + "edit"}
      direction="row"
      center={{ horizontal: true }}
    >
      <Button onClick={() => onManage(pair.address)} color="secondary">
        Manage LP
      </Button>
    </Container>,
  ];
};

export const GeneralCantoDexPairRow = ({
  pair,
  onAddLiquidity,
}: {
  pair: CantoDexPairWithUserCTokenData;
  onAddLiquidity: (pairAddress: string) => void;
}) => [
  <Container
    key={pair.address}
    direction="row"
    gap={10}
    style={{
      padding: "0 16px",
    }}
    center={{
      vertical: true,
      horizontal: true,
    }}
  >
    <Icon icon={{ url: pair.logoURI, size: 54 }} />
    <Text theme="primary-dark" key={pair.address + "symbol"}>
      {pair.symbol}
    </Text>
  </Container>,
  <Text key={pair.address + "apr"}>
    {(pair.clmData?.distApy ?? "0.00") + "%"}
  </Text>,

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
  <Container
    key={pair.address + "edit"}
    direction="row"
    center={{ horizontal: true }}
  >
    <Button onClick={() => onAddLiquidity(pair.address)}>Add LP</Button>
  </Container>,
];

export const GeneralAmbientPairRow = ({
  pool,
  onAddLiquidity,
}: {
  pool: AmbientPool;
  onAddLiquidity: (poolAddress: string) => void;
}) => [
  <Container
    key={pool.address}
    direction="row"
    gap={10}
    style={{
      padding: "0 16px",
    }}
    center={{
      vertical: true,
      horizontal: true,
    }}
  >
    <Icon icon={{ url: pool.logoURI, size: 54 }} />
    <Text theme="primary-dark" key={pool.address + "symbol"}>
      {pool.symbol}
    </Text>
  </Container>,
  <AprBlock key={"apr"} pool={pool} />,
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

  <Container
    key={"popkey"}
    direction="row"
    gap={10}
    center={{
      horizontal: true,
      vertical: true,
    }}
  >
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
  <Container key={"action"} direction="row" center={{ horizontal: true }}>
    <Button key={"action item"} onClick={() => onAddLiquidity(pool.address)}>
      Add LP
    </Button>
  </Container>,
];

export const UserAmbientPairRow = ({
  pool,
  onManage,
  rewards,
}: {
  pool: AmbientPool;
  onManage: (poolAddress: string) => void;
  rewards?: string;
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
    <Container
      key={pool.address}
      direction="row"
      gap={10}
      style={{
        padding: "0 16px",
      }}
      center={{
        vertical: true,
        horizontal: true,
      }}
    >
      <Icon icon={{ url: pool.logoURI, size: 54 }} />
      <Text theme="primary-dark" key={pool.address + "symbol"}>
        {pool.symbol}
      </Text>
    </Container>,
    <AprBlock key={"apr"} pool={pool} />,
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
    <Text key={pool.symbol + "rewards"}>
      {displayAmount(rewards ?? "0", 18)}
    </Text>,
    <Container key={"action"} direction="row" center={{ horizontal: true }}>
      <Button
        color="secondary"
        key={"action item"}
        onClick={() => onManage(pool.address)}
      >
        Manage LP
      </Button>
    </Container>,
  ];
};

const AprBlock = ({ pool }: { pool: AmbientPool }) => {
  const baseApr = pool.totals.apr.base;
  const quoteApr = pool.totals.apr.quote;
  const totalApr =
    Number(pool.totals.apr.poolApr) +
    (baseApr ? Number(baseApr.supply) + Number(baseApr.dist) : 0) +
    (quoteApr ? Number(quoteApr.supply) + Number(quoteApr.dist) : 0);

  return (
    <Container
      key={"popkey1"}
      direction="row"
      gap={10}
      center={{
        horizontal: true,
        vertical: true,
      }}
    >
      <Text key={pool.address + "apr"}>{totalApr.toFixed(2)}%</Text>
      <InfoPop>
        <Container gap={6}>
          <Container gap={"auto"} direction="row">
            <Text font="proto_mono" size="x-sm">
              pool incentive:
            </Text>
            <Text font="proto_mono" size="x-sm">
              {Number(pool.totals.apr.poolApr).toFixed(2)}%
            </Text>
          </Container>
          {baseApr && (
            <>
              {Number(baseApr.supply) !== 0 && (
                <Container gap={"auto"} direction="row">
                  <Text font="proto_mono" size="x-sm">
                    {pool.base.symbol} supply apr:
                  </Text>
                  <Text font="proto_mono" size="x-sm">
                    {baseApr.supply}%
                  </Text>
                </Container>
              )}
              {Number(baseApr.dist) !== 0 && (
                <Container gap={"auto"} direction="row">
                  <Text font="proto_mono" size="x-sm">
                    {pool.base.symbol} dist apr:
                  </Text>
                  <Text font="proto_mono" size="x-sm">
                    {baseApr.dist}%
                  </Text>
                </Container>
              )}
            </>
          )}
          {quoteApr && (
            <>
              {Number(quoteApr.supply) !== 0 && (
                <Container gap={"auto"} direction="row">
                  <Text font="proto_mono" size="x-sm">
                    {pool.quote.symbol} supply apr:
                  </Text>
                  <Text font="proto_mono" size="x-sm">
                    {quoteApr.supply}%
                  </Text>
                </Container>
              )}
              {Number(quoteApr.dist) !== 0 && (
                <Container gap={"auto"} direction="row">
                  <Text font="proto_mono" size="x-sm">
                    {pool.quote.symbol} dist apr:
                  </Text>
                  <Text font="proto_mono" size="x-sm">
                    {quoteApr.dist}%
                  </Text>
                </Container>
              )}
            </>
          )}
        </Container>
      </InfoPop>
    </Container>
  );
};
