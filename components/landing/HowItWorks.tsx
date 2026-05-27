'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Search, CreditCard, Sparkles } from 'lucide-react'

const steps = [
  {
    title: 'Choose Service',
    description: 'Browse our extensive catalog of global subscriptions like Netflix, Spotify, and more.',
    icon: <Search className="w-8 h-8" />,
    color: 'bg-brutalist-cyan'
  },
  {
    title: 'Pay with eSewa',
    description: 'Use your local eSewa wallet to pay in NPR. No dollar card or conversion needed.',
    icon: <CreditCard className="w-8 h-8" />,
    color: 'bg-brutalist-yellow'
  },
  {
    title: 'Instant Access',
    description: 'Receive your activation details instantly and start enjoying your service.',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'bg-brutalist-green'
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white border-t-[3px] border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-7xl font-black mb-4">How It Works</h2>
          <p className="text-xl font-bold uppercase max-w-2xl mx-auto">
            Three simple steps to unlock the global internet from Nepal.
          </p>
        </div>

        <div className="relative">
          {/* Connector line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[3px] bg-black -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`w-24 h-24 ${step.color} border-[3px] border-black rounded-full flex items-center justify-center mb-8 shadow-brutalist relative`}>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-xl border-[3px] border-white">
                    {i + 1}
                  </div>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase">{step.title}</h3>
                <p className="font-bold text-sm uppercase leading-tight max-w-xs">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <ArrowRight className="lg:hidden w-8 h-8 mt-8 text-black" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
