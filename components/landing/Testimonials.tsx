'use client'

import { motion } from 'framer-motion'
import { mockTestimonials } from '@/lib/data-client'
import { Quote } from 'lucide-react'

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white border-t-[3px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-7xl font-black mb-4 uppercase tracking-tighter">Voices of <br /> <span className="text-brutalist-magenta">CrossPay</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTestimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              whileHover={{ rotate: -1, scale: 1.02 }}
              className="brutalist-card p-8 bg-white flex flex-col h-full"
            >
              <div className="mb-6 bg-brutalist-yellow p-4 border-[3px] border-black inline-block self-start shadow-brutalist">
                <Quote className="text-black" size={32} />
              </div>
              
              <p className="text-lg font-bold mb-8 flex-grow">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex items-center gap-4 pt-6 border-t-[2px] border-black">
                <div className="w-12 h-12 bg-brutalist-cyan border-[3px] border-black flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tight">{testimonial.name}</h4>
                  <p className="text-xs font-bold opacity-60 uppercase">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
