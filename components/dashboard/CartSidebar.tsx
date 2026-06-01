'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, Loader2, CreditCard } from 'lucide-react';
import { useCart } from './CartContext';
import { checkoutCart } from '@/lib/actions';
import { useToast } from '../ui/Toast';

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, isLoading } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'eSewa' | 'Stripe'>('eSewa');
  const { showToast } = useToast();

  const total = items.reduce((acc, item) => acc + (Number(item.service.price) * item.quantity), 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const result = await checkoutCart(paymentMethod);
      if (result.success) {
        if (paymentMethod === 'eSewa' && result.paymentParams) {
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
        } else if (paymentMethod === 'Stripe' && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          showToast(result.message || 'Checkout successful', 'success');
        }
      } else {
        showToast(result.error || 'Checkout failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred during checkout', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l-[4px] border-black z-50 flex flex-col shadow-[-12px_0px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="p-6 border-b-[4px] border-black flex justify-between items-center bg-brutalist-yellow">
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} className="font-black" />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Your Cart</h2>
                <span className="bg-black text-white text-xs font-black px-2 py-1 rounded-none">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white border-[2px] border-transparent hover:border-black transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="font-black uppercase text-sm">Loading Cart...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-6 text-center">
                  <div className="w-20 h-20 bg-gray-100 border-[3px] border-black flex items-center justify-center">
                    <ShoppingCart size={40} className="opacity-20" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase">Cart is Empty</h3>
                    <p className="text-sm font-bold opacity-50 uppercase">Start adding some subscriptions!</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="brutalist-button bg-brutalist-cyan px-8 py-3 text-sm font-black uppercase"
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="brutalist-card bg-white border-[3px] border-black p-4 flex gap-4 relative">
                    <div className="w-16 h-16 bg-brutalist-magenta/10 border-[2px] border-black flex items-center justify-center text-2xl">
                      {item.service.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-black uppercase text-sm leading-tight mb-1">{item.service.name}</h3>
                      <p className="text-xs font-bold text-brutalist-magenta mb-3">NPR {item.service.price}</p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border-[2px] border-black">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-brutalist-cyan border-r-[2px] border-black"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-xs font-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-brutalist-cyan border-l-[2px] border-black"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-end">
                      <span className="text-xs font-black">NPR {Number(item.service.price) * item.quantity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t-[4px] border-black bg-white space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase text-sm opacity-60">Total Amount</span>
                  <span className="text-2xl font-black text-brutalist-green">NPR {total}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('eSewa')}
                      className={`flex items-center justify-center gap-2 p-3 border-[2px] border-black transition-all ${
                        paymentMethod === 'eSewa' ? 'bg-brutalist-green shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[10px] font-black uppercase">eSewa</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('Stripe')}
                      className={`flex items-center justify-center gap-2 p-3 border-[2px] border-black transition-all ${
                        paymentMethod === 'Stripe' ? 'bg-brutalist-cyan shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase leading-none">Stripe</span>
                        <span className="text-[8px] font-bold opacity-50 uppercase">(Sandbox)</span>
                      </div>
                    </button>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full brutalist-button bg-black text-white py-4 font-black uppercase flex items-center justify-center gap-3 hover:bg-brutalist-magenta transition-colors disabled:opacity-50"
                  >
                    {isCheckingOut ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Checkout Now
                        <ShoppingCart size={20} />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] font-bold text-center opacity-40 uppercase">
                  Secure transaction powered by {paymentMethod}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
