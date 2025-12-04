
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Hamburguesa + Papas",
    price: 8.50,
    type: 'hot',
    // Foto real, jugosa y de alta calidad
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: 2,
    name: "Ramen",
    price: 6.00,
    type: 'hot',
    // Foto real de un bowl de ramen visto desde arriba
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Helado de Cono",
    price: 1.00,
    type: 'cold',
    // Foto real de un helado, no dibujo
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Té Frío",
    price: 2.00,
    type: 'cold',
    // Foto real de un vaso de té helado
    image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=800&auto=format&fit=crop"
  }
];

export const MOCK_USER_ID = "user-123";
export const MOCK_ADMIN_ID = "admin-999";
