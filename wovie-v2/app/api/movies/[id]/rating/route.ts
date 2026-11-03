import { NextResponse } from 'next/server'
import { currentUserId, jsonError, parseMovieId, readJson } from '@/app/lib/api'
import { ensureMovie } from '@/app/lib/catalog'
import { prisma } from '@/app/lib/db'
import { communityScore, isValidUserRating } from '@/app/lib/ratings'

type Params = { params: Promise<{ id: string }> }

async function summary(movieId: number) {
  const { _avg, _count } = await prisma.review.aggregate({
    where: { movieId },
    _avg: { rating: true },
    _count: { _all: true },
  })
  return communityScore(_avg.rating, _count._all)
}

/** Rate a film from 1 to 10, or change your rating. */
export async function PUT(request: Request, { params }: Params) {
  const userId = await currentUserId()
  if (!userId) return jsonError(401, 'Sign in to rate films')
  const movieId = parseMovieId((await params).id)
  if (!movieId) return jsonError(400, 'Invalid film id')
  const rating = (await readJson(request))?.rating
  if (!isValidUserRating(rating)) return jsonError(400, 'A rating is a whole number from 1 to 10')

  try {
    if (!(await ensureMovie(movieId))) return jsonError(404, 'Film not found')
    await prisma.review.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: { rating },
      create: { userId, movieId, rating },
    })
    return NextResponse.json({ myRating: rating, community: await summary(movieId) })
  } catch (error) {
    console.error('Error saving rating:', error)
    return jsonError(500, 'Could not save your rating')
  }
}

/** Take your rating back. */
export async function DELETE(_request: Request, { params }: Params) {
  const userId = await currentUserId()
  if (!userId) return jsonError(401, 'Sign in to rate films')
  const movieId = parseMovieId((await params).id)
  if (!movieId) return jsonError(400, 'Invalid film id')

  try {
    await prisma.review.deleteMany({ where: { userId, movieId } })
    return NextResponse.json({ myRating: null, community: await summary(movieId) })
  } catch (error) {
    console.error('Error removing rating:', error)
    return jsonError(500, 'Could not remove your rating')
  }
}
