'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { Service } from '@/lib/types';
import { createOrder } from '@/lib/actions';

interface OrderModalProps {
  service: Service | null;
  onClose: () => void;
}

export default function OrderModal({ service, onClose }: OrderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'eSewa' | 'Khalti'>('eSewa');
  const [loading, setLoading] = useState(false);

  if (!service) return null;

  const handleOrder = async () => {
    setLoading(true);
    try {
      const result = await createOrder(service.id, service.price, quantity, paymentMethod);
      
      if (result.success) {
        if (paymentMethod === 'eSewa' && result.paymentParams) {
          // ... (existing eSewa logic)
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
        } else if (paymentMethod === 'Khalti' && result.paymentUrl) {
          // Redirect to Khalti payment page
          window.location.href = result.paymentUrl;
        } else {
          alert(result.message || 'Order placed successfully!');
          onClose();
        }
      } else {
        alert(result.error || 'Failed to place order');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-8 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-brutalist-yellow border-[2px] border-transparent hover:border-black transition-all"
          >
            <X size={24} />
          </button>

          <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">
            Confirm <span className="text-brutalist-magenta">Order</span>
          </h2>

          <div className="space-y-6">
            {/* Service Summary */}
            <div className="flex items-center gap-4 p-4 bg-brutalist-yellow border-[3px] border-black">
              <div className="text-3xl">{service.icon}</div>
              <div>
                <h3 className="font-black uppercase text-lg leading-none">{service.name}</h3>
                <p className="text-sm font-bold opacity-70">NPR {service.price} / unit</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider">Select Quantity</label>
                <span className="text-[10px] font-black uppercase opacity-60">
                  {service.stock} available
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center hover:bg-brutalist-cyan transition-colors active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <Minus size={20} />
                </button>
                <div className="w-20 h-12 border-[3px] border-black flex items-center justify-center text-xl font-black">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(Math.min(service.stock, quantity + 1))}
                  className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center hover:bg-brutalist-cyan transition-colors active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('eSewa')}
                  className={`flex flex-col items-center gap-2 p-4 border-[3px] border-black transition-all ${
                    paymentMethod === 'eSewa' ? 'bg-brutalist-green shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="font-black text-xs uppercase">eSewa</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('Khalti')}
                  className={`flex flex-col items-center gap-2 p-4 border-[3px] border-black transition-all ${
                    paymentMethod === 'Khalti' ? 'bg-brutalist-cyan shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="w-6 h-6 bg-[#5C2D91] rounded-full flex items-center justify-center text-white text-[10px] font-bold">K</div>
                  <span className="font-black text-xs uppercase">Khalti</span>
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="pt-6 border-t-[3px] border-black flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase opacity-60">Total Amount</span>
                <span className="text-2xl font-black text-brutalist-magenta">NPR {service.price * quantity}</span>
              </div>
              
              <button
                onClick={handleOrder}
                disabled={loading}
                className="brutalist-button bg-black text-white px-6 py-3 font-black uppercase flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                {paymentMethod === 'eSewa' || paymentMethod === 'Khalti' ? 'Pay Now' : 'Place Order'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
