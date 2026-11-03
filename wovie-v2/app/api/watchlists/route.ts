import { NextResponse } from 'next/server'
import { currentUserId, jsonError, readJson } from '@/app/lib/api'
import { prisma } from '@/app/lib/db'
import { parseListName } from '@/app/lib/lists'

/** Create a list. */
export async function POST(request: Request) {
  const userId = await currentUserId()
  if (!userId) return jsonError(401, 'Sign in to make lists')
  const name = parseListName((await readJson(request))?.name)
  if (!name) return jsonError(400, 'A list needs a name of up to 60 characters')

  try {
    const watchlist = await prisma.watchlist.create({ data: { name, userId }, select: { id: true, name: true } })
    return NextResponse.json({ watchlist }, { status: 201 })
  } catch (error) {
    console.error('Error creating list:', error)
    return jsonError(500, 'Could not create the list')
  }
}
