'use client'

import { motion } from 'framer-motion'
import { Play, CreditCard, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-40 -left-20 w-64 h-64 bg-brutalist-yellow border-[3px] border-black rotate-12 -z-10 shadow-brutalist-xl hidden lg:block" />
      <div className="absolute top-20 -right-10 w-48 h-48 bg-brutalist-cyan border-[3px] border-black -rotate-6 -z-10 shadow-brutalist-xl hidden lg:block" />
      <div className="absolute bottom-10 right-20 w-72 h-32 bg-brutalist-magenta border-[3px] border-black rotate-3 -z-10 shadow-brutalist-xl hidden lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ rotate: -2, scale: 0.9 }}
              animate={{ rotate: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-brutalist-green border-[3px] border-black px-4 py-2 mb-8 shadow-brutalist"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-tight">Now supporting eSewa payments</span>
            </motion.div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-black mb-6 leading-[0.9] tracking-tighter uppercase">
              Access Global
              <span className="block text-brutalist-magenta stroke-black">
                Subscriptions
              </span>
              <span className="block underline decoration-[8px] decoration-brutalist-yellow">From Nepal</span>
            </h1>

            <p className="text-xl font-bold text-black max-w-2xl mx-auto lg:mx-0 mb-10 leading-tight uppercase">
              The first digital marketplace that lets you pay for international services using
              local payment methods like eSewa. No more currency conversion headaches.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
              <Link 
                href="/signup" 
                className="brutalist-button bg-black text-white text-xl px-10 py-5 text-center"
              >
                Start Free Trial
              </Link>
              <button className="brutalist-button bg-white text-black text-xl px-10 py-5 flex items-center gap-2">
                <Play className="fill-current" /> Watch Demo
              </button>
            </div>


            <div className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8 text-sm font-black uppercase">
              <div className="flex items-center gap-2">
                <div className="bg-brutalist-green p-1 border-2 border-black">
                  <CreditCard className="w-4 h-4" />
                </div>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-brutalist-cyan p-1 border-2 border-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                14-day free trial
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <motion.div 
              initial={{ x: 20, y: 20, rotate: 2 }}
              animate={{ x: 0, y: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative"
            >
              {/* Fake UI Card */}
              <div className="brutalist-card bg-white p-2 overflow-hidden">
                <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 border-2 border-white" />
                    <div className="w-3 h-3 bg-yellow-500 border-2 border-white" />
                    <div className="w-3 h-3 bg-green-500 border-2 border-white" />
                  </div>
                  <div className="text-[10px] font-black uppercase">crosspay.app</div>
                </div>
                
                <div className="p-8 space-y-6">
                  {[
                    { name: 'Netflix Premium', price: 'NPR 1,299', icon: '🎬', color: 'bg-brutalist-cyan' },
                    { name: 'Spotify Family', price: 'NPR 899', icon: '🎵', color: 'bg-brutalist-yellow' },
                    { name: 'YouTube Premium', price: 'NPR 599', icon: '📺', color: 'bg-brutalist-magenta' }
                  ].map((item, i) => (
                    <motion.div 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center justify-between p-4 border-[3px] border-black ${item.color} shadow-brutalist`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <div className="font-black uppercase text-sm">{item.name}</div>
                          <div className="text-xs font-bold opacity-70">{item.price}/MO</div>
                        </div>
                      </div>
                      <Link 
                        href="/signup"
                        className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-colors"
                      >
                        Select
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decorative Floating Element */}
              <div className="absolute -bottom-6 -right-6 bg-brutalist-green border-[3px] border-black px-6 py-3 font-black uppercase rotate-6 shadow-brutalist">
                Verified!
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
