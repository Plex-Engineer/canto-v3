import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import { ValidationReturn } from "@/config/interfaces";
import { Validator } from "@/hooks/staking/interfaces/validators";
import BigNumber from "bignumber.js";
import Text from "@/components/text";
import { formatBalance } from "@/utils/formatting";

export const GenerateValidatorTableRow = (validator: Validator, index: number, onDelegate: (validator: Validator)=>void)=>
        [
            <Container key={`name_${index}`}><Text font="rm_mono">{validator.description.moniker}</Text></Container>,
                  <Container key={`tokens_${index}`} direction="row" center={{horizontal: true, vertical:true}} gap="auto">
                    <Text font="rm_mono">{formatBalance(validator.tokens,18,{commify:true,precision:2})} </Text>
                    <div>{" "}</div>
                    <Icon
                      icon={{
                        url: "./tokens/canto.svg",
                        size: 16,
                      }}
                    />
                  </Container>,
                  <Container key={`commission_${index}`}><Text font="rm_mono">{formatBalance(validator.commission,-2,{commify:true,precision:2})}%</Text></Container>,
                  <Container key={`participation_${index}`}><Text font="rm_mono">95%</Text></Container>,
                  <Container key={`delegators_${index}`}><Text font="rm_mono">1000</Text></Container>,
                  <Container key={`button_${index}`}>
                    <Button onClick={()=>onDelegate(validator)}>DELEGATE</Button>
                  </Container>
        ];