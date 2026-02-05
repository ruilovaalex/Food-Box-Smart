
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Burger Supreme + Fries",
    price: 5.50,
    originalPrice: 7.00,
    type: 'hot',
    onSale: true,
    saleText: "OFERTA HOY",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop" 
  },
  {
    id: 2,
    name: "Ramen Tonkotsu Pro",
    price: 5.99,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Sushi Roll Premium",
    price: 5.85,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Ensalada de frutas de mango",
    price: 3.50,
    originalPrice: 4.50,
    type: 'cold',
    onSale: true,
    saleText: "HEALTHY DAY",
    image: "https://images.unsplash.com/photo-1568308853224-1f17b4084076?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: 5,
    name: "Rebanada de pizza",
    price: 2.50,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Tacos al Pastor (x3)",
    price: 4.50,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Ensalada César Pollo",
    price: 4.99,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Iced Caramel Macchiato",
    price: 3.75,
    type: 'cold',
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Lasagna Bolognesa",
    price: 5.75,
    type: 'hot',
    image: "https://images.unsplash.com/photo-1619895092538-128341789043?q=80&w=800&auto=format&fit=crop"
  }
];

export const MOCK_USER_ID = "user-123";
export const MOCK_ADMIN_ID = "admin-999";
