'use client';

import { Order } from '@/lib/types';
import { motion } from 'framer-motion';
import { Calendar, ShoppingBag, CreditCard, ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { getEsewaPaymentParams, getStripeCheckoutUrl, cancelOrder } from '@/lib/actions';
import { useToast } from '../ui/Toast';

interface OrderHistoryProps {
  orders: Order[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const { showToast } = useToast();

  const toggleOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? This will release the reserved stock.")) return;
    
    setCancellingOrderId(orderId);
    try {
      const result = await cancelOrder(orderId);
      if (result.success) {
        showToast(result.message || 'Order cancelled successfully', 'success');
      } else {
        showToast(result.error || 'Failed to cancel order', 'error');
      }
    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handlePayNow = async (order: Order, method: 'eSewa' | 'Stripe') => {
    setLoadingOrderId(`${order.id}-${method}`);
    try {
      if (method === 'Stripe') {
        const result = await getStripeCheckoutUrl(order.id);
        if (result.success && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          showToast(result.error || 'Failed to initiate Stripe payment', 'error');
        }
      } else {
        const result = await getEsewaPaymentParams(order.id);
        if (result.success && result.paymentParams) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = result.paymentUrl!;
          
          Object.entries(result.paymentParams).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value.toString();
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
        } else {
          showToast(result.error || 'Failed to initiate eSewa payment', 'error');
        }
      }
    } catch (error) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoadingOrderId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="brutalist-card bg-white p-12 border-[3px] border-black text-center">
        <ShoppingBag className="mx-auto mb-4 opacity-20" size={48} />
        <h3 className="text-xl font-black uppercase">No orders yet</h3>
        <p className="font-bold opacity-60">Your purchase history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
        <ShoppingBag size={24} /> My Purchase History
      </h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="brutalist-card bg-white border-[3px] border-black overflow-hidden">
            <div 
              onClick={() => toggleOrder(order.id)}
              className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brutalist-yellow border-[2px] border-black flex items-center justify-center font-black">
                  {order.serviceName?.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm leading-none mb-1">{order.serviceName}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold opacity-50 uppercase">
                    <Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs font-black uppercase opacity-60 leading-none mb-1">Amount</p>
                  <p className="font-black text-sm">NPR {order.amount}</p>
                </div>

                <div className={`
                  px-3 py-1 text-[10px] font-black uppercase border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  ${getStatusColor(order.status)}
                `}>
                  {order.status}
                </div>

                {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedOrder === order.id && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                className="border-t-[3px] border-black p-4 bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black uppercase opacity-40">Order Details</h5>
                    <div className="space-y-2">
                      <DetailRow label="Order ID" value={`#${order.id.slice(0, 8)}...`} />
                      <DetailRow label="Date" value={new Date(order.createdAt).toLocaleString()} />
                      <DetailRow label="Service" value={order.serviceName || 'N/A'} />
                      <DetailRow label="Total Paid" value={`NPR ${order.amount}`} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase opacity-40">Actions & Status</h5>
                    
                    {order.status === 'completed' ? (
                      <div className="bg-brutalist-green/20 border-[2px] border-black p-4">
                        <p className="text-xs font-black uppercase mb-2 flex items-center gap-2">
                          <CreditCard size={14} /> Key Delivered
                        </p>
                        <p className="text-[10px] font-bold">Your digital key was sent to your email. Check your inbox or spam folder.</p>
                      </div>
                    ) : (order.status === 'awaiting_payment' || order.status === 'pending') ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold opacity-70 uppercase">Payment is pending. Choose a method to complete your order:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayNow(order, 'eSewa');
                            }}
                            disabled={!!loadingOrderId}
                            className="brutalist-button bg-brutalist-green text-black py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {loadingOrderId === `${order.id}-eSewa` ? <Loader2 className="animate-spin" size={12} /> : <CreditCard size={12} />}
                            eSewa
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePayNow(order, 'Stripe');
                            }}
                            disabled={!!loadingOrderId || !!cancellingOrderId}
                            className="brutalist-button bg-brutalist-cyan text-black py-2 text-[10px] font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {loadingOrderId === `${order.id}-Stripe` ? <Loader2 className="animate-spin" size={12} /> : <ExternalLink size={12} />}
                            Stripe
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id);
                          }}
                          disabled={!!loadingOrderId || !!cancellingOrderId}
                          className="w-full mt-2 border-[2px] border-black py-2 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {cancellingOrderId === order.id ? <Loader2 className="animate-spin mx-auto" size={12} /> : 'Cancel Order'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-red-50 border-[2px] border-black p-4 text-red-600">
                        <p className="text-xs font-black uppercase">Order {order.status}</p>
                        <p className="text-[10px] font-bold">Please contact support if you have questions.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="font-bold uppercase opacity-50">{label}</span>
      <span className="font-black uppercase">{value}</span>
    </div>
  );
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'success' || s === 'paid') return 'bg-brutalist-green text-black';
  if (s === 'pending' || s === 'awaiting_payment') return 'bg-brutalist-yellow text-black';
  if (s === 'failed' || s === 'cancelled') return 'bg-red-500 text-white';
  return 'bg-gray-200 text-black';
}
