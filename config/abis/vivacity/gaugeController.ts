/**
    guageController Contract ABI
 */
    export const GAUGE_CONTROLLER_ABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_gauge",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_time",
                    "type": "uint256"
                }
            ],
            "name": "gauge_relative_weight",
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
    ] as const;