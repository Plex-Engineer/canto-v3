import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Spacer from "@/components/layout/spacer";
import Text from "@/components/text";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { formatBalance } from "@/utils/tokenBalances.utils";

export const CTokenRow = ({
  cToken,
  onClick,
}: {
  cToken: CTokenWithUserData;
  onClick: () => void;
}) => [
  <>
    <Icon icon={{ url: cToken.underlying.logoURI, size: 30 }} />
    <Spacer width="10px" />
    <Text theme="primary-dark" key={cToken.name + cToken.name}>
      {cToken.underlying.name}
    </Text>
  </>,
  <Text theme="primary-dark" key={cToken.name + "cToken.supplyApy"}>
    {cToken.supplyApy + "%"}
  </Text>,
  <Text theme="primary-dark" key={cToken.name + "cToken.balance"}>
    {formatBalance(
      cToken.userDetails?.balanceOfUnderlying ?? "0",
      cToken.underlying.decimals,
      {
        commify: true,
      }
    )}
  </Text>,
  <Text theme="primary-dark" key={cToken.name + "cToken.ubalance"}>
    {formatBalance(
      cToken.userDetails?.supplyBalanceInUnderlying ?? "0",
      cToken.underlying.decimals,
      {
        commify: true,
      }
    )}
  </Text>,
  <Text theme="primary-dark" key={cToken.name + "cToken.CF"}>
    {formatBalance(cToken.collateralFactor, 16) + "%"}
  </Text>,
  <Container key={cToken.name + "Test"} direction="row">
    <Button
      key={cToken.name + "cToken.supply"}
      color="primary"
      onClick={onClick}
    >
      Supply
    </Button>
    <Spacer width="10px" />
    <Button
      key={cToken.name + "cToken.withdraw"}
      color="secondary"
      onClick={onClick}
    >
      Withdraw
    </Button>
  </Container>,
];
