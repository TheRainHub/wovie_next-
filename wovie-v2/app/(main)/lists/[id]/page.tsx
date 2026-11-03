import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/db'
import { loginHref } from '@/app/lib/login'
import ListEditor from './ListEditor'

type Params = Promise<{ id: string }>

export const metadata: Metadata = { title: 'List' }

// One of your lists. Only its owner can see it; anyone else gets a 404.
export default async function ListPage({ params }: { params: Params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(loginHref(`/lists/${id}`))

  const list = await prisma.watchlist.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      userId: true,
      items: {
        orderBy: { addedAt: 'desc' },
        select: {
          movie: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
              releaseDate: true,
              rating: true,
              voteCount: true,
              genres: { select: { genre: { select: { name: true } } } },
            },
          },
        },
      },
    },
  })
  if (!list || list.userId !== session.user.id) notFound()

  return (
    <div className="min-h-screen bg-background text-white pb-20 pt-10 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          Your profile
        </Link>
        <ListEditor id={list.id} name={list.name} movies={list.items.map(i => i.movie)} />
      </div>
    </div>
  )
}
