# CrossPay - Digital Subscription Marketplace (Nepal)

## Project Overview
A Next.js-based digital marketplace for cross-border subscription services specifically targeting the Nepalese market. Supports both Stripe and eSewa payment integrations.

## Tech Stack
- **Next.js 16.2.4** with App Router and Cache Components
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Next.js MCP** for agent communication
- **Stripe + eSewa** for payment processing

## Core Architecture
- Server Components by default (Next.js 16+ paradigm)
- Client Components only when specific interactivity required
- "use cache" directive for performance optimization
- Server Actions for secure data mutations

## Data Flow Patterns
```typescript
// Server Components (default)
export async function Component() {
  const data = await fetch('...');
  return <UI data={data} />;
}

// Client Components (use sparingly)
'use client'
export function InteractiveComponent() {
  return <... />;
}

// Cache optimization
'use cache'
export const getProducts = cache(async () => {
  return await fetch('...');
});
```

## File Structure
```
app/
├── (landing)/            # Landing page with Next.js 16 App Router
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Landing layout
│   └── globals.css        # Global styles
├── products/              # Product pages
├── categories/            # Category pages
├── checkout/              # Secure checkout flow
└── api/                   # Route handlers
components/
├── ui/                    # Shareable UI components
├── landing/               # Landing page components
├── products/              # Product components
└── checkout/              # Checkout components
lib/
├── api/                   # API utilities
├── auth/                  # Authentication
├── payment/               # Payment processing
└── utils/                 # Helper functions
styles/
├── tailwind.config.js     # Tailwind configuration
├── globals.css           # Global styles
└── components.css        # Component styles
```

## Payment Integration Strategy
- **Stripe**: Primary payment processor for international cards
- **eSewa**: Nepalese payment gateway integration
- **Fallback mechanisms** for both systems
- **Regional compliance** (KYC, local regulations)

## Styling Guidelines
- **Tailwind CSS** with consistent spacing scale
- **Responsive design** mobile-first approach
- **Dark/light theme** support planned
- **Accessibility** (WCAG 2.1 compliant)
- **Performance-focused** (purge unused styles)

## Component Design Patterns
- **Server Components first** for better performance
- **Suspense boundaries** for progressive enhancement
- **Error boundaries** for graceful degradation
- **Loading states** as separate components
- **Minimal client javascript**

## Security Best Practices
- Server Actions for form handling
- Input validation on server
- Payment data never touches client
- Geographic restrictions via headers
- Rate limiting via Route Handlers

## Environment Configuration
```bash
# Payment Providers
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
ESHWA_API_KEY=
ESHWA_MERCHANT_ID=

# Application
NEXTAUTH_URL=
NEXTAUTH_SECRET=
DATABASE_URL=

# Regional Settings
DEFAULT_LOCALE=ne
CURRENCY=NPR
```

## Development Workflow
1. **Server Components** by default
2. **Client Components** only when needed
3. **use cache** directive for static content
4. **Route Handlers** for API endpoints
5. **Server Actions** for mutations
6. **Testing** with Playwright integration

## Performance Optimization
- **Static generation** for product catalogs
- **Incremental Static Regeneration** (ISR) for updates
- **Edge caching** for global CDN distribution
- **Image optimization** with next/image
- **Font optimization** with next/font

## Regional Considerations
- **Nepali language support** (unicode, fonts)
- **Local payment methods** (eSewa, Khalti)
- **Tax compliance** (VAT rules for Nepal)
- **Local regulations** (data residency)
- **Currency display** (NPR formatting)

## Quality Checklist
- [ ] All components reference Next.js docs
- [ ] Server Components used where applicable
- [ ] Clean git history
- [ ] TypeScript strict mode enabled
- [ ] Accessibility audited
- [ ] Performance metrics > 90%
- [ ] Payment flow tested
- [ ] Mobile responsiveness verified
- [ ] Environment variables secured