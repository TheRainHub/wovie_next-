'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { loginHref } from '@/app/lib/login'

interface Props {
  movieId: number
  initialIsFavorite: boolean
  className?: string
  iconClassName?: string
}

export default function FavoriteButton({ movieId, initialIsFavorite, className = '', iconClassName = 'w-4 h-4' }: Props) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // the button often sits inside a card link
    e.stopPropagation()

    if (status !== 'authenticated') {
      router.push(loginHref(pathname))
      return
    }
    if (isLoading) return

    // Optimistic: flip now, settle on what the server says.
    const previousState = isFavorite
    setIsFavorite(!previousState)
    setIsLoading(true)

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, favorite: !previousState }),
      })
      if (!res.ok) throw new Error(`Favourite toggle failed: ${res.status}`)
      const data = await res.json()
      setIsFavorite(data.isFavorite)
    } catch (error) {
      console.error(error)
      setIsFavorite(previousState)
    } finally {
      setIsLoading(false)
    }
  }

  const label = isFavorite ? 'Remove from favourites' : 'Add to favourites'

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className={className || 'p-2 rounded-full backdrop-blur-sm bg-black/30 hover:bg-black/50 transition-colors'}
    >
      <motion.div
        whileTap={{ scale: 0.8 }}
        animate={{ scale: isFavorite ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`${iconClassName} transition-colors duration-300 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-white/80 hover:text-white'
          }`}
        />
      </motion.div>
    </button>
  )
}
