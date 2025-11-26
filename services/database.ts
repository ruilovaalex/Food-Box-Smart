
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, writeBatch, getDocs } from "firebase/firestore";
import { Order, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';

export const database = {
  // Suscribirse a cambios en tiempo real
  subscribeToOrders: (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    
    // onSnapshot escucha cambios en la DB y ejecuta el callback automáticamente
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => {
          const d = doc.data();
          // Sanitizamos los datos para evitar crashes si la DB tiene basura
          return {
              id: d.id || doc.id,
              userId: d.userId || 'Guest',
              items: d.items || [],
              total: typeof d.total === 'number' ? d.total : 0,
              status: d.status || 'pending',
              code: d.code || '----',
              createdAt: d.createdAt || Date.now(),
              customerDetails: d.customerDetails || null,
              simulatedTemps: d.simulatedTemps || null
          } as Order;
      });
      callback(orders);
    });
  },

  // Agregar una orden (Usamos setDoc para definir nosotros el ID)
  addOrder: async (order: Order) => {
    // No guardamos las temperaturas simuladas en la DB para ahorrar escrituras
    const { simulatedTemps, ...orderData } = order;
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), orderData);
  },

  // Actualizar una orden completa
  updateOrder: async (order: Order) => {
    const { simulatedTemps, ...orderData } = order;
    await updateDoc(doc(db, ORDERS_COLLECTION, order.id), orderData as any);
  },

  // Helper para actualizar solo el estado
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { status });
  },

  // Limpiar base de datos (Admin)
  clearDatabase: async () => {
    const q = query(collection(db, ORDERS_COLLECTION));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
  }
};
    