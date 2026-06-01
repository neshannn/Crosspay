'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus } from 'lucide-react';
import { Service } from '@/lib/types';
import OrderModal from './OrderModal';
import { useCart } from './CartContext';

interface SubscriptionSelectorProps {
  services: Service[];
}

export default function SubscriptionSelector({ services }: SubscriptionSelectorProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { addItem } = useCart();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase mb-6">
          Choose Your <span className="text-brutalist-cyan">Subscription</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
              className="brutalist-card bg-white border-[3px] border-black p-6 flex flex-col h-full transition-shadow duration-200"
              style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-brutalist-yellow border-[2px] border-black flex items-center justify-center text-2xl">
                  {service.icon}
                </div>
                <span className="bg-brutalist-black text-white text-[10px] font-black uppercase px-2 py-1">
                  {service.category}
                </span>
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                {service.name}
              </h3>
              <p className="text-sm font-bold opacity-70 mb-6 flex-grow">
                {service.description}
              </p>
              
              <div className="mt-auto pt-6 border-t-[2px] border-black space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase opacity-50">
                      {service.stock <= 0 ? 'STATUS' : 'Price'}
                    </span>
                    <span className={`text-xl font-black ${service.stock <= 0 ? 'text-red-600' : ''}`}>
                      {service.stock <= 0 ? 'OUT OF STOCK' : `NPR ${service.price}`}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedService(service)}
                    disabled={service.stock <= 0}
                    className={`
                      flex items-center gap-2 px-3 py-1 font-black uppercase text-[10px] border-[2px] border-black 
                      transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                      ${service.stock <= 0 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-400' 
                        : 'bg-white hover:bg-brutalist-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      }
                    `}
                  >
                    Direct Order
                  </button>
                </div>
                
                <button
                  onClick={() => addItem(service)}
                  disabled={service.stock <= 0}
                  className={`
                    w-full flex items-center justify-center gap-2 px-4 py-2 font-black uppercase text-sm border-[2px] border-black 
                    transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    ${service.stock <= 0 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-400' 
                      : 'bg-brutalist-magenta text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[1px] hover:-translate-y-[1px]'
                    }
                  `}
                >
                  <Plus size={18} />
                  {service.stock <= 0 ? 'SOLD OUT' : 'ADD TO CART'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <OrderModal 
        service={selectedService} 
        onClose={() => setSelectedService(null)} 
      />
    </div>
  );
}
