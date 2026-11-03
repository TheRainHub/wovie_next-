import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import OfflineBanner from "@/app/components/OfflineBanner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <OfflineBanner />
      <main className="pt-16 px-4">{children}</main>
      <Footer />
    </>
  );
}
