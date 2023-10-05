"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/tokenBalances.utils";
import { useEffect, useState } from "react";
import Container from "@/components/container/container";
import { quoteRemoveLiquidity } from "@/utils/evm/pairs.utils";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { ValidationReturn } from "@/config/interfaces";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import {
  CantoDexTransactionParams,
  CantoDexTxTypes,
} from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { getOptimalValueBFormatted } from "@/hooks/pairs/cantoDex/helpers/addLiquidityValues";

interface AddParams {
  value1: string;
  value2: string;
  willStake: boolean;
  slippage: number;
  deadline: string;
}
interface RemoveParams {
  amountLP: string;
  unstake: boolean;
  slippage: number;
  deadline: string;
}
interface TestEditProps {
  pair: CantoDexPairWithUserCTokenData;
  sendTxFlow: (params: Partial<CantoDexTransactionParams>) => void;
  validateParams: (
    params: Partial<CantoDexTransactionParams>
  ) => ValidationReturn;
}
export const TestEditModal = (props: TestEditProps) => {
  const [modalType, setModalType] = useState<"add" | "remove" | "base">("base");
  const createAddParams = (params: AddParams) => ({
    pair: props.pair,
    slippage: params.slippage,
    deadline: params.deadline,
    txType: CantoDexTxTypes.ADD_LIQUIDITY,
    amounts: {
      amount1: params.value1,
      amount2: params.value2,
    },
    stake: params.willStake,
  });
  const createRemoveParams = (params: RemoveParams) => ({
    pair: props.pair,
    slippage: params.slippage,
    deadline: params.deadline,
    txType: CantoDexTxTypes.REMOVE_LIQUIDITY,
    amountLP: params.amountLP,
    unstake: true,
  });
  return (
    <Container>
      {modalType !== "base" && (
        <Button onClick={() => setModalType("base")}>Back</Button>
      )}
      <Icon icon={{ url: props.pair.logoURI, size: 50 }} />
      <Text size="lg" weight="bold">
        {props.pair.symbol}
      </Text>
      {modalType === "base" &&
        props.pair.clmData?.userDetails?.balanceOfUnderlying !== "0" && (
          <Container>
            <Text>
              Unstaked Liquidity{" "}
              {displayAmount(
                props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
                props.pair.decimals,
                {
                  symbol: props.pair.symbol,
                }
              )}
            </Text>
            <Button
              onClick={() =>
                props.sendTxFlow({
                  txType: CantoDexTxTypes.REMOVE_LIQUIDITY,
                  amountLP:
                    props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
                  slippage: 2,
                  deadline: "9999999999999999999999999",
                })
              }
            >
              Remove Unstaked Liquidity
            </Button>
            <Button
              onClick={() =>
                props.sendTxFlow({
                  txType: CantoDexTxTypes.STAKE,
                  amountLP:
                    props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
                })
              }
            >
              Stake Unstaked Liquidity
            </Button>
          </Container>
        )}
      {modalType === "base" && (
        <>
          <Button color="accent" onClick={() => setModalType("add")}>
            Add Liquidity
          </Button>
          {props.pair.clmData?.userDetails?.balanceOfCToken !== "0" && (
            <Button color="accent" onClick={() => setModalType("remove")}>
              Remove Liquidity
            </Button>
          )}
        </>
      )}
      {modalType === "add" && (
        <TestAddLiquidityModal
          pair={props.pair}
          validateParams={(params) =>
            props.validateParams(createAddParams(params))
          }
          sendTxFlow={(params) => props.sendTxFlow(createAddParams(params))}
        />
      )}
      {modalType === "remove" && (
        <TestRemoveLiquidityModal
          pair={props.pair}
          validateParams={(params) =>
            props.validateParams(createRemoveParams(params))
          }
          sendTxFlow={(params) => props.sendTxFlow(createRemoveParams(params))}
        />
      )}
    </Container>
  );
};

interface TestAddProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: AddParams) => ValidationReturn;
  sendTxFlow: (params: AddParams) => void;
}
const TestAddLiquidityModal = ({
  pair,
  validateParams,
  sendTxFlow,
}: TestAddProps) => {
  // values
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("9999999999999999999999999");
  const [willStake, setWillStake] = useState(false);
  const [valueToken1, setValueToken1] = useState("");
  const [valueToken2, setValueToken2] = useState("");

  // set values based on optimization
  async function setValue(value: string, token1: boolean) {
    let optimalAmount;
    if (token1) {
      setValueToken1(value);
      optimalAmount = await getOptimalValueBFormatted({
        chainId: Number(pair.token1.chainId),
        pair,
        valueChanged: 1,
        amount: value,
      });
    } else {
      setValueToken2(value);
      optimalAmount = await getOptimalValueBFormatted({
        chainId: Number(pair.token1.chainId),
        pair,
        valueChanged: 2,
        amount: value,
      });
    }
    if (optimalAmount.error) return;
    token1
      ? setValueToken2(optimalAmount.data)
      : setValueToken1(optimalAmount.data);
  }

  // validation
  const paramCheck = validateParams({
    value1: (
      convertToBigNumber(valueToken1, pair.token1.decimals).data ?? "0"
    ).toString(),
    value2: (
      convertToBigNumber(valueToken2, pair.token2.decimals).data ?? "0"
    ).toString(),
    willStake,
    slippage,
    deadline,
  });

  return (
    <Container>
      <h3>
        Reserve Ratio:{" "}
        {formatBalance(
          pair.ratio,
          18 + Math.abs(pair.token1.decimals - pair.token2.decimals)
        )}
      </h3>
      <Spacer height="50px" />
      <Input
        value={valueToken1}
        onChange={(e) => {
          setValue(e.target.value, true);
        }}
        label={pair.token1.symbol}
        type="amount"
        balance={pair.token1.balance ?? "0"}
        decimals={pair.token1.decimals}
        error={
          !paramCheck.isValid &&
          Number(valueToken1) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.token1.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="50px" />
      <Input
        value={valueToken2}
        onChange={(e) => {
          setValue(e.target.value, false);
        }}
        label={pair.token2.symbol}
        type="amount"
        balance={pair.token2.balance ?? "0"}
        decimals={pair.token2.decimals}
        error={
          !paramCheck.isValid &&
          Number(valueToken2) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.token2.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="50px" />
      <Button
        color={willStake ? "accent" : "primary"}
        onClick={() => setWillStake(!willStake)}
      >
        STAKE {`${willStake ? "ON" : "OFF"}`}
      </Button>
      <Button
        disabled={!paramCheck.isValid}
        onClick={() =>
          sendTxFlow({
            value1: (
              convertToBigNumber(valueToken1, pair.token1.decimals).data ?? "0"
            ).toString(),
            value2: (
              convertToBigNumber(valueToken2, pair.token2.decimals).data ?? "0"
            ).toString(),
            willStake,
            slippage,
            deadline,
          })
        }
      >
        {"Add Liquidity"}
      </Button>
    </Container>
  );
};

interface TestRemoveProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: RemoveParams) => ValidationReturn;
  sendTxFlow: (params: RemoveParams) => void;
}

const TestRemoveLiquidityModal = ({
  pair,
  validateParams,
  sendTxFlow,
}: TestRemoveProps) => {
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("9999999999999999999999999");
  const [amountLP, setAmountLP] = useState("");

  // validation
  const paramCheck = validateParams({
    amountLP: (
      convertToBigNumber(amountLP, pair.decimals).data ?? "0"
    ).toString(),
    unstake: true,
    deadline,
    slippage,
  });

  // expected tokens
  const [expectedTokens, setExpectedTokens] = useState({
    expectedToken1: "0",
    expectedToken2: "0",
  });
  useEffect(() => {
    async function getQuote() {
      const { data, error } = await quoteRemoveLiquidity(
        Number(pair.token1.chainId),
        getCantoCoreAddress(Number(pair.token1.chainId), "router") ?? "",
        pair.token1.address,
        pair.token2.address,
        pair.stable,
        (convertToBigNumber(amountLP, pair.decimals).data ?? "0").toString()
      );
      if (error) {
        setExpectedTokens({
          expectedToken1: "0",
          expectedToken2: "0",
        });
      } else {
        setExpectedTokens({
          expectedToken1: data?.expectedToken1 ?? "0",
          expectedToken2: data?.expectedToken2 ?? "0",
        });
      }
    }
    getQuote();
  }, [amountLP]);
  return (
    <div>
      {" "}
      <h3>
        Reserve Ratio:{" "}
        {formatBalance(
          pair.ratio,
          18 + Math.abs(pair.token1.decimals - pair.token2.decimals)
        )}
      </h3>
      <Spacer height="50px" />
      <Input
        value={amountLP}
        onChange={(e) => setAmountLP(e.target.value)}
        label={pair.symbol}
        type="amount"
        balance={pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0"}
        decimals={pair.decimals}
        error={!paramCheck.isValid && Number(amountLP) !== 0}
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="50px" />
      <h3>Expected Tokens</h3>
      <h4>
        {displayAmount(expectedTokens.expectedToken1, pair.token1.decimals, {
          symbol: pair.token1.symbol,
        })}
      </h4>
      <h4>
        {displayAmount(expectedTokens.expectedToken2, pair.token2.decimals, {
          symbol: pair.token2.symbol,
        })}
      </h4>
      <Button
        disabled={!paramCheck.isValid}
        onClick={() =>
          sendTxFlow({
            amountLP: (
              convertToBigNumber(amountLP, pair.decimals).data ?? "0"
            ).toString(),
            unstake: true,
            deadline,
            slippage,
          })
        }
      >
        Remove Liquidity
      </Button>
    </div>
  );
};
