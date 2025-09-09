import { useEffect, useRef, useState } from 'react'
import axios, { isAxiosError } from 'axios'
import { API_BASE_URL } from '../config'

import { useBrochureStore } from '../stores/useBrochureStore'
import { useBrochuresRemainingStore } from '../stores/useBrochuresRemaining'
import { useAnonUserIdStore } from '../stores/useAnonUserId'
import type {LanguageStore} from '../stores/useLanguageStore'

export interface BrochureSubmitData {
  companyName: string
  url: string
  language: LanguageStore
  brochureType: 'professional' | 'funny'
}

export type BrochureSubmitResult =
  | { success: true }
  | { success: false; status?: number; error?: unknown }

export const useBrochureSubmit = () => {
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  // Stores
  const { setBrochure, setCacheKey, setLastSubmission } = useBrochureStore()
  const { setBrochuresRemaining } = useBrochuresRemainingStore()
  const { anonUserId } = useAnonUserIdStore()

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  const submitBrochure = async (data: BrochureSubmitData): Promise<BrochureSubmitResult> => {
    setIsLoading(true)
    setBrochure('')

    // Cancel any previous in-flight request before starting a new one
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/create_brochure`,
        {
          anon_id: anonUserId,
          company_name: data.companyName,
          url: data.url,
          language: data.language,
          brochure_type: data.brochureType,
        },
        {
          signal: controller.signal,
          timeout: 120_000, // 120s timeout
        }
      )

      setBrochure(response.data.brochure)
      setCacheKey(response.data.cache_key)
      setBrochuresRemaining(response.data.brochures_remaining)

      // Persistimos la "última sumisión válida" sólo tras éxito
      setLastSubmission({
        companyName: data.companyName,
        url: data.url,
        language: data.language,
        brochureType: data.brochureType,
      })

      return { success: true }
    } catch (error) {
      if (isAxiosError(error)) {
        return { success: false, status: error.response?.status, error }
      }
      return { success: false, error }
    } finally {
      setIsLoading(false)
      // Clear controller ref after request finishes/cancels
      controllerRef.current = null
    }
  }

  return {
    isLoading,
    submitBrochure,
  }
}