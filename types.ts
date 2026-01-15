
export type ProductType = 'hot' | 'cold';

export interface Product {
  id: number;
  name: string;
  price: number;
  type: ProductType;
  image: string;
  isAvailable?: boolean; // Campo opcional para disponibilidad
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'paid' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  userEmail?: string; 
  items: CartItem[];
  total: number;
  status: OrderStatus;
  code: string; 
  createdAt: number;
  customerDetails?: {
    name: string;
    phone: string;
    paymentMethod: 'cash' | 'card';
  };
}

export interface InventoryStatus {
  [productId: string]: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'admin';
}
