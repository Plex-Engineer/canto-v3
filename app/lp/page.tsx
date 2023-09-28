"use client";
import Button from "@/components/button/button";
import Icon from "@/components/icon/icon";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import { PairWithUserCTokenData } from "@/hooks/pairs/interfaces/pairs";
import { PairsTxTypes } from "@/hooks/pairs/interfaces/pairsTxTypes";
import usePairs from "@/hooks/pairs/usePairs";
import useTransactionStore from "@/stores/transactionStore";
import useStore from "@/stores/useStore";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import { useState } from "react";
import { useWalletClient } from "wagmi";

export default function Page() {
  const signer = useWalletClient();
  const txStore = useStore(useTransactionStore, (state) => state);
  const { pairs, transaction, amounts, selection } = usePairs({
    chainId: signer.data?.chain.id ?? 7700,
    userEthAddress: signer.data?.account.address ?? "",
  });
  const sortedPairs = pairs?.sort((a, b) => a.symbol.localeCompare(b.symbol));
  const { setPair, pair: selectedPair } = selection;

  // values
  const [valueToken1, setValueToken1] = useState("");
  const [valueToken2, setValueToken2] = useState("");
  async function setValue(value: string, token1: boolean) {
    if (!selectedPair) return;
    let optimalAmount;
    if (token1) {
      setValueToken1(value);
      optimalAmount = await amounts.getOptimalAmount2(value, selectedPair);
    } else {
      setValueToken2(value);
      optimalAmount = await amounts.getOptimalAmount1(value, selectedPair);
    }
    if (optimalAmount.error) return;
    token1
      ? setValueToken2(optimalAmount.data)
      : setValueToken1(optimalAmount.data);
  }

  // transactions
  const [willStake, setWillStake] = useState(false);
  function addLiquidity() {
    if (!selectedPair) return;
    const { data: flow, error } = transaction.createNewPairsFlow({
      chainId: signer.data?.chain.id ?? 7700,
      ethAccount: signer.data?.account.address ?? "",
      pair: selectedPair,
      slippage: 2,
      deadline: "9999999999999999999999999",
      txType: PairsTxTypes.ADD_LIQUIDITY,
      stake: willStake,
      amounts: {
        amount1: convertToBigNumber(
          valueToken1,
          selectedPair.token1.decimals
        ).data.toString(),
        amount2: convertToBigNumber(
          valueToken2,
          selectedPair.token2.decimals
        ).data.toString(),
      },
    });
    if (error) {
      console.log(error);
    } else {
      txStore?.addNewFlow({ txFlow: flow, signer: signer.data });
    }
  }

  const PairTable = ({ pairs }: { pairs: PairWithUserCTokenData[] }) => {
    return (
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Symbol</th>
            <th>Stable</th>
            <th>LP Price</th>
            <th>Ratio</th>
            <th>Token 1</th>
            <th>Token 2</th>
            <th>TVL</th>
            <th>edit</th>
            <th>user tokens</th>
            <th>user stake</th>
            <th>rewards</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <PairRow key={pair.symbol} pair={pair} />
          ))}
        </tbody>
      </table>
    );
  };
  const PairRow = ({ pair }: { pair: PairWithUserCTokenData }) => {
    return (
      <tr>
        <td>
          <Icon
            icon={{
              url: pair.logoURI,
              size: 54,
            }}
          ></Icon>
        </td>
        <td>{pair.symbol}</td>
        <td>{pair.stable ? "stable" : "vol"}</td>
        <td>{formatBalance(pair.lpPrice, 36 - pair.decimals)}</td>
        <td>
          {formatBalance(
            pair.ratio,
            18 +
              (pair.aTob
                ? pair.token1.decimals - pair.token2.decimals
                : pair.token2.decimals - pair.token1.decimals)
          )}
        </td>
        <td>{pair.token1.symbol}</td>
        <td>{pair.token2.symbol}</td>
        <td>{formatBalance(pair.tvl, 18, { commify: true })}</td>
        <td>
          <Button onClick={() => setPair(pair.address)}>Manage</Button>
        </td>
        <td>
          {formatBalance(
            pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
            pair.decimals
          )}
        </td>
        <td>
          {formatBalance(
            pair.clmData?.userDetails?.supplyBalanceInUnderlying ?? "0",
            pair.decimals
          )}
        </td>
        <td>{formatBalance(pair.clmData?.userDetails?.rewards ?? "0", 18)}</td>
      </tr>
    );
  };
  return (
    <div>
      TEST LP
      <Modal
        open={selectedPair !== null}
        onClose={() => {
          setPair(null);
          setValueToken1("");
          setValueToken2("");
        }}
      >
        {selectedPair && (
          <div>
            <h1>{selectedPair.symbol}</h1>
            <h3>
              Reserve Ratio:{" "}
              {formatBalance(
                selectedPair.ratio,
                18 +
                  Math.abs(
                    selectedPair.token1.decimals - selectedPair.token2.decimals
                  )
              )}
            </h3>
            <Spacer height="50px" />
            <Input
              value={valueToken1}
              onChange={(e) => {
                setValue(e.target.value, true);
              }}
              label={selectedPair.token1.symbol}
              type="amount"
              balance={selectedPair.token1.balance ?? "0"}
              decimals={selectedPair.token1.decimals}
            />
            <Spacer height="50px" />
            <Input
              value={valueToken2}
              onChange={(e) => {
                setValue(e.target.value, false);
              }}
              label={selectedPair.token2.symbol}
              type="amount"
              balance={selectedPair.token2.balance ?? "0"}
              decimals={selectedPair.token2.decimals}
            />
            <Spacer height="50px" />
            <Button
              color={willStake ? "accent" : "primary"}
              onClick={() => setWillStake(!willStake)}
            >
              STAKE {`${willStake ? "ON" : "OFF"}`}
            </Button>
            <Button onClick={addLiquidity}>Add Liquidity</Button>
          </div>
        )}
      </Modal>
      <PairTable pairs={sortedPairs ?? []} />
    </div>
  );
}
