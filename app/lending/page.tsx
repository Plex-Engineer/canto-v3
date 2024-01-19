"use client";

import styles from "./lending.module.scss";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import { displayAmount, formatPercent } from "@/utils/formatting";
import { useLendingCombo } from "./utils";
import Text from "@/components/text";
import Container from "@/components/container/container";
import LoadingIcon from "@/components/loader/loading";
import { LendingModal } from "./components/modal/modal";
import { RWARow, StableCoinRow } from "./components/cTokenRow";
import { useState } from "react";
import Spacer from "@/components/layout/spacer";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import AccountHealth from "./components/accountHealth/accountHealth";
import TokenCard from "./components/tokenCard/tokenCard";
import Icon from "@/components/icon/icon";
import { addTokenBalances, divideBalances } from "@/utils/math/tokenMath.utils";

enum CLMModalTypes {
  SUPPLY = "supply",
  BORROW = "borrow",
  NONE = "none",
}
export default function LendingPage() {
  // track current modal type
  const [currentModal, setCurrentModal] = useState<CLMModalTypes>(
    CLMModalTypes.NONE
  );

  // get all data from lending combo
  const {
    cTokens,
    clmPosition,
    transaction,
    selection,
    isLoading,
    lendingStats,
  } = useLendingCombo({
    onSuccessTx: () => {
      setCurrentModal(CLMModalTypes.NONE);
    },
  });
  const { cNote, rwas, stableCoins } = cTokens;
  const { selectedCToken, setSelectedCToken } = selection;

  if (isLoading || cNote === undefined || stableCoins === undefined) {
    return <div className={styles.loading}>loading</div>;
  }

  return (
    <div className={styles.container}>
      <Text size="x-lg" font="proto_mono" className={styles.title}>
        Lending
      </Text>
      <Spacer height="20px" />
      <Modal
        open={currentModal !== CLMModalTypes.NONE}
        onClose={() => setCurrentModal(CLMModalTypes.NONE)}
        title="Lending"
        width="32rem"
      >
        {selectedCToken && (
          <LendingModal
            isSupplyModal={currentModal === CLMModalTypes.SUPPLY}
            position={clmPosition.position}
            cToken={selectedCToken}
            transaction={{
              performTx: transaction.performTx,
              validateParams: transaction.validateParams,
            }}
          />
        )}
      </Modal>

      <div className={styles.accountHealth}>
        <AccountHealth
          title="Account Health"
          items={[
            {
              name: "Supplied",
              value: displayAmount(clmPosition.position.totalSupply, 18, {
                precision: 2,
              }),
              symbol: true,
            },
            {
              name: "Borrow Limit",
              value: displayAmount(
                clmPosition.general.maxAccountLiquidity,
                18,
                {
                  precision: 2,
                }
              ),
              symbol: true,
            },
            {
              name: "Net APY",
              value: clmPosition.general.netApr + "%",
            },
            {
              name: "Borrowed",
              value: displayAmount(clmPosition.position.totalBorrow, 18, {
                precision: 2,
              }),
              symbol: true,
            },
            {
              name: "Liquidity Remaining",
              value: displayAmount(clmPosition.position.liquidity, 18),
              symbol: true,
            },
            {
              name: "Limit Used",
              value: clmPosition.general.percentLimitUsed + "%",
            },
          ]}
          percent={Number(clmPosition.general.percentLimitUsed) / 100}
        />
      </div>
      <div className={styles.highlightCard}>
        <TokenCard
          cToken={cNote}
          items={[
            {
              key: "Circulating Supply",
              value: displayAmount(
                addTokenBalances(
                  lendingStats.circulatingNote,
                  lendingStats.circulatingCNote
                ),
                18
              ),
            },
            {
              key: "Percent Deposited",
              value: formatPercent(
                divideBalances(
                  lendingStats.circulatingCNote,
                  addTokenBalances(
                    lendingStats.circulatingNote,
                    lendingStats.circulatingCNote
                  )
                )
              ),
            },
            {
              key: "RWA TVl",
              value: displayAmount(lendingStats.valueOfAllRWA, 18),
            },
          ]}
          onClick={() => {
            //! TODO: confirm what happens when you click on get cNote
            setCurrentModal(CLMModalTypes.SUPPLY);
          }}
        />
      </div>
      <div className={styles.mainTable}>
        <Container gap={12} width="100%">
          <Text size="x-lg" font="proto_mono">
            SUPPLY
          </Text>
          <Table
            title="Canto Lending Market"
            headers={[
              {
                value: "Asset",
                ratio: 3,
              },
              {
                value: "APY",
                ratio: 2,
              },
              {
                value: "Collateral",
                ratio: 2,
              },
              {
                value: "Supplied",
                ratio: 2,
              },
            ]}
            content={[
              ...[cNote, ...stableCoins, ...rwas].map((cStableCoin) => [
                <Container
                  center={{
                    vertical: true,
                  }}
                  width="100%"
                  direction="row"
                  gap={10}
                  style={{
                    paddingLeft: "30px",
                  }}
                  key={"title" + cStableCoin.address}
                >
                  <Icon
                    icon={{ url: cStableCoin.underlying.logoURI, size: 30 }}
                  />
                  <Container
                    style={{
                      alignItems: "flex-start",
                    }}
                  >
                    <Text font="proto_mono">
                      {cStableCoin.underlying.symbol}
                    </Text>
                    <Text theme="secondary-dark" size="x-sm">
                      Balance:{" "}
                      {displayAmount(
                        cStableCoin.userDetails?.balanceOfUnderlying ?? "0",
                        cStableCoin.underlying.decimals,
                        {
                          precision: 2,
                        }
                      )}
                    </Text>
                  </Container>
                </Container>,
                cStableCoin.supplyApy + "%",
                displayAmount(cStableCoin.collateralFactor, 16),
                displayAmount(
                  cStableCoin.userDetails?.supplyBalanceInUnderlying ?? "0",
                  cStableCoin.underlying.decimals,
                  {
                    precision: 2,
                  }
                ),
              ]),
            ]}
          />
          <Table
            title="Vivacity"
            headers={[
              {
                value: "Asset",
                ratio: 3,
              },
              {
                value: "APY",
                ratio: 2,
              },

              {
                value: "Supplied",
                ratio: 2,
              },
              {
                value: "Rewards",
                ratio: 2,
              },
            ]}
            content={[
              ...[...stableCoins].map((cStableCoin) => [
                <Container
                  center={{
                    vertical: true,
                  }}
                  width="100%"
                  direction="row"
                  gap={10}
                  style={{
                    paddingLeft: "30px",
                  }}
                  key={"title" + cStableCoin.address}
                >
                  <Icon
                    icon={{ url: cStableCoin.underlying.logoURI, size: 30 }}
                  />
                  <Container
                    style={{
                      alignItems: "flex-start",
                    }}
                  >
                    <Text font="proto_mono">
                      {cStableCoin.underlying.symbol}
                    </Text>
                    <Text theme="secondary-dark" size="x-sm">
                      Balance:{" "}
                      {displayAmount(
                        cStableCoin.userDetails?.balanceOfUnderlying ?? "0",
                        cStableCoin.underlying.decimals,
                        {
                          precision: 2,
                        }
                      )}
                    </Text>
                  </Container>
                </Container>,
                cStableCoin.supplyApy + "%",
                displayAmount(cStableCoin.collateralFactor, 16),
                <Text
                  key={"grp" + cStableCoin.address}
                  font={"proto_mono"}
                  style={{
                    width: "100%",
                    lineClamp: 1,
                  }}
                >
                  {displayAmount(
                    cStableCoin.userDetails?.supplyBalanceInUnderlying ?? "0",
                    cStableCoin.underlying.decimals,
                    {
                      precision: 2,
                    }
                  )}
                  <Icon
                    style={{
                      marginLeft: "5px",
                    }}
                    key={"title" + cStableCoin.address}
                    icon={{
                      url: "/tokens/canto.svg",
                      size: 14,
                    }}
                  />
                </Text>,
              ]),
            ]}
          />
        </Container>
        <Container gap={12} width="100%">
          <Text size="x-lg" font="proto_mono">
            Borrow
          </Text>
          <Table
            title="Canto Lending Market"
            headers={[
              {
                value: "Asset",
                ratio: 3,
              },
              {
                value: "APY",
                ratio: 2,
              },
              {
                value: "Liquidity",
                ratio: 2,
              },
              {
                value: "Borrowed",
                ratio: 2,
              },
            ]}
            content={[
              ...stableCoins.map((cStableCoin) => [
                <Container
                  center={{
                    vertical: true,
                  }}
                  width="100%"
                  direction="row"
                  gap={10}
                  style={{
                    paddingLeft: "30px",
                  }}
                  key={"title" + cStableCoin.address}
                >
                  <Icon
                    icon={{ url: cStableCoin.underlying.logoURI, size: 30 }}
                  />
                  <Container
                    style={{
                      alignItems: "flex-start",
                    }}
                  >
                    <Text font="proto_mono">
                      {cStableCoin.underlying.symbol}
                    </Text>
                    <Text theme="secondary-dark" size="x-sm">
                      Balance:{" "}
                      {displayAmount(
                        cStableCoin.userDetails?.balanceOfUnderlying ?? "0",
                        cStableCoin.underlying.decimals,
                        {
                          precision: 2,
                        }
                      )}
                    </Text>
                  </Container>
                </Container>,
                cStableCoin.supplyApy + "%",
                // liquidity
                displayAmount(cStableCoin.liquidity, 0),
                displayAmount(
                  cStableCoin.userDetails?.supplyBalanceInUnderlying ?? "0",
                  cStableCoin.underlying.decimals,
                  {
                    precision: 2,
                  }
                ),
              ]),
            ]}
          />
        </Container>
      </div>
    </div>
  );
}

const CTokenTable = ({
  title,
  isLoading,
  stableTokens,
  rwas,
  onSupply,
  onBorrow,
}: {
  title?: string;
  isLoading: boolean;
  stableTokens: CTokenWithUserData[];
  rwas: CTokenWithUserData[];
  onSupply: (address: string) => void;
  onBorrow: (address: string) => void;
}) => {
  const [filteredPairs, setFilteredPairs] = useState("RWAs");

  const headers =
    filteredPairs === "RWAs"
      ? [
          { value: "Asset", ratio: 1 },
          { value: "Balance", ratio: 1 },
          { value: "APR", ratio: 1 },
          { value: "Supplied", ratio: 1 },
          { value: "Collateral Factor", ratio: 1 },
          { value: "Liquidity", ratio: 1 },
          { value: "Manage", ratio: 1 },
        ]
      : [
          { value: "Asset", ratio: 1 },
          { value: "Balance", ratio: 1 },
          {
            value: (
              <span>
                Supply
                <br /> APY
              </span>
            ),
            ratio: 1,
          },
          { value: "Supplied", ratio: 1 },
          {
            value: (
              <span>
                Borrow
                <br /> APY
              </span>
            ),
            ratio: 1,
          },
          { value: "Borrowed", ratio: 1 },
          { value: "Liquidity", ratio: 1 },
          { value: "Manage", ratio: 2 },
        ];

  return (
    <div className={styles.mainTable}>
      {isLoading ? (
        <Container
          width="1000px"
          height="200px"
          center={{
            horizontal: true,
            vertical: true,
          }}
        >
          <LoadingIcon />
        </Container>
      ) : stableTokens.length > 0 ? (
        <Table
          title={title}
          textSize={filteredPairs === "Stablecoins" ? "14px" : "14px"}
          secondary={
            <Container width="320px">
              <ToggleGroup
                options={["RWAs", "Stablecoins"]}
                selected={filteredPairs}
                setSelected={(value) => {
                  setFilteredPairs(value);
                }}
              />
            </Container>
          }
          headers={headers}
          content={
            filteredPairs == "RWAs"
              ? rwas.map((cRwa) =>
                  RWARow({
                    cRwa,
                    onSupply: () => onSupply(cRwa.address),
                  })
                )
              : filteredPairs == "Stablecoins"
                ? stableTokens.map((cStableCoin) =>
                    StableCoinRow({
                      cStableCoin,
                      onSupply: () => onSupply(cStableCoin.address),
                      onBorrow: () => onBorrow(cStableCoin.address),
                    })
                  )
                : []
          }
        />
      ) : (
        <Container
          width="1000px"
          height="200px"
          center={{
            horizontal: true,
            vertical: true,
          }}
          backgroundColor="var(--card-sub-surface-color)"
        >
          <Text theme="secondary-dark">No {title} tokens available</Text>
        </Container>
      )}
    </div>
  );
};
