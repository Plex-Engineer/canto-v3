import { COMPTROLLER_ABI, RESERVOIR_ABI } from "@/config/abis";
import { getCantoCoreAddress } from "@/config/consts/addresses";
import { TX_DESCRIPTIONS } from "@/config/consts/txDescriptions";
import {
  NEW_ERROR,
  NO_ERROR,
  PromiseWithError,
  Transaction,
  TransactionDescription,
  TxCreatorFunctionReturn,
  errMsg,
} from "@/config/interfaces";
import { getTokenBalance } from "@/utils/evm/erc20.utils";
import { displayAmount } from "@/utils/tokenBalances.utils";
import { CLMClaimRewardsTxParams } from "../interfaces/lendingTxTypes";


export async function clmClaimRewardsTx(
  params: CLMClaimRewardsTxParams
): PromiseWithError<TxCreatorFunctionReturn> {
  // get all addresses for tx
  const [wcantoAddress, comptrollerAddress, reservoirAddress] = [
    getCantoCoreAddress(params.chainId, "wcanto"),
    getCantoCoreAddress(params.chainId, "comptroller"),
    getCantoCoreAddress(params.chainId, "reservoir"),
  ];
  // check for errors
  if (!(wcantoAddress && comptrollerAddress && reservoirAddress)) {
    return NEW_ERROR("clmClaimRewardsTx: chainId not supported");
  }
  // create tx list
  const txList: Transaction[] = [];

  // check if drip needs to be called (if balance is less than estimated rewards)
  const { data: comptrollerBalance, error: comptrollerBalanceError } =
    await getTokenBalance(params.chainId, wcantoAddress, comptrollerAddress);
  if (comptrollerBalanceError) {
    return NEW_ERROR("clmClaimRewardsTx::" + errMsg(comptrollerBalanceError));
  }
  if (comptrollerBalance.lte(params.estimatedRewards)) {
    // must call drip
    txList.push(
      _dripComptrollerTx(
        params.chainId,
        reservoirAddress,
        TX_DESCRIPTIONS.DRIP_COMPTROLLER()
      )
    );
  }
  // push claim rewards tx
  txList.push(
    _claimLendingRwardsTx(
      params.chainId,
      params.ethAccount,
      comptrollerAddress,
      TX_DESCRIPTIONS.CLAIM_CLM_RWARDS(
        displayAmount(params.estimatedRewards, 18)
      )
    )
  );

  // return with no error
  return NO_ERROR({ transactions: txList });
}

/**
 * TRANSACTION CREATORS
 * WILL NOT CHECK FOR VALIDITY OF PARAMS, MUST DO THIS BEFORE USING THESE CONSTRUCTORS
 */
const _claimLendingRwardsTx = (
  chainId: number,
  userEthAdress: string,
  comptrollerAddress: string,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: comptrollerAddress,
  abi: COMPTROLLER_ABI,
  method: "claimComp",
  params: [userEthAdress],
  value: "0",
});

// drip is called when claiming rewards, but the comptroller does not have enough WCANTO to pay
// called on reservoir contract, not comptroller
const _dripComptrollerTx = (
  chainId: number,
  reservoirAddress: string,
  description: TransactionDescription
): Transaction => ({
  description,
  chainId: chainId,
  type: "EVM",
  target: reservoirAddress,
  abi: RESERVOIR_ABI,
  method: "drip",
  params: [],
  value: "0",
});
