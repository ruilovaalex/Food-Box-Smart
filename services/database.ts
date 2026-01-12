
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, writeBatch, getDocs, where } from "firebase/firestore";
import { Order, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const SYSTEM_COLLECTION = 'system';

export const database = {
  // Suscribirse a cambios en tiempo real (Pedidos)
  // Ahora acepta userId e isAdmin para filtrar correctamente según las reglas
  subscribeToOrders: (callback: (orders: Order[]) => void, userId?: string, isAdmin?: boolean) => {
    let q;
    
    if (isAdmin) {
        // Los admins pueden ver todo
        q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    } else {
        // Los clientes solo ven lo suyo (requerido por reglas de Firebase)
        q = query(
            collection(db, ORDERS_COLLECTION), 
            where('userId', '==', userId || 'guest'),
            orderBy('createdAt', 'desc')
        );
    }
    
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
    }, (error) => {
        console.error("Error en suscripción de pedidos:", error);
    });
  },

  // Suscribirse a los SENSORES REALES (Solo accesible por Admin)
  subscribeToSensors: (callback: (data: { hot: number, cold: number }) => void) => {
     return onSnapshot(doc(db, SYSTEM_COLLECTION, 'sensors'), (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            callback({
                hot: data.hot || 0,
                cold: data.cold || 0
            });
        }
     }, (error) => {
         console.warn("Acceso denegado a sensores (no eres admin)");
     });
  },

  // Suscribirse a PRUEBAS DE TECLADO FÍSICO (Solo accesible por Admin)
  subscribeToKeypadTest: (callback: (data: { key: string, timestamp: number }) => void) => {
    return onSnapshot(doc(db, SYSTEM_COLLECTION, 'keypad_test'), (doc) => {
       if (doc.exists()) {
           const data = doc.data();
           callback({
               key: data.key || '',
               timestamp: data.timestamp || 0
           });
       }
    }, (error) => {
        console.warn("Acceso denegado a teclado físico (no eres admin)");
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
