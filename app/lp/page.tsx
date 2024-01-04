"use client";
import Spacer from "@/components/layout/spacer";
import Modal from "@/components/modal/modal";
import Table from "@/components/table/table";
import {
  GeneralAmbientPairRow,
  GeneralCantoDexPairRow,
  UserAmbientPairRow,
  UserCantoDexPairRow,
} from "./components/pairRow";
import Text from "@/components/text";
import { CantoDexLPModal } from "./components/dexModals/cantoDexLPModal";
import styles from "./lp.module.scss";
import {
  isAmbientPool,
  isCantoDexPair,
} from "@/hooks/pairs/lpCombo/interfaces.ts/pairTypes";
import { AmbientModal } from "./components/ambient/ambientLPModal";
import { displayAmount } from "@/utils/formatting";
import Rewards from "./components/rewards";
import Container from "@/components/container/container";
import ToggleGroup from "@/components/groupToggle/ToggleGroup";
import usePool from "./utils";
import { getPriceFromTick } from "@/utils/ambient";
import Analytics from "@/provider/analytics";

export default function Page() {
  const {
    pairs,
    rewards,
    filteredPairs,
    setFilteredPairs,
    selectedPair,
    setPair,
    sortedCantoDexPairs,
    validateCantoDexTx,
    sendCantoDexTxFlow,
    validateAmbientTxParams,
    sendAmbientTxFlow,
    sendClaimRewardsFlow,
    pairNames,
  } = usePool();

  //main content
  return (
    <div className={styles.container}>
      <Modal
        width="min-content"
        padded={false}
        open={selectedPair !== null}
        onClose={() => setPair(null)}
        closeOnOverlayClick={true}
      >
        {selectedPair && isCantoDexPair(selectedPair) && (
          <CantoDexLPModal
            pair={selectedPair}
            validateParams={validateCantoDexTx}
            sendTxFlow={sendCantoDexTxFlow}
          />
        )}
        {selectedPair && isAmbientPool(selectedPair) && (
          <AmbientModal
            pool={selectedPair}
            sendTxFlow={sendAmbientTxFlow}
            verifyParams={validateAmbientTxParams}
          />
        )}
      </Modal>

      <Container direction="row" gap={"auto"} width="100%">
        <Text size="x-lg" font="proto_mono" className={styles.title}>
          Pools
        </Text>
        <Rewards
          onClick={sendClaimRewardsFlow}
          value={displayAmount(rewards.total, 18, {
            precision: 4,
          })}
        />
      </Container>
      <Spacer height="30px" />
      {pairs.userCantoDex.length + pairs.userAmbient.length > 0 && (
        <>
          <Table
            title="Your Pairs"
            headers={[
              { value: "Pair", ratio: 2 },
              { value: "APR", ratio: 1 },
              { value: "Pool Share", ratio: 1 },
              { value: "Value", ratio: 1 },
              { value: "Rewards", ratio: 1 },
              { value: "Edit", ratio: 1 },
            ]}
            content={[
              ...pairs.userAmbient.map((pool) =>
                UserAmbientPairRow({
                  pool,
                  onManage: (poolAddress) => {
                    const positions = pool.userPositions.map((position) => {
                      return {
                        positionId: position.positionId,
                        liquidity: position.concLiq,
                        minRangePrice: displayAmount(
                          getPriceFromTick(position.bidTick),
                          pool.base.decimals - pool.quote.decimals,
                          {
                            short: false,
                            precision: pool.base.decimals - pool.quote.decimals,
                          }
                        ),
                        maxRangePrice: displayAmount(
                          getPriceFromTick(position.askTick),
                          pool.base.decimals - pool.quote.decimals,
                          {
                            short: false,
                            precision: pool.base.decimals - pool.quote.decimals,
                          }
                        ),
                      };
                    });
                    Analytics.actions.events.liquidityPool.manageLPClicked({
                      ambientLp: pool.symbol,
                      positions,
                    });
                    setPair(poolAddress);
                  },
                  rewards: rewards.ambient,
                })
              ),
              ...pairs.userCantoDex.map((pair) =>
                UserCantoDexPairRow({
                  pair,

                  onManage: (pairAddress) => {
                    Analytics.actions.events.liquidityPool.manageLPClicked({
                      cantoLp: pair.symbol,
                      cantoLpTokenBalance: displayAmount(
                        pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
                        pair.decimals,
                        { short: false, precision: pair.decimals }
                      ),
                      cantoLpStakedBalance: displayAmount(
                        pair.clmData?.userDetails?.supplyBalanceInUnderlying ??
                          "0",
                        pair.decimals,
                        { short: false, precision: pair.decimals }
                      ),
                      cantoLpUnstakedBalance: displayAmount(
                        pair.clmData?.userDetails?.balanceOfUnderlying ?? "0",
                        pair.decimals,
                        { short: false, precision: pair.decimals }
                      ),
                    });
                    setPair(pairAddress);
                  },
                })
              ),
            ]}
          />
          <Spacer height="20px" />
        </>
      )}

      <Table
        //@ts-ignore
        title={pairNames[filteredPairs]}
        secondary={
          <Container width="400px">
            <ToggleGroup
              options={["all", "stable", "volatile"]}
              selected={filteredPairs}
              setSelected={(value) => {
                Analytics.actions.events.liquidityPool.tabSwitched(value);
                setFilteredPairs(value);
              }}
            />
          </Container>
        }
        headers={[
          { value: "Pair", ratio: 2 },
          { value: "APR", ratio: 1 },
          { value: "TVL", ratio: 1 },
          { value: "Type", ratio: 1 },
          { value: "Action", ratio: 1 },
        ]}
        content={[
          ...pairs.allAmbient
            .filter(
              (pool) =>
                filteredPairs === "all" ||
                (filteredPairs === "stable" && pool.stable) ||
                (filteredPairs === "volatile" && !pool.stable)
            )
            .map((pool) =>
              GeneralAmbientPairRow({
                pool,
                onAddLiquidity: (poolAddress) => setPair(poolAddress),
              })
            ),
          ...sortedCantoDexPairs
            .filter(
              (pair) =>
                filteredPairs === "all" ||
                (filteredPairs === "stable" && pair.stable) ||
                (filteredPairs === "volatile" && !pair.stable)
            )
            .map((pair) =>
              GeneralCantoDexPairRow({
                pair,
                onAddLiquidity: (pairAddress) => {
                  Analytics.actions.events.liquidityPool.addLPClicked({
                    cantoLp: pair.symbol,
                  });
                  setPair(pairAddress);
                },
              })
            ),
        ]}
      />
      <Spacer height="40px" />
    </div>
  );
}
