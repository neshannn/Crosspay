import { Feature, PricingPlan, Testimonial, Service } from './types'

export const mockFeatures: Feature[] = [
  {
    icon: '💳',
    title: 'Dual Payment Gateway',
    description: 'Seamlessly switch between Stripe for international cards and eSewa for local transactions.',
  },
  {
    icon: '🔒',
    title: 'Bank-Level Security',
    description: 'PCI DSS compliant with end-to-end encryption for all payment data.',
  },
  {
    icon: '🌍',
    title: 'Cross-Border Access',
    description: 'Access global subscription services from Nepal with regional pricing.',
  },
  {
    icon: '⚡',
    title: 'Instant Activation',
    description: 'Get your subscriptions activated within seconds of payment confirmation.',
  },
  {
    icon: '📱',
    title: 'Mobile First',
    description: 'Optimized for mobile devices with a smooth, native-like experience.',
  },
  {
    icon: '💰',
    title: 'NPR Pricing',
    description: 'Pay in Nepalese Rupees with transparent pricing and no hidden fees.',
  },
]

export const mockServices: Service[] = [
  {
    id: 'netflix-1',
    name: 'Netflix Premium',
    price: 1500,
    description: '4K + HDR, 4 Screens at once. Global access.',
    icon: '🎬',
    category: 'Streaming',
  },
  {
    id: 'spotify-1',
    name: 'Spotify Family',
    price: 500,
    description: '6 accounts, Ad-free music, Offline play.',
    icon: '🎵',
    category: 'Music',
  },
  {
    id: 'youtube-1',
    name: 'YouTube Premium',
    price: 300,
    description: 'Ad-free, Background play, YT Music.',
    icon: '📺',
    category: 'Entertainment',
  },
  {
    id: 'canva-1',
    name: 'Canva Pro',
    price: 800,
    description: 'Premium templates, Brand kit, Background remover.',
    icon: '🎨',
    category: 'Design',
  },
  {
    id: 'adobe-1',
    name: 'Adobe Creative Cloud',
    price: 4500,
    description: 'All 20+ Adobe apps, Cloud storage.',
    icon: '🖌️',
    category: 'Design',
  },
  {
    id: 'chatgpt-1',
    name: 'ChatGPT Plus',
    price: 2800,
    description: 'Access to GPT-4, Faster response, Priority access.',
    icon: '🤖',
    category: 'AI',
  },
]

export const mockPricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for trying out the platform',
    features: [
      'Up to 3 subscriptions',
      'Basic support',
      'Email notifications',
      'Standard processing',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: 'NPR 499/mo',
    description: 'For power users and small teams',
    features: [
      'Unlimited subscriptions',
      'Priority support',
      'SMS notifications',
      'Instant processing',
      'Advanced analytics',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Bulk discounts',
    ],
    popular: false,
  },
]

export const mockTestimonials: Testimonial[] = [
  {
    name: 'Rajesh Karki',
    role: 'Software Engineer',
    content: 'Finally, a platform that lets me access all my favorite tools without the hassle of international payments.',
    avatar: '👨‍💻',
  },
  {
    name: 'Sita Thapa',
    role: 'Digital Nomad',
    content: 'The eSewa integration is a game-changer. I can pay for my subscriptions in NPR without any issues.',
    avatar: '👩‍💼',
  },
  {
    name: 'Bikash Shrestha',
    role: 'Startup Founder',
    content: 'CrossPay has simplified our team\'s subscription management. Highly recommended for any Nepali business.',
    avatar: '👨‍🎓',
  },
]
