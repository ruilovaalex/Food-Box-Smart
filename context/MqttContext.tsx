
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { database } from '../services/database';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean;
  resetDatabase: () => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Usamos una referencia para mantener el acceso al estado más reciente de las órdenes
  // dentro de los intervalos (setInterval) sin necesidad de reiniciar el temporizador
  // cada vez que el estado cambia. Esto soluciona el bloqueo en "Preparando".
  const ordersRef = useRef<Order[]>([]);

  // Sincronizar la referencia con el estado cada vez que cambie
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // 1. Suscripción a Firebase (Tiempo Real)
  useEffect(() => {
    const unsubscribe = database.subscribeToOrders((newOrders) => {
      setOrders(currentOrders => {
        // Fusionar datos de Firebase con temperaturas simuladas locales
        return newOrders.map(newOrder => {
            const existing = currentOrders.find(o => o.id === newOrder.id);
            return {
                ...newOrder,
                simulatedTemps: existing?.simulatedTemps // Mantener temp local
            };
        });
      });
    });

    return () => unsubscribe();
  }, []);

  // 2. Simulación de Sensores (Local - No afecta Firebase)
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (['pending', 'paid', 'ready'].includes(order.status)) {
            const currentHot = order.simulatedTemps?.hot || 60;
            const currentCold = order.simulatedTemps?.cold || 4;
            
            const newHot = currentHot + (Math.random() - 0.5); 
            const newCold = currentCold + (Math.random() - 0.5);

            return {
              ...order,
              simulatedTemps: {
                hot: parseFloat(newHot.toFixed(1)),
                cold: parseFloat(newCold.toFixed(1))
              }
            };
          }
          return order;
        });
      });
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  // 3. WORKER DE COCINA (Respaldo Automático)
  // Ahora usa ordersRef para NO reiniciar el intervalo con cada renderizado.
  useEffect(() => {
    const kitchenTimer = setInterval(() => {
        const now = Date.now();
        // Leemos desde la referencia (siempre actualizada) sin romper el ciclo del timer
        ordersRef.current.forEach(order => {
            // Si la orden está pendiente y pasó el tiempo de "cocción" (simulado)
            if (order.status === 'pending' && (now - order.createdAt > 3000)) {
                console.log(`[COCINA] La orden ${order.code} está lista. Actualizando...`);
                updateOrderStatus(order.id, 'ready');
            }
        });
    }, 1000); // Revisamos cada segundo para mayor reactividad

    return () => clearInterval(kitchenTimer);
  }, []); // Dependencias vacías = El timer nunca se detiene/reinicia

  const createOrder = async (order: Order) => {
    try {
        console.log(`[APP] Enviando orden ${order.code} a Firebase...`);
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
    // Usamos la referencia para buscar, asegurando tener los datos más recientes
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

  return (
    <MqttContext.Provider value={{ orders, createOrder, updateOrderStatus, simulateBoxKeypadEntry, resetDatabase }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within MqttProvider");
  return context;
};
