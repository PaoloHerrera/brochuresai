import { useEffect, useRef, useState } from 'react'
import { apiPost, isAxiosError } from '../services/http'

import { useBrochureStore } from '../stores/useBrochureStore'
import { useBrochuresRemainingStore } from '../stores/useBrochuresRemaining'
import { useAnonIdStore } from '../stores/useAnonId'
import type { BrochureSubmitData, BrochureSubmitResult } from '../types'

export const useBrochureSubmit = () => {
  const [isLoading, setIsLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  // Stores
  const { setBrochure, setCacheKey, setLastSubmission } = useBrochureStore()
  const { setBrochuresRemaining } = useBrochuresRemainingStore()
  const { anonId } = useAnonIdStore()

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
      const response = await apiPost(
        '/api/v1/create_brochure',
        {
          anon_id: anonId,
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

      setBrochure((response.data as { brochure: string }).brochure)
      setCacheKey((response.data as { cache_key: string }).cache_key)
      setBrochuresRemaining((response.data as { brochures_remaining: number }).brochures_remaining)

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