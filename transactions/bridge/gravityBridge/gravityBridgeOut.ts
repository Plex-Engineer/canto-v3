import { IBCToken } from "@/config/interfaces";
import { createMsgsSendToEth } from "@/transactions/cosmos/messages/gravitySendToEth/sendToEth";
import { Transaction } from "@/transactions/interfaces";
import { ethToGravity } from "@gravity-bridge/address-converter";

type GravityBridgeOutParams = {
  ethSender: string;
  token: IBCToken;
  amount: string;
};
export async function gravityBridgeOutTx(
  txParams: GravityBridgeOutParams
): Promise<Transaction> {
  const gravtiyAddress = ethToGravity(txParams.ethSender);
  // chain fee = amount * 0.01%
  const msgs = createMsgsSendToEth({
    amount: "1",
    bridgeFee: "0",
    chainFee: "0",
    ethReceiver: txParams.ethSender,
    gravitySender: gravtiyAddress,
    ibcDenom: "gravity0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687",
  });
  return {
    chainId: 999999,
    type: "COSMOS",
    description: {
      title: "Gravity Bridge Out",
      description: "Bridge tokens from Cosmos to Ethereum",
    },
    msg: msgs,
  };
}
