import { Product } from './types';

// NOTA: Asegúrate de guardar tus imágenes en la carpeta 'public/images/' de tu proyecto.
// Ejemplo: public/images/hamburguesa.png

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Hamburguesa + Papas",
    price: 8.50,
    type: 'hot',
    // Cambia esto por el nombre real de tu archivo
    image: "/images/hamburguesa.png" 
  },
  {
    id: 2,
    name: "Ramen",
    price: 6.00,
    type: 'hot',
    image: "/images/ramen.png"
  },
  {
    id: 3,
    name: "Helado de Cono",
    price: 1.00,
    type: 'cold',
    image: "/images/helado.png"
  },
  {
    id: 4,
    name: "Té Frío",
    price: 2.00,
    type: 'cold',
    image: "/images/te.png"
  }
];

export const MOCK_USER_ID = "user-123";
export const MOCK_ADMIN_ID = "admin-999";