import Container from "@/components/container/container";
import Text from "@/components/text";
import TxItem from "@/components/transactions/TxItem";
import useCantoSigner from "@/hooks/helpers/useCantoSigner";
import { TransactionFlowType } from "@/transactions/flows";
import { TransactionWithStatus } from "@/transactions/interfaces";
import { useMemo } from "react";
import InProgressTxItem from "./inProgressItem";

type InProgressTx = TransactionWithStatus & {
  txIndex: number;
  flowId: string;
};

const BridgeInProgress = () => {
  const { signer, txStore } = useCantoSigner();

  const inProgressTxs = useMemo(() => {
    // get all flows
    const flows = txStore?.getUserTransactionFlows(
      signer?.account.address ?? ""
    );
    if (!flows) return [];

    const pendingTxs: InProgressTx[] = [];

    flows.forEach((flow) => {
      // filter by bridge flow type
      if (flow.txType === TransactionFlowType.BRIDGE) {
        // separate txs with bridge flag and status of pending
        flow.transactions.forEach((tx, idx) => {
          if (tx.tx.bridge && tx.tx.bridge?.lastStatus !== "SUCCESS") {
            pendingTxs.push({ ...tx, txIndex: idx, flowId: flow.id });
          }
        });
      }
    });

    return pendingTxs;
  }, [signer?.account.address, txStore]);

  //   const dum = inProgressTxs[0];
  const dum = {
    txLink:
      "https://explorer.canto.io/tx/0x4a2812daf2432ead79d2c20ba84d65cbfa524a4d",
    timestamp: 1634176800,
    hash: "0x4a2812daf2432ead79d2c20ba84d65cbfa524a4d",
    tx: {
      bridge: {
        lastStatus: "NONE",
        type: "2",
      },

      description: {
        title: "Bridge IN",
        description: "20.00 USDT",
      },
      fromAddress: "0x4A2812DAf2432EAD79D2c20Ba84d65CbfA524A4D",
      chainId: 80001,
      type: "EVM",
      target: "0x6175a322E284E6a5ff5f8BcdBE82d30B047E22d4",
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "_lzEndpoint",
              type: "address",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Approval",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_nonce",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_hash",
              type: "bytes32",
            },
          ],
          name: "CallOFTReceivedSuccess",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_dst",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Deposit",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_nonce",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_payload",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_reason",
              type: "bytes",
            },
          ],
          name: "MessageFailed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "_address",
              type: "address",
            },
          ],
          name: "NonContractAddress",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "ReceiveFromChain",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
            {
              indexed: false,
              internalType: "uint64",
              name: "_nonce",
              type: "uint64",
            },
            {
              indexed: false,
              internalType: "bytes32",
              name: "_payloadHash",
              type: "bytes32",
            },
          ],
          name: "RetryMessageSuccess",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              indexed: true,
              internalType: "address",
              name: "_from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "bytes32",
              name: "_toAddress",
              type: "bytes32",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "SendToChain",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "uint16",
              name: "_type",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_minDstGas",
              type: "uint256",
            },
          ],
          name: "SetMinDstGas",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "address",
              name: "precrime",
              type: "address",
            },
          ],
          name: "SetPrecrime",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint16",
              name: "_remoteChainId",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_path",
              type: "bytes",
            },
          ],
          name: "SetTrustedRemote",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "uint16",
              name: "_remoteChainId",
              type: "uint16",
            },
            {
              indexed: false,
              internalType: "bytes",
              name: "_remoteAddress",
              type: "bytes",
            },
          ],
          name: "SetTrustedRemoteAddress",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: "bool",
              name: "_useCustomAdapterParams",
              type: "bool",
            },
          ],
          name: "SetUseCustomAdapterParams",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "value",
              type: "uint256",
            },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "_src",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "Withdrawal",
          type: "event",
        },
        {
          inputs: [],
          name: "DEFAULT_PAYLOAD_SIZE_LIMIT",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "NO_EXTRA_GAS",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "PT_SEND",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "PT_SEND_AND_CALL",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "owner",
              type: "address",
            },
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
          ],
          name: "allowance",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "approve",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          name: "balanceOf",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "_nonce",
              type: "uint64",
            },
            {
              internalType: "bytes32",
              name: "_from",
              type: "bytes32",
            },
            {
              internalType: "address",
              name: "_to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_payload",
              type: "bytes",
            },
            {
              internalType: "uint256",
              name: "_gasForCall",
              type: "uint256",
            },
          ],
          name: "callOnOFTReceived",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "circulatingSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          name: "creditedPackets",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "subtractedValue",
              type: "uint256",
            },
          ],
          name: "decreaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "deposit",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              internalType: "bytes32",
              name: "_toAddress",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_payload",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "_dstGasForCall",
              type: "uint64",
            },
            {
              internalType: "bool",
              name: "_useZro",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "_adapterParams",
              type: "bytes",
            },
          ],
          name: "estimateSendAndCallFee",
          outputs: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "zroFee",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              internalType: "bytes32",
              name: "_toAddress",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_useZro",
              type: "bool",
            },
            {
              internalType: "bytes",
              name: "_adapterParams",
              type: "bytes",
            },
          ],
          name: "estimateSendFee",
          outputs: [
            {
              internalType: "uint256",
              name: "nativeFee",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "zroFee",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "",
              type: "uint64",
            },
          ],
          name: "failedMessages",
          outputs: [
            {
              internalType: "bytes32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
          ],
          name: "forceResumeReceive",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_version",
              type: "uint16",
            },
            {
              internalType: "uint16",
              name: "_chainId",
              type: "uint16",
            },
            {
              internalType: "address",
              name: "",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "_configType",
              type: "uint256",
            },
          ],
          name: "getConfig",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_remoteChainId",
              type: "uint16",
            },
          ],
          name: "getTrustedRemoteAddress",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "spender",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "addedValue",
              type: "uint256",
            },
          ],
          name: "increaseAllowance",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
          ],
          name: "isTrustedRemote",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "lzEndpoint",
          outputs: [
            {
              internalType: "contract ILayerZeroEndpoint",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "_nonce",
              type: "uint64",
            },
            {
              internalType: "bytes",
              name: "_payload",
              type: "bytes",
            },
          ],
          name: "lzReceive",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
          ],
          name: "minDstGasLookup",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "name",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "_nonce",
              type: "uint64",
            },
            {
              internalType: "bytes",
              name: "_payload",
              type: "bytes",
            },
          ],
          name: "nonblockingLzReceive",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
          ],
          name: "payloadSizeLimitLookup",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "precrime",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_srcAddress",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "_nonce",
              type: "uint64",
            },
            {
              internalType: "bytes",
              name: "_payload",
              type: "bytes",
            },
          ],
          name: "retryMessage",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_from",
              type: "address",
            },
            {
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              internalType: "bytes32",
              name: "_toAddress",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_payload",
              type: "bytes",
            },
            {
              internalType: "uint64",
              name: "_dstGasForCall",
              type: "uint64",
            },
            {
              components: [
                {
                  internalType: "address payable",
                  name: "refundAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "zroPaymentAddress",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "adapterParams",
                  type: "bytes",
                },
              ],
              internalType: "struct ICommonOFT.LzCallParams",
              name: "_callParams",
              type: "tuple",
            },
          ],
          name: "sendAndCall",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_from",
              type: "address",
            },
            {
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              internalType: "bytes32",
              name: "_toAddress",
              type: "bytes32",
            },
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              components: [
                {
                  internalType: "address payable",
                  name: "refundAddress",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "zroPaymentAddress",
                  type: "address",
                },
                {
                  internalType: "bytes",
                  name: "adapterParams",
                  type: "bytes",
                },
              ],
              internalType: "struct ICommonOFT.LzCallParams",
              name: "_callParams",
              type: "tuple",
            },
          ],
          name: "sendFrom",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_version",
              type: "uint16",
            },
            {
              internalType: "uint16",
              name: "_chainId",
              type: "uint16",
            },
            {
              internalType: "uint256",
              name: "_configType",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "_config",
              type: "bytes",
            },
          ],
          name: "setConfig",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              internalType: "uint16",
              name: "_packetType",
              type: "uint16",
            },
            {
              internalType: "uint256",
              name: "_minGas",
              type: "uint256",
            },
          ],
          name: "setMinDstGas",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_dstChainId",
              type: "uint16",
            },
            {
              internalType: "uint256",
              name: "_size",
              type: "uint256",
            },
          ],
          name: "setPayloadSizeLimit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "_precrime",
              type: "address",
            },
          ],
          name: "setPrecrime",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_version",
              type: "uint16",
            },
          ],
          name: "setReceiveVersion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_version",
              type: "uint16",
            },
          ],
          name: "setSendVersion",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_srcChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_path",
              type: "bytes",
            },
          ],
          name: "setTrustedRemote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "_remoteChainId",
              type: "uint16",
            },
            {
              internalType: "bytes",
              name: "_remoteAddress",
              type: "bytes",
            },
          ],
          name: "setTrustedRemoteAddress",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bool",
              name: "_useCustomAdapterParams",
              type: "bool",
            },
          ],
          name: "setUseCustomAdapterParams",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "sharedDecimals",
          outputs: [
            {
              internalType: "uint8",
              name: "",
              type: "uint8",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "bytes4",
              name: "interfaceId",
              type: "bytes4",
            },
          ],
          name: "supportsInterface",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [
            {
              internalType: "string",
              name: "",
              type: "string",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "token",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "from",
              type: "address",
            },
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "transferFrom",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint16",
              name: "",
              type: "uint16",
            },
          ],
          name: "trustedRemoteLookup",
          outputs: [
            {
              internalType: "bytes",
              name: "",
              type: "bytes",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "useCustomAdapterParams",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
          ],
          name: "withdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          stateMutability: "payable",
          type: "receive",
        },
      ],
      method: "sendFrom",
      params: [
        "0x4A2812DAf2432EAD79D2c20Ba84d65CbfA524A4D",
        10159,
        "0x0000000000000000000000004a2812daf2432ead79d2c20ba84d65cbfa524a4d",
        "20000000000000000",
        [
          "0x4A2812DAf2432EAD79D2c20Ba84d65CbfA524A4D",
          "0x0000000000000000000000000000000000000000",
          "0x",
        ],
      ],
      value: "179486079258246338",
    },
    status: "SUCCESS",
    txIndex: 0,
    flowId: "1703761746769",
  } as InProgressTx;
  return (
    <Container height="468px" padding="lg">
      <InProgressTxItem
        key={"key"}
        tx={dum}
        idx={0}
        loading={false}
        loadingPercentage={20}
        timeLeftInSeconds={1000}
        setBridgeStatus={(status) => {
          txStore?.setTxBridgeStatus(
            signer?.account.address ?? "",
            dum.flowId,
            dum.txIndex,
            status
          );
        }}
      />
      <InProgressTxItem
        key={"key"}
        tx={dum}
        idx={0}
        loading={false}
        loadingPercentage={-1}
        timeLeftInSeconds={1000}
        setBridgeStatus={(status) => {
          txStore?.setTxBridgeStatus(
            signer?.account.address ?? "",
            dum.flowId,
            dum.txIndex,
            status
          );
        }}
      />
      {inProgressTxs.length > 0 ? (
        inProgressTxs.map((tx, idx) => (
          <InProgressTxItem
            key={idx}
            tx={tx}
            idx={idx}
            loading={false}
            // loadingPercentage={20}
            timeLeftInSeconds={0}
            setBridgeStatus={(status) => {
              txStore?.setTxBridgeStatus(
                signer?.account.address ?? "",
                tx.flowId,
                tx.txIndex,
                status
              );
            }}
          />
        ))
      ) : (
        <Container
          height="100%"
          center={{
            horizontal: true,
            vertical: true,
          }}
        >
          <Text
            theme="secondary-dark"
            size="sm"
            style={{
              textAlign: "center",
              width: "80%",
            }}
          >
            You have no pending transactions. To check history please click on
            the transactions icon in the navbar.
          </Text>
        </Container>
      )}
    </Container>
  );
};

export default BridgeInProgress;
