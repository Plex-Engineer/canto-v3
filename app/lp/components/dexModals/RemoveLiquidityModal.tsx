"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import { convertToBigNumber, displayAmount } from "@/utils/formatting";
import { useEffect, useState } from "react";
import Container from "@/components/container/container";
import { quoteRemoveLiquidity } from "@/utils/cantoDex";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { Validation } from "@/config/interfaces";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import styles from "./cantoDex.module.scss";
import Amount from "@/components/amount/amount";
import { ModalItem } from "@/app/lending/components/modal/modal";
import { addTokenBalances } from "@/utils/math";
import { areEqualAddresses } from "@/utils/address";
import { CantoDexTxTypes } from "@/transactions/pairs/cantoDex";

interface RemoveTxParams {
  pair: CantoDexPairWithUserCTokenData;
  amountLP: string;
  slippage: number;
  deadline: string;
}
export const createRemoveParams = (params: RemoveTxParams) => ({
  pair: params.pair,
  slippage: params.slippage,
  deadline: params.deadline,
  txType: CantoDexTxTypes.REMOVE_LIQUIDITY,
  amountLP: params.amountLP,
  unstake: true,
});
interface RemoveLiquidityProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: RemoveTxParams) => Validation;
  sendTxFlow: (params: RemoveTxParams) => void;
}
export const RemoveLiquidityModal = ({
  pair,
  validateParams,
  sendTxFlow,
}: RemoveLiquidityProps) => {
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("10");
  const [amountLP, setAmountLP] = useState("");

  // total LP will be staked + unstaked balance
  const totalLP = addTokenBalances(
    pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
    pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
  );
  // validation
  const paramCheck = validateParams({
    pair,
    amountLP: (
      convertToBigNumber(amountLP, pair.decimals).data ?? "0"
    ).toString(),
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

  // speical function to display correct symbol if wcanto
  const tokenSymbol = (token: {
    chainId: number;
    address: string;
    symbol: string;
  }) => {
    const wcantoAddress = getCantoCoreAddress(Number(token.chainId), "wcanto");
    return areEqualAddresses(token.address, wcantoAddress ?? "")
      ? "CANTO"
      : token.symbol;
  };
  return (
    <Container margin="sm">
      <div className={styles.iconTitle}>
        <Icon icon={{ url: pair.logoURI, size: 60 }} />
        <Text size="lg" font="proto_mono">
          {pair.symbol}
        </Text>
      </div>
      <Container
        width="100%"
        center={{
          horizontal: true,
        }}
      >
        <Spacer height="10px" />
        <Amount
          value={amountLP}
          decimals={pair.decimals}
          onChange={(e) => setAmountLP(e.target.value)}
          IconUrl={pair.logoURI}
          title={pair.symbol}
          min="1"
          max={totalLP}
          maxName="LP Modal"
          symbol={pair.symbol}
        />
        <Spacer height="20px" />
        <Container className={styles.card}>
          <ModalItem
            name="Slippage"
            value={
              <Container
                center={{
                  vertical: true,
                }}
                gap={40}
                direction="row"
                style={{
                  width: "120px",
                }}
              >
                <Input
                  height={"sm"}
                  type="number"
                  placeholder={Number(slippage).toString()}
                  value={Number(slippage).toString()}
                  onChange={(e) => setSlippage(Number(e.target.value))}
                  error={Number(slippage) > 100 || Number(slippage) < 0}
                />
                <Text>%</Text>
              </Container>
            }
          />
          <ModalItem
            name="Deadline"
            value={
              <Container
                center={{
                  vertical: true,
                }}
                gap={10}
                direction="row"
                style={{
                  width: "120px",
                }}
              >
                <Input
                  height={"sm"}
                  type="number"
                  placeholder={Number(deadline).toString()}
                  value={Number(deadline).toString()}
                  onChange={(e) => setDeadline(e.target.value)}
                  error={Number(deadline) <= 0}
                />
                <Text>mins</Text>
              </Container>
            }
          />
        </Container>
        <Spacer height="6px" />

        <Text
          font="proto_mono"
          size="xx-sm"
          style={{
            marginLeft: "16px",
          }}
        >
          Expected Tokens
        </Text>
        <Spacer height="6px" />

        <Container className={styles.card}>
          <ModalItem
            name={tokenSymbol(pair.token1)}
            value={displayAmount(
              expectedTokens.expectedToken1,
              pair.token1.decimals,
              {
                symbol: tokenSymbol(pair.token1),
              }
            )}
          />
          <ModalItem
            name={tokenSymbol(pair.token2)}
            value={displayAmount(
              expectedTokens.expectedToken2,
              pair.token2.decimals,
              {
                symbol: tokenSymbol(pair.token2),
              }
            )}
          />
        </Container>
        <Spacer height="30px" />

        <Button
          disabled={paramCheck.error}
          width={"fill"}
          onClick={() =>
            sendTxFlow({
              pair,
              amountLP: (
                convertToBigNumber(amountLP, pair.decimals).data ?? "0"
              ).toString(),
              deadline,
              slippage,
            })
          }
        >
          {paramCheck.error ? paramCheck.reason : "Remove Liquidity"}
        </Button>
      </Container>
    </Container>
  );
};
