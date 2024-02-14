import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import InfoPop from "@/components/infopop/infopop";
import PopUp from "@/components/popup/popup";
import Text from "@/components/text";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { AmbientPool } from "@/hooks/pairs/newAmbient/interfaces/ambientPools";
import { concentratedLiquidityTokenAmounts } from "@/utils/ambient";
import { formatPercent, displayAmount } from "@/utils/formatting";
import {
  addTokenBalances,
  convertTokenAmountToNote,
  divideBalances,
} from "@/utils/math";
import BigNumber from "bignumber.js";
import { HoverPositions } from "./HoverPositions";
import { estimateTokenAmountsFromLiquidity } from "@/utils/cantoDex";
import Countdown from "@/components/timer/countdown";
export const UserCantoDexPairRow = ({
  pair,
  onManage,
  isMobile,
}: {
  pair: CantoDexPairWithUserCTokenData;
  onManage: (pairAddress: string) => void;
  isMobile: boolean;
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

  // get amount of tokens position represents
  const tokenAmounts = estimateTokenAmountsFromLiquidity({
    reserveA: pair.reserve1,
    reserveB: pair.reserve2,
    totalLPSupply: pair.totalSupply,
    liquidity: totalUserLpTokens,
  });
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

    !isMobile && (
      <Text key={pair.address + "share"}>{formatPercent(userPoolShare)}</Text>
    ),
    <Container
      key={pair.address + "value"}
      direction="row"
      center={{
        horizontal: true,
        vertical: true,
      }}
      gap={10}
    >
      <Text>
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
      </Text>
      <InfoPop>
        <Container>
          <HoverPositions
            dexType="cantodex"
            positions={[
              {
                token1: {
                  amount: tokenAmounts.tokenA,
                  value:
                    convertTokenAmountToNote(
                      tokenAmounts.tokenA,
                      pair.price1
                    ).data?.toString() ?? "0",
                  symbol: pair.token1.symbol,
                  decimals: pair.token1.decimals,
                  icon: pair.token1.logoURI,
                },
                token2: {
                  amount: tokenAmounts.tokenB,
                  value:
                    convertTokenAmountToNote(
                      tokenAmounts.tokenB,
                      pair.price2
                    ).data?.toString() ?? "0",
                  symbol: pair.token2.symbol,
                  decimals: pair.token2.decimals,
                  icon: pair.token2.logoURI,
                },
              },
            ]}
          />
        </Container>
      </InfoPop>
    </Container>,
    !isMobile && (
      <Container
        key={pair.address + "edit"}
        direction="row"
        center={{ horizontal: true, vertical: true }}
        gap={4}
      >
        <Text key={pair.address + "rewards"}>
          {displayAmount(pair.clmData.userDetails.rewards, 18)}
        </Text>
        {Number(pair.clmData.userDetails.balanceOfUnderlying) != 0 && (
          <PopUp
            content={
              <Text size="xx-sm">
                You have{" "}
                {displayAmount(
                  pair.clmData.userDetails.balanceOfUnderlying,
                  pair.decimals
                )}{" "}
                unstaked LP tokens. You must stake them to earn rewards.
              </Text>
            }
            width="300px"
          >
            <Icon
              icon={{
                url: "/warning.svg",
                size: 16,
              }}
              themed
              style={{
                translate: "0 1.5px",
              }}
            />
          </PopUp>
        )}
      </Container>
    ),

    !isMobile && (
      <Container
        key={pair.address + "edit"}
        direction="row"
        center={{ horizontal: true, vertical: true }}
        gap={10}
      >
        <Button onClick={() => onManage(pair.address)} color="secondary">
          Manage LP
        </Button>
      </Container>
    ),
  ];
};

export const GeneralCantoDexPairRow = ({
  pair,
  onAddLiquidity,
  isMobile,
}: {
  pair: CantoDexPairWithUserCTokenData;
  onAddLiquidity: (pairAddress: string) => void;
  isMobile: boolean;
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
  !isMobile && (
    <Text key={pair.address + "type"}>
      {pair.stable ? "Stable" : "Volatile"}
    </Text>
  ),
  !isMobile && (
    <Container
      key={pair.address + "edit"}
      direction="row"
      center={{ horizontal: true }}
    >
      <Button onClick={() => onAddLiquidity(pair.address)}>Add LP</Button>
    </Container>
  ),
];

export const GeneralAmbientPairRow = ({
  pool,
  onAddLiquidity,
  isMobile,
}: {
  pool: AmbientPool;
  onAddLiquidity: (poolAddress: string) => void;
  isMobile: boolean;
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

  !isMobile && (
    <Container
      key={"popkey"}
      direction="row"
      gap={4}
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
          This is a concentrated liquidity stable pool. The default range will
          be selected for optimal rewards.
        </Text>
      </InfoPop>
    </Container>
  ),
  !isMobile && (
    <Container key={"action"} direction="row" center={{ horizontal: true }}>
      <Button key={"action item"} onClick={() => onAddLiquidity(pool.address)}>
        Add LP
      </Button>
    </Container>
  ),
];

export const UserAmbientPairRow = ({
  pool,
  onManage,
  rewards,
  rewardTime,
  isMobile,
}: {
  pool: AmbientPool;
  onManage: (poolAddress: string) => void;
  rewards?: string;
  rewardTime: bigint;
  isMobile?: boolean;
}) => {
  let totalValue = "0";
  const allPositionValues = pool.userPositions.map((position) => {
    const tokenAmounts = concentratedLiquidityTokenAmounts(
      position.concLiq,
      pool.stats.lastPriceSwap,
      position.bidTick,
      position.askTick
    );
    const baseNoteValue = convertTokenAmountToNote(
      tokenAmounts.base,
      new BigNumber(10).pow(36 - pool.base.decimals).toString()
    );
    const quoteNoteValue = convertTokenAmountToNote(
      tokenAmounts.quote,
      new BigNumber(10).pow(36 - pool.quote.decimals).toString()
    );
    if (baseNoteValue.error || quoteNoteValue.error) {
      const emptyToken = {
        amount: "0",
        value: "0",
        symbol: "",
        decimals: 0,
        icon: "",
      };
      return {
        token1: emptyToken,
        token2: emptyToken,
      };
    }
    totalValue = addTokenBalances(
      totalValue,
      addTokenBalances(
        baseNoteValue.data.toString(),
        quoteNoteValue.data.toString()
      )
    );
    return {
      token1: {
        amount: tokenAmounts.base,
        value: baseNoteValue.data.toString(),
        symbol: pool.base.symbol,
        decimals: pool.base.decimals,
        icon: pool.base.logoURI,
      },
      token2: {
        amount: tokenAmounts.quote,
        value: quoteNoteValue.data.toString(),
        symbol: pool.quote.symbol,
        decimals: pool.quote.decimals,
        icon: pool.quote.logoURI,
      },
    };
  });
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
    !isMobile && (
      <Text key={pool.symbol + "pool share"}>
        {formatPercent(divideBalances(totalValue, pool.totals.noteTvl))}
      </Text>
    ),
    <Container
      key={pool.address + " value"}
      direction="row"
      center={{
        horizontal: true,
        vertical: true,
      }}
      gap={10}
    >
      <Text key={pool.symbol + "value"}>
        {displayAmount(totalValue, 18)}
        <Icon
          style={{ marginLeft: "5px" }}
          themed
          icon={{
            url: "/tokens/note.svg",
            size: 16,
          }}
        />
      </Text>
      <InfoPop>
        {/* show all the positions */}
        <Container>
          <HoverPositions dexType="ambient" positions={allPositionValues} />
        </Container>
      </InfoPop>
    </Container>,
    !isMobile && (
      <Container
        key={pool.address + " value"}
        direction="row"
        center={{
          horizontal: true,
          vertical: true,
        }}
        gap={10}
      >
        <Text key={pool.symbol + "rewards"}>
          {displayAmount(rewards ?? "0", 18)}
        </Text>
        <InfoPop>
          <Container>
            <Text size="sm" theme="secondary-dark">
              Rewards will be released in{" "}
              <Countdown endTimestamp={rewardTime} />
            </Text>
          </Container>
        </InfoPop>
      </Container>
    ),
    !isMobile && (
      <Container key={"action"} direction="row" center={{ horizontal: true }}>
        <Button
          color="secondary"
          key={"action item"}
          onClick={() => onManage(pool.address)}
        >
          Manage LP
        </Button>
      </Container>
    ),
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
      gap={4}
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
