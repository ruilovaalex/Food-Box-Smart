import { Product } from './types';

// Mock Products matching the request
export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Hamburguesa + Papas",
    price: 8.50,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 2,
    name: "Ramen",
    price: 6.00,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 3,
    name: "Helado de Cono",
    price: 1.00,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1507316986422-b52994c5dd17?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: 4,
    name: "Té Frío",
    price: 2.00,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=500&q=80"
  }
];

export const MOCK_USER_ID = "user-123";
export const MOCK_ADMIN_ID = "admin-999";