import useCantoSigner from "../helpers/useCantoSigner";
import { useQuery } from "react-query";
import { getSendToCosmosEvents } from "@/utils/bridge";
import BRIDGE_IN_TOKENS from "@/config/jsons/bridgeInTokens.json";
import BRIDGE_OUT_TOKENS from "@/config/jsons/bridgeOutTokens.json";
import { getUserLayerZeroHistory } from "./txHistory/layerZeroHistory";
import { BaseNetwork, OFTToken } from "@/config/interfaces";
import { getAllIBCTransactions } from "./txHistory/ibcHistory";
import { CANTO_MAINNET_EVM } from "@/config/networks";
import { displayAmount } from "@/utils/formatting";
import { BridgeToken } from "./interfaces/tokens";
import { areEqualAddresses } from "@/utils/address";
import * as ALL_NETWORKS from "@/config/networks";

const oftTokens = [
  ...Object.values(BRIDGE_IN_TOKENS.chainTokenList).flat(),
].filter((token) => (token as any).isOFT && token.chainId === 1) as OFTToken[];

const getBridgeInToken = (address: string) =>
  Object.values(BRIDGE_IN_TOKENS.chainTokenList)
    .flat()
    .find((token) => areEqualAddresses((token as any).address, address));

const getIBCToken = (nativeName: string) =>
  Object.values(BRIDGE_IN_TOKENS.chainTokenList)
    .flat()
    .find((token) =>
      areEqualAddresses((token as any).nativeName ?? "", nativeName)
    );

export type BridgeTxHistory = {
  direction: "in" | "out";
  timestamp: Date;
  formattedAmount: string;
  transactionHash: string;
  token: BridgeToken;
  link?: string;
};
export default function useBridgeHistory() {
  const { signer } = useCantoSigner();

  const { data } = useQuery(
    ["bridge history", signer?.account.address],
    async () => {
      if (signer?.account.address) {
        // get all of the transactions
        const [sendToCosmos, oft, ibc] = await Promise.all([
          getSendToCosmosEvents(signer.account.address),
          Promise.all(
            oftTokens.map(async (token) => ({
              token,
              events: await getUserLayerZeroHistory(
                token.chainId,
                token.address,
                signer.account.address
              ),
            }))
          ),
          getAllIBCTransactions(
            CANTO_MAINNET_EVM.chainId,
            signer.account.address
          ),
        ]);

        // format each one
        const txList: BridgeTxHistory[] = [];
        sendToCosmos.forEach((tx) => {
          const token = getBridgeInToken(tx._tokenContract);
          if (token) {
            txList.push({
              direction: "in",
              timestamp: new Date(tx.blockTimestamp),
              formattedAmount: displayAmount(tx._amount, token?.decimals ?? 0, {
                symbol: token.symbol,
              }),
              transactionHash: tx.transactionHash,
              token: token as BridgeToken,
              link: ALL_NETWORKS.ETH_MAINNET.blockExplorer?.getTransactionLink(
                tx.transactionHash
              ),
            });
          }
        });

        oft.forEach((oftEvent) => {
          if (oftEvent.events.data) {
            oftEvent.events.data.receiveFromChain.forEach((tx) => {
              // looking at eth, so receive comes from canto
              txList.push({
                direction: "out",
                timestamp: new Date(parseInt(tx.blockNumber)),
                formattedAmount: displayAmount(
                  tx.amount,
                  oftEvent.token.decimals,
                  {
                    symbol: oftEvent.token.symbol,
                  }
                ),
                transactionHash: tx.txHash,
                token: oftEvent.token as BridgeToken,
                link: ALL_NETWORKS.ETH_MAINNET.blockExplorer?.getTransactionLink(
                  tx.txHash
                ),
              });
            });
            oftEvent.events.data.sendToChain.forEach((tx) => {
              // looking at eth, so send goes to canto
              txList.push({
                direction: "in",
                timestamp: new Date(parseInt(tx.blockNumber)),
                formattedAmount: displayAmount(
                  tx.amount,
                  oftEvent.token.decimals,
                  {
                    symbol: oftEvent.token.symbol,
                  }
                ),
                transactionHash: tx.txHash,
                token: oftEvent.token as BridgeToken,
                link: ALL_NETWORKS.ETH_MAINNET.blockExplorer?.getTransactionLink(
                  tx.txHash
                ),
              });
            });
          }
        });
        if (ibc.data) {
          ibc.data.ibcIn.forEach((tx) => {
            const token = getIBCToken(tx.tx.denom);
            if (token) {
              txList.push({
                direction: "in",
                timestamp: new Date(tx.timestamp),
                formattedAmount: displayAmount(tx.tx.amount, token.decimals, {
                  symbol: token.symbol,
                }),
                transactionHash: tx.txHash,
                token: token as BridgeToken,
                link: ALL_NETWORKS.CANTO_MAINNET_COSMOS.blockExplorer?.getTransactionLink(
                  tx.txHash
                ),
              });
            }
          });
          ibc.data.ibcOut.forEach((tx) => {
            const token = getIBCToken(tx.tx.denom.split("/").pop() ?? "");
            if (token) {
              txList.push({
                direction: "out",
                timestamp: new Date(tx.timestamp),
                formattedAmount: displayAmount(tx.tx.amount, token.decimals, {
                  symbol: token.symbol,
                }),
                transactionHash: tx.txHash,
                token: token as BridgeToken,
                link: ALL_NETWORKS.CANTO_MAINNET_COSMOS.blockExplorer?.getTransactionLink(
                  tx.txHash
                ),
              });
            }
          });
        }

        return { sendToCosmos, oft, ibc, txList };
      }
    },
    {
      refetchInterval: 10000,
    }
  );

  return data;
}
