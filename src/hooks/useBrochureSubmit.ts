import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

import { useBrochureStore } from '../stores/useBrochureStore'
import { useBrochuresRemainingStore } from '../stores/useBrochuresRemaining'
import { useAnonUserIdStore } from '../stores/useAnonUserId'

export interface BrochureSubmitData {
  companyName: string
  url: string
  language: string
  brochureType: 'professional' | 'funny'
}

export type BrochureSubmitResult =
  | { success: true }
  | { success: false; status?: number; error?: unknown }

export const useBrochureSubmit = () => {
  const [isLoading, setIsLoading] = useState(false)

  // Stores
  const { setBrochure, setCompanyName, setCacheKey } = useBrochureStore()
  const { setBrochuresRemaining } = useBrochuresRemainingStore()
  const { anonUserId } = useAnonUserIdStore()

  const submitBrochure = async (data: BrochureSubmitData): Promise<BrochureSubmitResult> => {
    setIsLoading(true)
    setBrochure('')

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/create_brochure`, {
        anon_id: anonUserId,
        company_name: data.companyName,
        url: data.url,
        language: data.language,
        brochure_type: data.brochureType,
      })

      setBrochure(response.data.brochure)
      setCompanyName(data.companyName)
      setCacheKey(response.data.cache_key)
      setBrochuresRemaining(response.data.brochures_remaining)

      return { success: true }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, status: error.response?.status, error }
      }
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    submitBrochure,
  }
}