
export type ProductType = 'hot' | 'cold';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number; // Para mostrar descuentos
  type: ProductType;
  image: string;
  isAvailable?: boolean;
  onSale?: boolean; // Indica si tiene oferta activa
  saleText?: string; // Texto de la oferta (ej: "2x1", "15% OFF")
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

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'critical' | 'offer';
  timestamp: number;
  read: boolean;
}
