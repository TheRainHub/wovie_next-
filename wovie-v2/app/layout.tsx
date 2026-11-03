import type { Metadata } from "next";
import { Poppins, Patua_One } from 'next/font/google';
import "./globals.css";
import Providers from "./providers";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const patuaOne = Patua_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-patua-one',
});

export const metadata: Metadata = {
  title: {
    default: "Wovie: find a film, keep a watchlist",
    template: "%s · Wovie",
  },
  description:
    "Browse popular films with TMDB ratings, rate what you have seen and keep your own lists.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${patuaOne.variable}`}>
      <body className="font-sans bg-background text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
