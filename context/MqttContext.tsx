
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { database } from '../services/database';
import { BOX_MASTER_CODE } from '../constants';
import { useAuth } from './AuthContext';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean;
  resetDatabase: () => void;
  realTemps: { hot: number, cold: number };
  lastPhysicalKeyPress: { key: string, timestamp: number } | null;
  physicalBuffer: string; 
  setPhysicalBuffer: (val: string) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Obtenemos el usuario para manejar permisos
  const [orders, setOrders] = useState<Order[]>([]);
  const [realTemps, setRealTemps] = useState({ hot: 0, cold: 0 }); 
  const [lastPhysicalKeyPress, setLastPhysicalKeyPress] = useState<{ key: string, timestamp: number } | null>(null);
  const [physicalBuffer, setPhysicalBuffer] = useState('');
  
  const ordersRef = useRef<Order[]>([]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // 1. Suscripción a Pedidos (Filtrada por Usuario para evitar Permission Denied)
  useEffect(() => {
    if (!user) {
        setOrders([]);
        return;
    }

    const isAdmin = user.role === 'admin';
    const unsubscribe = database.subscribeToOrders(
        (newOrders) => setOrders(newOrders),
        user.id,
        isAdmin
    );
    return () => unsubscribe();
  }, [user]);

  // 2. Suscripción a Sensores y Teclado (SOLO PARA ADMINS)
  useEffect(() => {
      if (!user || user.role !== 'admin') return;

      const unsubSensors = database.subscribeToSensors((data) => {
          setRealTemps(data);
      });

      const unsubKeypad = database.subscribeToKeypadTest((data) => {
          if (!data || !data.key) return;
          setLastPhysicalKeyPress(data);
          
          const key = data.key;
          if (key === '*' || key === '#') {
              setPhysicalBuffer('');
          } else {
              setPhysicalBuffer(prev => {
                  const newBuffer = (prev + key).slice(-4);
                  if (newBuffer === BOX_MASTER_CODE) {
                      const readyOrder = ordersRef.current.find(o => o.status === 'ready');
                      if (readyOrder) {
                          updateOrderStatus(readyOrder.id, 'delivered');
                          return ''; 
                      }
                  }
                  return newBuffer;
              });
          }
      });

      return () => {
          unsubSensors();
          unsubKeypad();
      };
  }, [user]);

  // 3. Worker de cocina (Solo se ejecuta si hay un usuario activo)
  useEffect(() => {
    if (!user) return;

    const kitchenTimer = setInterval(() => {
        const now = Date.now();
        ordersRef.current.forEach(order => {
            // Solo intentamos actualizar pedidos si somos el dueño o somos admin
            // Firebase rechazará la actualización si no tenemos permiso
            if (order.status === 'pending' && (now - order.createdAt > 3000)) {
                // Verificación local extra de seguridad
                const canUpdate = user.role === 'admin' || order.userId === user.id;
                if (canUpdate) {
                    updateOrderStatus(order.id, 'ready');
                }
            }
        });
    }, 2000); 

    return () => clearInterval(kitchenTimer);
  }, [user]); 

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
