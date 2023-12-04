import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import InfoPop from "@/components/infopop/infopop";
import Text from "@/components/text";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { displayAmount } from "@/utils/formatting";

export const RWARow = ({
  cRwa,
  onSupply,
}: {
  cRwa: CTokenWithUserData;
  onSupply?: () => void;
}) => [
  <Container
    key={cRwa.address}
    direction="row"
    gap={10}
    style={{
      paddingLeft: "20px",
    }}
    center={{
      vertical: true,
    }}
    width="100%"
  >
    <Icon icon={{ url: cRwa.underlying.logoURI, size: 30 }} />
    <Text theme="primary-dark" key={cRwa.name + cRwa.name}>
      {cRwa.underlying.symbol}
    </Text>
  </Container>,
  <Text theme="primary-dark" key={cRwa.name + "cToken.balance"}>
    {displayAmount(
      cRwa.userDetails?.balanceOfUnderlying ?? "0",
      cRwa.underlying.decimals
    )}
  </Text>,
  <Text theme="primary-dark" key={cRwa.name + "cToken.supplyApy"}>
    {Number(cRwa.supplyApy).toFixed(2) + "%"}
  </Text>,
  <Text theme="primary-dark" key={cRwa.name + "cToken.ubalance"}>
    {displayAmount(
      cRwa.userDetails?.supplyBalanceInUnderlying ?? "0",
      cRwa.underlying.decimals
    )}
  </Text>,
  <Text theme="primary-dark" key={cRwa.name + "cToken.CF"}>
    {displayAmount(cRwa.collateralFactor, 16) + "%"}
  </Text>,
  <Text theme="primary-dark" key={cRwa.name + "cToken.liquidity"}>
    {displayAmount(cRwa.cash, cRwa.decimals)}
  </Text>,
  <Container
    key={cRwa.name + "Manage"}
    direction="row"
    gap={10}
    center={{ horizontal: true }}
  >
    {onSupply && (
      <Button
        key={cRwa.name + "cToken.onSupply"}
        color="secondary"
        onClick={onSupply}
      >
        Supply
      </Button>
    )}
  </Container>,
];

export const StableCoinRow = ({
  cStableCoin,
  onSupply,
  onBorrow,
}: {
  cStableCoin: CTokenWithUserData;
  onSupply?: () => void;
  onBorrow?: () => void;
}) => [
  <Container
    key={cStableCoin.address}
    direction="row"
    gap={10}
    center={{
      vertical: true,
      horizontal: true,
    }}
    width="100%"
  >
    <Icon icon={{ url: cStableCoin.underlying.logoURI, size: 30 }} />
    <Text
      size="sm"
      theme="primary-dark"
      key={cStableCoin.name + cStableCoin.name}
    >
      {cStableCoin.underlying.symbol}
    </Text>
  </Container>,
  <Text
    size="sm"
    theme="primary-dark"
    key={cStableCoin.name + "cToken.balance"}
  >
    {displayAmount(
      cStableCoin.userDetails?.balanceOfUnderlying ?? "0",
      cStableCoin.underlying.decimals
    )}
  </Text>,
  <Container
    key={"popkey" + cStableCoin.name}
    direction="row"
    gap={10}
    center={{
      horizontal: true,
      vertical: true,
    }}
  >
    <Text
      size="sm"
      theme="primary-dark"
      key={cStableCoin.name + "cToken.supplyApy"}
    >
      {`${Number(cStableCoin.supplyApy)}%`}
    </Text>
    <InfoPop>
      <Container gap={6}>
        <Container gap={"auto"} direction="row">
          <Text font="proto_mono" size="x-sm">
            supply apr:
          </Text>
          <Text font="proto_mono" size="x-sm">
            {`${Number(cStableCoin.supplyApy).toFixed(2)}%`}
          </Text>
        </Container>
        <Container gap={"auto"} direction="row">
          <Text font="proto_mono" size="x-sm">
            distribution apr:
          </Text>
          <Text font="proto_mono" size="x-sm">
            {`${Number(cStableCoin.distApy).toFixed(2)}%`}
          </Text>
        </Container>
      </Container>
    </InfoPop>
  </Container>,
  <Text
    size="sm"
    theme="primary-dark"
    key={cStableCoin.name + "cToken.ubalance"}
  >
    {displayAmount(
      cStableCoin.userDetails?.supplyBalanceInUnderlying ?? "0",
      cStableCoin.underlying.decimals
    )}
  </Text>,
  //   <Text size="sm" theme="primary-dark" key={cStableCoin.name + "cToken.CF"}>
  //     {displayAmount(cStableCoin.collateralFactor, 16) + "%"}
  //   </Text>,
  <Text
    size="sm"
    theme="primary-dark"
    key={cStableCoin.name + "cToken.borrowApr"}
  >
    {Number(cStableCoin.borrowApy).toFixed(2) + "%"}
  </Text>,
  <Text
    size="sm"
    theme="primary-dark"
    key={cStableCoin.name + "cToken.borrowAmount"}
  >
    {displayAmount(
      cStableCoin.userDetails?.borrowBalance ?? "0",
      cStableCoin.decimals
    )}
  </Text>,
  <Text
    size="sm"
    theme="primary-dark"
    key={cStableCoin.name + "cToken.liquidity"}
  >
    {displayAmount(cStableCoin.cash, cStableCoin.decimals)}
  </Text>,
  <Container
    key={cStableCoin.name + "Manage"}
    direction="row"
    gap={10}
    center={{ horizontal: true }}
  >
    {onSupply && (
      <Button
        height="small"
        width={75}
        fontSize={"sm"}
        key={cStableCoin.name + "cToken.onSupply"}
        color="secondary"
        onClick={onSupply}
      >
        Supply
      </Button>
    )}
    {onBorrow && (
      <Button
        height="small"
        width={75}
        fontSize={"sm"}
        key={cStableCoin.name + "cToken.onBorrow"}
        color="secondary"
        onClick={onBorrow}
      >
        Borrow
      </Button>
    )}
  </Container>,
];
