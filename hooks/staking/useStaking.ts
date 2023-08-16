import { CANTO_DATA_API_URL } from "@/config/consts/apiUrls";
import { tryFetch } from "@/utils/async.utils";
import { useEffect, useState } from "react";
import { Validator } from "./interfaces.ts/validators";

export default function useStaking() {
  const initialState = {};

  const [state, setState] = useState(initialState);

  async function getAllValidators() {
    const { data: validators, error: validatorError } = await tryFetch<
      Validator[]
    >("http://localhost:8010/proxy" + "/v1/staking/validators");
    if (validatorError) {
      console.error(validatorError);
      return;
    }
    setState((prevState) => ({ ...prevState, validators }));
  }
  useEffect(() => {
    getAllValidators();
  }, []);

  return state;
}
