'use client';

import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, BarChart3, Users } from 'lucide-react';

interface AdminDashboardTabsProps {
  activeTab: string;
}

export default function AdminDashboardTabs({ activeTab }: AdminDashboardTabsProps) {
  return (
    <div className="flex flex-wrap gap-4 border-b-[3px] border-black pb-8">
      <TabLink 
        href="/admin/dashboard?tab=services" 
        active={activeTab === 'services'} 
        icon={<LayoutDashboard size={18} />}
        label="Services"
        color="bg-brutalist-cyan"
      />
      <TabLink 
        href="/admin/dashboard?tab=orders" 
        active={activeTab === 'orders'} 
        icon={<ShoppingBag size={18} />}
        label="Orders & Sales"
        color="bg-brutalist-yellow"
      />
      <TabLink 
        href="#" 
        active={activeTab === 'users'} 
        icon={<Users size={18} />}
        label="Users"
        color="bg-brutalist-green"
        disabled
      />
    </div>
  );
}

function TabLink({ href, active, icon, label, color, disabled }: { href: string, active: boolean, icon: React.ReactNode, label: string, color: string, disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 font-black uppercase text-sm border-[3px] border-black bg-gray-100 text-gray-400 cursor-not-allowed opacity-50">
        {icon} {label}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2 px-6 py-3 font-black uppercase text-sm border-[3px] border-black transition-all
        ${active 
          ? `${color} shadow-none translate-x-1 translate-y-1` 
          : `bg-white hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
        }
      `}
    >
      {icon} {label}
    </Link>
  );
}
