import { NextResponse } from 'next/server'
import { currentUserId, jsonError, parseMovieId, readJson } from '@/app/lib/api'
import { ensureMovie } from '@/app/lib/catalog'
import { prisma } from '@/app/lib/db'

/**
 * Put a film on one of your lists or take it off:
 * `{ watchlistId, movieId, contains: true | false }`.
 */
export async function POST(request: Request) {
  const userId = await currentUserId()
  if (!userId) return jsonError(401, 'Sign in to use lists')
  const body = await readJson(request)
  const movieId = parseMovieId(body?.movieId)
  const watchlistId = typeof body?.watchlistId === 'string' ? body.watchlistId : null
  if (!movieId || !watchlistId) return jsonError(400, 'A film id and a list id are required')
  if (typeof body?.contains !== 'boolean') return jsonError(400, '`contains` must be true or false')

  try {
    const list = await prisma.watchlist.findUnique({ where: { id: watchlistId }, select: { userId: true } })
    // Someone else's list looks the same as a missing one.
    if (!list || list.userId !== userId) return jsonError(404, 'List not found')

    if (!body.contains) {
      await prisma.watchlistItem.deleteMany({ where: { watchlistId, movieId } })
      return NextResponse.json({ contains: false })
    }
    if (!(await ensureMovie(movieId))) return jsonError(404, 'Film not found')
    await prisma.watchlistItem.upsert({
      where: { watchlistId_movieId: { watchlistId, movieId } },
      update: {},
      create: { watchlistId, movieId },
    })
    return NextResponse.json({ contains: true })
  } catch (error) {
    console.error('Error updating list:', error)
    return jsonError(500, 'Could not update the list')
  }
}
