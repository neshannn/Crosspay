'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartButton() {
  const { items, setIsOpen } = useCart();
  const itemCount = items.length;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative p-2 bg-white border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
    >
      <ShoppingCart size={20} className="text-black" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 bg-brutalist-magenta text-white text-[10px] font-black w-5 h-5 flex items-center justify-center border-[2px] border-black"
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
