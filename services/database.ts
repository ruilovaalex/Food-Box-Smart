
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, writeBatch, getDocs } from "firebase/firestore";
import { Order, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const SYSTEM_COLLECTION = 'system';

export const database = {
  // Suscribirse a cambios en tiempo real (Pedidos)
  subscribeToOrders: (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
              id: d.id || doc.id,
              userId: d.userId || 'Guest',
              userEmail: d.userEmail || '',
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

  // Suscribirse a los SENSORES REALES (Nuevo)
  subscribeToSensors: (callback: (data: { hot: number, cold: number }) => void) => {
     // Escuchamos el documento 'system/sensors'
     return onSnapshot(doc(db, SYSTEM_COLLECTION, 'sensors'), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            callback({
                hot: data.hot || 0,   // Temperatura del sensor real
                cold: data.cold || 0  // Futuro sensor 2
            });
        }
     });
  },

  addOrder: async (order: Order) => {
    const { simulatedTemps, ...orderData } = order;
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), orderData);
  },

  updateOrder: async (order: Order) => {
    const { simulatedTemps, ...orderData } = order;
    await updateDoc(doc(db, ORDERS_COLLECTION, order.id), orderData as any);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { status });
  },

  clearDatabase: async () => {
    const q = query(collection(db, ORDERS_COLLECTION));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
};
