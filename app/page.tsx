import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'
import { getServices } from '@/lib/data'
import { Suspense } from 'react'

export const metadata = {
  title: 'CrossPay - Access Global Subscriptions from Nepal',
  description: 'The first digital marketplace for cross-border subscriptions in Nepal. Pay for international services using local payment methods like eSewa.',
}

async function PricingSection() {
  const services = await getServices()
  return <Pricing services={services} />
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Suspense fallback={<div className="py-24 bg-brutalist-cyan border-t-[3px] border-black flex items-center justify-center font-black uppercase text-2xl animate-pulse">Loading Subscriptions...</div>}>
        <PricingSection />
      </Suspense>
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
