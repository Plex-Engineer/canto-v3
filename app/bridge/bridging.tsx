"use client";
import Spacer from "@/components/layout/spacer";
import Selector from "@/components/selector/selector";
import Text from "@/components/text";
import { displayAmount, sortTokens } from "@/utils/formatting";
import styles from "./bridge.module.scss";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Container from "@/components/container/container";
import Image from "next/image";
import ConfirmationModal from "./components/confirmationModal";
import { isEVMNetwork } from "@/utils/networks";
import { BridgeComboReturn } from "./util";
import { BridgingFeesReturn } from "@/hooks/bridge/useBridgingFees";
import { BridgingMethod } from "@/transactions/bridge";
import { addTokenBalances } from "@/utils/math";
import { BridgeToken } from "@/hooks/bridge/interfaces/tokens";
import FeeButton from "./components/feeButton";
import { useEffect, useState } from "react";
import GravityConfirmationModal from "./components/gravityConfirmationModal";
import { GRAVITY_BRIDGE } from "@/config/networks";
import { TX_ERROR_TYPES } from "@/config/consts/errors";
import useScreenSize from "@/hooks/helpers/useScreenSize";

const Bridging = ({ props }: { props: BridgeComboReturn }) => {
  const {
    Amount,
    Direction,
    Transaction,
    Confirmation,
    bridgeHook: bridge,
    cosmosProps,
    networkName,
    feesHook: fees,
    feesSelection,
  } = props;
  const { fromNetwork, toNetwork, token, method } = bridge.selections;
  const { selectedGBridgeFee, setSelectedGBridgeFee, totalChainFee } =
    feesSelection.gravityBridge;
  const feeObject = formattedFeesForConfirmation(fees, token, {
    totalChainFee,
    selected: selectedGBridgeFee,
  });

  // special modal for gravity bridge out (check for wallet provider custom chains)
  const [gravityModalOpen, setGravityModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const screen = useScreenSize();
  useEffect(() => {
    setIsMobile(screen.width < 768);
  }, [screen.width]);
  return (
    <>
      <GravityConfirmationModal
        open={gravityModalOpen}
        onClose={() => setGravityModalOpen(false)}
        onConfirm={() => {
          setGravityModalOpen(false);
          Confirmation.setIsModalOpen(true);
        }}
        onReselectMethod={() => {
          setGravityModalOpen(false);
          bridge.setState("network", GRAVITY_BRIDGE.id);
          Confirmation.setIsModalOpen(true);
        }}
      />
      <ConfirmationModal
        open={Confirmation.isModalOpen}
        onClose={() => {
          Confirmation.setIsModalOpen(false);
        }}
        {...cosmosProps}
        token={{
          name: token?.symbol ?? "",
          url: token?.icon ?? "",
        }}
        imgUrl={
          bridge.direction === "in"
            ? fromNetwork?.icon ?? ""
            : toNetwork?.icon ?? ""
        }
        addresses={{
          from: bridge.addresses.getSender(),
          to: bridge.addresses.getReceiver(),
        }}
        fromNetwork={networkName(fromNetwork)}
        toNetwork={networkName(toNetwork)}
        type={bridge.direction}
        amount={displayAmount(
          Amount.amountAsBigNumberString,
          token?.decimals ?? 0,
          {
            symbol: token?.symbol,
            precision: token?.decimals,
          }
        )}
        fees={feeObject}
        confirmation={{
          onConfirm: () => {
            Transaction.bridgeTx();
          },
          canConfirm: !Transaction.canBridge.error,
        }}
        showGravityPortalMsg={toNetwork?.id === GRAVITY_BRIDGE.id}
      />
      <section className={styles.container}>
        <div
          className={styles["network-selection"]}
          style={{
            flexDirection:
              bridge.direction === "in" ? "column" : "column-reverse",
          }}
        >
          {/* select network group */}

          <Container width="100%" gap={14}>
            {bridge.direction === "in" ? (
              <>
                <Text size="sm">Select Network</Text>

                <Selector
                  label={{
                    text: "From",
                    width: "50px",
                  }}
                  title="SELECT FROM NETWORK"
                  activeItem={
                    fromNetwork ?? {
                      name: "Select network",
                      icon: "loader.svg",
                      id: "",
                    }
                  }
                  items={
                    bridge.direction === "in"
                      ? bridge.allOptions.networks.filter((network) =>
                          isEVMNetwork(network)
                        )!
                      : []
                  }
                  groupedItems={[
                    {
                      main: {
                        name: "Cosmos Networks",
                        icon: "/icons/atom.svg",
                        id: "",
                      },
                      items: bridge.allOptions.networks.filter(
                        (network) => !isEVMNetwork(network)
                      ),
                    },
                  ]}
                  onChange={
                    bridge.direction === "in"
                      ? (networkId) => bridge.setState("network", networkId)
                      : () => false
                  }
                />
              </>
            ) : (
              <>
                <Text size="sm">Select Network</Text>

                <div className={styles["network-box"]}>
                  <Text
                    theme="secondary-dark"
                    size="sm"
                    style={{
                      width: "60px",
                    }}
                  >
                    From
                  </Text>
                  <div className={styles.token}>
                    <Image
                      src={fromNetwork?.icon ?? "loader.svg"}
                      alt={fromNetwork?.name ?? "loading"}
                      width={30}
                      height={30}
                    />
                    <Text size="md" font="proto_mono">
                      {fromNetwork?.name}
                    </Text>
                  </div>
                </div>
              </>
            )}

            {bridge.direction === "out" ? (
              <Selector
                label={{
                  text: "To",
                  width: "50px",
                }}
                title="SELECT TO NETWORK"
                activeItem={
                  toNetwork ?? {
                    name: "Select network",
                    icon: "loader.svg",
                    id: "",
                  }
                }
                items={
                  bridge.direction === "out" ? bridge.allOptions.networks : []
                }
                onChange={
                  bridge.direction === "out"
                    ? (networkId) => bridge.setState("network", networkId)
                    : () => false
                }
              />
            ) : (
              <div className={styles["network-box"]}>
                <Text
                  theme="secondary-dark"
                  size="sm"
                  style={{
                    width: "60px",
                  }}
                >
                  To
                </Text>

                <div className={styles.token}>
                  <Image
                    src={toNetwork?.icon ?? "loader.svg"}
                    alt={toNetwork?.name ?? "loading"}
                    width={30}
                    height={30}
                  />
                  <Text size="md" font="proto_mono">
                    {toNetwork?.name}
                  </Text>
                </div>
              </div>
            )}
          </Container>
          <Spacer height="20px" />
          {/* select token group */}

          <Container width="100%" gap={14}>
            <Text size="sm">Select Token and Enter Amount</Text>
            <Container
              width="100%"
              direction={isMobile ? "column" : "row"}
              gap={isMobile ? 50 : 20}
            >
              <Selector
                title="SELECT TOKEN"
                activeItem={
                  token
                    ? {
                        ...token,
                        name:
                          token.name.length > 24 ? token.symbol : token.name,
                      }
                    : {
                        name: "Select Token",
                        icon: "loader.svg",
                        id: "",
                      }
                }
                items={sortTokens(
                  bridge.allOptions.tokens.map((token) => ({
                    ...token,
                    name: token.name.length > 24 ? token.symbol : token.name,
                    secondary: displayAmount(
                      token.balance ?? "0",
                      token.decimals
                    ),
                  }))
                )}
                onChange={(tokenId) => bridge.setState("token", tokenId)}
              />
              <Container width="100%">
                <Input
                  type="amount"
                  height={64}
                  balance={token?.balance ?? "0"}
                  tokenMin="0"
                  tokenMax={Amount.maxBridgeAmount}
                  decimals={token?.decimals ?? 0}
                  placeholder="0.0"
                  value={Amount.amount}
                  onChange={(val) => {
                    Amount.setAmount(val.target.value);
                  }}
                  className={styles["input"]}
                />
              </Container>
            </Container>
          </Container>
          {/* <Text size="sm">Select Method</Text>
          <Selector
            title="SELECT METHOD"
            activeItem={{
              name: getBridgeMethodInfo(method).name,
              id: method ?? "0",
              icon: getBridgeMethodInfo(method).icon,
            }}
            items={hook.allOptions.methods.map((method) => ({
              name: getBridgeMethodInfo(method).name,
              id: method,
              icon: getBridgeMethodInfo(method).icon,
            }))}
            onChange={(method) =>
              hook.setters.method(method as BridgingMethod)
            }
          /> */}
        </div>

        <Spacer height="20px" />
        {bridge.direction === "out" ? (
          <FeesSection
            props={fees}
            fees={{
              totalChainFee,
              selected: selectedGBridgeFee,
              setSelected: setSelectedGBridgeFee,
            }}
            token={token}
            notEnoughNativeBalance={
              Confirmation.preConfirmCheck.error &&
              (Confirmation.preConfirmCheck.reason ===
                TX_ERROR_TYPES.NOT_ENOUGH_NATIVE_BALANCE_LZ ||
                Confirmation.preConfirmCheck.reason ===
                  TX_ERROR_TYPES.NOT_ENOUGH_NATIVE_BALANCE_GRAVITY_BRIDGE ||
                Confirmation.preConfirmCheck.reason ===
                  TX_ERROR_TYPES.NOT_ENOUGH_NATIVE_BALANCE_IBC)
            }
          />
        ) : (
          <Spacer height="20px" />
        )}

        <Button
          width="fill"
          onClick={() => {
            if (
              Direction.direction === "out" &&
              method === BridgingMethod.GRAVITY_BRIDGE
            ) {
              setGravityModalOpen(true);
            } else {
              Confirmation.setIsModalOpen(true);
            }
          }}
          disabled={
            Confirmation.preConfirmCheck.error ||
            fees.isLoading ||
            fees.error !== null
          }
        >
          {bridge.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};

export default Bridging;

const formattedFeesForConfirmation = (
  props: BridgingFeesReturn,
  token: BridgeToken | null,
  gravityFees: {
    selected: string;
    totalChainFee: string;
  }
):
  | { tokenFees: { key: string; value: string }[]; totalFees?: string }
  | undefined => {
  return props.isLoading
    ? undefined
    : props.error !== null
      ? undefined
      : props.method === BridgingMethod.LAYER_ZERO
        ? {
            tokenFees: [{ key: "gas fee", value: props.lzFee.formattedAmount }],
          }
        : props.method === BridgingMethod.GRAVITY_BRIDGE &&
            props.direction === "out"
          ? {
              tokenFees: [
                {
                  key: "bridge fee (paid to validators)",
                  value: displayAmount(
                    gravityFees.selected,
                    token?.decimals ?? 0,
                    {
                      symbol: token?.symbol,
                      maxSmallBalance: undefined,
                    }
                  ),
                },
                {
                  key: "chain fee (paid to relayers)",
                  value: displayAmount(
                    gravityFees.totalChainFee,
                    token?.decimals ?? 0,
                    {
                      symbol: token?.symbol,
                      maxSmallBalance: undefined,
                    }
                  ),
                },
                ...Object.values(props.gasFees).map((fee) => ({
                  key: fee.name,
                  value: displayAmount(fee.amount, 18, { symbol: "CANTO" }),
                })),
              ],
              totalFees:
                displayAmount(
                  addTokenBalances(
                    gravityFees.selected,
                    gravityFees.totalChainFee
                  ),
                  token?.decimals ?? 0,
                  {
                    symbol: token?.symbol,
                    maxSmallBalance: undefined,
                  }
                ) +
                " & " +
                displayAmount(
                  Object.values(props.gasFees).reduce(
                    (acc, fee) => addTokenBalances(acc, fee.amount),
                    "0"
                  ),
                  18,
                  { symbol: "CANTO" }
                ),
            }
          : props.method === BridgingMethod.IBC && props.direction === "out"
            ? {
                tokenFees: Object.values(props.gasFees).map((fee) => ({
                  key: fee.name,
                  value: displayAmount(fee.amount, 18, { symbol: "CANTO" }),
                })),
                totalFees: displayAmount(
                  Object.values(props.gasFees).reduce(
                    (acc, fee) => addTokenBalances(acc, fee.amount),
                    "0"
                  ),
                  18,
                  { symbol: "CANTO" }
                ),
              }
            : undefined;
};

function LoadingTextAnim() {
  const [value, setValue] = useState("loading fees");

  useEffect(() => {
    const interval = setInterval(() => {
      if (value === "loading fees...") {
        setValue("loading fees");
      } else {
        setValue(value + ".");
      }
    }, 200);
    return () => clearInterval(interval);
  });
  return (
    <Text font="proto_mono" size="x-sm" className={styles.blink}>
      {value}
    </Text>
  );
}

// props are return type of useBridgingFees
const FeesSection = ({
  props,
  fees,
  token,
  notEnoughNativeBalance,
}: {
  props: BridgingFeesReturn;
  fees: {
    selected: string;
    setSelected: (value: string) => void;
    totalChainFee: string;
  };
  token: BridgeToken | null;
  notEnoughNativeBalance: boolean;
}) => {
  return props.isLoading ? (
    <LoadingTextAnim />
  ) : props.error !== null ? (
    <Text font="proto_mono" size="x-sm">
      error loading fees {props.error}
    </Text>
  ) : (
    <>
      {props.method === BridgingMethod.LAYER_ZERO &&
        props.direction === "out" && (
          <Text
            font="proto_mono"
            size="x-sm"
            color={
              notEnoughNativeBalance
                ? " var(--extra-failure-color, #ff0000)"
                : ""
            }
          >
            Gas Fee: {props.lzFee.formattedAmount}
          </Text>
        )}
      {props.method === BridgingMethod.GRAVITY_BRIDGE &&
        props.direction === "out" && (
          <>
            <Container direction="row" gap={10}>
              <FeeButton
                key={props.bridgeFeeOptions.slow.fee}
                onClick={() =>
                  fees.setSelected(props.bridgeFeeOptions.slow.fee)
                }
                title="slow"
                subtext={"1 - 5 days"}
                subtext2={"Batched transfer"}
                tokenSymbol={token?.symbol ?? ""}
                tokenAmount={displayAmount(
                  addTokenBalances(
                    props.bridgeFeeOptions.slow.fee,
                    fees.totalChainFee
                  ),
                  token?.decimals ?? 0,
                  { maxSmallBalance: undefined }
                )}
                tokenValueUSD={props.bridgeFeeOptions.slow.usdValueFormatted}
                active={fees.selected === props.bridgeFeeOptions.slow.fee}
              />
              <FeeButton
                key={props.bridgeFeeOptions.medium.fee}
                onClick={() =>
                  fees.setSelected(props.bridgeFeeOptions.medium.fee)
                }
                title="medium"
                subtext={"4 hours - 3 days"}
                subtext2={"Batched transfer"}
                tokenSymbol={token?.symbol ?? ""}
                tokenAmount={displayAmount(
                  addTokenBalances(
                    props.bridgeFeeOptions.medium.fee,
                    fees.totalChainFee
                  ),
                  token?.decimals ?? 0,
                  { maxSmallBalance: undefined }
                )}
                tokenValueUSD={props.bridgeFeeOptions.medium.usdValueFormatted}
                active={fees.selected === props.bridgeFeeOptions.medium.fee}
              />
              <FeeButton
                key={props.bridgeFeeOptions.fast.fee}
                onClick={() =>
                  fees.setSelected(props.bridgeFeeOptions.fast.fee)
                }
                title="fast"
                subtext={"30 minutes"}
                subtext2={"Individual transfer"}
                tokenSymbol={token?.symbol ?? ""}
                tokenAmount={displayAmount(
                  addTokenBalances(
                    props.bridgeFeeOptions.fast.fee,
                    fees.totalChainFee
                  ),
                  token?.decimals ?? 0,
                  { maxSmallBalance: undefined }
                )}
                tokenValueUSD={props.bridgeFeeOptions.fast.usdValueFormatted}
                active={fees.selected === props.bridgeFeeOptions.fast.fee}
              />
            </Container>
            <Text
              font="proto_mono"
              size="x-sm"
              color={
                notEnoughNativeBalance
                  ? " var(--extra-failure-color, #ff0000)"
                  : ""
              }
            >
              Gas Fee:{" "}
              {displayAmount(
                Object.values(props.gasFees).reduce(
                  (acc, fee) => addTokenBalances(acc, fee.amount),
                  "0"
                ),
                18,
                { symbol: "CANTO" }
              )}
            </Text>
          </>
        )}
      {props.method === BridgingMethod.IBC && props.direction === "out" && (
        <Text
          font="proto_mono"
          size="x-sm"
          color={
            notEnoughNativeBalance ? " var(--extra-failure-color, #ff0000)" : ""
          }
        >
          Gas Fee:{" "}
          {displayAmount(
            Object.values(props.gasFees).reduce(
              (acc, fee) => addTokenBalances(acc, fee.amount),
              "0"
            ),
            18,
            { symbol: "CANTO" }
          )}
        </Text>
      )}
    </>
  );
};
