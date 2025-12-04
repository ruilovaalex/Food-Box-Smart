
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Hamburguesa + Papas",
    price: 8.50,
    type: 'hot',
    // Usamos una imagen online para asegurar que se vea en el despliegue
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: 2,
    name: "Ramen",
    price: 6.00,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Helado de Cono",
    price: 1.00,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1549395156-e8c1e9f43ad7?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Té Frío",
    price: 2.00,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=800&auto=format&fit=crop"
  }
];

export const MOCK_USER_ID = "user-123";
export const MOCK_ADMIN_ID = "admin-999";
