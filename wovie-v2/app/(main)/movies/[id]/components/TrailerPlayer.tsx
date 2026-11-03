'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

// The film's trailer: a thumbnail until it is clicked, so YouTube only loads
// for people who want to watch.
export default function TrailerPlayer({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <section id="trailer" aria-label="Trailer" className="mt-8 scroll-mt-24">
      <h2 className="text-xl font-medium text-white mb-4">Trailer</h2>
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            title={`${title} trailer`}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" className="absolute inset-0 group" onClick={() => setPlaying(true)} aria-label={`Play the ${title} trailer`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail, not worth routing through the optimiser */}
            <img
              src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="absolute inset-0 flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-[#E8454A]/90 flex items-center justify-center border-2 border-white/20">
                <Play className="w-6 h-6 text-white ml-1" aria-hidden />
              </span>
            </motion.span>
          </button>
        )}
      </div>
    </section>
  )
}
