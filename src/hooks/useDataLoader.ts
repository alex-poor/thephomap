import { useState, useEffect } from 'react'

interface DataLoaderState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useDataLoader<T>(url: string): DataLoaderState<T> {
  const [state, setState] = useState<DataLoaderState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
        return res.json() as Promise<T>
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
      })

    return () => {
      cancelled = true
    }
  }, [url])

  return state
}
