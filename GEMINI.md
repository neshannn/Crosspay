# CrossPay Project Guidelines

Foundational mandates and architectural standards for the CrossPay Frontend project.

## Project Overview
CrossPay is a digital marketplace enabling users in Nepal to access global subscription services (Netflix, Spotify, etc.) using local payment methods like eSewa.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: MySQL (local/managed)
- **ORM**: Drizzle ORM
- **Auth**: Better Auth
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Database & Auth
1. **Schema**: Defined in `lib/db/schema.ts`. Use `npx drizzle-kit push` or manual `ALTER` statements to apply changes.
2. **Better Auth**: Configured in `lib/auth.ts` (server) and `lib/auth-client.ts` (client). Supports `role` field (user/admin).
3. **Environment**: Requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` in `.env`.

## Core Features
### 1. Marketplace & Ordering
- **Subscription Services**: Managed via the `services` table. Supports pricing, icons, categories, and stock limits.
- **Ordering System**: Users can select quantity and payment method (eSewa/Khalti).
- **eSewa Integration**: Uses ePay v2 protocol with HMAC-SHA256 signing. Test secret: `8gBm/:&EnhH.1/q`.
- **Khalti Integration**: Uses Khalti v2 API for digital payments. Test secret: `key 496660f6430a471694f2756d11f016d2`.
- **Stock Management**: Orders automatically decrement stock. UI displays "OUT OF STOCK" when limit reaches 0.

### 2. Admin Dashboard (`/admin/dashboard`)
- Restricted to users with `role: 'admin'`.
- Full CRUD operations for subscription services.
- Real-time inventory monitoring.

## Architectural Patterns
### Data Fetching & Bundling
- **Type Separation**: Always define shared interfaces in `lib/types.ts`.
- **Client vs Server Data**: 
  - `lib/data.ts`: Server-only fetching (DB access). Use for Server Components.
  - `lib/data-client.ts`: Client-safe mock data for landing page/static previews.
- **NEVER** import from `lib/data.ts` in a `'use client'` file to avoid bundling Node.js modules like `mysql2` in the browser.

## Design System: Neo-Brutalist
All UI updates must adhere to the Neo-Brutalist aesthetic established in May 2026.

### Color Palette
- **Yellow**: `#FFE600` (`bg-brutalist-yellow`)
- **Cyan**: `#00F0FF` (`bg-brutalist-cyan`)
- **Magenta**: `#FF00F5` (`bg-brutalist-magenta`)
- **Green**: `#00FF66` (`bg-brutalist-green`)
- **Black**: `#000000` (`bg-brutalist-black`)
- **White**: `#FFFFFF` (`bg-brutalist-white`)

### UI Rules
1. **Borders**: Use thick black borders for all primary containers and buttons. Default is `border-[3px] border-black`.
2. **Shadows**: Use hard, offset shadows instead of blurs. 
   - Standard: `shadow-brutalist` (4px offset)
   - Large: `shadow-brutalist-lg` (8px offset)
3. **Typography**: Use bold, black, or extra-bold weights. Headers should be `uppercase` and `tracking-tighter`.
4. **Interactions**: Buttons and cards should "lift" or "sink" on hover/active states using `framer-motion` or standard CSS transitions.
   - Hover: `-translate-x-1 -translate-y-1 shadow-brutalist-lg`
   - Active: `translate-x-1 translate-y-1 shadow-none`

## Component Standards
- **Client Components**: Use `'use client'` strictly when Interactivity (Framer Motion, hooks, or `authClient`) is required.
- **Data Fetching**: Use `lib/data.ts` for all mock/real data fetching. For auth-protected data, use `auth.api.getSession` on the server.
- **Responsive Design**: Ensure all brutalist elements scale properly. Avoid excessively large shadows on small mobile screens.

## Workflow
- **Migrations**: Always run `npx drizzle-kit push` after modifying `lib/db/schema.ts`.
- **Validation**: Always run `npm run build` after major UI or logic changes to ensure type safety and icon compatibility.
- **Documentation**: Update this file when introducing new architectural patterns or significant design shifts.
