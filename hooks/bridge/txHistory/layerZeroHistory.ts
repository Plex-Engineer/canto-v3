// to find the layer 0 history for a user, we need to check the following events from the OFT contract:
// - SendToChain
// - ReceiveFromChain

import { OFT_ABI } from "@/config/abis";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  errMsg,
} from "@/config/interfaces";
import { newContractInstance } from "@/utils/evm";

// this must be done on each OFT contract
// TODO: allow list to be passed through, only works for single OFT contract right now

// chainId will be either src/dst depending on the direction of the bridge
interface LayerZeroEvent {
  blockNumber: string;
  txHash: string;
  amount: string;
  tokenAddress: string;
  lzChainId: string;
}
export interface UserLayerZeroHistory {
  sendToChain: LayerZeroEvent[];
  receiveFromChain: LayerZeroEvent[];
}
export async function getUserLayerZeroHistory(
  chainId: number,
  oftContractAddress: string,
  ethAccount: string
): PromiseWithError<UserLayerZeroHistory> {
  // create OFT contract instance
  const { data: oftContract, error } = newContractInstance<typeof OFT_ABI>(
    chainId,
    oftContractAddress,
    OFT_ABI
  );
  if (error) {
    return NEW_ERROR("getUserLayerZeroHistory::" + errMsg(error));
  }

  try {
    const sendToChainEvents = await oftContract.getPastEvents("SendToChain", {
      filter: { _from: ethAccount },
      fromBlock: 0,
      toBlock: "latest",
    });
    const sendFromChainEvents = await oftContract.getPastEvents(
      "ReceiveFromChain",
      {
        filter: { _to: ethAccount },
        fromBlock: 0,
        toBlock: "latest",
      }
    );

    // format events to readable format
    const formattedToEvents: LayerZeroEvent[] = [];
    sendToChainEvents.forEach((event) => {
      if (typeof event !== "string")
        formattedToEvents.push({
          blockNumber: (event.blockNumber as number).toString(),
          txHash: event.transactionHash as string,
          amount: (event.returnValues._amount as number).toString(),
          tokenAddress: oftContractAddress,
          lzChainId: (event.returnValues._dstChainId as number).toString(),
        });
    });

    const formattedFromEvents: LayerZeroEvent[] = [];
    sendFromChainEvents.forEach((event) => {
      if (typeof event !== "string")
        formattedFromEvents.push({
          blockNumber: (event.blockNumber as number).toString(),
          txHash: event.transactionHash as string,
          amount: (event.returnValues._amount as number).toString(),
          tokenAddress: oftContractAddress,
          lzChainId: (event.returnValues._srcChainId as number).toString(),
        });
    });
    return NO_ERROR({
      sendToChain: formattedToEvents,
      receiveFromChain: formattedFromEvents,
    });
  } catch (err) {
    return NEW_ERROR("getUserLayerZeroHistory::" + errMsg(err));
  }
}
