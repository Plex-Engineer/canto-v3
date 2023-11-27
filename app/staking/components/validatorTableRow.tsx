import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import { ValidationReturn } from "@/config/interfaces";
import { Validator } from "@/hooks/staking/interfaces/validators";
import BigNumber from "bignumber.js";
import Text from "@/components/text";
import { formatBalance } from "@/utils/formatting";

export const GenerateValidatorTableRow = (validator: Validator, index: number)=>
        [
            <Container key={`name_${index}`}>{validator.description.moniker}</Container>,
                  <Container key={`tokens_${index}`} direction="row" center={{horizontal: true, vertical:true}} gap="auto">
                    <Text >{formatBalance(validator.tokens,18,{commify:true,precision:2})} </Text>
                    <div>{" "}</div>
                    <Icon
                      icon={{
                        url: "./tokens/canto.svg",
                        size: 16,
                      }}
                    />
                  </Container>,
                  <Container key={`commission_${index}`}>{formatBalance(validator.commission,-2,{commify:true,precision:2})}%</Container>,
                  <Container key={`participation_${index}`}>95%</Container>,
                  <Container key={`delegators_${index}`}>1000</Container>,
                  <Container key={`button_${index}`}>
                    <Button>DELEGATE</Button>
                  </Container>
        ];