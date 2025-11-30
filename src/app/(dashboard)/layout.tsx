import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        </div>
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <DashboardShell>
          <Header user={session.user} />
          <main className="p-6 relative z-10">{children}</main>
        </DashboardShell>
      </div>
    </SidebarProvider>
  );
}
