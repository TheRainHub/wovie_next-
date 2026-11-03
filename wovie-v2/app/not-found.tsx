import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-16">
        <p className="text-accent font-semibold mb-2">404</p>
        <h1 className="text-3xl font-bold mb-3">Nothing here</h1>
        <p className="text-white/50 mb-8 max-w-md">The film or page you were looking for doesn&apos;t exist, or it isn&apos;t yours to see.</p>
        <Link href="/movies" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90">
          Browse films
        </Link>
      </main>
      <Footer />
    </>
  );
}
