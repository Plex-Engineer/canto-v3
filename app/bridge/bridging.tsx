"use client";
import Spacer from "@/components/layout/spacer";
import Selector from "@/components/selector/selector";
import Text from "@/components/text";
import { displayAmount, formatBalance } from "@/utils/formatting";
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

const Bridging = ({ props }: { props: BridgeComboReturn }) => {
  const {
    Amount,
    Transaction,
    Confirmation,
    bridgeHook: bridge,
    cosmosProps,
    networkName,
    feesHook: fees,
    feesSelection,
  } = props;
  const { fromNetwork, toNetwork, token } = bridge.selections;
  const { selectedGBridgeFee, setSelectedGBridgeFee, totalChainFee } =
    feesSelection.gravityBridge;

  return (
    <>
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
        amount={formatBalance(
          Amount.amountAsBigNumberString,
          token?.decimals ?? 0,
          {
            symbol: token?.symbol,
            precision: token?.decimals,
            commify: true,
          }
        )}
        confirmation={{
          onConfirm: () => {
            Transaction.bridgeTx();
          },
          canConfirm: !Transaction.canBridge.error,
        }}
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
            <Container width="100%" direction="row" gap={20}>
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
                items={bridge.allOptions.tokens
                  .map((token) => ({
                    ...token,
                    name: token.name.length > 24 ? token.symbol : token.name,
                    secondary: displayAmount(
                      token.balance ?? "0",
                      token.decimals
                    ),
                  }))
                  .sort((a, b) => {
                    if (Number(a.secondary) === Number(b.secondary)) {
                      return b.name.toLowerCase() > a.name.toLowerCase()
                        ? -1
                        : 1;
                    }
                    return Number(a.secondary) > Number(b.secondary) ? -1 : 1;
                  })}
                onChange={(tokenId) => bridge.setState("token", tokenId)}
              />
              <Container width="100%">
                <Input
                  type="amount"
                  height={64}
                  balance={Amount.maxBridgeAmount}
                  decimals={token?.decimals ?? 0}
                  placeholder="0.0"
                  value={Amount.amount}
                  onChange={(val) => {
                    Amount.setAmount(val.target.value);
                  }}
                  className={styles["input"]}
                  error={
                    Amount.amountCheck.error && Number(Amount.amount) !== 0
                  }
                  errorMessage={
                    Amount.amountCheck.error ? Amount.amountCheck.reason : ""
                  }
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
        <FeesSection
          props={fees}
          fees={{
            totalChainFee,
            selected: selectedGBridgeFee,
            setSelected: setSelectedGBridgeFee,
          }}
          token={token}
        />
        <Spacer height="20px" />

        <Button
          width="fill"
          onClick={() => {
            Confirmation.setIsModalOpen(true);
          }}
          disabled={Amount.amountCheck.error}
        >
          {bridge.direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};

export default Bridging;

// props are return type of useBridgingFees
const FeesSection = ({
  props,
  fees,
  token,
}: {
  props: BridgingFeesReturn;
  fees: {
    selected: string;
    setSelected: (value: string) => void;
    totalChainFee: string;
  };
  token: BridgeToken | null;
}) => {
  return props.isLoading ? (
    <div>loading fees.....</div>
  ) : props.error !== null ? (
    <div>error loading fees {props.error}</div>
  ) : (
    <>
      {props.method === BridgingMethod.LAYER_ZERO && (
        <div>Gas Fee: {props.gasFee.formattedAmount}</div>
      )}
      {props.method === BridgingMethod.GRAVITY_BRIDGE && (
        <>
          <div>
            Chain Fee Percent:{" "}
            {`${props.chainFeePercent}% (${displayAmount(
              fees.totalChainFee,
              token?.decimals ?? 0
            )})`}
          </div>
          <div>
            Selected Bridge Fee:{" "}
            {displayAmount(fees.selected, token?.decimals ?? 0)}
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {Object.values(props.bridgeFeeOptions).map((fee) => (
              <Button
                key={fee} 
                onClick={() => fees.setSelected(fee)}
                color={fees.selected === fee ? "accent" : "primary"}
              >
                {displayAmount(
                  addTokenBalances(fee, fees.totalChainFee),
                  token?.decimals ?? 0,
                  { symbol: token?.symbol }
                )}
              </Button>
            ))}
          </div>
        </>
      )}
    </>
  );
};
