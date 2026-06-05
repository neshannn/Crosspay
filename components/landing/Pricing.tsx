'use client'

import { motion } from 'framer-motion'
import { Service } from '@/lib/types'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'

interface PricingProps {
  services: Service[]
}

export function Pricing({ services }: PricingProps) {
  // Show top 3 services as "Pricing Plans"
  const displayServices = services.slice(0, 3)

  return (
    <section id="pricing" className="py-24 bg-brutalist-cyan border-t-[3px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-7xl font-black mb-4 uppercase tracking-tighter">Simple Pricing</h2>
          <p className="text-xl font-bold uppercase max-w-2xl mx-auto">
            Choose from our range of digital services. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayServices.map((service, index) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -8, x: -8, boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}
              className={`brutalist-card p-8 bg-white relative ${index === 1 ? 'border-brutalist-magenta border-[4px]' : 'border-[3px] border-black'}`}
              style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brutalist-magenta text-white px-4 py-1 font-black uppercase text-xs border-[2px] border-black rotate-2 shadow-brutalist z-10">
                  Most Popular
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-brutalist-yellow border-[3px] border-black flex items-center justify-center text-3xl shadow-brutalist">
                  {service.icon}
                </div>
                <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-1 border-[2px] border-black">
                  {service.category}
                </span>
              </div>

              <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">{service.name}</h3>
              <div className="text-4xl font-black mb-4">NPR {service.price}</div>
              <p className="font-bold text-sm uppercase mb-8 opacity-70 min-h-[40px]">
                {service.description}
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 font-bold text-sm uppercase">
                  <div className="bg-brutalist-green p-1 border-[2px] border-black">
                    <Check size={14} className="text-black" />
                  </div>
                  Instant Activation
                </li>
                <li className="flex items-center gap-3 font-bold text-sm uppercase">
                  <div className="bg-brutalist-green p-1 border-[2px] border-black">
                    <Check size={14} className="text-black" />
                  </div>
                  24/7 Support
                </li>
                <li className="flex items-center gap-3 font-bold text-sm uppercase">
                  <div className="bg-brutalist-green p-1 border-[2px] border-black">
                    <Check size={14} className="text-black" />
                  </div>
                  Secure Payment
                </li>
              </ul>

              <Link href="/signup">
                <button className={`w-full brutalist-button flex items-center justify-center gap-2 ${index === 1 ? 'bg-brutalist-magenta text-white hover:bg-brutalist-magenta/90' : 'bg-black text-white hover:bg-black/90'}`}>
                  Get Started <Zap size={18} />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        {services.length > 3 && (
          <div className="mt-16 text-center">
            <Link href="/signup">
              <button className="brutalist-button bg-brutalist-yellow font-black uppercase px-8 py-4 text-xl inline-flex items-center gap-3">
                View All {services.length} Services <Zap className="fill-current" />
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
