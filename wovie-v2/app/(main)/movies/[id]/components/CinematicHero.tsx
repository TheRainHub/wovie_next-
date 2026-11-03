'use client'
import { useScroll, useTransform, motion, useReducedMotion } from 'framer-motion'
import { useSyncExternalStore } from 'react'

interface Props {
  backdropUrl: string | null
  trailerKey?: string
}

const noSubscription = () => () => {}

/** True in the browser when the visitor has asked to save data; false on the server. */
function useSaveData() {
  return useSyncExternalStore(
    noSubscription,
    () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
    () => true, // server render: no background video until the browser decides
  )
}

// The fixed backdrop behind the film page. After a few seconds a muted trailer
// fades in over it, unless the visitor prefers reduced motion or saves data.
export default function CinematicHero({ backdropUrl, trailerKey }: Props) {
  const { scrollYProgress } = useScroll()
  const reduceMotion = useReducedMotion()
  const saveData = useSaveData()
  const playTrailer = Boolean(trailerKey) && !reduceMotion && !saveData

  // The haze thickens as you scroll, taking the backdrop into the dark.
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.2, 0.95])

  return (
    <div className="fixed inset-0 w-full h-screen -z-10 bg-[#0D0F14] overflow-hidden" aria-hidden>
      {backdropUrl && (
        <motion.img
          src={backdropUrl}
          alt=""
          initial={{ scale: 1 }}
          animate={reduceMotion ? undefined : { scale: 1.1 }}
          transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {playTrailer && trailerKey && (
        <motion.div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 6, duration: 2 }} // let YouTube hide its own controls first
        >
          <iframe
            title="Trailer playing in the background"
            tabIndex={-1}
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=${trailerKey}&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1`}
            className="absolute top-1/2 left-1/2 w-[300vw] h-[300vh] md:w-[150vw] md:h-[150vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            allow="autoplay; encrypted-media"
          />
        </motion.div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0D0F14]/40 to-[#0D0F14] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F14]/90 via-[#0D0F14]/20 to-transparent pointer-events-none" />
      <motion.div style={{ opacity }} className="absolute inset-0 bg-[#0D0F14] pointer-events-none" />
    </div>
  )
}
