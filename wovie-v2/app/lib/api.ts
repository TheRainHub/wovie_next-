import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

// Small helpers shared by the route handlers.

export async function currentUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id
}

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

/** The request body as an object, or null when it is not JSON. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** TMDB film ids are positive integers; anything else is a bad request. */
export function parseMovieId(value: unknown) {
  const id = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
