import { NextResponse } from 'next/server'
import { currentUserId } from '@/app/lib/api'
import { favoriteIds, listMovies } from '@/app/lib/catalog'
import { parseCatalogueQuery } from '@/app/lib/catalog-query'

// Later pages of the catalogue grid (the first page is rendered on the server).
export async function GET(request: Request) {
  try {
    const query = parseCatalogueQuery(new URL(request.url).searchParams)
    const [{ movies, total, hasMore }, userId] = await Promise.all([listMovies(query), currentUserId()])
    const favorites = await favoriteIds(userId, movies.map(m => m.id))

    return NextResponse.json({
      movies: movies.map(m => ({ ...m, isFavorite: favorites.has(m.id) })),
      total,
      page: query.page,
      hasMore,
    })
  } catch (error) {
    console.error('Error listing movies:', error)
    return NextResponse.json({ error: 'Could not load films' }, { status: 500 })
  }
}
