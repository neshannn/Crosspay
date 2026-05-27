'use client'

import { motion } from 'framer-motion'
import { mockFeatures } from '@/lib/data-client'

const colorMap = [
  'bg-brutalist-yellow',
  'bg-brutalist-cyan',
  'bg-brutalist-magenta',
  'bg-brutalist-green',
  'bg-white',
  'bg-brutalist-yellow',
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white border-t-[3px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-7xl font-black mb-4">Why CrossPay?</h2>
          <p className="text-xl font-bold uppercase max-w-2xl mx-auto">
            We break the barriers of international payments with a bold, local approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -8, x: -8, boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)' }}
              className={`brutalist-card p-8 ${colorMap[i % colorMap.length]}`}
            >
              <div className="text-4xl mb-6 inline-block bg-white border-[3px] border-black p-3 shadow-brutalist">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
              <p className="font-bold text-sm uppercase leading-tight">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
