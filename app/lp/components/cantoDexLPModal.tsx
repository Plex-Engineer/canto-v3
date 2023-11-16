"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import {
  convertToBigNumber,
  displayAmount,
  formatPercent,
} from "@/utils/formatting";
import { useEffect, useState } from "react";
import Container from "@/components/container/container";
import { quoteRemoveLiquidity } from "@/utils/cantoDex";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { Validation } from "@/config/interfaces";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import {
  CantoDexTransactionParams,
  CantoDexTxTypes,
} from "@/hooks/pairs/cantoDex/interfaces/pairsTxTypes";
import { CantoDexPairWithUserCTokenData } from "@/hooks/pairs/cantoDex/interfaces/pairs";
import { getOptimalValueBFormatted } from "@/hooks/pairs/cantoDex/helpers/addLiquidityValues";
import styles from "./cantoDex.module.scss";
import Amount from "@/components/amount/amount";
import Tabs from "@/components/tabs/tabs";
import { ModalItem } from "@/app/lending/components/modal/modal";
import Toggle from "@/components/toggle";
import { StakeLPModal } from "./stakeLPModal";
import {
  addTokenBalances,
  convertTokenAmountToNote,
  divideBalances,
} from "@/utils/math";
import { areEqualAddresses } from "@/utils/address";
import PopUp from "@/components/popup/popup";

interface ManageCantoDexLPProps {
  pair: CantoDexPairWithUserCTokenData;
  sendTxFlow: (params: Partial<CantoDexTransactionParams>) => void;
  validateParams: (params: Partial<CantoDexTransactionParams>) => Validation;
}
export const CantoDexLPModal = (props: ManageCantoDexLPProps) => {
  const [modalType, setModalType] = useState<"liquidity" | "stake" | "base">(
    "base"
  );

  const Liquidity = () => (
    <div
      style={{
        height: "100%",
      }}
    >
      <Container
        direction="row"
        height="50px"
        center={{
          vertical: true,
        }}
        style={{
          cursor: "pointer",
          marginTop: "-14px",
        }}
        onClick={() => setModalType("base")}
      >
        <div
          style={{
            rotate: "90deg",
            marginRight: "6px",
          }}
        >
          <Icon icon={{ url: "./dropdown.svg", size: 24 }} themed />
        </div>
        <Text font="proto_mono" size="lg">
          Liquidity
        </Text>
      </Container>
      <div
        style={{
          margin: "0  -16px -16px -16px",
          height: "39rem",
        }}
      >
        <Tabs
          tabs={[
            {
              title: "Add",
              content: (
                <Container width="100%" margin="sm">
                  <div className={styles.iconTitle}>
                    <Icon icon={{ url: props.pair.logoURI, size: 60 }} />
                    <Text size="lg" font="proto_mono">
                      {props.pair.symbol}
                    </Text>
                  </div>
                  <AddLiquidityModal
                    pair={props.pair}
                    validateParams={(params) =>
                      props.validateParams(createAddParams(params))
                    }
                    sendTxFlow={(params) =>
                      props.sendTxFlow(createAddParams(params))
                    }
                  />
                </Container>
              ),
            },
            {
              title: "Remove",
              isDisabled:
                Number(
                  addTokenBalances(
                    props.pair.clmData?.userDetails
                      ?.supplyBalanceInUnderlying ?? "0",
                    props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
                  )
                ) === 0,
              content: (
                <Container width="100%" margin="sm">
                  <div className={styles.iconTitle}>
                    <Icon icon={{ url: props.pair.logoURI, size: 60 }} />
                    <Text size="lg" font="proto_mono">
                      {props.pair.symbol}
                    </Text>
                  </div>
                  <RemoveLiquidityModal
                    pair={props.pair}
                    validateParams={(params) =>
                      props.validateParams(createRemoveParams(params))
                    }
                    sendTxFlow={(params) =>
                      props.sendTxFlow(createRemoveParams(params))
                    }
                  />
                </Container>
              ),
            },
          ]}
        />
      </div>
    </div>
  );

  const Base = () => {
    // total LP will be staked + unstaked balance
    const totalLP = addTokenBalances(
      props.pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
      props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0"
    );
    // position value will be total LP * price
    const { data: positionValue } = convertTokenAmountToNote(
      totalLP,
      props.pair.clmData?.price ?? "0"
    );
    // pool share determined by total value of LP and tvl
    const poolShare = divideBalances(
      positionValue?.toString() ?? "0",
      props.pair.tvl
    );

    return (
      <Container gap={40} padding="md">
        <div className={styles.iconTitle}>
          <Icon icon={{ url: props.pair.logoURI, size: 100 }} />
          <Text size="lg" font="proto_mono">
            {props.pair.symbol}
          </Text>
        </div>
        <Container className={styles.card} padding="md" width="100%">
          <ModalItem
            name="Position Value"
            value={displayAmount(positionValue?.toString() ?? "0", 18)}
            note
          />
          <ModalItem
            name="Total # of LP Tokens"
            value={displayAmount(totalLP, props.pair.decimals)}
          />
          <ModalItem
            name="Staked LP Tokens"
            value={displayAmount(
              props.pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
              props.pair.decimals
            )}
          />
          <ModalItem
            name="Unstaked LP Tokens"
            value={displayAmount(
              props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
              props.pair.decimals
            )}
          />
        </Container>
        <Container className={styles.card} padding="md" width="100%">
          <ModalItem
            name="Pool Liquidity"
            value={displayAmount(props.pair.tvl, 18)}
            note
          />
          <ModalItem name="Pool Share" value={formatPercent(poolShare)} />
        </Container>

        <Container gap={20} direction="row">
          <Button width="fill" onClick={() => setModalType("liquidity")}>
            Manage LP
          </Button>
          <Button
            disabled={Number(totalLP) === 0}
            width="fill"
            onClick={() => setModalType("stake")}
          >
            Manage Stake
          </Button>
        </Container>
      </Container>
    );
  };

  const modals = {
    liquidity: Liquidity(),
    stake: props.pair.clmData ? (
      <StakeLPModal
        onBack={() => setModalType("base")}
        clpToken={props.pair.clmData}
        transaction={{
          validateAmount: (amountLP, txType) =>
            props.validateParams({
              amountLP,
              txType,
            }),
          performTx: (amountLP, txType) =>
            props.sendTxFlow({
              txType,
              amountLP,
            }),
        }}
      />
    ) : (
      "Loading..."
    ),
    base: Base(),
  }[modalType];
  return (
    <Container className={styles.container} width="28rem">
      {modals}
    </Container>
  );
};

// Functions to create correct parameters for transactions (add/remove liquidity)
interface AddTxParams {
  pair: CantoDexPairWithUserCTokenData;
  value1: string;
  value2: string;
  willStake: boolean;
  slippage: number;
  deadline: string;
}
const createAddParams = (params: AddTxParams) => ({
  pair: params.pair,
  slippage: params.slippage,
  deadline: params.deadline,
  txType: CantoDexTxTypes.ADD_LIQUIDITY,
  amounts: {
    amount1: params.value1,
    amount2: params.value2,
  },
  stake: params.willStake,
});
interface RemoveTxParams {
  pair: CantoDexPairWithUserCTokenData;
  amountLP: string;
  slippage: number;
  deadline: string;
}
const createRemoveParams = (params: RemoveTxParams) => ({
  pair: params.pair,
  slippage: params.slippage,
  deadline: params.deadline,
  txType: CantoDexTxTypes.REMOVE_LIQUIDITY,
  amountLP: params.amountLP,
  unstake: true,
});

// Add and Remove Modals
interface AddLiquidityProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: AddTxParams) => Validation;
  sendTxFlow: (params: AddTxParams) => void;
}
const AddLiquidityModal = ({
  pair,
  validateParams,
  sendTxFlow,
}: AddLiquidityProps) => {
  // values
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("10");
  const [willStake, setWillStake] = useState(true);
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
    if (optimalAmount.error) {
      token1 ? setValueToken2("") : setValueToken1("");
      return;
    }
    token1
      ? setValueToken2(optimalAmount.data)
      : setValueToken1(optimalAmount.data);
  }

  // validation
  const paramCheck = validateParams({
    pair,
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
    <Container>
      <Spacer height="10px" />
      <Amount
        decimals={pair.token1.decimals}
        value={valueToken1}
        onChange={(e) => {
          setValue(e.target.value, true);
        }}
        IconUrl={pair.token1.logoURI}
        title={tokenSymbol(pair.token1)}
        min="1"
        max={pair.token1.balance ?? "0"}
        symbol={tokenSymbol(pair.token1)}
      />

      <Spacer height="20px" />

      <Amount
        decimals={pair.token2.decimals}
        value={valueToken2}
        onChange={(e) => {
          setValue(e.target.value, false);
        }}
        IconUrl={pair.token2.logoURI}
        title={tokenSymbol(pair.token2)}
        min="1"
        max={pair.token2.balance ?? "0"}
        symbol={tokenSymbol(pair.token2)}
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

      <Container
        direction="row"
        gap={"auto"}
        width="fill"
        style={{
          padding: "16px 0",
        }}
      >
        <div></div>
        <Container
          direction="row"
          gap={12}
          center={{
            vertical: true,
          }}
        >
          <Text size="sm" font="proto_mono">
            Stake
          </Text>
          <div>
            <PopUp
              content={
                <Text>
                  To receive rewards you&apos;ll need to stake your LP tokens.
                </Text>
              }
              width="300px"
            >
              {/* <Icon
          icon={{
            url: "/check.svg",
            size: 24,
          }}
        /> */}
              <span className={styles.infoPop}>
                <Text
                  theme="secondary-dark"
                  size="sm"
                  style={{
                    textAlign: "right",
                  }}
                >
                  ?
                </Text>
              </span>
            </PopUp>
          </div>
          <Toggle onChange={(value) => setWillStake(value)} value={willStake} />
        </Container>
      </Container>

      <Button
        disabled={paramCheck.error}
        width={"fill"}
        onClick={() =>
          sendTxFlow({
            pair,
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
        {paramCheck.error ? paramCheck.reason : "Add Liquidity"}
      </Button>
      <Spacer height="20px" />
    </Container>
  );
};

interface RemoveLiquidityProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: RemoveTxParams) => Validation;
  sendTxFlow: (params: RemoveTxParams) => void;
}

const RemoveLiquidityModal = ({
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
    <div>
      <Spacer height="10px" />
      <Amount
        value={amountLP}
        decimals={pair.decimals}
        onChange={(e) => setAmountLP(e.target.value)}
        IconUrl={pair.logoURI}
        title={pair.symbol}
        min="1"
        max={totalLP}
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
    </div>
  );
};
