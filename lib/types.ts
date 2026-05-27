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
  digitalKey?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  serviceId: string;
  serviceName?: string;
  status: string;
  amount: number;
  paymentMethod?: string;
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
