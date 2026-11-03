"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { loginHref } from "@/app/lib/login";

const NAV_LINKS = [
  { label: "Films", href: "/movies" },
  { label: "Top rated", href: "/top-rated" },
  { label: "New releases", href: "/new-releases" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Solid background once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the profile menu on an outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menus after navigating (adjusting state during render, not in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/movies?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const isActive = (href: string) => pathname === href || (href !== "/movies" && pathname?.startsWith(href));
  const initial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "?";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled || menuOpen
          ? "bg-[#0a0b0d]/95 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.05)]"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-8 min-w-0">
          <Link
            href="/movies"
            aria-label="Wovie, all films"
            className="relative inline-flex items-baseline font-logo font-bold tracking-wider transition-transform duration-300 ease-out hover:scale-110 group"
          >
            <span className="text-4xl text-white transition-[text-shadow] duration-500 ease-out [text-shadow:0_0_15px_rgba(255,255,255,0.35)] group-hover:[text-shadow:0_0_18px_rgba(232,69,74,0.75)]">
              W
            </span>
            <span className="text-3xl text-white/95 transition-colors duration-300 group-hover:text-white">ovie</span>
          </Link>

          <nav aria-label="Main" className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className="relative px-3.5 py-1.5 rounded-md text-[15px] font-medium text-white/60 hover:text-white transition-colors aria-[current=page]:text-white after:absolute after:bottom-0 after:left-3 after:h-0.5 after:w-[calc(100%-24px)] after:bg-accent after:scale-x-0 aria-[current=page]:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <AnimatePresence initial={false} mode="wait">
            {searchOpen ? (
              <motion.form
                key="search-bar"
                role="search"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 420, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onSubmit={handleSearch}
                className="flex items-center overflow-hidden max-w-[52vw]"
              >
                <div className="flex items-center gap-2 w-full bg-white/10 border border-white/10 rounded-lg px-3 py-1.5">
                  <Search className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Escape" && setSearchOpen(false)}
                    placeholder="Search films by title"
                    aria-label="Search films by title"
                    className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
                  />
                  <button
                    type="button"
                    aria-label="Close search"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="text-white/30 hover:text-white/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button
                key="search-btn"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSearchOpen(true)}
                aria-label="Search films"
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Search className="w-[18px] h-[18px]" />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />

          {status === "loading" ? (
            <div className="w-9 h-9 rounded-md bg-white/5" aria-hidden />
          ) : session?.user ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Account menu"
                aria-expanded={profileOpen}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar URL may be any host
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-md object-cover border border-white/10" />
                ) : (
                  <span className="w-7 h-7 rounded-md bg-gradient-to-br from-[#D4537E] to-[#993556] flex items-center justify-center text-xs font-bold text-white border border-white/10">
                    {initial}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 py-1.5 rounded-xl bg-[#1a1c20] border border-white/10 shadow-xl shadow-black/40"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white line-clamp-1">{session.user.name}</p>
                      <p className="text-xs text-white/40 line-clamp-1">{session.user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                      <User className="w-4 h-4" aria-hidden />
                      Profile and lists
                    </Link>
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400/80 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" aria-hidden />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href={loginHref(pathname)}
              className="text-sm font-medium text-white/80 hover:text-white px-4 py-1.5 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Main" className="md:hidden border-t border-white/5 px-4 py-2">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className="block px-3 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 aria-[current=page]:text-white aria-[current=page]:bg-white/5"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </motion.header>
  );
}
