'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import HoverOverlay from './HoverOverlay'
import ProgressBar from './ProgressBar'
import FavoriteButton from '@/app/components/FavoriteButton'
import Wovie from '@/app/lib/MovieModel'

interface Movie {
  id: number; title: string; posterUrl: string | null;
  releaseDate: Date | null; rating: number;
  genres: { genre: { name: string } }[]
  isFavorite?: boolean
  imdb?: number;
  rottenTomatoes?: number;
  metacritic?: number;
}

interface Props {
  movie: Movie
  rank: number
  progress?: { watchedSeconds: number; totalSeconds: number }
  isNew?: boolean
}

export default function RankedCard({ movie, rank, progress, isNew }: Props) {
  const [isHovered, setIsHovered] = useState(false)

  // Используем OOP-модель для форматирования данных
  const movieModel = Wovie.createMovie(movie as any)
  const year = movieModel.getYear()
  const genre = movie.genres?.[0]?.genre.name || ''

  // Mock data for demonstration as requested
  const imdb = movie.imdb || 8.8;
  const rottenTomatoes = movie.rottenTomatoes || 71;
  const metacritic = movie.metacritic || 82;

  return (
    <Link href={`/movies/${movie.id}`} className="block group">
      <motion.div
        className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card cursor-pointer card-3d"
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Poster */}
        {movie.posterUrl && (
          <Image 
            src={movie.posterUrl} 
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover" 
          />
        )}

        {/* Bottom gradient — all info lives here */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Top items (Favorite + Badges) */}
        <div className="absolute top-2 left-2 right-2 z-30 flex items-start justify-between pointer-events-none">
          <div className="flex flex-col gap-2 items-start pointer-events-auto">
            {isNew && (
              <div className="px-2 py-0.5 rounded text-[9px] font-bold bg-accent text-white uppercase tracking-wider shadow-md">
                New
              </div>
            )}
            <FavoriteButton movieId={movie.id} initialIsFavorite={!!movie.isFavorite} />
          </div>
          
          {/* Rating badge — top right, always visible */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white/90 shadow-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {movieModel.formatRating()}
          </div>
        </div>

        {/* Info block — bottom, inside the card */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
          
          {/* Detailed Ratings */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 transform translate-y-2 group-hover:translate-y-0">
            {imdb && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f5c518] text-black text-[8px] font-extrabold uppercase tracking-tight shadow-sm">
                IMDb <span className="font-black text-[9px]">{imdb}</span>
              </div>
            )}
            {rottenTomatoes && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[8px] font-extrabold uppercase tracking-tight shadow-sm">
                RT <span className="font-black text-[9px]">{rottenTomatoes}%</span>
              </div>
            )}
            {metacritic && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#66cc33] text-white text-[8px] font-extrabold uppercase tracking-tight shadow-sm">
                MC <span className="font-black text-[9px]">{metacritic}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-white line-clamp-1 mb-1 drop-shadow-md group-hover:text-accent transition-colors duration-300">
            {movie.title}
          </h4>

          {/* Year + Genre */}
          <div className="flex items-center gap-1.5 text-[11px] text-white/60">
            {year && <span>{year}</span>}
            {year && genre && <span className="text-white/20">·</span>}
            {genre && <span>{genre}</span>}
          </div>

          {/* Progress */}
          {progress && (
            <div className="mt-2">
              <ProgressBar watchedSeconds={progress.watchedSeconds} totalSeconds={progress.totalSeconds} />
            </div>
          )}
        </div>

        <HoverOverlay isHovered={isHovered} />
      </motion.div>
    </Link>
  )
}
