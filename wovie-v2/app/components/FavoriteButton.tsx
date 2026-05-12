'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  movieId: number
  initialIsFavorite: boolean
  className?: string
}

export default function FavoriteButton({ movieId, initialIsFavorite, className = "" }: Props) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // prevent navigating to movie page if wrapped in Link
    e.stopPropagation()

    if (isLoading) return

    // Optimistic UI update
    const previousState = isFavorite
    setIsFavorite(!previousState)
    setIsLoading(true)

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId })
      })

      if (!res.ok) {
        // If unauthorized or other error, revert
        throw new Error('Failed to toggle favorite')
      }
      
      const data = await res.json()
      setIsFavorite(data.isFavorite)
    } catch (error) {
      console.error(error)
      // Revert optimistic update on error
      setIsFavorite(previousState)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-full backdrop-blur-sm bg-black/30 hover:bg-black/50 transition-colors ${className}`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <motion.div
        whileTap={{ scale: 0.8 }}
        animate={{ scale: isFavorite ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-4 h-4 transition-colors duration-300 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-white/80 hover:text-white'
          }`}
        />
      </motion.div>
    </button>
  )
}
