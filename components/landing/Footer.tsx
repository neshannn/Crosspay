import { Globe, MessageCircle, Share2, Code2 } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const socialIcons = [
    { Icon: Globe, label: 'Website' },
    { Icon: MessageCircle, label: 'Chat' },
    { Icon: Share2, label: 'Share' },
    { Icon: Code2, label: 'Code' },
  ]

  return (
    <footer className="bg-black text-white border-t-[3px] border-black pt-20 pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brutalist-yellow border-[3px] border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center">
                <span className="text-black font-black text-xl">CP</span>
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">CrossPay</span>
            </div>
            <p className="font-bold text-sm uppercase leading-tight text-gray-400 mb-8">
              The first digital marketplace for cross-border subscriptions in Nepal. 
              Unlock the global web with local payments.
            </p>
            <div className="flex gap-4">
              {socialIcons.map(({ Icon }, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-white text-black border-[3px] border-white flex items-center justify-center hover:bg-brutalist-cyan hover:-translate-y-1 transition-all shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,240,255,1)]"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Product',
              links: [
                { label: 'Features', href: '#features' },
                { label: 'Marketplace', href: '#' },
                { label: 'eSewa Integration', href: '#' },
                { label: 'Pricing', href: '#pricing' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Sign In', href: '/login' },
                { label: 'Sign Up', href: '/signup' },
                { label: 'Help Center', href: '#' },
                { label: 'System Status', href: '#' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About Us', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Press', href: '#' },
                { label: 'Contact', href: '#' },
              ],
            },
            {
              title: 'Legal',
              links: [
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Cookie Policy', href: '#' },
                { label: 'SLA', href: '#' },
              ],
            },
          ].map((column) => (
            <div key={column.title}>
              <h3 className="text-xl font-black uppercase mb-6 text-brutalist-yellow">{column.title}</h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-bold text-sm uppercase text-gray-400 hover:text-brutalist-cyan hover:underline decoration-2 underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm font-bold uppercase text-gray-500">
            © 2026 CROSSPAY NP. ALL RIGHTS RESERVED. BOLDLY MADE IN NEPAL.
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-brutalist-green rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)]" />
              <span className="text-[10px] font-black uppercase">System Status: Online</span>
            </div>
            <div className="text-[10px] font-black uppercase text-gray-500">
              Last Update: MAY 01, 2026
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
