import axios from "axios";
import { API_BASE_URL } from "../config";

export interface GetBrochuresRemainingResponse {
  brochures_remaining: number
  anon_id: string
}

export type GetBrochuresRemainingResult =
  | { success: true; data: GetBrochuresRemainingResponse }
  | { success: false; error?: unknown }

export const getBrochuresRemaining = async (
  anonUserId: string | null
): Promise<GetBrochuresRemainingResult> => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/v1/users/get_remaining`, {
      params: { anonUserId },
    })
    return { success: true, data: res.data as GetBrochuresRemainingResponse }
  } catch (err) {
    console.error("getBrochuresRemaining failed", err)
    return { success: false, error: err }
  }
}
