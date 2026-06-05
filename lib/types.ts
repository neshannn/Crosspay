export interface Feature {
  icon: string
  title: string
  description: string
}

export interface PricingPlan {
  name: string
  price: string
  description: string
  features: string[]
  popular: boolean
}

export interface Testimonial {
  name: string
  role: string
  content: string
  avatar: string
}

export interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  category: string;
  stock: number;
  active?: boolean;
  digitalKey?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  serviceId: string | null;
  serviceName?: string | null;
  status: string;
  amount: number;
  paymentMethod?: string | null;
  createdAt: Date;
}

export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenueByService: {
    serviceName: string;
    revenue: number;
    count: number;
  }[];
}
