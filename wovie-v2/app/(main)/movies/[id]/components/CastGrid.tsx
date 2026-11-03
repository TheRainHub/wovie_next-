import Image from 'next/image'
import type { TMDBCastMember } from '@/app/lib/tmdb-types'
import { imageUrl } from '@/app/lib/tmdb'

export default function CastGrid({ cast }: { cast: TMDBCastMember[] }) {
  if (cast.length === 0) return null

  return (
    <section className="mt-12 px-4 sm:px-8" aria-labelledby="cast-heading">
      <h2 id="cast-heading" className="text-xl font-medium text-white mb-6">Cast</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cast.map(actor => {
          const photo = imageUrl(actor.profile_path, 'w185')
          return (
            <li key={actor.id} className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 bg-white/5 border border-white/10">
                {photo ? (
                  <Image src={photo} alt="" fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No photo</div>
                )}
              </div>
              <p className="text-sm text-white font-medium line-clamp-1">{actor.name}</p>
              <p className="text-xs text-white/50 line-clamp-1">{actor.character}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
