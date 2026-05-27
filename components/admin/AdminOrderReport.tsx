'use client';

import { Order, SalesStats } from '@/lib/types';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Clock, CheckCircle, User, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';

interface AdminOrderReportProps {
  orders: Order[];
  stats: SalesStats;
}

export default function AdminOrderReport({ orders, stats }: AdminOrderReportProps) {
  return (
    <div className="space-y-12">
      {/* Sales Overview Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-brutalist-yellow border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Sales Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`NPR ${stats.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign className="text-brutalist-green" />}
            color="bg-white"
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders.toString()} 
            icon={<ShoppingBag className="text-brutalist-cyan" />}
            color="bg-white"
          />
          <StatCard 
            title="Completed" 
            value={stats.completedOrders.toString()} 
            icon={<CheckCircle className="text-brutalist-green" />}
            color="bg-white"
          />
          <StatCard 
            title="Pending" 
            value={stats.pendingOrders.toString()} 
            icon={<Clock className="text-brutalist-magenta" />}
            color="bg-white"
          />
        </div>

        {/* Revenue by Service Chart-like list */}
        <div className="mt-8 brutalist-card bg-white border-[3px] border-black p-6">
          <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
            <ArrowUpRight size={20} /> Revenue by Service
          </h3>
          <div className="space-y-4">
            {stats.revenueByService.map((item, idx) => (
              <div key={item.serviceName} className="relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-black uppercase text-sm">{item.serviceName}</span>
                  <span className="font-bold text-xs">NPR {item.revenue.toLocaleString()} ({item.count} sales)</span>
                </div>
                <div className="h-4 bg-gray-100 border-[2px] border-black overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.revenue / (stats.totalRevenue || 1)) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-brutalist-cyan"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Log Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-brutalist-magenta text-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Order Reports</h2>
        </div>

        <div className="brutalist-card bg-white border-[3px] border-black overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-black text-white uppercase text-xs font-black">
              <tr>
                <th className="p-4 border-r border-white/20">Date</th>
                <th className="p-4 border-r border-white/20">Customer</th>
                <th className="p-4 border-r border-white/20">Service</th>
                <th className="p-4 border-r border-white/20">Amount</th>
                <th className="p-4 border-r border-white/20">Status</th>
                <th className="p-4">Order ID</th>
              </tr>
            </thead>
            <tbody className="font-bold text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 uppercase font-black">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b-[2px] border-black hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-r border-black">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 border-r border-black">
                      <div className="flex flex-col">
                        <span className="uppercase tracking-tight flex items-center gap-1">
                          <User size={12} /> {order.userName || 'Anonymous'}
                        </span>
                        <span className="text-[10px] text-gray-500 lowercase">{order.userEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 border-r border-black font-black uppercase">{order.serviceName}</td>
                    <td className="p-4 border-r border-black font-black">NPR {order.amount.toLocaleString()}</td>
                    <td className="p-4 border-r border-black">
                      <span className={`
                        px-3 py-1 text-[10px] font-black uppercase border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                        ${getStatusColor(order.status)}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-gray-400">
                      #{order.id.slice(0, 8)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, x: -5 }}
      className={`${color} border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 border-[2px] border-black bg-gray-50">
          {icon}
        </div>
      </div>
      <h4 className="text-xs font-black uppercase text-gray-500 mb-1">{title}</h4>
      <p className="text-2xl font-black uppercase tracking-tighter">{value}</p>
    </motion.div>
  );
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'success' || s === 'paid') return 'bg-brutalist-green text-black';
  if (s === 'pending' || s === 'awaiting_payment') return 'bg-brutalist-yellow text-black';
  if (s === 'failed' || s === 'cancelled') return 'bg-red-500 text-white';
  return 'bg-gray-200 text-black';
}
