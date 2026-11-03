'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Star } from 'lucide-react'
import { formatScore } from '@/app/lib/format'
import { loginHref } from '@/app/lib/login'

export interface Community {
  average: number
  count: number
}

interface Props {
  movieId: number
  signedIn: boolean
  loaded: boolean
  community: Community | null
  myRating: number | null
  accent: string
  onChange: (myRating: number | null, community: Community | null) => void
}

const SCORES = Array.from({ length: 10 }, (_, i) => i + 1)

// Wovie's own rating (the average of what people here gave the film) and the
// control to give yours.
export default function FilmRatings({ movieId, signedIn, loaded, community, myRating, accent, onChange }: Props) {
  const pathname = usePathname()
  const [hovered, setHovered] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(rating: number | null) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/movies/${movieId}/rating`, {
        method: rating === null ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: rating === null ? undefined : JSON.stringify({ rating }),
      })
      if (!res.ok) throw new Error(`Rating failed: ${res.status}`)
      const data = await res.json()
      onChange(data.myRating, data.community)
    } catch (err) {
      console.error(err)
      setError('Could not save your rating. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const shown = hovered ?? myRating ?? 0

  return (
    <div className="flex flex-col gap-3 min-w-[16rem]">
      <div>
        <p className="text-white/40 text-[10px] tracking-wider uppercase mb-1">Wovie rating</p>
        {!loaded ? (
          <p className="h-7 w-32 rounded bg-white/5 animate-pulse" aria-label="Loading" />
        ) : community ? (
          <p className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color: accent }}>{formatScore(community.average)}</span>
            <span className="text-white/40 text-sm">
              / 10 from {community.count} {community.count === 1 ? 'person' : 'people'}
            </span>
          </p>
        ) : (
          <p className="text-white/50 text-sm">No one on Wovie has rated it yet.</p>
        )}
      </div>

      <div>
        <p id={`rate-${movieId}`} className="text-white/40 text-[10px] tracking-wider uppercase mb-1.5">
          {myRating ? `Your rating: ${myRating}` : 'Your rating'}
        </p>
        {!loaded ? null : signedIn ? (
          <>
            <div
              role="radiogroup"
              aria-labelledby={`rate-${movieId}`}
              className="flex items-center gap-0.5"
              onMouseLeave={() => setHovered(null)}
            >
              {SCORES.map(score => (
                <button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={myRating === score}
                  aria-label={`${score} out of 10`}
                  disabled={saving}
                  onMouseEnter={() => setHovered(score)}
                  onFocus={() => setHovered(score)}
                  onBlur={() => setHovered(null)}
                  onClick={() => save(score)}
                  className="p-0.5 disabled:opacity-50"
                >
                  <Star
                    className="w-5 h-5 transition-colors"
                    style={{ color: score <= shown ? accent : 'rgba(255,255,255,0.25)', fill: score <= shown ? accent : 'transparent' }}
                    aria-hidden
                  />
                </button>
              ))}
              {myRating && (
                <button
                  type="button"
                  onClick={() => save(null)}
                  disabled={saving}
                  className="ml-3 text-xs text-white/40 hover:text-white underline underline-offset-2"
                >
                  Remove
                </button>
              )}
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </>
        ) : (
          <Link href={loginHref(pathname)} className="text-sm text-white/70 hover:text-white underline underline-offset-4">
            Sign in to rate it
          </Link>
        )}
      </div>
    </div>
  )
}
