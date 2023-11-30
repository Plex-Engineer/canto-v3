"use client";
import Spacer from "@/components/layout/spacer";
import Selector from "@/components/selector/selector";
import Text from "@/components/text";
import { BridgeHookReturn } from "@/hooks/bridge/interfaces/hookParams";
import { TransactionStore } from "@/stores/transactionStore";
import {
  convertToBigNumber,
  displayAmount,
  formatBalance,
} from "@/utils/formatting";
import { useEffect, useState } from "react";
import styles from "./bridge.module.scss";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Container from "@/components/container/container";
import Image from "next/image";
import Modal from "@/components/modal/modal";
import ConfirmationModal from "./components/confirmationModal";
import { isCosmosNetwork, isEVMNetwork } from "@/utils/networks";
import { GetWalletClientResult } from "wagmi/actions";
import { maxBridgeAmountInUnderlying } from "@/hooks/bridge/helpers/amounts";
import { BaseNetwork } from "@/config/interfaces";
import { validateWeiUserInputTokenAmount } from "@/utils/math";
import { BridgingMethod } from "@/transactions/bridge";
import useGravityFees from "@/hooks/bridge/useGravityFees";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";

interface BridgeProps {
  hook: BridgeHookReturn;
  params: {
    signer: GetWalletClientResult | undefined;
    transactionStore?: TransactionStore;
  };
}
const Bridging = (props: BridgeProps) => {
  // STATES FOR BRIDGE
  const [amount, setAmount] = useState<string>("");
  const [maxBridgeAmount, setMaxBridgeAmount] = useState<string>("0");
  const { token, fromNetwork, toNetwork, method } = props.hook.selections;
  const { addresses, direction } = props.hook;

  // big number amount
  const amountAsBigNumberString = (
    convertToBigNumber(amount, token?.decimals ?? 18).data ?? "0"
  ).toString();

  // gravity bridge fees state
  const gravityFees = useGravityFees({
    balance: token?.balance,
    amount: amountAsBigNumberString,
    address: token?.address,
  });

  // validate user input amount
  const amountCheck = validateWeiUserInputTokenAmount(
    amountAsBigNumberString,
    "1",
    maxBridgeAmount,
    token?.symbol ?? "",
    token?.decimals ?? 0
  );

  useEffect(() => {
    async function getMaxAmount() {
      const needGravityFees =
        direction === "out" && method === BridgingMethod.GRAVITY_BRIDGE;
      setMaxBridgeAmount(
        needGravityFees
          ? gravityFees.maxBridgeAmount
          : await maxBridgeAmountInUnderlying(token, toNetwork?.id ?? "")
      );
    }
    getMaxAmount();
  }, [direction, method, gravityFees.maxBridgeAmount, token, toNetwork?.id]);

  const txParams = {
    amount: amountAsBigNumberString,
    bridgeFee: gravityFees.selectedBridgeFee ?? undefined,
    chainFee: gravityFees.chainFee ?? undefined,
  };

  // transaction that will do the bridging
  async function bridgeTx() {
    // get flow
    const flow = props.hook.bridge.newBridgeFlow(txParams);
    // add flow to store
    props.params.transactionStore?.addNewFlow({
      txFlow: flow,
      signer: props.params.signer,
      onSuccessCallback: () => setIsConfirmationModalOpen(false),
    });
  }

  // check to see if bridging will be possible with the current parameters
  const canBridge = props.hook.bridge.validateParams(txParams);

  // if confirmation is open
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  // cosmos address props
  const cosmosProps =
    method === BridgingMethod.IBC &&
    direction === "out" &&
    toNetwork &&
    isCosmosNetwork(toNetwork)
      ? {
          cosmosAddress: {
            chainId: toNetwork.chainId,
            addressPrefix: toNetwork.addressPrefix,
            currentAddress: addresses.getReceiver() ?? "",
            setAddress: (address: string) =>
              props.hook.setState("inputCosmosAddress", address),
          },
        }
      : {};

  // get network name to display in modal
  const networkName = (network: BaseNetwork | null) => {
    if (network) {
      if (isCosmosNetwork(network) && network.altName) {
        return network.altName;
      }
      return network.name;
    }
    return "";
  };
  return (
    <>
      <Modal
        open={isConfirmationModalOpen}
        width="30rem"
        height="min-content"
        onClose={() => {
          setIsConfirmationModalOpen(false);
        }}
      >
        <ConfirmationModal
          {...cosmosProps}
          token={{
            name: token?.symbol ?? "",
            url: token?.icon ?? "",
          }}
          imgUrl={
            direction === "in" ? fromNetwork?.icon ?? "" : toNetwork?.icon ?? ""
          }
          addresses={{
            from: addresses.getSender(),
            to: addresses.getReceiver(),
          }}
          fromNetwork={networkName(fromNetwork)}
          toNetwork={networkName(toNetwork)}
          type={direction}
          amount={formatBalance(amountAsBigNumberString, token?.decimals ?? 0, {
            symbol: token?.symbol,
            precision: token?.decimals,
            commify: true,
          })}
          confirmation={{
            onConfirm: () => {
              bridgeTx();
            },
            canConfirm: !canBridge.error,
          }}
        />
      </Modal>
      <section className={styles.container}>
        <div
          className={styles["network-selection"]}
          style={{
            flexDirection: direction === "in" ? "column" : "column-reverse",
          }}
        >
          {/* select network group */}

          <Container width="100%" gap={14}>
            {direction === "in" ? (
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
                    direction === "in"
                      ? props.hook.allOptions.networks.filter((network) =>
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
                      items: props.hook.allOptions.networks.filter(
                        (network) => !isEVMNetwork(network)
                      ),
                    },
                  ]}
                  onChange={
                    direction === "in"
                      ? (networkId) => props.hook.setState("network", networkId)
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

            {direction === "out" ? (
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
                  direction === "out" ? props.hook.allOptions.networks : []
                }
                onChange={
                  direction === "out"
                    ? (networkId) => props.hook.setState("network", networkId)
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
                items={props.hook.allOptions.tokens
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
                onChange={(tokenId) => props.hook.setState("token", tokenId)}
              />
              <Container width="100%">
                <Input
                  type="amount"
                  height={64}
                  balance={maxBridgeAmount}
                  decimals={token?.decimals ?? 0}
                  placeholder="0.0"
                  value={amount}
                  onChange={(val) => {
                    setAmount(val.target.value);
                  }}
                  className={styles["input"]}
                  error={amountCheck.error && Number(amount) !== 0}
                  errorMessage={amountCheck.error ? amountCheck.reason : ""}
                />
              </Container>
            </Container>
          </Container>
        </div>

        <Spacer height="20px" />
        {direction === "out" && method === BridgingMethod.GRAVITY_BRIDGE && (
          <div>
            {gravityFees.isLoading ? (
              <div>loading...</div>
            ) : (
              <>
                <div>
                  {" "}
                  chain fee:{" "}
                  {displayAmount(gravityFees.chainFee, token?.decimals ?? 0, {
                    symbol: token?.symbol,
                  })}{" "}
                </div>
                bridge fee:
                <ToggleGroup
                  options={
                    gravityFees.bridgeFeeOptions
                      ? [
                          "0",
                          ...Object.values(gravityFees.bridgeFeeOptions),
                        ].map((fee) => displayAmount(fee, token?.decimals ?? 0))
                      : []
                  }
                  selected={displayAmount(
                    gravityFees.selectedBridgeFee ?? "0",
                    token?.decimals ?? 0
                  )}
                  setSelected={(fee) =>
                    gravityFees.setSelectedBridgeFee(
                      convertToBigNumber(
                        fee,
                        token?.decimals ?? 0
                      ).data?.toString() ?? "0"
                    )
                  }
                />
              </>
            )}
          </div>
        )}
        <Spacer height="20px" />
        <Button
          width="fill"
          onClick={() => {
            setIsConfirmationModalOpen(true);
          }}
          disabled={amountCheck.error}
        >
          {direction === "in" ? "BRIDGE IN" : "BRIDGE OUT"}
        </Button>
      </section>
    </>
  );
};

export default Bridging;
