import { getCosmosAPIEndpoint } from "@/config/consts/apiUrls";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  ReturnWithError,
} from "@/config/interfaces/errors";
import { ethToCantoAddress } from "@/utils/address.utils";
import { tryFetch } from "@/utils/async.utils";

interface IBCTransaction {
  chainId: number;
  tx: ParsedFungibleTokenPacket;
  txHash: string;
  timestamp: string;
}
export interface UserIBCTransactionHistory {
  ibcIn: IBCTransaction[];
  ibcOut: IBCTransaction[];
}

export async function getAllIBCTransactions(
  chainId: number,
  ethAccount: string
): PromiseWithError<UserIBCTransactionHistory> {
  const { data: cantoAccount, error: addressError } = await ethToCantoAddress(
    ethAccount
  );
  if (addressError) {
    return NEW_ERROR("getAllIBCTransactions::" + addressError.message);
  }
  const { data: ibcInTxs, error: ibcInError } = await getIBCTransactions(
    chainId,
    cantoAccount,
    true
  );
  if (ibcInError) {
    return NEW_ERROR("getAllIBCTransactions::" + ibcInError.message);
  }
  const { data: ibcOutTxs, error: ibcOutError } = await getIBCTransactions(
    chainId,
    cantoAccount,
    false
  );
  if (ibcOutError) {
    return NEW_ERROR("getAllIBCTransactions::" + ibcOutError.message);
  }
  return NO_ERROR({
    ibcIn: ibcInTxs,
    ibcOut: ibcOutTxs,
  });
}

interface CosmosTxEvent {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
}
// events are encrypted, so we must use logs.events to get raw data
interface IBCTransactionResponse {
  code: number;
  codespace: string;
  data: string;
  events: object[];
  gas_used: string;
  gas_wanted: string;
  height: string;
  info: string;
  logs: {
    events: CosmosTxEvent[];
    log: string;
    msg_index: number;
  }[];
  raw_log: string;
  timestamp: string;
  tx: {
    "@type": string;
    body: object;
    auth_info: object;
    signatures: string[];
  };
  txhash: string;
}
async function getIBCTransactions(
  chainId: number,
  cantoAccount: string,
  ibcIn: boolean
): PromiseWithError<IBCTransaction[]> {
  const { data: endpoint, error: endpointError } =
    getCosmosAPIEndpoint(chainId);
  if (endpointError) {
    return NEW_ERROR("getIBCTransactions::" + endpointError.message);
  }
  // if ibcIn, then we want to filter by receiver, otherwise filter by sender
  const ibcAttribute = ibcIn ? "receiver" : "sender";
  const { data: ibcTransactions, error: ibcError } = await tryFetch<{
    tx_responses: IBCTransactionResponse[];
  }>(
    endpoint +
      "/cosmos/tx/v1beta1/txs?events=fungible_token_packet." +
      ibcAttribute +
      "%3D'" +
      cantoAccount +
      "'"
  );
  if (ibcError) {
    return NEW_ERROR("getIBCTransactions::" + ibcError.message);
  }
  const filteredTransactions: IBCTransaction[] = [];
  // go through each transaction and grab event data
  for (const txResponse of ibcTransactions.tx_responses) {
    // grab events from all logs
    const allEvents = txResponse.logs.map((log) => log.events).flat();
    for (const event of allEvents) {
      // search for fungible token packet event
      if (event.type === "fungible_token_packet") {
        const { data: parsedTokenPacket, error: parseError } =
          parseFungibleTokenPacket(event);
        if (parseError) {
          console.log(parseError);
        } else {
          filteredTransactions.push({
            chainId,
            tx: parsedTokenPacket,
            txHash: txResponse.txhash,
            timestamp: txResponse.timestamp,
          });
        }
      }
    }
  }
  return NO_ERROR(filteredTransactions);
}

interface ParsedFungibleTokenPacket {
  sender: string;
  receiver: string;
  denom: string;
  amount: string;
  success: boolean;
}
// parse fungible token packed event to get tx data
function parseFungibleTokenPacket(
  event: CosmosTxEvent
): ReturnWithError<ParsedFungibleTokenPacket> {
  // create empty dictionary so we only go through packet one time
  const parsedPacket: { [key: string]: string } = {};
  for (const attribute of event.attributes) {
    // add all keys and values to dictionary
    parsedPacket[attribute.key] = attribute.value;
  }
  // check if all keys exist
  if (instanceOfParsedPacked(parsedPacket)) {
    return NO_ERROR(parsedPacket);
  }
  return NEW_ERROR("parseFungibleTokenPacket: missing keys");
}

// check if object is instance of ParsedFungibleTokenPacket for type guarding
function instanceOfParsedPacked(
  object: any
): object is ParsedFungibleTokenPacket {
  return (
    object.sender &&
    object.receiver &&
    object.denom &&
    object.amount &&
    object.success
  );
}
