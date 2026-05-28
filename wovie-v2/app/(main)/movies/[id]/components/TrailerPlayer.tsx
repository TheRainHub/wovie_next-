'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize, Tv } from 'lucide-react'

interface Props {
  youtubeId: string | undefined
}

/**
 * TrailerPlayer — единый плеер с двумя режимами:
 *   1. YouTube — встроенный трейлер
 *   2. Native  — нативный <video> с кастомными контролами (HTML5 Media API)
 */
export default function TrailerPlayer({ youtubeId }: Props) {
  const [tab, setTab] = useState<'youtube' | 'native'>('youtube')
  const [ytPlaying, setYtPlaying] = useState(false)

  // ── Media API ────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null)
  const [nativePlaying, setNativePlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate    = () => {
      setCurrentTime(video.currentTime)
      if (video.duration) setProgress((video.currentTime / video.duration) * 100)
    }
    const onLoadedMeta    = () => setDuration(video.duration)
    const onPlay          = () => setNativePlaying(true)
    const onPause         = () => setNativePlaying(false)
    const onEnded         = () => { setNativePlaying(false); setProgress(0) }

    video.addEventListener('timeupdate',     onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMeta)
    video.addEventListener('play',           onPlay)
    video.addEventListener('pause',          onPause)
    video.addEventListener('ended',          onEnded)

    return () => {
      video.removeEventListener('timeupdate',     onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMeta)
      video.removeEventListener('play',           onPlay)
      video.removeEventListener('pause',          onPause)
      video.removeEventListener('ended',          onEnded)
    }
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.()
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  if (!youtubeId) return null

  return (
    <div className="mt-8">
      {/* ── Вкладки ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-3">
        <button
          onClick={() => setTab('youtube')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'youtube'
              ? 'bg-[#E8454A] text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          Trailer
        </button>
        <button
          onClick={() => setTab('native')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'native'
              ? 'bg-white/10 text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Demo Clip
          <span className="text-[10px] text-white/30 font-normal">Media API</span>
        </button>
      </div>

      {/* ── YouTube ─────────────────────────────────────────── */}
      {tab === 'youtube' && (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
          {ytPlaying ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 cursor-pointer group" onClick={() => setYtPlaying(true)}>
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                className="w-full h-full object-cover"
                alt="Trailer"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <motion.div
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#E8454A]/90 flex items-center justify-center border-2 border-white/20">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* ── Native <video> + Media API контролы ─────────────── */}
      {tab === 'native' && (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
          <video
            ref={videoRef}
            className="w-full aspect-video object-contain bg-black"
            preload="metadata"
            playsInline
            poster={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
          >
            <source
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              type="video/mp4"
            />
          </video>

          {/* Кастомные контролы через HTML5 Media API */}
          <div className="px-4 py-3 bg-[#0d0f14] border-t border-white/5">
            {/* Прогресс-бар */}
            <div
              className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer mb-3 group/bar"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-[#E8454A] rounded-full relative transition-all duration-100"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
                {nativePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={toggleMute} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-xs text-white/40 tabular-nums">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
              <div className="flex-1" />
              <button onClick={handleFullscreen} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
