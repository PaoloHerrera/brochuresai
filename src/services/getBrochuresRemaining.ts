import axios from "axios";

export const getBrochuresRemaining = async (anonUserId: string | null) => {
  try {
    const res = await axios.get('http://localhost:8000/api/v1/users/get_remaining', {
      params: {
        anonUserId,
      },
    })
    return res.data
  } catch (err) {
    console.log(err)
  }
}
