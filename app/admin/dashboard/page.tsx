import { auth } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { LogOut, LayoutDashboard, Plus, Trash2, Edit, Package, Users, ShoppingBag, BarChart3, Settings } from "lucide-react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServices, getOrders, getSalesStats } from "@/lib/data";
import AdminServiceManager from "@/components/admin/AdminServiceManager";
import AdminOrderReport from "@/components/admin/AdminOrderReport";
import AdminDashboardTabs from "@/components/admin/AdminDashboardTabs";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminDashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

function AdminLoading() {
  return (
    <div className="min-h-screen bg-brutalist-black flex items-center justify-center">
      <div className="text-2xl font-black uppercase tracking-tighter animate-pulse text-white">
        Loading Admin Panel...
      </div>
    </div>
  );
}

async function AdminDashboardContent({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeTab = tab || 'services';
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    redirect("/dashboard");
  }

  const services = await getServices(true);
  const orders = await getOrders();
  const stats = await getSalesStats();

  return (
    <div className="min-h-screen bg-brutalist-white">
      {/* Admin Navbar */}
      <nav className="bg-brutalist-black border-b-[3px] border-black text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-brutalist-magenta border-[2px] border-white flex items-center justify-center">
                <span className="text-white font-black text-sm">CP</span>
              </div>
              <span className="font-black text-lg tracking-tighter uppercase">Admin Panel</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase">
                <span className="w-2 h-2 bg-brutalist-green rounded-full animate-pulse"></span>
                System Status: Optimal
              </div>
              <a 
                href="/"
                className="brutalist-button bg-white text-black flex items-center gap-2 px-4 py-2 text-xs font-black uppercase border-[2px] border-black hover:bg-brutalist-yellow"
              >
                Storefront
              </a>
              <form action={logout}>
                <button
                  type="submit"
                  className="brutalist-button bg-brutalist-magenta text-white flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
                >
                  <LogOut size={14} />
                  LOGOUT
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2">
              <BarChart3 size={12} />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase mb-4 leading-none">
              Admin <span className="text-brutalist-magenta">Dashboard</span>
            </h1>
            <p className="text-xl font-bold opacity-70 max-w-2xl">
              Control center for CrossPay. Manage your digital inventory and track every transaction with neo-brutalist precision.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="brutalist-card bg-brutalist-cyan p-6 border-[3px] border-black flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-4xl font-black">{services.length}</span>
              <span className="text-[10px] font-black uppercase">Services Active</span>
            </div>
            <div className="brutalist-card bg-brutalist-yellow p-6 border-[3px] border-black flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-4xl font-black">{stats.totalOrders}</span>
              <span className="text-[10px] font-black uppercase">Total Sales</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <AdminDashboardTabs activeTab={activeTab} />

        <div className="mt-8">
          {activeTab === 'services' ? (
            <AdminServiceManager initialServices={services} />
          ) : (
            <AdminOrderReport orders={orders} stats={stats} />
          )}
        </div>
      </main>
    </div>
  );
}
