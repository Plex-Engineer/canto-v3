export interface VCNote {
    address: string;
    decimals: number;
    exchangeRate: string;
    name: string;
    price: string;
    supplyApy: string;
    symbol: string;
    underlying: {
        address: string;
        decimals: number;
        logoURI: string;
        name: string;
        symbol: string;
    };
}

export interface UserVCNoteDetails {
    chainId: number;
    cTokenAddress: string;
    balanceOfCToken: string;
    balanceOfUnderlying: string;
    rewards: string;
    supplyBalanceInUnderlying: string;
    underlyingAllowance: string;
}


export interface VCNoteWithUserData extends VCNote {
    userDetails?: UserVCNoteDetails;
}

export enum CTokenLendingTxTypes {
    SUPPLY = "Supply",
    WITHDRAW = "Withdraw",
}

export type CTokenLendingTransactionParams = {
    chainId: number;
    ethAccount: string;
    txType: CTokenLendingTxTypes;
    cToken: VCNoteWithUserData;
    amount: string;
    max: boolean; // for withdraw, if all tokens should be withdrawn
};

export type ClaimRewardsTxParams = {
    chainId: number;
    ethAccount: string;
    estimatedRewards: string;
};
