import React from "react";
import styles from "./transactions.module.scss";
import Image from "next/image";
import Text from "../text";
import TxItem from "./TxItem";
import Spacer from "../layout/spacer";

export interface ITransaction {
  title: string;
  description: string;
  status: "pending" | "loading" | "success" | "failed";
  link?: string;
  hash?: string;
  rawTx: string;
  idx?: number;
}
interface Props {
  imgUrl: string;
  title: string;
  transactions: ITransaction[];
}

const TxUnused = () => {
  return (
    <div className={styles.container}>
      <Image
        src="https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg"
        width={50}
        height={50}
        alt="canto"
      />
      <Spacer height="20px" />

      <Text font="proto_mono" size="lg">
        Briding - USDT
      </Text>
      <Spacer height="40px" />

      <TxItem
        title="Approve USDT"
        description="Approving USDT to be bridged"
        status="success"
        rawTx="0x1234567890"
        idx={1}
      />
      <TxItem
        title="Bridging USDT"
        description="Bridging USDT from Ethereum to Solana"
        status="failed"
        rawTx="0x1234567890"
        idx={2}
      />
      <TxItem
        title="Rewarding collection from staking"
        description="Join a highly vetted community for founders to connect with growth leaders and investors."
        status="loading"
        rawTx="0x1234567890"
        idx={3}
      />
      <TxItem
        title="Rewarding collection from staking"
        description="Join a highly vetted community for founders to connect with growth leaders and investors."
        status="success"
        rawTx="0x1234567890"
        idx={4}
        link="https://google.com"
        hash="1234567890"
      />
    </div>
  );
};

export default TxUnused;
