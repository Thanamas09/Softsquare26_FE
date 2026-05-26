export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Customer';
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Product {
  productId: number;
  productName: string;
  price: number;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface ProductInput {
  productName: string;
  price: number;
  categoryId: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  customerId: number;
  customerName: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  type: 'Dine-in' | 'Takeaway' | 'Delivery';
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderInput {
  customerId: number;
  title: string;
  description: string;
  type: string;
  items: { productId: number; quantity: number }[];
}

export interface DashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSales: number;
  recentOrders: Order[];
  topProducts: {
    productId: number;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}
