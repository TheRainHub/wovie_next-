'use client'

import { useEffect } from 'react'
import { LAST_VIEWED_KEY } from '@/app/lib/last-viewed'

// Remembers this film in the browser, for the "You looked at this last" banner.
export default function SaveLastVisited({ movieId }: { movieId: number }) {
  useEffect(() => {
    try {
      localStorage.setItem(LAST_VIEWED_KEY, String(movieId))
    } catch {}
  }, [movieId])

  return null
}
