"use client";

import styles from "./lending.module.scss";
import Icon from "@/components/icon/icon";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";

import { formatBalance } from "@/utils/tokenBalances.utils";
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
  const { cTokens, clmPosition, transaction, selection, isLoading } =
    useLendingCombo();
  const { cNote, rwas } = cTokens;
  const { selectedCToken, setSelectedCToken } = selection;

  return (
    <div className={styles.container}>
      <Text size="x-lg" font="proto_mono" className={styles.title}>
        Lending
      </Text>

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
            transaction={transaction}
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
                token={{
                  name: cNote.symbol,
                  imgUrl: cNote.underlying.logoURI,
                  supplyAPR: cNote.supplyApy + "%",
                  borrowAPR: cNote.borrowApy + "%",
                  walletBalance: formatBalance(
                    cNote.userDetails?.balanceOfUnderlying ?? "0",
                    cNote.underlying.decimals,
                    {
                      commify: true,
                    }
                  ),
                  amountStaked: formatBalance(
                    cNote.userDetails?.supplyBalanceInUnderlying ?? "0",
                    cNote.underlying.decimals,
                    {
                      commify: true,
                    }
                  ),
                  outStandingDebt: formatBalance(
                    cNote.userDetails?.borrowBalance ?? "0",
                    cNote.underlying.decimals,
                    {
                      commify: true,
                    }
                  ),
                  supply: () => {
                    setSelectedCToken(cNote.address);
                    setCurrentModal(CLMModalTypes.SUPPLY);
                  },

                  borrow: () => {
                    setSelectedCToken(cNote.address);
                    setCurrentModal(CLMModalTypes.BORROW);
                  },
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
              <Text>No RWAS tokens available</Text>
            )}
          </div>
        </Container>

        <Container gap={20}>
          <div className={styles.widget1}>
            <OutlineCard>
              <Item
                name="Note in circulation"
                value="10,234,234,234"
                postChild={
                  <Icon
                    themed
                    icon={{
                      url: "/tokens/note.svg",
                      size: 24,
                    }}
                  />
                }
              />
              <Item
                name="Value of rwas on canto"
                value="3,435,215"
                postChild={
                  <Icon
                    themed
                    icon={{
                      url: "/tokens/note.svg",
                      size: 24,
                    }}
                  />
                }
              />
              <Item
                name="Price of cNote"
                value={formatBalance(cNote?.exchangeRate ?? "0", 18, {
                  precision: 2,
                  commify: true,
                })}
                postChild={
                  <Icon
                    themed
                    icon={{
                      url: "/tokens/note.svg",
                      size: 24,
                    }}
                  />
                }
              />
            </OutlineCard>
          </div>

          <div className={styles.widget2}>
            <OutlineCard>
              <Item
                name="Outstanding Debt"
                value={formatBalance(clmPosition.general.outstandingDebt, 18, {
                  commify: true,
                  precision: 2,
                })}
              />
              <Item
                name="Average APR"
                value={clmPosition.general.netApr + "%"}
              />
              <Item
                name="Percent Limit Used"
                value={clmPosition.general.percentLimitUsed + "%"}
              />
              <Item
                name="Maximum Account Liquidity"
                value={formatBalance(
                  clmPosition.general.maxAccountLiquidity,
                  18,
                  {
                    commify: true,
                    precision: 2,
                  }
                )}
              />
            </OutlineCard>
          </div>
        </Container>
      </Container>
    </div>
  );
}
