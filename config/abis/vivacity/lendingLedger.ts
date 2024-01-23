/**
    lendinLedger Contract ABI
 */
export const LENDING_LEDGER_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_gaugeController",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_governance",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "market",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fromEpoch",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "toEpoch",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "SecondaryRewardsSet",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "WEEK",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_market",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_lender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_forwardTimestampLimit",
                "type": "uint256"
            }
        ],
        "name": "checkpoint_lender",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_market",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_forwardTimestampLimit",
                "type": "uint256"
            }
        ],
        "name": "checkpoint_market",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_market",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_claimFromTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_claimUpToTimestamp",
                "type": "uint256"
            }
        ],
        "name": "claim",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_lendingMarket",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_incentiveToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_fromEpoch",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_toEpoch",
                "type": "uint256"
            }
        ],
        "name": "claimSecondaryRewards",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "gaugeController",
        "outputs": [
            {
                "internalType": "contract GaugeController",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "governance",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "lendingMarketBalances",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lendingMarketBalancesEpoch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "lendingMarketTimeWeightedBalances",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "lendingMarketTotalBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lendingMarketTotalBalanceEpoch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "lendingMarketTotalTimeWeightedBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lendingMarketWhitelist",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "rewardInformation",
        "outputs": [
            {
                "internalType": "bool",
                "name": "set",
                "type": "bool"
            },
            {
                "internalType": "uint248",
                "name": "amount",
                "type": "uint248"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "secondaryRewards",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "secondaryRewardsClaimed",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_governance",
                "type": "address"
            }
        ],
        "name": "setGovernance",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_fromEpoch",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_toEpoch",
                "type": "uint256"
            },
            {
                "internalType": "uint248",
                "name": "_amountPerEpoch",
                "type": "uint248"
            }
        ],
        "name": "setRewards",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_lendingMarket",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_incentiveToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_fromEpoch",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_toEpoch",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_amountPerEpoch",
                "type": "uint256"
            }
        ],
        "name": "setSecondaryRewards",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_lender",
                "type": "address"
            },
            {
                "internalType": "int256",
                "name": "_delta",
                "type": "int256"
            }
        ],
        "name": "sync_ledger",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "userClaimedEpoch",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_market",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "_isWhiteListed",
                "type": "bool"
            }
        ],
        "name": "whiteListLendingMarket",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "payable",
        "type": "receive"
    }
] as const;