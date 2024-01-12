import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import {
  UnbondingDelegation,
  UserUnbondingDelegation,
  Validator,
  ValidatorWithDelegations,
} from "@/hooks/staking/interfaces/validators";
import BigNumber from "bignumber.js";
import Text from "@/components/text";
import { formatBalance } from "@/utils/formatting";
import { formatTime } from "@/utils/gov/formatData";

export const GenerateValidatorTableRow = (
  validator: Validator,
  index: number,
  onDelegate: (validator: Validator) => void
) => [
  <Container key={`name_${index}`}>
    <Text font="rm_mono">{validator.rank}</Text>
  </Container>,
  <Container key={`name_${index}`}>
    <Text font="rm_mono">{validator.description.moniker}</Text>
  </Container>,
  <Container
    key={`tokens_${index}`}
    direction="row"
    center={{ horizontal: true, vertical: true }}
    gap="auto"
  >
    <Text font="rm_mono">
      {formatBalance(validator.tokens, 18, { commify: true, short: true })}{" "}
    </Text>
    <div> </div>
    <Icon
      style={{ marginLeft: "5px" }}
      icon={{
        url: "/tokens/canto.svg",
        size: 16,
      }}
      themed={true}
    />
  </Container>,
  <Container key={`commission_${index}`}>
    <Text font="rm_mono">
      {formatBalance(validator.commission, -2, { commify: true, precision: 2 })}
      %
    </Text>
  </Container>,
  <Container key={`button_${index}`}>
    <Button onClick={() => onDelegate(validator)} disabled={validator.jailed}>
      DELEGATE
    </Button>
  </Container>,
];

export const GenerateMyStakingTableRow = (
  userStakedValidator: ValidatorWithDelegations,
  index: number,
  onDelegate: (validator: Validator) => void
) => [
  <Container key={`name_${index}`}>
    <Text font="rm_mono">{userStakedValidator?.description.moniker}</Text>
  </Container>,
  <Container
    key={`mystake_${index}`}
    direction="row"
    center={{ horizontal: true, vertical: true }}
    gap="auto"
  >
    <Text font="rm_mono">
      {formatBalance(userStakedValidator.userDelegation.balance, 18, {
        commify: true,
      })}{" "}
    </Text>
    <div> </div>
    <Icon
      style={{ marginLeft: "5px" }}
      icon={{
        url: "/tokens/canto.svg",
        size: 16,
      }}
      themed={true}
    />
  </Container>,
  <Container
    key={`tokens_${index}`}
    direction="row"
    center={{ horizontal: true, vertical: true }}
    gap="auto"
  >
    <Text font="rm_mono">
      {formatBalance(userStakedValidator?.tokens, 18, {
        commify: true,
        short: true,
      })}{" "}
    </Text>
    <div> </div>
    <Icon
      style={{ marginLeft: "5px" }}
      icon={{
        url: "/tokens/canto.svg",
        size: 16,
      }}
      themed={true}
    />
  </Container>,
  <Container key={`commission_${index}`}>
    <Text font="rm_mono">
      {formatBalance(userStakedValidator?.commission, -2, {
        commify: true,
        precision: 2,
      })}
      %
    </Text>
  </Container>,
  <Container key={`buttonManage_${index}`}>
    <Button onClick={() => onDelegate(userStakedValidator)}>MANAGE</Button>
  </Container>,
];

export const GenerateUnbondingDelegationsTableRow = (
  userStakedValidator: UnbondingDelegation,
  index: number
) => [
  <Container key={`name_${index}`}>
    <Text font="rm_mono">{userStakedValidator.name}</Text>
  </Container>,
  <Container
    key={`mystake_${index}`}
    direction="row"
    center={{ horizontal: true, vertical: true }}
    gap="auto"
  >
    <Text font="rm_mono">
      {formatBalance(userStakedValidator.undelegation, 18, { commify: true })}{" "}
    </Text>
    <div> </div>
    <Icon
      style={{ marginLeft: "5px" }}
      icon={{
        url: "/tokens/canto.svg",
        size: 16,
      }}
      themed={true}
    />
  </Container>,
  <Container key={`name_${index}`}>
    <Text font="rm_mono">
      {new Date(userStakedValidator.completion_date).toDateString() +
        ", " +
        new Date(userStakedValidator.completion_date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }) +
        (new Date(userStakedValidator.completion_date).getHours() >= Number(12)
          ? "PM"
          : "AM")}
    </Text>
  </Container>,
];
