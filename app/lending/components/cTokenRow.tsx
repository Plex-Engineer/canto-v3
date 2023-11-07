import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { displayAmount } from "@/utils/formatting";

export const CTokenRow = ({
  cToken,
  onBorrow,
  onSupply,
}: {
  cToken: CTokenWithUserData;
  onSupply?: () => void;
  onBorrow?: () => void;
}) => [
  <Container
    key={cToken.address}
    direction="row"
    gap={10}
    style={{
      padding: "0 16px",
      width: "220px",
    }}
    center={{
      vertical: true,
      horizontal: true,
    }}
  >
    <Icon icon={{ url: cToken.underlying.logoURI, size: 30 }} />
    <Text theme="primary-dark" key={cToken.name + cToken.name}>
      {cToken.underlying.name}
    </Text>
  </Container>,
  <Text theme="primary-dark" key={cToken.name + "cToken.supplyApy"}>
    {cToken.supplyApy + "%"}
  </Text>,
  <Text theme="primary-dark" key={cToken.name + "cToken.balance"}>
    {displayAmount(
      cToken.userDetails?.balanceOfUnderlying ?? "0",
      cToken.underlying.decimals
    )}
  </Text>,
  <Text theme="primary-dark" key={cToken.name + "cToken.ubalance"}>
    {displayAmount(
      cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
      cToken.underlying.decimals
    )}
  </Text>,
  <Text theme="primary-dark" key={cToken.name + "cToken.CF"}>
    {displayAmount(cToken.collateralFactor, 16) + "%"}
  </Text>,
  <Container
    key={cToken.name + "Manage"}
    direction="row"
    gap={10}
    center={{ horizontal: true }}
  >
    {onSupply && (
      <Button
        key={cToken.name + "cToken.onSupply"}
        color="secondary"
        onClick={onSupply}
      >
        Supply
      </Button>
    )}
    {onBorrow && (
      <Button
        key={cToken.name + "cToken.onBorrow"}
        color="secondary"
        onClick={onBorrow}
      >
        Borrow
      </Button>
    )}
  </Container>,
];
