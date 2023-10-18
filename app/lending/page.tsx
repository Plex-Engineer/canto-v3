"use client";

import styles from "./lending.module.scss";
import Icon from "@/components/icon/icon";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";

import { displayAmount } from "@/utils/tokenBalances.utils";
import { useLendingCombo } from "./utils";
import Text from "@/components/text";
import Container from "@/components/container/container";
import HighlightCard from "./components/highlightCard";
import OutlineCard from "./components/outlineCard";
import Item from "./components/item";
import LoadingIcon from "@/components/loader/loading";
import { LendingModal } from "./components/modal/modal";
import { CTokenRow } from "./components/cTokenRow";
import { useState } from "react";
import Spacer from "@/components/layout/spacer";

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
  const { cNote, rwas } = cTokens;
  const { selectedCToken, setSelectedCToken } = selection;

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
              validateAmount: transaction.validateParams,
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
                  setSelectedCToken(cNote.address);
                  setCurrentModal(CLMModalTypes.SUPPLY);
                }}
                onBorrow={() => {
                  setSelectedCToken(cNote.address);
                  setCurrentModal(CLMModalTypes.BORROW);
                }}
              />
            ) : (
              <Text>No Supply Tokens Found</Text>
            )}
          </div>
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
            ) : rwas.length > 0 ? (
              <Table
                columns={7}
                title="RWAS"
                headers={[
                  "Asset",
                  "APR",
                  "Wallet Balance",
                  "Supplied Amount",
                  "Collateral Factor",
                  "",
                ]}
                data={[
                  ...rwas.map((cToken) =>
                    CTokenRow({
                      cToken,
                      onClick: () => {
                        setSelectedCToken(cToken.address);
                        setCurrentModal(CLMModalTypes.SUPPLY);
                      },
                    })
                  ),
                ]}
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
                <Text theme="secondary-dark">No RWAS tokens available</Text>
              </Container>
            )}
          </div>
        </Container>

        <Container gap={20}>
          <div className={styles.widget1}>
            <OutlineCard>
              <Item
                name="Note in circulation"
                value={displayAmount(lendingStats.circulatingNote, 18)}
                postChild={<NoteIcon />}
              />
              <Item
                name="CNote in circulation"
                value={displayAmount(lendingStats.circulatingCNote, 18)}
              />
              <Item
                name="Value of rwas on canto"
                value={displayAmount(lendingStats.valueOfAllRWA, 18)}
                postChild={<NoteIcon />}
              />
              <Item
                name="Price of cNote"
                value={displayAmount(lendingStats.cNotePrice, 18, {
                  precision: 2,
                })}
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
              <Item name="Net APR" value={clmPosition.general.netApr + "%"} />
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
