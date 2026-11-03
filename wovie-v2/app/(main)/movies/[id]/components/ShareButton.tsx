'use client'
import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

// Opens the system share sheet where there is one, otherwise copies the link.
export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href.split('#')[0]
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // Closing the share sheet rejects; nothing to do.
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? 'Link copied' : 'Share this film'}
      title={copied ? 'Link copied' : 'Share'}
      className="p-3.5 bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-white rounded-xl backdrop-blur-sm"
    >
      {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      <span className="sr-only" aria-live="polite">{copied ? 'Link copied' : ''}</span>
    </button>
  )
}
