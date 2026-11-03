import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Heart, ListVideo, Star, User } from "lucide-react"
import { authOptions } from "@/app/lib/auth"
import { prisma } from "@/app/lib/db"
import { loginHref } from "@/app/lib/login"
import LogoutButton from "./components/LogoutButton"
import MiniCard from "../movies/components/MiniCard"

export const metadata: Metadata = { title: "Your profile" }

const cardMovie = { id: true, title: true, posterUrl: true, rating: true, voteCount: true } as const

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(loginHref("/profile"))

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      avatarUrl: true,
      reviews: { select: { rating: true, movie: { select: cardMovie } }, orderBy: { updatedAt: "desc" } },
      favorites: { select: { movie: { select: cardMovie } }, orderBy: { addedAt: "desc" } },
      watchlists: {
        select: {
          id: true,
          name: true,
          _count: { select: { items: true } },
          items: { select: { movie: { select: { id: true, posterUrl: true } } }, orderBy: { addedAt: "desc" }, take: 4 },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
  if (!user) redirect(loginHref("/profile"))

  const stats = [
    { label: "Rated", value: user.reviews.length },
    { label: "Favourites", value: user.favorites.length },
    { label: "Lists", value: user.watchlists.length },
  ]

  return (
    <div className="min-h-screen bg-background text-white pb-20 pt-10 px-4 sm:px-8">
      <div className="max-w-[1400px] mx-auto">
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 bg-white/5 p-8 rounded-2xl border border-white/10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-accent to-accent/50 flex items-center justify-center text-5xl font-bold shadow-xl shadow-accent/20 flex-shrink-0 overflow-hidden">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar URL may be any host
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span aria-hidden>{user.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2 break-all">{user.username}</h1>
            <p className="text-white/50 mb-6 flex items-center justify-center md:justify-start gap-2 break-all">
              <User className="w-4 h-4 flex-shrink-0" aria-hidden />
              {user.email}
            </p>
            <LogoutButton />
          </div>
          <dl className="flex gap-8 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <dd className="text-3xl font-bold text-white mb-1">{s.value}</dd>
                <dt className="text-xs text-white/50 uppercase tracking-wider">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <Section icon={<Star className="w-6 h-6 text-accent" aria-hidden />} title="Your ratings">
          {user.reviews.length > 0 ? (
            <Row>
              {user.reviews.map(r => (
                <MiniCard key={r.movie.id} movie={r.movie} myRating={r.rating} />
              ))}
            </Row>
          ) : (
            <Empty>Rate a film from 1 to 10 on its page and it shows up here.</Empty>
          )}
        </Section>

        <Section icon={<Heart className="w-6 h-6 text-accent fill-accent" aria-hidden />} title="Favourites">
          {user.favorites.length > 0 ? (
            <Row>
              {user.favorites.map(f => (
                <MiniCard key={f.movie.id} movie={f.movie} />
              ))}
            </Row>
          ) : (
            <Empty>Tap the heart on any film to keep it here.</Empty>
          )}
        </Section>

        <Section icon={<ListVideo className="w-6 h-6 text-accent" aria-hidden />} title="Your lists">
          {user.watchlists.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.watchlists.map(list => (
                <li key={list.id}>
                  <Link
                    href={`/lists/${list.id}`}
                    className="block bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group"
                  >
                    <h3 className="text-lg font-medium mb-1 group-hover:text-accent transition-colors line-clamp-1">{list.name}</h3>
                    <p className="text-white/40 text-sm mb-4">
                      {list._count.items} {list._count.items === 1 ? "film" : "films"}
                    </p>
                    <div className="flex -space-x-4 h-16">
                      {list.items.map(({ movie }) =>
                        movie.posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- tiny stacked thumbnails
                          <img key={movie.id} src={movie.posterUrl} alt="" className="h-16 w-12 rounded-md ring-2 ring-[#0f0f11] object-cover" />
                        ) : null,
                      )}
                      {list._count.items === 0 && <span className="text-sm text-white/30 italic self-center">Empty list</span>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Open any film and use &ldquo;Add to list&rdquo; to start your first list.</Empty>
          )}
        </Section>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">{children}</div>
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-white/40">{children}</p>
}
