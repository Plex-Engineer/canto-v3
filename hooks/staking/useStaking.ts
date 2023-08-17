import {
  CANTO_DATA_API_ENDPOINTS,
  CANTO_DATA_API_URL,
} from "@/config/consts/apiUrls";
import { tryFetch } from "@/utils/async.utils";
import { useEffect, useState } from "react";
import { Validator } from "./interfaces.ts/validators";

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

  async function getAllValidators() {
    const { data: validators, error: validatorError } = await tryFetch<
      Validator[]
    >("http://localhost:8010/proxy" + CANTO_DATA_API_ENDPOINTS.allValidators);
    if (validatorError) {
      console.error(validatorError);
      return;
    }
    setState((prevState) => ({ ...prevState, validators }));
  }
  async function getStakingApy() {
    const { data: apy, error: apyError } = await tryFetch<string>(
      "http://localhost:8010/proxy" + CANTO_DATA_API_ENDPOINTS.stakingApr
    );
    if (apyError) {
      console.error(apyError);
      return;
    }
    setState((prevState) => ({ ...prevState, stakingApy: apy }));
  }

  useEffect(() => {
    getAllValidators();
    getStakingApy();
  }, []);

  return state;
}
