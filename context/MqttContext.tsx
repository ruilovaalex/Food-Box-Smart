
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { database } from '../services/database';
import { useAuth } from './AuthContext';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean;
  resetDatabase: () => void;
  realTemps: { hot: number, cold: number };
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [realTemps, setRealTemps] = useState({ hot: 0, cold: 0 }); 
  const ordersRef = useRef<Order[]>([]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
        await database.updateOrderStatus(orderId, status);
    } catch (error) {
        console.error(`Error actualizando estado:`, error);
    }
  }, []);

  // Suscripción a Pedidos
  useEffect(() => {
    if (!user) {
        setOrders([]);
        return;
    }

    const unsubscribe = database.subscribeToOrders(
        (newOrders) => setOrders(newOrders),
        user.id,
        user.role === 'admin'
    );
    return () => unsubscribe();
  }, [user]);

  // Suscripción a Sensores (Solo para el Admin)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const unsubSensors = database.subscribeToSensors(setRealTemps);
    return () => unsubSensors();
  }, [user]);

  // Worker de cocina optimizado
  useEffect(() => {
    if (!user) return;
    
    const kitchenTimer = setInterval(() => {
        const now = Date.now();
        ordersRef.current.forEach(order => {
            if (order.status === 'pending' && (now - order.createdAt > 5000)) {
                updateOrderStatus(order.id, 'ready');
            }
        });
    }, 3000); 

    return () => clearInterval(kitchenTimer);
  }, [user, updateOrderStatus]); 

  const createOrder = async (order: Order) => {
    try {
        await database.addOrder(order);
    } catch (error) {
        console.error("Error creando orden:", error);
    }
  };

  const simulateBoxKeypadEntry = useCallback((orderId: string, inputCode: string) => {
    const order = ordersRef.current.find(o => o.id === orderId);
    if (!order) return false;
    if (order.code === inputCode) {
      updateOrderStatus(orderId, 'delivered'); 
      return true;
    }
    return false;
  }, [updateOrderStatus]);

  const resetDatabase = useCallback(() => database.clearDatabase(), []);

  const value = React.useMemo(() => ({
    orders, createOrder, updateOrderStatus, simulateBoxKeypadEntry, 
    resetDatabase, realTemps 
  }), [orders, createOrder, updateOrderStatus, simulateBoxKeypadEntry, resetDatabase, realTemps]);

  return (
    <MqttContext.Provider value={value}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within MqttProvider");
  return context;
};
