import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import {
  UnbondingDelegation,
  Validator,
  ValidatorWithDelegations,
} from "@/hooks/staking/interfaces/validators";
import Text from "@/components/text";
import { displayAmount } from "@/utils/formatting";
import Analytics from "@/provider/analytics";
import { getAnalyticsStakingInfo } from "@/utils/analytics";

export const GenerateValidatorTableRow = (
  validator: Validator,
  index: number,
  onDelegate: (validator: Validator) => void,
  isMobile: boolean
) => [
  !isMobile && (
    <Container key={`name_${index}`}>
      <Text font="rm_mono">{validator.rank}</Text>
    </Container>
  ),
  <Container key={`name_${index}`}>
    <div
      style={{
        //maxWidth: !isMobile ? "300px" : "150px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <Text font="rm_mono">{validator.description.moniker}</Text>
    </div>
  </Container>,
  <Container
    key={`tokens_${index}`}
    direction="row"
    center={{ horizontal: true, vertical: true }}
    //gap="auto"
  >
    <Text font="rm_mono">{displayAmount(validator.tokens, 18)} </Text>
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
      {displayAmount(validator.commission, -2, { precision: 2 })}%
    </Text>
  </Container>,
  !isMobile && (
    <Container key={`button_${index}`}>
      <Button
        onClick={() => {
          Analytics.actions.events.staking.delegateClicked(
            getAnalyticsStakingInfo(validator, "0")
          );
          onDelegate(validator);
        }}
        disabled={validator.jailed}
      >
        DELEGATE
      </Button>
    </Container>
  ),
];

export const GenerateMyStakingTableRow = (
  userStakedValidator: ValidatorWithDelegations,
  index: number,
  onDelegate: (validator: Validator) => void,
  isMobile: boolean
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
      {displayAmount(userStakedValidator.userDelegation.balance, 18, {
        short: false,
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
  !isMobile && (
    <Container
      key={`tokens_${index}`}
      direction="row"
      center={{ horizontal: true, vertical: true }}
      gap="auto"
    >
      <Text font="rm_mono">
        {displayAmount(userStakedValidator?.tokens, 18, {})}
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
    </Container>
  ),
  <Container key={`commission_${index}`}>
    <Text font="rm_mono">
      {displayAmount(userStakedValidator?.commission, -2, {
        precision: 2,
      })}
      %
    </Text>
  </Container>,
  !isMobile && (
    <Container key={`buttonManage_${index}`}>
      <Button
        onClick={() => {
          Analytics.actions.events.staking.manageClicked(
            getAnalyticsStakingInfo(
              userStakedValidator,
              userStakedValidator.userDelegation.balance
            )
          );
          onDelegate(userStakedValidator);
        }}
      >
        MANAGE
      </Button>
    </Container>
  ),
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
      {displayAmount(userStakedValidator.undelegation, 18, {
        short: false,
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
