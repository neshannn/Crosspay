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

  const services = await getServices();
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
                <span className="w-2 h-2 bg-brutalist-green rounded-full"></span>
                System Status: Optimal
              </div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 leading-none">
              {activeTab === 'services' ? 'Marketplace' : 'Sales'} <span className="text-brutalist-magenta">{activeTab === 'services' ? 'Control' : 'Analytics'}</span>
            </h1>
            <p className="text-lg font-bold opacity-70">
              {activeTab === 'services' ? 'Manage subscriptions, pricing, and availability.' : 'Track orders, revenue, and customer activity.'}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="brutalist-card bg-brutalist-cyan p-4 border-[3px] border-black flex flex-col items-center min-w-[120px]">
              <span className="text-3xl font-black">{services.length}</span>
              <span className="text-[10px] font-black uppercase">Total Services</span>
            </div>
            <div className="brutalist-card bg-brutalist-yellow p-4 border-[3px] border-black flex flex-col items-center min-w-[120px]">
              <span className="text-3xl font-black">{stats.totalOrders}</span>
              <span className="text-[10px] font-black uppercase">Total Orders</span>
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
