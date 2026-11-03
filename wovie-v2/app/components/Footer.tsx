// Shown on every page. TMDB's API terms ask apps to credit them this way.
export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-16 px-6 py-8 text-center text-xs text-white/40 space-y-2">
      <p>
        Film data and images from{' '}
        <a href="https://www.themoviedb.org/" className="text-white/60 hover:text-white underline underline-offset-2" rel="noreferrer" target="_blank">
          TMDB
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
      <p>© {new Date().getFullYear()} My Invention World</p>
    </footer>
  )
}
