import { NextResponse } from 'next/server'
import { jsonError, parseMovieId } from '@/app/lib/api'
import { ensureMovie, movieCardSelect } from '@/app/lib/catalog'
import { prisma } from '@/app/lib/db'

// One film in card shape, for the "Last viewed" banner. Films opened from
// Trending or Similar may not be stored yet, so they are fetched from TMDB.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const movieId = parseMovieId((await params).id)
  if (!movieId) return jsonError(400, 'Invalid film id')

  try {
    if (!(await ensureMovie(movieId))) return jsonError(404, 'Film not found')
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { ...movieCardSelect, trailerUrl: true },
    })
    return movie ? NextResponse.json(movie) : jsonError(404, 'Film not found')
  } catch (error) {
    console.error('Error fetching film:', error)
    return jsonError(500, 'Could not load the film')
  }
}
