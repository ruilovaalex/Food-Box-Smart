
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { database } from '../services/database';
import { BOX_MASTER_CODE } from '../constants';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean;
  resetDatabase: () => void;
  realTemps: { hot: number, cold: number };
  lastPhysicalKeyPress: { key: string, timestamp: number } | null;
  physicalBuffer: string; // Buffer global compartido
  setPhysicalBuffer: (val: string) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [realTemps, setRealTemps] = useState({ hot: 0, cold: 0 }); 
  const [lastPhysicalKeyPress, setLastPhysicalKeyPress] = useState<{ key: string, timestamp: number } | null>(null);
  const [physicalBuffer, setPhysicalBuffer] = useState('');
  
  const ordersRef = useRef<Order[]>([]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // 1. Suscripción a Pedidos
  useEffect(() => {
    const unsubscribe = database.subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, []);

  // 2. Suscripción a Sensores
  useEffect(() => {
      const unsubscribe = database.subscribeToSensors((data) => {
          setRealTemps(data);
      });
      return () => unsubscribe();
  }, []);

  // 3. Suscripción a Teclado Físico y Lógica de Apertura
  useEffect(() => {
    const unsubscribe = database.subscribeToKeypadTest((data) => {
        if (!data || !data.key) return;
        
        setLastPhysicalKeyPress(data);
        
        // Lógica de buffer
        const key = data.key;
        if (key === '*' || key === '#') {
            setPhysicalBuffer('');
        } else {
            setPhysicalBuffer(prev => {
                const newBuffer = (prev + key).slice(-4); // Mantener últimos 4 dígitos
                
                // Si el buffer coincide con la contraseña maestra
                if (newBuffer === BOX_MASTER_CODE) {
                    // Buscar el primer pedido 'ready' para entregarlo
                    const readyOrder = ordersRef.current.find(o => o.status === 'ready');
                    if (readyOrder) {
                        console.log("🔓 Contraseña correcta! Abriendo para pedido:", readyOrder.id);
                        updateOrderStatus(readyOrder.id, 'delivered');
                        return ''; // Limpiar buffer tras éxito
                    }
                }
                return newBuffer;
            });
        }
    });
    return () => unsubscribe();
  }, []);

  // 4. Worker de cocina (Simulación de preparación)
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
        throw error;
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
    if (inputCode === BOX_MASTER_CODE) {
      updateOrderStatus(orderId, 'delivered'); 
      return true;
    }
    return false;
  };

  const resetDatabase = () => {
      database.clearDatabase();
  };

  return (
    <MqttContext.Provider value={{ 
        orders, 
        createOrder, 
        updateOrderStatus, 
        simulateBoxKeypadEntry, 
        resetDatabase, 
        realTemps, 
        lastPhysicalKeyPress,
        physicalBuffer,
        setPhysicalBuffer
    }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within MqttProvider");
  return context;
};
