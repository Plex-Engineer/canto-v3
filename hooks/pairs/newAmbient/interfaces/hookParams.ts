import {
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import { AmbientTransactionParams } from "./ambientPoolTxTypes";
import { AmbientPool } from "./ambientPools";

export interface AmbientHookInputParams {
  chainId: number;
  userEthAddress?: string;
}
export interface AmbientHookReturn {
  isLoading: boolean;
  ambientPools: AmbientPool[];
  transaction: {
    validateParams: (txParams: AmbientTransactionParams) => ValidationReturn;
    createNewPoolFlow: (
      params: AmbientTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
