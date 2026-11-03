import { NextResponse } from 'next/server'
import { currentUserId, jsonError, readJson } from '@/app/lib/api'
import { prisma } from '@/app/lib/db'
import { parseListName } from '@/app/lib/lists'

type Params = { params: Promise<{ id: string }> }

async function ownList(id: string, userId: string) {
  const list = await prisma.watchlist.findUnique({ where: { id }, select: { userId: true } })
  return list?.userId === userId
}

/** Rename a list. */
export async function PATCH(request: Request, { params }: Params) {
  const userId = await currentUserId()
  if (!userId) return jsonError(401, 'Sign in to edit lists')
  const { id } = await params
  const name = parseListName((await readJson(request))?.name)
  if (!name) return jsonError(400, 'A list needs a name of up to 60 characters')

  try {
    if (!(await ownList(id, userId))) return jsonError(404, 'List not found')
    const watchlist = await prisma.watchlist.update({ where: { id }, data: { name }, select: { id: true, name: true } })
    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Error renaming list:', error)
    return jsonError(500, 'Could not rename the list')
  }
}

/** Delete a list. The films stay in the catalogue. */
export async function DELETE(_request: Request, { params }: Params) {
  const userId = await currentUserId()
  if (!userId) return jsonError(401, 'Sign in to edit lists')
  const { id } = await params

  try {
    if (!(await ownList(id, userId))) return jsonError(404, 'List not found')
    await prisma.watchlist.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('Error deleting list:', error)
    return jsonError(500, 'Could not delete the list')
  }
}
