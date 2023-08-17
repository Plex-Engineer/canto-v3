import { GRAVITY_BRIDGE_ABI } from "@/config/abis";
import { GRAVITY_BRIDGE_ETH_ADDRESS } from "@/config/consts/addresses";
import { GRAVITY_BRIDGE_API_URL } from "@/config/consts/apiUrls";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
} from "@/config/interfaces/errors";
import { tryFetch } from "@/utils/async.utils";
import {
  getProviderWithoutSigner,
  getRpcUrlFromChainId,
} from "@/utils/evm/helpers.utils";
import { Contract } from "web3";

interface UserGBridgeInHistory {
  completed: SendToCosmosEvent[];
  queued: GBridgeQueueReturn[];
}
export async function getUserGBridgeInHistory(
  chainId: number,
  ethAccount: string
): PromiseWithError<UserGBridgeInHistory> {
  const { data: allTransactions, error: eventError } =
    await getUserGBridgeInEvents(chainId, ethAccount);
  if (eventError) {
    return NEW_ERROR("getUserGBridgeInHistory::" + eventError.message);
  }
  const { data: queue, error: queueError } = await getGBridgeQueueForUser(
    ethAccount
  );
  if (queueError) {
    return NEW_ERROR("getUserGBridgeInHistory::" + queueError.message);
  }
  // there could be matching transactions in the queue and in the event logs
  // split into "completed" and "queued"
  // loop through all events, and separate out the queued transactions
  const completedTxs: SendToCosmosEvent[] = [];
  const queuedTxs: GBridgeQueueReturn[] = [];

  allTransactions.forEach((event) => {
    const matchingQueueTx = queue.find(
      (qTx) => qTx.block_height === event.blockNumber
    );
    matchingQueueTx
      ? queuedTxs.push(matchingQueueTx)
      : completedTxs.push(event);
  });

  return NO_ERROR({
    completed: completedTxs,
    queued: queuedTxs,
  });
}

interface SendToCosmosEvent {
  chainId: number;
  sender: string;
  destination: string;
  tokenContract: string;
  amount: string;
  txHash: string;
  blockNumber: string;
}

// searches the gravity bridge contract for events that match the eth address sender
async function getUserGBridgeInEvents(
  chainId: number,
  ethAddress: string
): PromiseWithError<SendToCosmosEvent[]> {
  // get rpcUrl for chain
  const { data: rpcUrl, error: rpcError } = getRpcUrlFromChainId(chainId);
  if (rpcError) {
    return NEW_ERROR("getUserGBridgeInEvents::" + rpcError.message);
  }
  // create contract instance
  const gBridgeContract = new Contract(
    GRAVITY_BRIDGE_ABI,
    GRAVITY_BRIDGE_ETH_ADDRESS,
    getProviderWithoutSigner(rpcUrl)
  );
  try {
    // filter by eth sender
    const events = await gBridgeContract.getPastEvents("SendToCosmosEvent", {
      filter: { _sender: ethAddress },
      fromBlock: "0",
      toBlock: "latest",
    });
    console.log(events);
    // format events to readable format
    const formattedEvents: SendToCosmosEvent[] = [];
    events.forEach((event) => {
      if (typeof event !== "string")
        formattedEvents.push({
          chainId: chainId,
          sender: event.returnValues._sender as string,
          destination: event.returnValues._destination as string,
          tokenContract: event.returnValues._tokenContract as string,
          amount: (event.returnValues._amount as number).toString(),
          txHash: event.transactionHash as string,
          blockNumber: (event.blockNumber as number).toString(),
        });
    });
    return NO_ERROR(formattedEvents);
  } catch (err) {
    return NEW_ERROR("getUserGBridgeInEvents::" + (err as Error).message);
  }
}

interface GBridgeQueueReturn {
  amount: string;
  block_height: string;
  blocks_until_confirmed: string;
  confirmed: boolean;
  destination: string;
  erc20: string;
  event_nonce: number;
  seconds_until_confirmed: string;
  sender: string;
}

// this data comes from the gravity bridge api
async function getGBridgeQueueForUser(
  ethAccount: string
): PromiseWithError<GBridgeQueueReturn[]> {
  // query gbridge deposit events for queue
  const { data: latestTransactions, error: fetchError } = await tryFetch<{
    deposit_events: GBridgeQueueReturn[];
  }>(GRAVITY_BRIDGE_API_URL + "/eth_bridge_info");
  if (fetchError) {
    return NEW_ERROR("getGBridgeQueueForUser::" + fetchError.message);
  }
  console.log(latestTransactions.deposit_events);
  return NO_ERROR(
    latestTransactions.deposit_events.filter(
      (event) => event.sender.toLowerCase() === ethAccount.toLowerCase()
    )
  );
}
