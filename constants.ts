
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Hamburguesa + Papas",
    price: 6.80,
    originalPrice: 8.50,
    type: 'hot',
    onSale: true,
    saleText: "20% OFF",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: 2,
    name: "Ramen Tonkotsu",
    price: 12.00,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Helado de Cono",
    price: 2.50,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Té Frío Matcha",
    price: 2.10,
    originalPrice: 3.50,
    type: 'cold',
    onSale: true,
    saleText: "REBAJADO",
    image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Pizza Pepperoni",
    price: 9.99,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Tacos al Pastor",
    price: 7.50,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Sushi Roll Salmón",
    price: 14.00,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Bowl de Frutas",
    price: 5.50,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Pasta Carbonara",
    price: 11.50,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 10,
    name: "Ensalada César",
    price: 8.00,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=800&auto=format&fit=crop"
  }
];

export const MOCK_USER_ID = "user-123";
export const MOCK_ADMIN_ID = "admin-999";
