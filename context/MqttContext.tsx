
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { database } from '../services/database';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean;
  resetDatabase: () => void;
  realTemps: { hot: number, cold: number };
  lastPhysicalKeyPress: { key: string, timestamp: number } | null; // Nuevo estado para pruebas
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [realTemps, setRealTemps] = useState({ hot: 0, cold: 0 }); 
  const [lastPhysicalKeyPress, setLastPhysicalKeyPress] = useState<{ key: string, timestamp: number } | null>(null);
  
  const ordersRef = useRef<Order[]>([]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // 1. Suscripción a Pedidos (Firebase)
  useEffect(() => {
    const unsubscribe = database.subscribeToOrders((newOrders) => {
      setOrders(currentOrders => {
        return newOrders.map(newOrder => {
            return {
                ...newOrder,
                simulatedTemps: { hot: 0, cold: 0 }
            };
        });
      });
    });
    return () => unsubscribe();
  }, []);

  // 2. Suscripción a SENSORES REALES (Firebase)
  useEffect(() => {
      const unsubscribe = database.subscribeToSensors((data) => {
          setRealTemps(data);
      });
      return () => unsubscribe();
  }, []);

  // 3. NUEVO: Suscripción a TECLADO FÍSICO (Pruebas)
  useEffect(() => {
    const unsubscribe = database.subscribeToKeypadTest((data) => {
        console.log("🎹 Tecla Física Detectada:", data);
        setLastPhysicalKeyPress(data);
    });
    return () => unsubscribe();
  }, []);

  // 4. WORKER DE COCINA (Respaldo Automático)
  useEffect(() => {
    const kitchenTimer = setInterval(() => {
        const now = Date.now();
        ordersRef.current.forEach(order => {
            if (order.status === 'pending' && (now - order.createdAt > 3000)) {
                updateOrderStatus(order.id, 'ready');
            }
        });
    }, 1000); 

    return () => clearInterval(kitchenTimer);
  }, []); 

  const createOrder = async (order: Order) => {
    try {
        await database.addOrder(order);
    } catch (error) {
        console.error("Error creando orden:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
        await database.updateOrderStatus(orderId, status);
    } catch (error) {
        console.error(`Error actualizando estado:`, error);
    }
  };

  const simulateBoxKeypadEntry = (orderId: string, inputCode: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return false;

    if (order.code === inputCode) {
      updateOrderStatus(orderId, 'delivered'); 
      return true;
    }
    return false;
  };

  const resetDatabase = () => {
      database.clearDatabase();
  };

  const ordersWithRealTemps = orders.map(o => ({
      ...o,
      simulatedTemps: realTemps
  }));

  return (
    <MqttContext.Provider value={{ orders: ordersWithRealTemps, createOrder, updateOrderStatus, simulateBoxKeypadEntry, resetDatabase, realTemps, lastPhysicalKeyPress }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within MqttProvider");
  return context;
};
