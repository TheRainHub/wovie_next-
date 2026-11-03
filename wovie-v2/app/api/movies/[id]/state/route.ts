import { NextResponse } from 'next/server'
import { currentUserId, jsonError, parseMovieId } from '@/app/lib/api'
import { prisma } from '@/app/lib/db'
import { communityScore } from '@/app/lib/ratings'

// Everything on the film page that depends on Wovie's own data or on who is
// looking. The page itself is cached; this is fetched per visit.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const movieId = parseMovieId((await params).id)
  if (!movieId) return jsonError(400, 'Invalid film id')

  try {
    const userId = await currentUserId()
    const [community, favorite, myReview, lists] = await Promise.all([
      prisma.review.aggregate({ where: { movieId }, _avg: { rating: true }, _count: { _all: true } }),
      userId ? prisma.favorite.findUnique({ where: { userId_movieId: { userId, movieId } } }) : null,
      userId ? prisma.review.findUnique({ where: { userId_movieId: { userId, movieId } } }) : null,
      userId
        ? prisma.watchlist.findMany({
            where: { userId },
            select: { id: true, name: true, items: { where: { movieId }, select: { movieId: true } } },
            orderBy: { createdAt: 'desc' },
          })
        : [],
    ])

    return NextResponse.json({
      signedIn: Boolean(userId),
      community: communityScore(community._avg.rating, community._count._all),
      myRating: myReview?.rating ?? null,
      isFavorite: Boolean(favorite),
      watchlists: lists.map(l => ({ id: l.id, name: l.name, contains: l.items.length > 0 })),
    })
  } catch (error) {
    console.error('Error fetching film state:', error)
    return jsonError(500, 'Could not load your data for this film')
  }
}
