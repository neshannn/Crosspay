'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-24 bg-white border-t-[3px] border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ rotate: -1 }}
          whileInView={{ rotate: 0 }}
          viewport={{ once: true }}
          className="bg-brutalist-cyan border-[4px] border-black p-12 lg:p-20 text-center relative shadow-brutalist-xl"
        >
          {/* Decorative floating icons */}
          <motion.div 
            animate={{ y: [0, -20, 0] }} 
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-10 left-10 hidden lg:block"
          >
            <Sparkles size={60} className="text-brutalist-yellow stroke-black stroke-[3px]" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0] }} 
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-10 right-10 hidden lg:block"
          >
            <div className="w-16 h-16 bg-brutalist-magenta border-[3px] border-black rotate-12 shadow-brutalist" />
          </motion.div>

          <h2 className="text-5xl lg:text-8xl font-black mb-8 leading-[0.85] tracking-tighter">
            READY TO JOIN THE <span className="bg-white px-4 border-[4px] border-black">GLOBAL</span> DIGITAL WORLD?
          </h2>
          
          <p className="text-2xl font-bold uppercase mb-12 max-w-3xl mx-auto leading-tight">
            Stop worrying about international credit cards. Start subscribing with eSewa today.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/signup" 
              className="brutalist-button bg-black text-white text-2xl px-12 py-6 w-full sm:w-auto text-center"
            >
              GET STARTED NOW <ArrowRight className="inline-block ml-2 w-8 h-8" />
            </Link>
            <button className="brutalist-button bg-white text-black text-2xl px-12 py-6 w-full sm:w-auto">
              CONTACT SALES
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
