import { cache } from 'react'
import { db } from './db'
import { services as servicesTable, orders as ordersTable, user as userTable } from './db/schema'
import { Feature, PricingPlan, Testimonial, Service, Order, SalesStats } from './types'
import { desc, eq, sql } from 'drizzle-orm'

export const getFeatures = cache(async (): Promise<Feature[]> => {
  return [
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
})

export const getServices = cache(async (): Promise<Service[]> => {
  try {
    const dbServices = await db.select().from(servicesTable);
    if (dbServices.length > 0) {
      return dbServices.map(s => ({
        id: s.id,
        name: s.name,
        price: Number(s.price),
        description: s.description || '',
        icon: s.icon || '📦',
        category: s.category || 'General',
        stock: Number(s.stock ?? 100),
      }));
    }
  } catch (error) {
    console.error("Failed to fetch services from DB, using mock data:", error);
  }

  return [
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
})

export const getPricingPlans = cache(async (): Promise<PricingPlan[]> => {
  return [
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
})

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  return [
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
})

export const getOrders = cache(async (): Promise<Order[]> => {
  try {
    const dbOrders = await db.select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      userName: userTable.name,
      userEmail: userTable.email,
      serviceId: ordersTable.serviceId,
      serviceName: servicesTable.name,
      status: ordersTable.status,
      amount: ordersTable.amount,
      paymentMethod: ordersTable.paymentMethod,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(userTable, eq(ordersTable.userId, userTable.id))
    .leftJoin(servicesTable, eq(ordersTable.serviceId, servicesTable.id))
    .orderBy(desc(ordersTable.createdAt));

    return dbOrders.map(o => ({
      ...o,
      amount: Number(o.amount),
    }));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
});

export const getSalesStats = cache(async (): Promise<SalesStats> => {
  try {
    const orders = await getOrders();
    
    const totalRevenue = orders
      .filter(o => o.status === 'completed' || o.status === 'success' || o.status === 'paid')
      .reduce((sum, o) => sum + o.amount, 0);

    const revenueByService: { [key: string]: { revenue: number, count: number } } = {};
    
    orders.forEach(o => {
      const sName = o.serviceName || 'Unknown';
      if (!revenueByService[sName]) {
        revenueByService[sName] = { revenue: 0, count: 0 };
      }
      revenueByService[sName].count += 1;
      if (o.status === 'completed' || o.status === 'success' || o.status === 'paid') {
        revenueByService[sName].revenue += o.amount;
      }
    });

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'awaiting_payment').length,
      completedOrders: orders.filter(o => o.status === 'completed' || o.status === 'success' || o.status === 'paid').length,
      revenueByService: Object.entries(revenueByService).map(([name, data]) => ({
        serviceName: name,
        revenue: data.revenue,
        count: data.count,
      })).sort((a, b) => b.revenue - a.revenue),
    };
  } catch (error) {
    console.error("Failed to calculate sales stats:", error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      revenueByService: [],
    };
  }
});

export const getUserOrders = cache(async (userId: string): Promise<Order[]> => {
  try {
    const dbOrders = await db.select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      serviceId: ordersTable.serviceId,
      serviceName: servicesTable.name,
      status: ordersTable.status,
      amount: ordersTable.amount,
      paymentMethod: ordersTable.paymentMethod,
      createdAt: ordersTable.createdAt,
    })
    .from(ordersTable)
    .leftJoin(servicesTable, eq(ordersTable.serviceId, servicesTable.id))
    .where(eq(ordersTable.userId, userId))
    .orderBy(desc(ordersTable.createdAt));

    return dbOrders.map(o => ({
      ...o,
      amount: Number(o.amount),
    }));
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
    return [];
  }
});
