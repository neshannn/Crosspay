import { auth } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { LogOut, User, Shield, CreditCard, Package, ShoppingBag } from "lucide-react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { getServices, getUserOrders } from "@/lib/data";
import SubscriptionSelector from "@/components/dashboard/SubscriptionSelector";
import OrderHistory from "@/components/dashboard/OrderHistory";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-brutalist-yellow flex items-center justify-center">
      <div className="text-2xl font-black uppercase tracking-tighter animate-pulse">
        Loading Dashboard...
      </div>
    </div>
  );
}

async function DashboardContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const { user } = session;
  const services = await getServices();
  const orders = await getUserOrders(user.id);
  
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid' || o.status === 'success');
  const pendingOrders = orders.filter(o => o.status === 'awaiting_payment' || o.status === 'pending');

  return (
    <div className="min-h-screen bg-brutalist-yellow">
      <nav className="bg-white border-b-[3px] border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black border-[2px] border-black flex items-center justify-center">
                <span className="text-white font-black text-sm">CP</span>
              </div>
              <span className="font-black text-lg">CROSSPAY</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm font-bold">
                <User size={16} />
                <span>{user.email}</span>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="brutalist-button bg-brutalist-magenta text-white flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <LogOut size={16} />
                  LOGOUT
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
            Welcome to <span className="text-brutalist-magenta">Cross Pay</span>
          </h1>
          <p className="text-lg font-bold opacity-70">
            {user.name ? `Hello, ${user.name}! ` : ''}Manage your digital subscriptions and payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="brutalist-card bg-white p-6 border-[3px] border-black">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brutalist-cyan border-[2px] border-black flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg leading-none uppercase">Subscriptions</h3>
                <p className="text-sm font-black text-brutalist-magenta">{completedOrders.length} Active</p>
              </div>
            </div>
            <p className="text-xs font-bold opacity-60 uppercase">
              Ready-to-use digital keys delivered to your email.
            </p>
          </div>

          <div className="brutalist-card bg-white p-6 border-[3px] border-black">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brutalist-green border-[2px] border-black flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg leading-none uppercase">Order Status</h3>
                <p className="text-sm font-black text-brutalist-magenta">{pendingOrders.length} Pending</p>
              </div>
            </div>
            <p className="text-xs font-bold opacity-60 uppercase">
              Check payment status and history.
            </p>
          </div>

          <div className="brutalist-card bg-white p-6 border-[3px] border-black">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brutalist-magenta border-[2px] border-black flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg leading-none uppercase">Role</h3>
                <p className="text-sm font-black text-white bg-black px-2 inline-block uppercase tracking-tighter">
                  {user.role}
                </p>
              </div>
            </div>
            <p className="text-xs font-bold opacity-60 uppercase">
              Verified security for all transactions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <SubscriptionSelector services={services} />
            </section>
            
            <section className="pt-12 border-t-[3px] border-black/10">
              <OrderHistory orders={orders} />
            </section>
          </div>

          <div className="space-y-8">
            <div className="brutalist-card bg-white p-8 border-[3px] border-black">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter border-b-[3px] border-black pb-2">Profile</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b-[2px] border-black/10">
                  <span className="font-bold uppercase text-[10px] opacity-40">Email</span>
                  <span className="font-black text-xs">{user.email}</span>
                </div>
                {user.name && (
                  <div className="flex justify-between items-center py-2 border-b-[2px] border-black/10">
                    <span className="font-bold uppercase text-[10px] opacity-40">Full Name</span>
                    <span className="font-black text-xs uppercase">{user.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold uppercase text-[10px] opacity-40">Joined</span>
                  <span className="font-black text-xs uppercase">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="brutalist-card bg-brutalist-green p-6 border-[3px] border-black">
              <h3 className="font-black text-lg uppercase mb-2">Need Help?</h3>
              <p className="text-sm font-bold mb-4 opacity-80 uppercase leading-tight">Our support team is available for any subscription issues.</p>
              <button className="w-full brutalist-button bg-black text-white py-2 text-xs font-black uppercase">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
