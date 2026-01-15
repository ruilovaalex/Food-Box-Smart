
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Order, OrderStatus } from '../types';
import { database } from '../services/database';
import { useAuth } from './AuthContext';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmOrderDelivery: (orderId: string) => Promise<void>;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean;
  resetDatabase: () => void;
  realTemps: { hot: number, cold: number };
  physicalKeyPress: { key: string, timestamp: number } | null;
  boxStatus: { isOccupied: boolean, currentUserId: string | null };
  keyBuffer: string;
  setKeyBuffer: React.Dispatch<React.SetStateAction<string>>;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [realTemps, setRealTemps] = useState({ hot: 65, cold: 4 }); 
  const [physicalKeyPress, setPhysicalKeyPress] = useState<{ key: string, timestamp: number } | null>(null);
  const [boxStatus, setBoxStatus] = useState({ isOccupied: false, currentUserId: null as string | null });
  const [keyBuffer, setKeyBuffer] = useState('');
  
  const ordersRef = useRef<Order[]>([]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  // 1. Pedidos
  useEffect(() => {
    if (!user) return;
    const unsub = database.subscribeToOrders(setOrders, user.id, user.role === 'admin');
    return () => unsub();
  }, [user]);

  // 2. Sensores, Teclado y Estado de la Caja
  useEffect(() => {
    if (!user) return;

    const unsubSensors = database.subscribeToSensors(setRealTemps);
    const unsubBoxStatus = database.subscribeToBoxStatus(setBoxStatus);

    const unsubKeypad = database.subscribeToKeypad((data) => {
        setPhysicalKeyPress(data);
        if (!data.key) return;

        if (data.key === '*' || data.key === '#') {
            setKeyBuffer('');
        } else {
            setKeyBuffer(prev => {
                // Solo guardamos los últimos 4 dígitos
                const newBuf = (prev + data.key).slice(-4);
                return newBuf;
            });
        }
    });
    
    return () => {
        unsubSensors();
        unsubKeypad();
        unsubBoxStatus();
    };
  }, [user]);

  // 3. Simulación de Cocina
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
        const now = Date.now();
        ordersRef.current.forEach(order => {
            if (order.status === 'pending' && (now - order.createdAt > 4000)) {
                updateOrderStatus(order.id, 'ready');
            }
        });
    }, 2000); 
    return () => clearInterval(timer);
  }, [user]); 

  const createOrder = async (order: Order) => {
    await database.updateBoxStatus(true, order.userId);
    await database.addOrder(order);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => database.updateOrderStatus(orderId, status);

  const confirmOrderDelivery = async (orderId: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (order) {
        await database.updateBoxStatus(true, order.userId);
        await updateOrderStatus(orderId, 'delivered');
        setKeyBuffer(''); // Limpiamos el buffer tras confirmar
        
        // Liberar automáticamente tras el tiempo de retiro
        setTimeout(() => {
            database.updateBoxStatus(false, null);
        }, 8000);
    }
  };

  const simulateBoxKeypadEntry = (orderId: string, inputCode: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (order && order.code === inputCode) {
        // En el simulador manual, si se pide explícitamente simular la entrada completa,
        // simplemente seteamos el buffer para que el botón aparezca
        setKeyBuffer(inputCode);
        return true;
    }
    return false;
  };

  const resetDatabase = () => database.clearDatabase();

  return (
    <MqttContext.Provider value={{ 
        orders, createOrder, updateOrderStatus, confirmOrderDelivery, simulateBoxKeypadEntry, 
        resetDatabase, realTemps, physicalKeyPress, boxStatus, keyBuffer, setKeyBuffer
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
