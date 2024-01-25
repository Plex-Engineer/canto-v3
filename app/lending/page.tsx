"use client";

import styles from "./lending.module.scss";
import Icon from "@/components/icon/icon";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import { displayAmount, formatPercent } from "@/utils/formatting";
import { useLendingCombo } from "./utils";
import Text from "@/components/text";
import Container from "@/components/container/container";
import HighlightCard from "./components/highlightCard";
import OutlineCard from "./components/outlineCard";
import Item from "./components/item";
import LoadingIcon from "@/components/loader/loading";
import { LendingModal } from "./components/modal/modal";
import { RWARow, StableCoinRow } from "./components/cTokenRow";
import { useState } from "react";
import Spacer from "@/components/layout/spacer";
import { addTokenBalances, divideBalances } from "@/utils/math";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import Analytics from "@/provider/analytics";
import { getAnalyticsLendingMarketTokenInfo } from "@/utils/analytics";

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

  if (isLoading) {
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

      <Container className={styles.grid} direction="row">
        <Container gap={54}>
          <div className={styles.highlightCard}>
            {isLoading ? (
              <Container
                width="1000px"
                height="300px"
                center={{
                  horizontal: true,
                  vertical: true,
                }}
              >
                <LoadingIcon />
              </Container>
            ) : cNote ? (
              <HighlightCard
                cToken={cNote}
                precisionInValues={2}
                onSupply={() => {
                  Analytics.actions.events.lendingMarket.supplyClicked(
                    getAnalyticsLendingMarketTokenInfo(
                      "CTOKEN",
                      cNote,
                      clmPosition.position.liquidity,
                      true
                    )
                  );
                  setSelectedCToken(cNote.address);
                  setCurrentModal(CLMModalTypes.SUPPLY);
                }}
                onBorrow={() => {
                  Analytics.actions.events.lendingMarket.borrowClicked(
                    getAnalyticsLendingMarketTokenInfo(
                      "CTOKEN",
                      cNote,
                      clmPosition.position.liquidity,
                      false
                    )
                  );
                  setSelectedCToken(cNote.address);
                  setCurrentModal(CLMModalTypes.BORROW);
                }}
              />
            ) : (
              <Text>No Supply Tokens Found</Text>
            )}
          </div>

          <CTokenTable
            isLoading={isLoading}
            stableTokens={stableCoins.sort((a, b) =>
              a.underlying.symbol.localeCompare(b.underlying.symbol)
            )}
            rwas={rwas.sort((a, b) =>
              a.underlying.symbol.localeCompare(b.underlying.symbol)
            )}
            liquidity={clmPosition.position.liquidity}
            onSupply={(address) => {
              setSelectedCToken(address);
              setCurrentModal(CLMModalTypes.SUPPLY);
            }}
            onBorrow={(address) => {
              setSelectedCToken(address);
              setCurrentModal(CLMModalTypes.BORROW);
            }}
          />
          <Spacer height="20px" />
        </Container>

        <Container gap={20}>
          <div className={styles.widget1}>
            <OutlineCard>
              <Item
                name="Total Note"
                value={displayAmount(
                  addTokenBalances(
                    lendingStats.circulatingNote,
                    lendingStats.circulatingCNote
                  ),
                  18
                )}
                postChild={<NoteIcon />}
              />
              <Item
                name="Percent Note Deposited"
                value={formatPercent(
                  divideBalances(
                    lendingStats.circulatingCNote,
                    addTokenBalances(
                      lendingStats.circulatingNote,
                      lendingStats.circulatingCNote
                    )
                  )
                )}
              />
              <Item
                name="Price of cNote"
                value={displayAmount(lendingStats.cNotePrice, 18, {
                  precision: 4,
                })}
                postChild={<NoteIcon />}
              />
              <Item
                name="Value of rwas on canto"
                value={displayAmount(lendingStats.valueOfAllRWA, 18)}
                postChild={<NoteIcon />}
              />
            </OutlineCard>
          </div>

          <div className={styles.widget2}>
            <OutlineCard>
              {/* <Item
                name="Outstanding Debt"
                value={displayAmount(clmPosition.general.outstandingDebt, 18, {
                  precision: 2,
                })}
                postChild={<NoteIcon />}
              /> */}
              <Item name="Net APY" value={clmPosition.general.netApr + "%"} />
              <Item
                name="Percent Limit Used"
                value={clmPosition.general.percentLimitUsed + "%"}
              />
              <Item
                name="Borrow Limit"
                value={displayAmount(
                  clmPosition.general.maxAccountLiquidity,
                  18,
                  {
                    precision: 2,
                  }
                )}
                postChild={<NoteIcon />}
              />
              {/* Item for Total Borrowed */}
              <Item
                name="Total Borrowed"
                value={displayAmount(clmPosition.position.totalBorrow, 18, {
                  precision: 2,
                })}
                postChild={<NoteIcon />}
              />
              {/* Item for Total Supplied */}
              <Item
                name="Total Supplied"
                value={displayAmount(clmPosition.position.totalSupply, 18, {
                  precision: 2,
                })}
                postChild={<NoteIcon />}
              />
            </OutlineCard>
          </div>
        </Container>
      </Container>
    </div>
  );
}

const NoteIcon = () => (
  <Icon themed icon={{ url: "/tokens/note.svg", size: 20 }} />
);

const CTokenTable = ({
  title,
  isLoading,
  stableTokens,
  rwas,
  liquidity,
  onSupply,
  onBorrow,
}: {
  title?: string;
  isLoading: boolean;
  stableTokens: CTokenWithUserData[];
  rwas: CTokenWithUserData[];
  liquidity: string;
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
                  Analytics.actions.events.lendingMarket.tabSwitched(value);
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
                    onSupply: () => {
                      Analytics.actions.events.lendingMarket.supplyClicked(
                        getAnalyticsLendingMarketTokenInfo(
                          "RWA",
                          cRwa,
                          liquidity,
                          true
                        )
                      );
                      onSupply(cRwa.address);
                    },
                  })
                )
              : filteredPairs == "Stablecoins"
                ? stableTokens.map((cStableCoin) =>
                    StableCoinRow({
                      cStableCoin,
                      onSupply: () => {
                        Analytics.actions.events.lendingMarket.supplyClicked(
                          getAnalyticsLendingMarketTokenInfo(
                            "CTOKEN",
                            cStableCoin,
                            liquidity,
                            true
                          )
                        );
                        onSupply(cStableCoin.address);
                      },
                      onBorrow: () => {
                        Analytics.actions.events.lendingMarket.borrowClicked(
                          getAnalyticsLendingMarketTokenInfo(
                            "CTOKEN",
                            cStableCoin,
                            liquidity,
                            false
                          )
                        );
                        onBorrow(cStableCoin.address);
                      },
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
