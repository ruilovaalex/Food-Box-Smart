
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, writeBatch, getDocs, deleteDoc } from "firebase/firestore";
import { Order, OrderStatus, InventoryStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const SYSTEM_COLLECTION = 'system';

export const database = {
  subscribeToOrders: (callback: (orders: Order[]) => void, userId: string, isAdmin: boolean) => {
    if (!userId) return () => {};

    let q = isAdmin 
      ? query(collection(db, ORDERS_COLLECTION))
      : query(collection(db, ORDERS_COLLECTION), where('userId', '==', userId));
    
    return onSnapshot(q, {
      next: (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        callback(orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      },
      error: (error) => {
        console.error("Error suscripción pedidos:", error);
      }
    });
  },

  subscribeToSensors: (callback: (data: { hot: number, cold: number }) => void) => {
     return onSnapshot(doc(db, SYSTEM_COLLECTION, 'sensors'), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback({ hot: data.hot || 0, cold: data.cold || 0 });
        }
     });
  },

  subscribeToInventory: (callback: (inventory: InventoryStatus) => void) => {
    return onSnapshot(doc(db, SYSTEM_COLLECTION, 'inventory'), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as InventoryStatus);
      } else {
        callback({});
      }
    });
  },

  updateProductAvailability: async (productId: number, isAvailable: boolean) => {
    await setDoc(doc(db, SYSTEM_COLLECTION, 'inventory'), {
      [productId.toString()]: isAvailable
    }, { merge: true });
  },

  updateSensors: async (hot: number, cold: number) => {
    await setDoc(doc(db, SYSTEM_COLLECTION, 'sensors'), { hot, cold, lastUpdate: Date.now() }, { merge: true });
  },

  subscribeToBoxStatus: (callback: (status: { isOccupied: boolean, currentUserId: string | null }) => void) => {
    return onSnapshot(doc(db, SYSTEM_COLLECTION, 'box_status'), (docSnap) => {
       if (docSnap.exists()) {
           const data = docSnap.data();
           callback({ 
               isOccupied: data.isOccupied || false, 
               currentUserId: data.currentUserId || null 
           });
       }
    });
  },

  updateBoxStatus: async (isOccupied: boolean, userId: string | null) => {
    await setDoc(doc(db, SYSTEM_COLLECTION, 'box_status'), {
        isOccupied,
        currentUserId: userId,
        lastUpdate: Date.now()
    }, { merge: true });
  },

  subscribeToKeypad: (callback: (data: { key: string, timestamp: number }) => void) => {
    return onSnapshot(doc(db, SYSTEM_COLLECTION, 'keypad_test'), (docSnap) => {
       if (docSnap.exists()) {
           const data = docSnap.data();
           callback({ key: data.key || '', timestamp: data.timestamp || 0 });
       }
    });
  },

  sendKeypress: async (key: string) => {
    await setDoc(doc(db, SYSTEM_COLLECTION, 'keypad_test'), {
        key,
        timestamp: Date.now()
    });
  },

  addOrder: async (order: Order) => {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { status });
  },

  clearDatabase: async () => {
    const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    
    await setDoc(doc(db, SYSTEM_COLLECTION, 'sensors'), { hot: 65, cold: 4 });
    await setDoc(doc(db, SYSTEM_COLLECTION, 'box_status'), { isOccupied: false, currentUserId: null });
    await deleteDoc(doc(db, SYSTEM_COLLECTION, 'keypad_test'));
  }
};
