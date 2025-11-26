import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus } from '../types';
import { database } from '../services/database';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean; // Admin helper
  resetDatabase: () => void; // Admin helper
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

// This simulates the Backend + MQTT Broker + ESP32 Logic + Database persistence
export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from database on mount
  useEffect(() => {
    const loadedOrders = database.getOrders();
    setOrders(loadedOrders);
  }, []);

  // Simulate Real-time Temperature MQTT updates from ESP32
  // We do NOT save these temp fluctuations to DB to avoid thrashing localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.status === 'pending' || order.status === 'paid' || order.status === 'ready') {
            // Simulate sensors fluctuations
            const newHot = 60 + Math.random() * 5; // 60-65 C
            const newCold = 3 + Math.random() * 2; // 3-5 C
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
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const createOrder = (order: Order) => {
    // Save to State and Database
    const newOrders = database.addOrder(order);
    setOrders(newOrders);
    
    // Simulate MQTT publish: foodbox/orders/{id}/code
    console.log(`[MQTT] Published Code for Order ${order.id}: ${order.code}`);

    // Simulate cooking time then "Ready"
    setTimeout(() => {
        updateOrderStatus(order.id, 'ready');
        console.log(`[MQTT] Order ${order.id} is now READY in the box.`);
    }, 5000); 
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
        const targetOrder = prev.find(o => o.id === orderId);
        if (!targetOrder) return prev;
        
        const updatedOrder = { ...targetOrder, status };
        
        // Persist the status change
        database.updateOrder(updatedOrder);
        
        return prev.map(o => o.id === orderId ? updatedOrder : o);
    });
  };

  // Simulate the physical box keypad interaction
  const simulateBoxKeypadEntry = (orderId: string, inputCode: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    if (order.code === inputCode) {
      console.log(`[ESP32] Keypad Success. Box Opening for Order ${orderId}`);
      // Simulate box opening logic via MQTT
      updateOrderStatus(orderId, 'delivered'); 
      return true;
    }
    return false;
  };

  const resetDatabase = () => {
      const empty = database.clearDatabase();
      setOrders(empty);
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