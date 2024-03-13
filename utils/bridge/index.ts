import { tryFetch } from "../async";
type BridgeTx = {
  blockTimestamp: string;
  transactionHash: string;
  _sender: string;
  _destination: string;
  _amount: string;
  _tokenContract: string;
};

export async function getSendToCosmosEvents(
  ethAddress: string
): Promise<BridgeTx[]> {
  const { data, error } = await tryFetch<{
    data: { sendToCosmosEvents: BridgeTx[] };
  }>(
    `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_THEGRAPH_API_KEY}/subgraphs/id/5vjqnnpEoy15Qfw2kU1SXCUMkPhNBt2QdpGeiXSDiGnZ`,
    {
      method: "POST",
      body: JSON.stringify({
        query: `{\n  sendToCosmosEvents(\n    where: {_sender: "${ethAddress}"}\n  ) {\n    transactionHash\n    blockTimestamp\n   _sender\n    _destination\n    _amount\n    _tokenContract\n  }\n}`,
      }),
    }
  );
  if (error) {
    console.error("getSendToCosmosEvents", error);
    return [];
  }
  return data.data.sendToCosmosEvents;
}
