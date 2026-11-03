'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

/**
 * Tells the visitor when the connection drops (navigator.onLine and the
 * online/offline events), and briefly when it comes back.
 */
export default function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handleOnline = () => {
      setShowRestored(true)
      timer = setTimeout(() => setShowRestored(false), 3000)
    }
    const handleOffline = () => setShowRestored(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {/* Баннер оффлайн */}
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[200]
                     flex items-center gap-2.5
                     bg-red-500/95 text-white
                     px-5 py-2.5 rounded-xl
                     shadow-[0_4px_24px_rgba(239,68,68,0.4)]
                     backdrop-blur-md border border-red-400/30"
          role="alert"
          aria-live="assertive"
        >
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">No internet connection</span>
        </motion.div>
      )}

      {/* Кратковременный баннер восстановления */}
      {isOnline && showRestored && (
        <motion.div
          key="restored"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[200]
                     flex items-center gap-2.5
                     bg-emerald-500/95 text-white
                     px-5 py-2.5 rounded-xl
                     shadow-[0_4px_24px_rgba(16,185,129,0.4)]
                     backdrop-blur-md border border-emerald-400/30"
          role="status"
          aria-live="polite"
        >
          <Wifi className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Connection restored</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
