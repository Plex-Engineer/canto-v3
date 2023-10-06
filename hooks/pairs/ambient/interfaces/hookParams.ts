import {
  NewTransactionFlow,
  ReturnWithError,
  ValidationReturn,
} from "@/config/interfaces";
import { AmbientPair } from "./ambientPairs";
import { AmbientTransactionParams } from "./ambientTxTypes";

export interface AmbientHookInputParams {
  chainId: number;
  userEthAddress?: string;
}

export interface AmbientHookReturn {
  ambientPairs: AmbientPair[];
  transaction: {
    validateParams: (txParams: AmbientTransactionParams) => ValidationReturn;
    createNewPairsFlow: (
      params: AmbientTransactionParams
    ) => ReturnWithError<NewTransactionFlow>;
  };
}
