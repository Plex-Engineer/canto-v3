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
import styles from "./cantoDex.module.scss";
import Amount from "@/components/amount/amount";
import Tabs from "@/components/tabs/tabs";
import { ModalItem } from "@/app/lending/components/modal/modal";
import Toggle from "@/components/toggle";
import { StakeLPModal } from "./stakeModal";
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
  const [modalType, setModalType] = useState<"liquidity" | "stake" | "base">(
    "base"
  );
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
              //   isDisabled:
              //     props.pair.clmData?.userDetails?.balanceOfCToken === "0",
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

  //     <div
  //       style={{
  //         height: "100%",
  //       }}
  //     >
  //       <Container
  //         direction="row"
  //         height="50px"
  //         center={{
  //           vertical: true,
  //         }}
  //         style={{
  //           padding: "0 16px",
  //           cursor: "pointer",
  //           marginTop: "-14px",
  //         }}
  //         onClick={() => setModalType("base")}
  //       >
  //         <div
  //           style={{
  //             rotate: "90deg",
  //             marginRight: "6px",
  //           }}
  //         >
  //           <Icon icon={{ url: "./dropdown.svg", size: 24 }} />
  //         </div>
  //         <Text font="proto_mono" size="lg">
  //           Stake
  //         </Text>
  //       </Container>
  //       <div
  //         style={{
  //           margin: "0  -16px -16px -16px",
  //           height: "39rem",
  //         }}
  //       >
  //         <Tabs
  //           tabs={[
  //             {
  //               title: "Stake",
  //               content: (
  //                 <Container>
  //                   <div className={styles.iconTitle}>
  //                     <Icon icon={{ url: props.pair.logoURI, size: 100 }} />
  //                     <Text size="lg" font="proto_mono">
  //                       {props.pair.symbol}
  //                     </Text>
  //                   </div>
  //                   <StakeLPToken
  //                     pair={props.pair}
  //                     validateParams={(params) =>
  //                       props.validateParams(createAddParams(params))
  //                     }
  //                     sendTxFlow={(params) =>
  //                       props.sendTxFlow({
  //                         txType: CantoDexTxTypes.STAKE,
  //                         amountLP:
  //                           props.pair.clmData?.userDetails
  //                             ?.balanceOfUnderlying ?? "0",
  //                       })
  //                     }
  //                   />
  //                 </Container>
  //               ),
  //             },
  //             {
  //               title: "Unstake",
  //               isDisabled:
  //                 props.pair.clmData?.userDetails?.balanceOfCToken === "0",
  //               content: (
  //                 <Container>
  //                   <div className={styles.iconTitle}>
  //                     <Icon icon={{ url: props.pair.logoURI, size: 100 }} />
  //                     <Text size="lg" font="proto_mono">
  //                       {props.pair.symbol}
  //                     </Text>
  //                   </div>
  //                   <TestRemoveLiquidityModal
  //                     pair={props.pair}
  //                     validateParams={(params) =>
  //                       props.validateParams(createRemoveParams(params))
  //                     }
  //                     sendTxFlow={(params) =>
  //                       props.sendTxFlow(createRemoveParams(params))
  //                     }
  //                   />
  //                 </Container>
  //               ),
  //             },
  //           ]}
  //         />
  //       </div>
  //     </div>
  //   );
  const Base = () =>
    props.pair.clmData?.userDetails?.balanceOfUnderlying !== "0" && (
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
            value={
              props.pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0"
            }
            note
          />
          <ModalItem name="Total # of LP Tokens" value="0" />
          <ModalItem
            name="Staked LP Tokens"
            value={props.pair.clmData?.userDetails?.balanceOfCToken ?? "0"}
          />
          <ModalItem
            name="Unstaked LP Tokens"
            value={displayAmount(
              props.pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
              props.pair.decimals
              //   {
              //     symbol: props.pair.symbol,
              //   }
            )}
          />
        </Container>
        <Container className={styles.card} padding="md" width="100%">
          <ModalItem
            name="Pool Liquidity"
            value={displayAmount(props.pair.tvl, props.pair.decimals)}
            note
          />
          <ModalItem
            name="Pool Share"
            value={
              props.pair.clmData?.userDetails?.supplyBalanceInUnderlying !== "0"
                ? `${(
                    Number(
                      props.pair.clmData?.userDetails?.supplyBalanceInUnderlying
                    ) / Number(props.pair.tvl)
                  ).toFixed(4)}%`
                : "0%"
            }
          />
        </Container>
        {/* <Container gap={20}>
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
        </Container> */}
        <Container gap={20} direction="row">
          <Button width="fill" onClick={() => setModalType("liquidity")}>
            Manage LP
          </Button>
          <Button width="fill" onClick={() => setModalType("stake")}>
            Manage Stake
          </Button>
          {/* {props.pair.clmData?.userDetails?.balanceOfCToken !== "0" && (
              <Button color="accent" onClick={() => setModalType("remove")}>
                Remove Liquidity
              </Button>
            )} */}
        </Container>
      </Container>
    );

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

interface TestAddProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: AddParams) => ValidationReturn;
  sendTxFlow: (params: AddParams) => void;
}
const AddLiquidityModal = ({
  pair,
  validateParams,
  sendTxFlow,
}: TestAddProps) => {
  // values
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("10");
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
      <Spacer height="10px" />
      <Amount
        decimals={pair.token1.decimals}
        value={valueToken1}
        onChange={(e) => {
          setValue(e.target.value, true);
        }}
        IconUrl={pair.token1.logoURI}
        title={pair.token1.symbol}
        max={pair.token1.balance ?? "0"}
        symbol={pair.token1.symbol}
        error={
          !paramCheck.isValid &&
          Number(valueToken1) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.token1.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />

      <Spacer height="20px" />

      <Amount
        decimals={pair.token2.decimals}
        value={valueToken2}
        onChange={(e) => {
          setValue(e.target.value, false);
        }}
        IconUrl={pair.token2.logoURI}
        title={pair.token2.symbol}
        max={pair.token2.balance ?? "0"}
        symbol={pair.token2.symbol}
        error={
          !paramCheck.isValid &&
          Number(valueToken2) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.token2.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="20px" />
      {/* <Container className={styles.card}>
        <ModalItem
          name="Reserve Ratio"
          value={formatBalance(
            pair.ratio,
            18 + Math.abs(pair.token1.decimals - pair.token2.decimals)
          )}
        />
      </Container> */}

      {/* <Button
        color={willStake ? "accent" : "primary"}
        onClick={() => setWillStake(!willStake)}
      >
        STAKE {`${willStake ? "ON" : "OFF"}`}
      </Button> */}
      <Container className={styles.card}>
        {/* <ModalItem
          name="Reserve Ratio"
          value={formatBalance(
            pair.ratio,
            18 + Math.abs(pair.token1.decimals - pair.token2.decimals)
          )}
        /> */}
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
              />
              <Text>mins</Text>
            </Container>
          }
        />
      </Container>

      <Container direction="row" gap={14} margin="sm">
        <Text size="sm" font="proto_mono">
          Stake
        </Text>
        <Toggle onChange={(value) => setWillStake(value)} value={willStake} />
      </Container>

      <Button
        disabled={!paramCheck.isValid}
        width={"fill"}
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
      <Spacer height="20px" />
    </Container>
  );
};

const StakeLPToken = ({ pair, validateParams, sendTxFlow }: TestAddProps) => {
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
      <Spacer height="10px" />
      <Amount
        decimals={pair.token1.decimals}
        value={valueToken1}
        onChange={(e) => {
          setValue(e.target.value, true);
        }}
        IconUrl={pair.token1.logoURI}
        title={pair.token1.symbol}
        max={pair.token1.balance ?? "0"}
        symbol={pair.token1.symbol}
        error={
          !paramCheck.isValid &&
          Number(valueToken1) !== 0 &&
          paramCheck.errorMessage?.startsWith(pair.token1.symbol)
        }
        errorMessage={paramCheck.errorMessage}
      />

      {/* <Spacer height="20px" />
      <Container className={styles.card}>
        <ModalItem
          name="Reserve Ratio"
          value={formatBalance(
            pair.ratio,
            18 + Math.abs(pair.token1.decimals - pair.token2.decimals)
          )}
        />
      </Container> */}

      {/* <Button
          color={willStake ? "accent" : "primary"}
          onClick={() => setWillStake(!willStake)}
        >
          STAKE {`${willStake ? "ON" : "OFF"}`}
        </Button> */}

      <Container direction="row" gap={14} margin="sm">
        <Text size="sm" font="proto_mono">
          Stake
        </Text>
        <Toggle onChange={(value) => setWillStake(value)} value={willStake} />
      </Container>
      <Button
        disabled={!paramCheck.isValid}
        width={"fill"}
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
      <Spacer height="20px" />
    </Container>
  );
};

interface TestRemoveProps {
  pair: CantoDexPairWithUserCTokenData;
  validateParams: (params: RemoveParams) => ValidationReturn;
  sendTxFlow: (params: RemoveParams) => void;
}

const RemoveLiquidityModal = ({
  pair,
  validateParams,
  sendTxFlow,
}: TestRemoveProps) => {
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("10");
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
      <Spacer height="10px" />
      <Amount
        value={amountLP}
        decimals={pair.decimals}
        onChange={(e) => setAmountLP(e.target.value)}
        IconUrl={pair.logoURI}
        title={pair.symbol}
        max={pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0"}
        symbol={pair.symbol}
        error={!paramCheck.isValid && Number(amountLP) !== 0}
        errorMessage={paramCheck.errorMessage}
      />
      <Spacer height="20px" />
      <Container className={styles.card}>
        {/* <ModalItem
          name="Reserve Ratio"
          value={formatBalance(
            pair.ratio,
            18 + Math.abs(pair.token1.decimals - pair.token2.decimals)
          )}
        /> */}
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
          name={pair.token1.symbol}
          value={displayAmount(
            expectedTokens.expectedToken1,
            pair.token1.decimals,
            {
              symbol: pair.token1.symbol,
            }
          )}
        />
        <ModalItem
          name={pair.token2.symbol}
          value={displayAmount(
            expectedTokens.expectedToken2,
            pair.token2.decimals,
            {
              symbol: pair.token2.symbol,
            }
          )}
        />
      </Container>
      <Spacer height="30px" />

      <Button
        disabled={!paramCheck.isValid}
        width={"fill"}
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
