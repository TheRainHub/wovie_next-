import { NextResponse } from 'next/server'
import { currentUserId, jsonError, parseMovieId, readJson } from '@/app/lib/api'
import { ensureMovie } from '@/app/lib/catalog'
import { prisma } from '@/app/lib/db'

/**
 * Set whether a film is a favourite: `{ movieId, favorite: true | false }`.
 * Saying what you want (rather than "toggle") keeps a double click or a stale
 * page from flipping it the wrong way.
 */
export async function POST(request: Request) {
  const userId = await currentUserId()
  if (!userId) return jsonError(401, 'Sign in to keep favourites')
  const body = await readJson(request)
  const movieId = parseMovieId(body?.movieId)
  if (!movieId) return jsonError(400, 'Invalid film id')
  if (typeof body?.favorite !== 'boolean') return jsonError(400, '`favorite` must be true or false')

  try {
    if (!body.favorite) {
      await prisma.favorite.deleteMany({ where: { userId, movieId } })
      return NextResponse.json({ isFavorite: false })
    }
    if (!(await ensureMovie(movieId))) return jsonError(404, 'Film not found')
    await prisma.favorite.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: {},
      create: { userId, movieId },
    })
    return NextResponse.json({ isFavorite: true })
  } catch (error) {
    console.error('Error updating favourites:', error)
    return jsonError(500, 'Could not update favourites')
  }
}
