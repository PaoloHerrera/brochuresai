import { useEffect, useRef, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const handler = useRef<number | null>(null)

  useEffect(() => {
    if (handler.current) clearTimeout(handler.current)
    handler.current = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      if (handler.current) clearTimeout(handler.current)
    }
  }, [value, delay])

  return debouncedValue
}
