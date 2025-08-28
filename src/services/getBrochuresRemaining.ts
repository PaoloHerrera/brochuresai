import axios from "axios";
import { API_BASE_URL } from "../config";

export const getBrochuresRemaining = async (anonUserId: string | null) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/v1/users/get_remaining`, {
      params: {
        anonUserId,
      },
    })
    return res.data
  } catch (err) {
    console.log(err)
  }
}
