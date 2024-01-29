import Button from "@/components/button/button";
import Container from "@/components/container/container";
import Icon from "@/components/icon/icon";
import Text from "@/components/text";
import { BridgeToken } from "@/hooks/bridge/interfaces/tokens";
import useRecovery from "@/hooks/bridge/useRecovery";
import { getGravityBridgeFeesFromToken } from "@/transactions/bridge/gravityBridge/gravityFees";
import { displayAmount } from "@/utils/formatting";
import { useEffect, useState } from "react";

export default function Recovery() {
  const recovery = useRecovery();
  const [gravityRecoveryFees, setGravityRecoveryFees] = useState<
    { slow: string; medium: string; fast: string }[]
  >([]);
  const [selectedGravityFee, setSelectedGravityFee] = useState("0");
  useEffect(() => {
    async function getGravityFees() {
      const feesObjects = await Promise.all(
        recovery.userGravityTokens.map((token) =>
          getGravityBridgeFeesFromToken(token.address ?? "")
        )
      );
      if (Object.values(feesObjects).some((fee) => !fee.data)) {
        return;
      }
      setGravityRecoveryFees(
        feesObjects.map((fee) => ({
          slow: fee.data.slow.fee,
          medium: fee.data.medium.fee,
          fast: fee.data.fast.fee,
        }))
      );
    }
    getGravityFees();
  }, [recovery.userGravityTokens.length]);

  const FeeButton = ({
    idx,
    feeTier,
    token,
  }: {
    idx: number;
    feeTier: "slow" | "medium" | "fast";
    token: BridgeToken;
  }) => (
    <Button
      onClick={() => setSelectedGravityFee(gravityRecoveryFees[idx][feeTier])}
      color={
        selectedGravityFee === gravityRecoveryFees[idx][feeTier]
          ? "accent"
          : "secondary"
      }
    >
      {displayAmount(gravityRecoveryFees[idx][feeTier], token.decimals)}
    </Button>
  );

  return (
    <>
      <Text size="sm">Gravity Bridge Tokens</Text>
      {recovery.userGravityTokens.map((token, idx) => (
        <Container
          key={token.id}
          direction="row"
          gap={20}
          center={{ vertical: true }}
          margin="lg"
        >
          <Icon icon={{ url: token.icon, size: 34 }} />
          <Text>
            {displayAmount(token.balance ?? "0", token.decimals, {
              symbol: token.symbol,
            })}
          </Text>
          {gravityRecoveryFees.length > 0 && (
            <Container direction="row" gap={10} center={{ vertical: true }}>
              <Text>Fee</Text>
              <FeeButton idx={idx} feeTier="slow" token={token} />
              <FeeButton idx={idx} feeTier="medium" token={token} />
              <FeeButton idx={idx} feeTier="fast" token={token} />
              <Button
                onClick={() =>
                  recovery.recoverGravityToken(token, 0.01, selectedGravityFee)
                }
              >
                Send To ETH
              </Button>
            </Container>
          )}
        </Container>
      ))}
    </>
  );
}
