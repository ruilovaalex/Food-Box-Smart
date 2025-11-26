import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Order, OrderStatus } from '../types';

interface MqttContextType {
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateBoxKeypadEntry: (orderId: string, code: string) => boolean; // Admin helper
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

// This simulates the Backend + MQTT Broker + ESP32 Logic
export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Simulate persistent database
  useEffect(() => {
    const storedOrders = localStorage.getItem('foodbox_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('foodbox_orders', JSON.stringify(orders));
  }, [orders]);

  // Simulate Real-time Temperature MQTT updates from ESP32
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
    setOrders(prev => [order, ...prev]);
    
    // Simulate MQTT publish: foodbox/orders/{id}/code
    console.log(`[MQTT] Published Code for Order ${order.id}: ${order.code}`);

    // Simulate cooking time then "Ready"
    setTimeout(() => {
        updateOrderStatus(order.id, 'ready');
        console.log(`[MQTT] Order ${order.id} is now READY in the box.`);
    }, 5000); 
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Simulate the physical box keypad interaction
  const simulateBoxKeypadEntry = (orderId: string, inputCode: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    if (order.code === inputCode) {
      console.log(`[ESP32] Keypad Success. Box Opening for Order ${orderId}`);
      // Simulate box opening logic via MQTT
      // Topic: foodbox/orders/{id}/status payload: 'opened'
      // Ideally the backend listens to this and updates the DB. We simulate that here:
      updateOrderStatus(orderId, 'delivered'); 
      return true;
    }
    return false;
  };

  return (
    <MqttContext.Provider value={{ orders, createOrder, updateOrderStatus, simulateBoxKeypadEntry }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within MqttProvider");
  return context;
};