'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import ProfileDropdown from '@/components/dashboard/ProfileDropdown'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, isPending } = authClient.useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-[3px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brutalist-yellow border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all">
              <span className="text-black font-black text-xl">CP</span>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">CrossPay</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-bold uppercase hover:underline decoration-[3px] decoration-brutalist-magenta underline-offset-4"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isPending && (
              <>
                {session ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="font-bold uppercase text-sm flex items-center gap-2 hover:underline underline-offset-4"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <ProfileDropdown user={session.user} />
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="font-bold uppercase text-sm hover:underline underline-offset-4"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      className="brutalist-button bg-brutalist-cyan text-sm flex items-center gap-2"
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 border-[3px] border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-white border-b-[3px] border-black p-4 space-y-4"
          >
            {['Features', 'How It Works', 'Pricing', 'Testimonials'].map((item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="block text-xl font-black uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-4 border-t-[3px] border-black flex flex-col gap-4">
              {!isPending && (
                <>
                  {session ? (
                    <>
                      <Link 
                        href="/dashboard" 
                        className="brutalist-button bg-brutalist-yellow text-center flex items-center justify-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Go to Dashboard
                      </Link>
                      <div className="flex justify-center pt-2">
                        <ProfileDropdown user={session.user} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="brutalist-button bg-white text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/signup" 
                        className="brutalist-button bg-brutalist-magenta text-white text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
