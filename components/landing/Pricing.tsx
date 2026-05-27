'use client'

import { motion } from 'framer-motion'
import { mockPricingPlans } from '@/lib/data-client'
import { Check, Zap } from 'lucide-react'
import Link from 'next/link'

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-brutalist-cyan border-t-[3px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-7xl font-black mb-4">Simple Pricing</h2>
          <p className="text-xl font-bold uppercase max-w-2xl mx-auto">
            No hidden fees, no surprises. Just clear, upfront costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockPricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -8, x: -8, boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}
              className={`brutalist-card p-8 bg-white relative ${plan.popular ? 'border-brutalist-magenta' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brutalist-magenta text-white px-4 py-1 font-black uppercase text-xs border-[2px] border-black rotate-2 shadow-brutalist">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
              <div className="text-4xl font-black mb-4">{plan.price}</div>
              <p className="font-bold text-sm uppercase mb-8 opacity-70">
                {plan.description}
              </p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 font-bold text-sm uppercase">
                    <div className="bg-brutalist-green p-1 border-[2px] border-black">
                      <Check size={14} className="text-black" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <button className={`w-full brutalist-button flex items-center justify-center gap-2 ${plan.popular ? 'bg-brutalist-magenta text-white' : 'bg-black text-white'}`}>
                  Get Started <Zap size={18} />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
