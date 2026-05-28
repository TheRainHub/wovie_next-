import Header from "@/app/components/Header";
import OfflineBanner from "@/app/components/OfflineBanner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* Баннер реагирует на navigator.onLine / события online/offline */}
      <OfflineBanner />
      <main className="pt-16 px-4">{children}</main>
    </>
  );
}
