'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X } from 'lucide-react'
import PosterCard, { type PosterCardMovie } from '@/app/components/PosterCard'
import { MAX_LIST_NAME } from '@/app/lib/lists'

interface Props {
  id: string
  name: string
  movies: PosterCardMovie[]
}

// Rename or delete the list, and take films off it.
export default function ListEditor({ id, name: initialName, movies: initialMovies }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [draft, setDraft] = useState(initialName)
  const [editing, setEditing] = useState(false)
  const [movies, setMovies] = useState(initialMovies)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function request(url: string, init: RequestInit) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
      return data
    } finally {
      setBusy(false)
    }
  }

  async function rename(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { watchlist } = await request(`/api/watchlists/${id}`, { method: 'PATCH', body: JSON.stringify({ name: draft }) })
      setName(watchlist.name)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename the list')
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${name}”? The films stay in the catalogue.`)) return
    try {
      await request(`/api/watchlists/${id}`, { method: 'DELETE' })
      router.push('/profile')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the list')
    }
  }

  async function takeOff(movieId: number) {
    const before = movies
    setMovies(ms => ms.filter(m => m.id !== movieId))
    try {
      await request('/api/watchlists/items', { method: 'POST', body: JSON.stringify({ watchlistId: id, movieId, contains: false }) })
    } catch (err) {
      setMovies(before)
      setError(err instanceof Error ? err.message : 'Could not update the list')
    }
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
        {editing ? (
          <form onSubmit={rename} className="flex flex-wrap items-center gap-2">
            <label htmlFor="list-name" className="sr-only">List name</label>
            <input
              id="list-name"
              value={draft}
              maxLength={MAX_LIST_NAME}
              onChange={e => setDraft(e.target.value)}
              onFocus={e => e.target.select()}
              autoFocus
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-2xl font-bold text-white focus:outline-none focus:border-accent/60"
            />
            <button type="submit" disabled={busy || !draft.trim()} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold disabled:opacity-50">
              Save
            </button>
            <button type="button" onClick={() => { setEditing(false); setDraft(name) }} className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white">
              Cancel
            </button>
          </form>
        ) : (
          <div>
            <h1 className="text-4xl font-bold tracking-tight break-words">{name}</h1>
            <p className="text-white/40 mt-1">{movies.length} {movies.length === 1 ? 'film' : 'films'}</p>
          </div>
        )}

        {!editing && (
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
              <Pencil className="w-4 h-4" aria-hidden />
              Rename
            </button>
            <button type="button" onClick={remove} disabled={busy} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm">
              <Trash2 className="w-4 h-4" aria-hidden />
              Delete list
            </button>
          </div>
        )}
      </header>

      {error && <p role="alert" className="mb-6 text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

      {movies.length > 0 ? (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map(movie => (
            <li key={movie.id} className="relative group/item">
              <PosterCard movie={movie} showFavorite={false} />
              <button
                type="button"
                onClick={() => takeOff(movie.id)}
                aria-label={`Remove ${movie.title} from this list`}
                className="absolute -top-2 -left-2 z-20 w-8 h-8 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/80 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-white/40">
          Nothing here yet. <Link href="/movies" className="text-white/70 underline underline-offset-4 hover:text-white">Browse films</Link>{' '}
          and use &ldquo;Add to list&rdquo;.
        </p>
      )}
    </>
  )
}
