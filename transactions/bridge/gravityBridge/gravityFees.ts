import { NEW_ERROR, NO_ERROR, PromiseWithError } from "@/config/interfaces";
import { GRAVITY_BRIDGE } from "@/config/networks";
import { tryFetch } from "@/utils/async";

export async function getGravityChainFeeInPercent(): PromiseWithError<number> {
  const { data: gravityParams, error: gravityParamsError } = await tryFetch<{
    params: { min_chain_fee_basis_points: string };
  }>(`${GRAVITY_BRIDGE.restEndpoint}/gravity/v1beta/params`);
  if (gravityParamsError)
    return NEW_ERROR("getGravityChainFeeInPercent", gravityParamsError.message);
  const { min_chain_fee_basis_points } = gravityParams.params;
  return NO_ERROR(Number(min_chain_fee_basis_points) / 100);
}
