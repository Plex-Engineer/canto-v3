import Container from "@/components/container/container";
import mainStyles from "../bridge.module.scss";
import ethStyles from "./ethBridge.module.scss";
import useEthBridgeIn from "./useEthBridgeIn";
import Selector from "@/components/selector/selector";
import Text from "@/components/text";
import Image from "next/image";
import Spacer from "@/components/layout/spacer";
import useScreenSize from "@/hooks/helpers/useScreenSize";
import { displayAmount, sortTokens } from "@/utils/formatting";
import Input from "@/components/input/input";
import Button from "@/components/button/button";
import { validateNonWeiUserInputTokenAmount } from "@/utils/math";
import { BridgingMethod } from "@/transactions/bridge";
import { LoadingTextAnim } from "@/components/loadingText/loadingText";
import { useMemo } from "react";
import { isOFTToken } from "@/utils/tokens";
import BigNumber from "bignumber.js";

interface EthBridgeInProps {
  setEthBridgeIn: () => void;
}
const EthBridgeIn = ({ setEthBridgeIn }: EthBridgeInProps) => {
  const {
    fromNetwork,
    toNetwork,
    availableTokens,
    selectedToken,
    setSelectedTokenId,
    amount,
    setAmount,
    txText,
    txStatus,
    onBridgeIn,
    fees,
  } = useEthBridgeIn();
  const { isMobile } = useScreenSize();

  const amountCheck = validateNonWeiUserInputTokenAmount(
    amount,
    isOFTToken(selectedToken)
      ? BigNumber(10)
          .pow(selectedToken.decimals - selectedToken.sharedDecimals)
          .toString()
      : "1",
    selectedToken?.balance ?? "0",
    selectedToken?.symbol ?? "",
    selectedToken?.decimals ?? 0
  );

  const txInProgress = useMemo(() => txStatus !== "none", [txStatus]);

  return (
    <>
      <section className={mainStyles.container}>
        <div className={ethStyles.networkInfo}>
          <div className={ethStyles.networkIcon}>
            <Image
              src={fromNetwork.icon}
              alt={fromNetwork.name}
              width={90}
              height={90}
            />
            <Text>{fromNetwork.name}</Text>
          </div>
          {/* <div className={ethStyles.dot} /> */}

          <div className={ethStyles["dot-flashing"]} />

          <div className={ethStyles.networkIcon}>
            <Image
              src={toNetwork.icon}
              alt={toNetwork.name}
              width={90}
              height={90}
            />
            <Text>{toNetwork.name}</Text>
          </div>
        </div>
        <div
          className={mainStyles["network-selection"]}
          style={{
            flexDirection: "column",
          }}
        >
          <Text
            style={{
              fontSize: "10px",
              textDecoration: "underline",
              margin: "0 21%",
              cursor: "pointer",
            }}
            theme="secondary-dark"
            onClick={setEthBridgeIn}
          >
            bridge from other network
          </Text>
          <Spacer height="40px" />
          <Container width="100%" gap={14}>
            <Text size="sm">Select Token and Enter Amount</Text>
            <Container
              width="100%"
              direction={!isMobile ? "row" : "column"}
              gap={isMobile ? 50 : 20}
            >
              <Selector
                title="SELECT TOKEN"
                activeItem={
                  selectedToken
                    ? {
                        ...selectedToken,
                        name:
                          selectedToken.name.length > 24
                            ? selectedToken.symbol
                            : selectedToken.name,
                      }
                    : {
                        name: "Select Token",
                        icon: "loader.svg",
                        id: "",
                      }
                }
                items={sortTokens(
                  availableTokens.map((token) => ({
                    ...token,
                    name: token.name.length > 24 ? token.symbol : token.name,
                    secondary: displayAmount(
                      token.balance ?? "0",
                      token.decimals
                    ),
                  }))
                )}
                onChange={(tokenId) => setSelectedTokenId(tokenId)}
              />
              <Container width="100%">
                <Input
                  type="amount"
                  height={64}
                  balance={selectedToken?.balance ?? "0"}
                  tokenMin={
                    isOFTToken(selectedToken)
                      ? BigNumber(10)
                          .pow(
                            selectedToken.decimals -
                              selectedToken.sharedDecimals
                          )
                          .toString()
                      : "0"
                  }
                  tokenMax={selectedToken?.balance ?? "0"}
                  decimals={selectedToken?.decimals ?? 0}
                  placeholder="0.0"
                  value={amount}
                  onChange={(val) => {
                    setAmount(val.target.value);
                  }}
                  className={mainStyles["input"]}
                />
              </Container>
            </Container>
          </Container>
        </div>
        <Spacer height="20px" />
        <>
          {fees.isLoading ? (
            <LoadingTextAnim text="loading fees" />
          ) : (
            <Text font="proto_mono" size="x-sm">
              {txText === "bridge in" && selectedToken?.balance !== "0" ? (
                fees.error !== null ? (
                  "error loading fees"
                ) : fees.method === BridgingMethod.LAYER_ZERO ? (
                  `Fee: ${displayAmount(fees.lzFee.amount, 18, {
                    symbol: "ETH",
                    maxSmallBalance: 0,
                  })}`
                ) : fees.method === BridgingMethod.GRAVITY_BRIDGE &&
                  fees.direction === "in" ? (
                  `Fee: ${displayAmount(fees.gasFee, 18, {
                    symbol: "ETH",
                  })}`
                ) : (
                  <Spacer height="20px" />
                )
              ) : (
                <Spacer height="20px" />
              )}
            </Text>
          )}
        </>
        <Button
          width="fill"
          disabled={amountCheck.error || txInProgress}
          onClick={onBridgeIn}
          isLoading={txInProgress}
          color="primary"
        >
          {txInProgress
            ? txStatus
            : amountCheck.error && amount !== "0"
              ? amountCheck.reason
              : txText}
        </Button>
      </section>
    </>
  );
};

export default EthBridgeIn;
