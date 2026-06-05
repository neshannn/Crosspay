'use client';

import { useState } from 'react';
import { Order, SalesStats } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, TrendingUp, Clock, CheckCircle, User, Calendar, DollarSign, ArrowUpRight, Search, Filter, Download } from 'lucide-react';

interface AdminOrderReportProps {
  orders: Order[];
  stats: SalesStats;
}

export default function AdminOrderReport({ orders, stats }: AdminOrderReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOrders = orders.filter(order => 
    order.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Sales Overview Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brutalist-yellow border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <TrendingUp size={24} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Financial Summary</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Gross Revenue" 
            value={`NPR ${stats.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign className="text-white" />}
            color="bg-brutalist-black text-white"
          />
          <StatCard 
            title="Orders Processed" 
            value={stats.totalOrders.toString()} 
            icon={<ShoppingBag className="text-black" />}
            color="bg-brutalist-cyan"
          />
          <StatCard 
            title="Success Rate" 
            value={`${Math.round((stats.completedOrders / (stats.totalOrders || 1)) * 100)}%`} 
            icon={<CheckCircle className="text-black" />}
            color="bg-brutalist-green"
          />
          <StatCard 
            title="Action Required" 
            value={stats.pendingOrders.toString()} 
            icon={<Clock className="text-black" />}
            color="bg-brutalist-yellow"
          />
        </div>

        {/* Revenue by Service Chart-like list */}
        <div className="mt-12 brutalist-card bg-white border-[3px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-2">
            <ArrowUpRight size={24} className="text-brutalist-magenta" /> Performance by Service
          </h3>
          <div className="space-y-6">
            {stats.revenueByService.map((item, idx) => (
              <div key={item.serviceName} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-black uppercase text-sm tracking-tight">{item.serviceName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-0.5 border border-black">{item.count} orders</span>
                    <span className="font-black text-sm">NPR {item.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-6 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.revenue / (stats.totalRevenue || 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: idx * 0.1 }}
                    className="h-full bg-brutalist-magenta"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Log Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brutalist-magenta text-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Order Intelligence</h2>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by Customer, Service, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="brutalist-input w-full pl-12 py-3 bg-white border-[3px] border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            />
          </div>
        </div>

        <div className="brutalist-card bg-white border-[3px] border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-black text-white uppercase text-[10px] font-black">
                <tr>
                  <th className="p-5 border-r border-white/20">Timestamp</th>
                  <th className="p-5 border-r border-white/20">Customer Identification</th>
                  <th className="p-5 border-r border-white/20">Product/Service</th>
                  <th className="p-5 border-r border-white/20">Gross Amount</th>
                  <th className="p-5 border-r border-white/20">Payment Status</th>
                  <th className="p-5">Trace ID</th>
                </tr>
              </thead>
              <tbody className="font-bold text-sm">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.length === 0 ? (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="p-20 text-center text-gray-400 uppercase font-black">
                        <div className="flex flex-col items-center gap-4">
                          <Search size={48} className="opacity-20" />
                          No orders match your parameters
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredOrders.map((order, idx) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        key={order.id} 
                        className="border-b-[2px] border-black hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-5 border-r border-black">
                          <div className="flex flex-col gap-1">
                            <span className="uppercase text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-black">{new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="p-5 border-r border-black">
                          <div className="flex flex-col">
                            <span className="uppercase tracking-tight font-black flex items-center gap-1.5">
                              <User size={14} className="text-brutalist-cyan" /> {order.userName || 'Anonymous'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono mt-1">{order.userEmail}</span>
                          </div>
                        </td>
                        <td className="p-5 border-r border-black">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-brutalist-magenta"></div>
                            <span className="font-black uppercase tracking-tight">{order.serviceName}</span>
                          </div>
                        </td>
                        <td className="p-5 border-r border-black font-black text-lg">NPR {order.amount.toLocaleString()}</td>
                        <td className="p-5 border-r border-black">
                          <span className={`
                            px-4 py-1.5 text-[10px] font-black uppercase border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                            ${getStatusColor(order.status)}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-5 font-mono text-[10px] text-gray-400">
                          <span className="bg-gray-100 px-2 py-1 border border-black/10">
                            #{order.id.slice(0, 12)}...
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8, x: -8 }}
      className={`${color} border-[3px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all group`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 border-[3px] border-black bg-white group-hover:bg-brutalist-yellow transition-colors">
          {icon}
        </div>
        <div className="h-1 w-8 bg-black/20 group-hover:bg-black/40"></div>
      </div>
      <h4 className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">{title}</h4>
      <p className="text-3xl font-black uppercase tracking-tighter leading-none">{value}</p>
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
