'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Loader2 } from 'lucide-react'
import { MAX_LIST_NAME } from '@/app/lib/lists'

interface Watchlist {
  id: string
  name: string
  contains: boolean
}

interface Props {
  movieId: number
  watchlists: Watchlist[]
  isOpen: boolean
  onClose: () => void
}

export default function WatchlistDropdown({ movieId, watchlists: initialWatchlists, isOpen, onClose }: Props) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(initialWatchlists)
  const [newListName, setNewListName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Follow the parent when it re-fetches.
  useEffect(() => {
    setWatchlists(initialWatchlists)
  }, [initialWatchlists])

  // Close on a click outside or on Escape.
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  const setInList = async (watchlistId: string, contains: boolean) => {
    if (togglingId) return
    setTogglingId(watchlistId)
    setError('')
    setWatchlists(prev => prev.map(w => (w.id === watchlistId ? { ...w, contains } : w)))

    try {
      const res = await fetch('/api/watchlists/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, watchlistId, contains }),
      })
      if (!res.ok) throw new Error(`List update failed: ${res.status}`)
    } catch (err) {
      console.error(err)
      setError('Could not update the list. Try again.')
      setWatchlists(prev => prev.map(w => (w.id === watchlistId ? { ...w, contains: !contains } : w)))
    } finally {
      setTogglingId(null)
    }
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListName.trim() || isCreating) return

    setIsCreating(true)
    setError('')
    try {
      const res = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName }),
      })
      if (!res.ok) throw new Error(`List create failed: ${res.status}`)
      const { watchlist } = await res.json()

      // A list made from a film's page starts with that film in it.
      setWatchlists(prev => [{ id: watchlist.id, name: watchlist.name, contains: false }, ...prev])
      setNewListName('')
      await setInList(watchlist.id, true)
    } catch (err) {
      console.error(err)
      setError('Could not create the list. Try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full mt-2 left-0 w-64 bg-[#1a1c23] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[320px]"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-label="Save to a list"
        >
          <div className="p-3 border-b border-white/10 flex-shrink-0">
            <h4 className="text-sm font-semibold text-white/90">Save to…</h4>
          </div>

          <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
            {watchlists.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-4">No lists yet. Name one below.</p>
            ) : (
              watchlists.map(list => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setInList(list.id, !list.contains)}
                  disabled={togglingId === list.id}
                  aria-pressed={list.contains}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-sm text-white/80 line-clamp-1 pr-2">{list.name}</span>
                  <span
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      list.contains ? 'bg-accent border-accent' : 'border-white/20'
                    }`}
                  >
                    {togglingId === list.id ? (
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    ) : list.contains ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : null}
                  </span>
                </button>
              ))
            )}
          </div>

          {error && <p className="px-3 pb-2 text-xs text-red-400">{error}</p>}

          <div className="p-3 border-t border-white/10 bg-[#12151c] flex-shrink-0">
            <form onSubmit={handleCreateList} className="flex gap-2">
              <input
                type="text"
                placeholder="New list name"
                aria-label="New list name"
                value={newListName}
                maxLength={MAX_LIST_NAME}
                onChange={e => setNewListName(e.target.value)}
                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!newListName.trim() || isCreating}
                aria-label="Create list"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
