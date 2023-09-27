"use client";

import Button from "@/components/button/button";
import styles from "./lending.module.scss";
import Icon from "@/components/icon/icon";
import Input from "@/components/input/input";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import { CTokenLendingTxTypes } from "@/hooks/lending/interfaces/lendingTxTypes";
import { CTokenWithUserData } from "@/hooks/lending/interfaces/tokens";
import { maxAmountForLendingTx } from "@/utils/clm/limits.utils";
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

interface LendingProps {
  Asset: string;
  APR: string;
  WalletBalance: string;
  SuppliedAmount: string;
  CollateralFactor: string;
  Actions: {
    name: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
}

export default function LendingPage() {
  const { cTokens, clmPosition, transaction, selection, isLoading } =
    useLendingCombo();
  const { cNote, rwas } = cTokens;
  const {
    currentAction,
    setCurrentAction,
    modalOpen,
    setModalOpen,
    selectedToken,
    setSelectedToken,
    amount,
    setAmount,
  } = selection;

  return (
    <div className={styles.container}>
      <Text size="x-lg" font="proto_mono" className={styles.title}>
        Lending
      </Text>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <LendingModal
          selectedToken={selectedToken}
          transaction={transaction}
          amount={amount}
          setAmount={setAmount}
          currentAction={currentAction}
          setCurrentAction={setCurrentAction}
          clmPosition={clmPosition}
        />
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
                    setSelectedToken(cNote);
                    setModalOpen(true);
                  },

                  borrow: () => {
                    setSelectedToken(cNote);
                    setModalOpen(true);
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
                        setSelectedToken(cToken);
                        setModalOpen(true);
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
                name="Price of Note"
                value="1.50"
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
                value={clmPosition.general.percentLimitUsed}
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
