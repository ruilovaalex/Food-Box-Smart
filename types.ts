export type ProductType = 'hot' | 'cold';

export interface Product {
  id: number;
  name: string;
  price: number;
  type: ProductType;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'paid' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userEmail?: string; // Nuevo campo para guardar el correo visible
  items: CartItem[];
  total: number;
  status: OrderStatus;
  code: string; // 4 digit code
  createdAt: number;
  customerDetails?: {
    name: string;
    phone: string;
    paymentMethod: 'cash' | 'card';
  };
  simulatedTemps?: {
    hot: number;
    cold: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}