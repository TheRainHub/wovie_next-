"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ListVideo, Star } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LoginForm from "@/app/(auth)/components/LoginForm";
import RegisterForm from "@/app/(auth)/components/RegisterForm";

type View = "landing" | "login" | "register";

interface Props {
  backdrop: string | null;
  posters: { id: number; title: string; posterUrl: string }[];
}

const FEATURES = [
  { icon: Star, title: "Real scores", text: "TMDB ratings with their vote counts, and the average of what people on Wovie gave each film." },
  { icon: Heart, title: "Favourites", text: "Keep the films you love in one place." },
  { icon: ListVideo, title: "Your own lists", text: "Plan what to watch next, or group films however you like." },
];

const authVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 60, scale: 0.95 }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: (dir: number) => ({ opacity: 0, x: dir * -60, scale: 0.95, transition: { duration: 0.3, ease: "easeOut" as const } }),
};

// The landing page. ?view=login and ?view=register open the forms on top,
// which is also where protected pages send signed-out visitors.
export default function Landing({ backdrop, posters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const requested = searchParams.get("view");
  const callbackUrl = searchParams.get("callbackUrl");
  // The URL is the only source of truth, so Back and links both open and close the forms.
  const view: View = requested === "login" || requested === "register" ? requested : "landing";
  const [direction, setDirection] = useState(1);

  const open = (next: View) => {
    setDirection(next === "register" || view === "landing" ? 1 : -1);
    const params = new URLSearchParams(searchParams);
    if (next === "landing") params.delete("view");
    else params.set("view", next);
    const search = params.toString();
    router.push(search ? `/?${search}` : "/", { scroll: false });
  };

  const signedIn = status === "authenticated";

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-[#08070f]">
      {backdrop && (
        <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08070f]/70 via-[#08070f]/50 to-[#08070f]" />

      <Header />

      <main className="relative z-20 flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <AnimatePresence mode="wait" custom={direction}>
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-5">Find a film, keep a watchlist</h1>
                <p className="text-white/60 text-lg mb-8">
                  Browse what&apos;s popular, see how it is rated, then save it for later. Film data comes from TMDB.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/movies" className="px-7 py-3 rounded-xl font-semibold bg-white text-black hover:bg-white/90 transition-colors">
                    Browse films
                  </Link>
                  {!signedIn && (
                    <button
                      type="button"
                      onClick={() => open("register")}
                      className="px-7 py-3 rounded-xl font-medium bg-white/10 border border-white/15 hover:bg-white/20 transition-colors"
                    >
                      Create an account
                    </button>
                  )}
                </div>
              </div>

              {posters.length > 0 && (
                <ul className="mt-14 grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-4xl mx-auto" aria-label="Trending today">
                  {posters.map((p, i) => (
                    <li key={p.id} className={i >= 3 ? "hidden sm:block" : undefined}>
                      <Link href={`/movies/${p.id}`} className="block aspect-[2/3] relative rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors">
                        <Image src={p.posterUrl} alt={p.title} fill sizes="(max-width: 640px) 33vw, 150px" className="object-cover" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <ul className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <Icon className="w-5 h-5 text-accent mb-3" aria-hidden />
                    <h2 className="font-semibold mb-1">{title}</h2>
                    <p className="text-sm text-white/50">{text}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {view === "login" && (
            <motion.div key="login" custom={direction} variants={authVariants} initial="initial" animate="animate" exit="exit" className="w-full flex justify-center">
              <LoginForm onSwitch={() => open("register")} onClose={() => open("landing")} callbackUrl={callbackUrl} />
            </motion.div>
          )}

          {view === "register" && (
            <motion.div key="register" custom={direction} variants={authVariants} initial="initial" animate="animate" exit="exit" className="w-full flex justify-center">
              <RegisterForm onSwitch={() => open("login")} onClose={() => open("landing")} callbackUrl={callbackUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
