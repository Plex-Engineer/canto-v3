import { tryFetch } from "@/utils/async.utils";
import { useEffect, useState } from "react";
import { Validator } from "./interfaces.ts/validators";
// import { CANTO_DATA_API } from "@/config/api";

interface StakingReturn {
  validators: Validator[];
  stakingApy: string;
}
export default function useStaking() {
  const initialState: StakingReturn = {
    validators: [],
    stakingApy: "0",
  };

  const [state, setState] = useState(initialState);

  // async function getAllValidators() {
  //   const { data: validators, error: validatorError } = await tryFetch<
  //     Validator[]
  //   >(CANTO_DATA_API.allValidators);
  //   if (validatorError) {
  //     console.error(validatorError);
  //     return;
  //   }
  //   setState((prevState) => ({ ...prevState, validators }));
  // }
  // async function getStakingApy() {
  //   const { data: apy, error: apyError } = await tryFetch<string>(
  //     CANTO_DATA_API.stakingApr
  //   );
  //   if (apyError) {
  //     console.error(apyError);
  //     return;
  //   }
  //   setState((prevState) => ({ ...prevState, stakingApy: apy }));
  // }

  // useEffect(() => {
  //   getAllValidators();
  //   getStakingApy();
  // }, []);

  return state;
}
