import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#F7F8FA]">
      {/* Sidebar — hidden on mobile, icon-only on md, full on lg */}
      <AppSidebar user={session.user} />

      {/* Content column */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </main>
        {/* Bottom nav — mobile only */}
        <BottomNav role={session.user.role} />
      </div>
    </div>
  );
}
