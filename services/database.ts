
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, writeBatch, getDocs, deleteDoc } from "firebase/firestore";
import { Order, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const SYSTEM_COLLECTION = 'system';

export const database = {
  // Suscribirse filtrando por usuario si no es Admin
  subscribeToOrders: (callback: (orders: Order[]) => void, userId: string, isAdmin: boolean) => {
    if (!userId) return () => {};

    let q;
    if (isAdmin) {
      q = query(collection(db, ORDERS_COLLECTION));
    } else {
      q = query(
        collection(db, ORDERS_COLLECTION), 
        where('userId', '==', userId)
      );
    }
    
    return onSnapshot(q, {
      next: (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));

        const sortedOrders = orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(sortedOrders);
      },
      error: (error) => {
        console.error("Firestore Subscription Error:", error);
        callback([]);
      }
    });
  },

  subscribeToSensors: (callback: (data: { hot: number, cold: number }) => void) => {
     return onSnapshot(doc(db, SYSTEM_COLLECTION, 'sensors'), {
        next: (doc) => {
          if (doc.exists()) {
              const data = doc.data();
              callback({ hot: data.hot || 0, cold: data.cold || 0 });
          }
        },
        error: (err) => console.warn("Error sensores:", err)
     });
  },

  subscribeToKeypadTest: (callback: (data: { key: string, timestamp: number }) => void) => {
    return onSnapshot(doc(db, SYSTEM_COLLECTION, 'keypad_test'), {
       next: (doc) => {
         if (doc.exists()) {
             const data = doc.data();
             callback({ key: data.key || '', timestamp: data.timestamp || 0 });
         }
       },
       error: (err) => console.warn("Error teclado:", err)
    });
  },

  addOrder: async (order: Order) => {
    const { simulatedTemps, ...orderData } = order;
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), orderData);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { status });
  },

  clearDatabase: async () => {
    try {
      console.log("Comenzando proceso de limpieza...");
      const ordersRef = collection(db, ORDERS_COLLECTION);
      const snapshot = await getDocs(ordersRef);
      
      if (snapshot.empty) {
        console.log("Historial ya está vacío.");
        return;
      }

      console.log(`Se encontraron ${snapshot.size} órdenes para eliminar.`);
      
      // Usamos batches de 500 para eficiencia
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += 500) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + 500);
        chunk.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        console.log(`Lote de ${chunk.length} eliminado.`);
      }

      console.log("¡Base de datos reseteada con éxito!");
    } catch (error: any) {
      console.error("Error al resetear base de datos:", error);
      if (error.code === 'permission-denied') {
        throw new Error("No tienes permiso para borrar. Asegúrate de haber añadido 'allow delete' en las reglas de Firebase.");
      }
      throw error;
    }
  }
};
