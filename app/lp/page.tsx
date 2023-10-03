"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import {
  PairsTransactionParams,
  PairsTxTypes,
} from "@/hooks/pairs/interfaces/pairsTxTypes";
import usePairs from "@/hooks/pairs/usePairs";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/tokenBalances.utils";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { GeneralPairRow, UserPairRow } from "./components/pairRow";
import Container from "@/components/container/container";
import { PairWithUserCTokenData } from "@/hooks/pairs/interfaces/pairs";
import { PromiseWithError, ValidationReturn } from "@/config/interfaces";
import { quoteRemoveLiquidity } from "@/utils/evm/pairs.utils";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import Text from "@/components/text";
import Icon from "@/components/icon/icon";
import { getOptimalValueBFormatted } from "@/hooks/pairs/helpers/addLiquidityValues";

export default function Page() {
  const { data: signer } = useWalletClient();
  const chainId = signer?.chain.id === 7701 ? 7701 : 7700;

  const txStore = useStore(useTransactionStore, (state) => state);
  const { pairs, transaction, selection } = usePairs({
    chainId,
    userEthAddress: signer?.account.address ?? "",
  });
  const sortedPairs = pairs?.sort((a, b) => a.symbol.localeCompare(b.symbol));
  const userPairs = pairs.filter(
    (pair) =>
      pair.clmData?.userDetails?.balanceOfCToken !== "0" ||
      pair.clmData?.userDetails?.balanceOfUnderlying !== "0"
  );

  // console.log(pairs);
  const { setPair, pair: selectedPair } = selection;

  // transactions
  function sendTxFlow(params: Partial<PairsTransactionParams>) {
    const { data: flow, error } = transaction.createNewPairsFlow({
      chainId,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as PairsTransactionParams);
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({ txFlow: flow, signer: signer });
    }
  }
  function canPerformTx(
    params: Partial<PairsTransactionParams>
  ): ValidationReturn {
    return transaction.validateParams({
      chainId: signer?.chain.id ?? 7700,
      ethAccount: signer?.account.address ?? "",
      pair: selectedPair,
      ...params,
    } as PairsTransactionParams);
  }

  return (
    <div>
      <Modal open={selectedPair !== null} onClose={() => setPair(null)}>
        {selectedPair && (
          <TestEditModal
            pair={selectedPair}
            validateParams={canPerformTx}
            sendTxFlow={sendTxFlow}
          />
        )}
      </Modal>
      <Text size="x-lg">LP Interface</Text>
      <Spacer height="40px" />;
      <Table
        headers={[
          "Pair",
          "APR",
          "Pool Share",
          "Value",
          "# LP Tokens",
          "# Staked",
          "Rewards",
          "Edit",
        ]}
        columns={9}
        processedData={userPairs.map((pair) => (
          <UserPairRow
            key={pair.symbol}
            pair={pair}
            onAddLiquidity={(pairAddress) => {
              setPair(pairAddress);
            }}
            onRemoveLiquidity={(pairAddress) => {
              setPair(pairAddress);
            }}
          />
        ))}
      />
      <Spacer height="40px" />
      <Table
        headers={["Pair", "APR", "TVL", "Type", "action"]}
        columns={6}
        processedData={sortedPairs.map((pair) => (
          <GeneralPairRow
            key={pair.symbol}
            pair={pair}
            onAddLiquidity={(pairAddress) => {
              setPair(pairAddress);
            }}
          />
        ))}
      />
      <Spacer height="40px" />;
    </div>
  );
}

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
  pair: PairWithUserCTokenData;
  sendTxFlow: (params: Partial<PairsTransactionParams>) => void;
  validateParams: (params: Partial<PairsTransactionParams>) => ValidationReturn;
}
const TestEditModal = (props: TestEditProps) => {
  const [modalType, setModalType] = useState<"add" | "remove" | "base">("base");
  const createAddProps = (params: AddParams) => ({
    pair: props.pair,
    slippage: params.slippage,
    deadline: params.deadline,
    txType: PairsTxTypes.ADD_LIQUIDITY,
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
    txType: PairsTxTypes.REMOVE_LIQUIDITY,
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
                  txType: PairsTxTypes.REMOVE_LIQUIDITY,
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
                  txType: PairsTxTypes.STAKE,
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
        <Button color="accent" onClick={() => setModalType("add")}>
          Add Liquidity
        </Button>
      )}
      {modalType === "add" && (
        <TestAddLiquidityModal
          pair={props.pair}
          validateParams={(params) =>
            props.validateParams(createAddProps(params))
          }
          sendTxFlow={(params) => props.sendTxFlow(createAddProps(params))}
        />
      )}
    </Container>
  );
};

interface TestAddProps {
  pair: PairWithUserCTokenData;
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
        {paramCheck.isValid ? "Add Liquidity" : paramCheck.errorMessage}
      </Button>
    </Container>
  );
};

interface TestRemoveProps {
  pair: PairWithUserCTokenData;
  removeLiquidity: {
    canRemoveLiquidity: (params: RemoveParams) => boolean;
    removeLiquidityTx: (params: RemoveParams) => void;
  };
}

const TestRemoveLiquidityModal = ({
  pair,
  removeLiquidity,
}: TestRemoveProps) => {
  const [slippage, setSlippage] = useState(2);
  const [deadline, setDeadline] = useState("9999999999999999999999999");
  const [amountLP, setAmountLP] = useState("");
  const canRemoveLiquidity = removeLiquidity.canRemoveLiquidity({
    amountLP: (
      convertToBigNumber(amountLP, pair.decimals).data ?? "0"
    ).toString(),
    unstake: true,
    deadline,
    slippage,
  });
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
      console.log(data, error);
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
      <h1>{pair.symbol}</h1>
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
      />
      <Spacer height="50px" />
      <h3>Expected Tokens</h3>
      <h4>
        {formatBalance(expectedTokens.expectedToken1, pair.token1.decimals, {
          commify: true,
          symbol: pair.token1.symbol,
        })}
      </h4>
      <h4>
        {formatBalance(expectedTokens.expectedToken2, pair.token2.decimals, {
          commify: true,
          symbol: pair.token2.symbol,
        })}
      </h4>
      <Button
        disabled={!canRemoveLiquidity}
        onClick={() =>
          removeLiquidity.removeLiquidityTx({
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
