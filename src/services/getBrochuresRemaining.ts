import { apiGet } from "./http";
import type { GetBrochuresRemainingResponse, GetBrochuresRemainingResult } from "../types";

export const getBrochuresRemaining = async (
  anonId: string | null,
  options?: { signal?: AbortSignal; timeoutMs?: number }
): Promise<GetBrochuresRemainingResult> => {
  try {
    const res = await apiGet<GetBrochuresRemainingResponse>(`/api/v1/users/get_remaining`, {
      params: { anon_id: anonId },
      timeout: options?.timeoutMs ?? 8000,
      signal: options?.signal,
    })
    return { success: true, data: res.data as GetBrochuresRemainingResponse }
  } catch (err) {
    console.error("getBrochuresRemaining failed", err)
    return { success: false, error: err }
  }
}
