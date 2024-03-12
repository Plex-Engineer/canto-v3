import { CANTO_MAINNET_EVM, ETH_MAINNET } from "@/config/networks";
import BRIDGE_IN_TOKEN_LIST from "@/config/jsons/bridgeInTokens.json";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { useEffect, useMemo, useState } from "react";
import useTokenBalances from "@/hooks/helpers/useTokenBalances";
import { ERC20Token, OFTToken } from "@/config/interfaces";
import { useBalance } from "wagmi";
import { checkTokenAllowance, isOFTToken } from "@/utils/tokens";
import {
  GRAVITY_BRIDGE_ETH_ADDRESSES,
  MAX_UINT256,
  ZERO_ADDRESS,
} from "@/config/consts/addresses";
import { greaterThan } from "@/utils/math";
import { convertToBigNumber } from "@/utils/formatting";
import { bridgeLayerZeroTx } from "@/transactions/bridge/layerZero/layerZeroTx";
import { Transaction } from "@/transactions/interfaces";
import { _approveTx } from "@/transactions/erc20";
import { signTransaction, waitForTransaction } from "@/transactions/signTx";
import {
  _sendEthToCosmosTx,
  _sendToCosmosTx,
} from "@/transactions/bridge/gravityBridge/txCreators";
import { checkCantoPubKey, ethToCantoAddress } from "@/utils/address";
import { generateCantoPublicKeyWithTx } from "@/transactions/cosmos/publicKey";
import { useToast } from "@/components/toast";
import useBridgingFees from "@/hooks/bridge/useBridgingFees";
import { BridgingMethod } from "@/transactions/bridge";
import { BridgeToken } from "@/hooks/bridge/interfaces/tokens";

// constants
const fromNetwork = ETH_MAINNET;
const toNetwork = CANTO_MAINNET_EVM;
const availableTokens =
  BRIDGE_IN_TOKEN_LIST.chainTokenList[
    fromNetwork.id as keyof typeof BRIDGE_IN_TOKEN_LIST.chainTokenList
  ];

// possible transactions to make
enum TxType {
  LOADING,
  GEN_PUB_KEY,
  APPROVE,
  SEND_TO_COSMOS,
  SEND_ETH_TO_COSMOS,
  SEND_OFT,
}

const txText = (txType: TxType) => {
  switch (txType) {
    case TxType.GEN_PUB_KEY:
      return "generate public key";
    case TxType.APPROVE:
      return "approve token";
    case TxType.SEND_TO_COSMOS:
    case TxType.SEND_ETH_TO_COSMOS:
    case TxType.SEND_OFT:
      return "bridge in";
    case TxType.LOADING:
    default:
      return "loading...";
  }
};

// success and error will be dealt with in the toast, button state is either ready or confirming
enum TxStatus {
  NONE = "none",
  SIGNING = "signing...",
  CONFIRMING = "confirming...",
}

export default function useEthBridgeIn() {
  // get current connected account
  const { signer } = useCantoSigner();

  // useEffects will need to be retriggered after tx status changes
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.NONE);

  // user canto public key (retrigger after signer changes or tx status changes)
  const [hasPubKey, setHasPubKey] = useState<boolean>(false);
  useEffect(() => {
    async function checkPubKey() {
      if (signer?.account.address) {
        const { data: cantoAddress } = await ethToCantoAddress(
          signer.account.address
        );
        if (cantoAddress) {
          const { data: hasPubKey, error } = await checkCantoPubKey(
            cantoAddress,
            toNetwork.chainId
          );
          setHasPubKey(!(error || !hasPubKey));
        } else {
          setHasPubKey(false);
        }
      } else {
        setHasPubKey(false);
      }
    }
    checkPubKey();
  }, [signer?.account.address, txStatus]);

  const { data: ethBalance } = useBalance({
    chainId: fromNetwork.chainId,
    address: signer?.account.address,
  });
  const userTokenBalances = useTokenBalances(
    fromNetwork.chainId,
    availableTokens as ERC20Token[],
    signer?.account.address
  );
  const tokensWithBalances = useMemo(
    () =>
      availableTokens.map((token) => ({
        ...token,
        balance: userTokenBalances[token.id] ?? "0",
      })),
    [userTokenBalances]
  );

  const [selectedTokenId, setSelectedTokenId] = useState(availableTokens[0].id);
  const selectedToken = useMemo(
    () => tokensWithBalances.find((t) => t.id === selectedTokenId),
    [selectedTokenId, tokensWithBalances]
  ) as ERC20Token | undefined;

  // amount
  const [amount, setAmount] = useState<string>("0");
  const bnAmount = useMemo(
    () =>
      (
        convertToBigNumber(amount, selectedToken?.decimals).data ?? "0"
      ).toString(),
    [amount, selectedToken?.decimals]
  );

  // just grab once when token is selected (retriggger when txStatus changes since could be approval)
  const [currentTokenAllowance, setCurrentTokenAllowance] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function getAllowance() {
      if (
        selectedToken &&
        !isOFTToken(selectedToken) &&
        selectedToken.address !== ZERO_ADDRESS &&
        signer?.account.address
      ) {
        const { data: allowance, error } = await checkTokenAllowance(
          fromNetwork.chainId,
          selectedToken.address,
          signer.account.address,
          GRAVITY_BRIDGE_ETH_ADDRESSES.gravityBridge,
          "0"
        );
        if (error) {
          setCurrentTokenAllowance(null);
          return;
        }
        setCurrentTokenAllowance(allowance.allowance.toString());
      } else {
        setCurrentTokenAllowance(null);
      }
    }
    getAllowance();
  }, [selectedToken, signer?.account.address, txStatus]);

  // Transactions

  // current tx type
  const txType = useMemo(() => {
    // no token
    if (!selectedToken) return TxType.LOADING;
    // oft token
    if (isOFTToken(selectedToken)) return TxType.SEND_OFT;
    // check pubkey
    if (!hasPubKey) return TxType.GEN_PUB_KEY;
    // check if eth, send eth to router
    if (selectedToken.address === ZERO_ADDRESS)
      return TxType.SEND_ETH_TO_COSMOS;
    // amount greater than allowance
    if (
      greaterThan(bnAmount, currentTokenAllowance ?? "0") ||
      currentTokenAllowance === "0"
    )
      return TxType.APPROVE;
    // gbridge token ready to send
    return TxType.SEND_TO_COSMOS;
  }, [selectedToken, bnAmount, currentTokenAllowance, hasPubKey]);

  // Toast for tx status
  const toast = useToast();

  async function onBridgeIn() {
    // if already signing or confirming, do nothing
    if (txStatus !== TxStatus.NONE) return;
    try {
      setTxStatus(TxStatus.SIGNING);
      // basic check
      if (!selectedToken) throw new Error("no token selected");
      if (!signer) throw new Error("no signer");

      // depending on the tx type, different methods could be called
      let tx: Transaction;
      const txDescription = { title: "", description: "" };
      switch (txType) {
        case TxType.APPROVE: {
          tx = _approveTx(
            fromNetwork.chainId,
            signer.account.address,
            selectedToken.address,
            GRAVITY_BRIDGE_ETH_ADDRESSES.gravityBridge,
            MAX_UINT256,
            txDescription
          );
          break;
        }
        case TxType.SEND_OFT: {
          const { data: txCreator, error: txCreatorError } =
            await bridgeLayerZeroTx({
              ethSender: signer.account.address,
              fromNetworkChainId: fromNetwork.chainId,
              toNetworkChainId: toNetwork.chainId,
              token: selectedToken as OFTToken,
              amount: bnAmount,
            });
          if (txCreatorError) throw txCreatorError;
          // there should only be one evm transaction
          if (txCreator.transactions.length !== 1)
            throw new Error("invalid tx creator");
          tx = txCreator.transactions[0];
          break;
        }
        case TxType.GEN_PUB_KEY: {
          const { data: cantoReceiver, error: ethToCantoError } =
            await ethToCantoAddress(signer.account.address);
          if (ethToCantoError) throw ethToCantoError;
          const { data: pubKeyTxs, error: pubKeyTxsError } =
            await generateCantoPublicKeyWithTx(
              toNetwork.chainId,
              signer.account.address,
              cantoReceiver
            );
          if (pubKeyTxsError) throw pubKeyTxsError;
          // there should only be one transaction
          if (pubKeyTxs.length !== 1) throw new Error("invalid tx creator");
          tx = pubKeyTxs[0];
          break;
        }
        case TxType.SEND_TO_COSMOS: {
          /** convert sender address to canto address */
          const { data: cantoReceiver, error: ethToCantoError } =
            await ethToCantoAddress(signer.account.address);
          if (ethToCantoError) throw ethToCantoError;
          tx = _sendToCosmosTx(
            fromNetwork.chainId,
            signer.account.address,
            cantoReceiver,
            selectedToken.address,
            bnAmount,
            txDescription,
            { direction: "in", amountFormatted: "" }
          );
          break;
        }
        case TxType.SEND_ETH_TO_COSMOS: {
          /** convert sender address to canto address */
          const { data: cantoReceiver, error: ethToCantoError } =
            await ethToCantoAddress(signer.account.address);
          if (ethToCantoError) throw ethToCantoError;
          tx = _sendEthToCosmosTx(
            fromNetwork.chainId,
            signer.account.address,
            cantoReceiver,
            bnAmount,
            txDescription
          );
          break;
        }
        default:
          throw new Error("invalid tx");
      }
      const { data: txHash, error: txSignError } = await signTransaction(tx);
      if (txSignError) throw txSignError;
      setTxStatus(TxStatus.CONFIRMING);

      // wait for transactions to be confirmed
      const { data: receipt, error: receiptError } = await waitForTransaction(
        tx.type,
        tx.chainId,
        txHash
      );
      if (receiptError || receipt.status !== "success")
        throw Error(receipt.error);

      // if everything is successful
      toast.add({
        primary: "Transaction Successful",
        secondary: txText(txType),
        state: "success",
      });
      setTxStatus(TxStatus.NONE);
    } catch (err) {
      toast.add({
        primary: "Transaction Error",
        secondary: txText(txType),
        state: "failure",
      });
      setTxStatus(TxStatus.NONE);
      console.error(err);
    }
  }

  const fees = useBridgingFees({
    direction: "in",
    token: selectedToken as BridgeToken,
    fromNetwork,
    toNetwork,
    method:
      txType === TxType.SEND_OFT
        ? BridgingMethod.LAYER_ZERO
        : BridgingMethod.GRAVITY_BRIDGE,
    ethSender: signer?.account.address,
  });

  return {
    fromNetwork,
    toNetwork,
    availableTokens: tokensWithBalances,
    selectedToken,
    setSelectedTokenId,
    amount,
    setAmount,
    txText: txText(txType),
    txStatus,
    onBridgeIn,
    fees,
  };
}
