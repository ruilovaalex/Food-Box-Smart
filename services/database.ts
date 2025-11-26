import { Order } from '../types';

const DB_KEY = 'foodbox_db_production';

export const database = {
  // Obtener todas las órdenes
  getOrders: (): Order[] => {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading from DB", e);
      return [];
    }
  },

  // Guardar todas las órdenes (sobreescribe)
  saveOrders: (orders: Order[]) => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Error saving to DB", e);
    }
  },

  // Agregar una orden individual
  addOrder: (order: Order) => {
    const orders = database.getOrders();
    const newOrders = [order, ...orders];
    database.saveOrders(newOrders);
    return newOrders;
  },

  // Actualizar una orden existente
  updateOrder: (updatedOrder: Order) => {
    const orders = database.getOrders();
    const newOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    database.saveOrders(newOrders);
    return newOrders;
  },

  // Limpiar base de datos (para admin)
  clearDatabase: () => {
    localStorage.removeItem(DB_KEY);
    return [];
  }
};