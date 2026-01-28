
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Order, OrderStatus, InventoryStatus } from '../types';
import { database } from '../services/database';
import { useAuth } from './AuthContext';

interface MqttContextType {
  orders: Order[];
  inventory: InventoryStatus;
  createOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmOrderDelivery: (orderId: string) => Promise<void>;
  toggleProduct: (productId: number, isAvailable: boolean) => Promise<void>;
  resetDatabase: () => void;
  realTemps: { hot: number, cold: number };
  physicalKeyPress: { key: string, timestamp: number } | null;
  boxStatus: { isOccupied: boolean, currentUserId: string | null };
  keyBuffer: string;
  setKeyBuffer: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus>({});
  const [realTemps, setRealTemps] = useState({ hot: 65, cold: 4 }); 
  const [physicalKeyPress, setPhysicalKeyPress] = useState<{ key: string, timestamp: number } | null>(null);
  const [boxStatus, setBoxStatus] = useState({ isOccupied: false, currentUserId: null as string | null });
  const [keyBuffer, setKeyBuffer] = useState('');
  const [loading, setLoading] = useState(true);
  
  const ordersRef = useRef<Order[]>([]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);
    const unsubOrders = database.subscribeToOrders((newOrders) => {
        setOrders(newOrders);
        setLoading(false);
    }, user.id, user.role === 'admin');
    const unsubInventory = database.subscribeToInventory(setInventory);
    const unsubSensors = database.subscribeToSensors(setRealTemps);
    const unsubBoxStatus = database.subscribeToBoxStatus(setBoxStatus);
    const unsubKeypad = database.subscribeToKeypad(data => {
        setPhysicalKeyPress(data);
        if (data.key) {
            if (data.key === '*' || data.key === '#') setKeyBuffer('');
            else setKeyBuffer(prev => (prev + data.key).slice(-4));
        }
    });
    
    return () => {
        unsubOrders();
        unsubInventory();
        unsubSensors();
        unsubKeypad();
        unsubBoxStatus();
    };
  }, [user]);

  const createOrder = async (order: Order) => {
    await database.updateBoxStatus(true, order.userId);
    await database.addOrder(order);
  };

  const toggleProduct = async (productId: number, isAvailable: boolean) => {
    await database.updateProductAvailability(productId, isAvailable);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => database.updateOrderStatus(orderId, status);

  const confirmOrderDelivery = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
    setKeyBuffer('');
    setTimeout(() => database.updateBoxStatus(false, null), 8000);
  };

  const resetDatabase = () => database.clearDatabase();

  return (
    <MqttContext.Provider value={{ 
        orders, inventory, createOrder, updateOrderStatus, confirmOrderDelivery, toggleProduct,
        resetDatabase, realTemps, physicalKeyPress, boxStatus, keyBuffer, setKeyBuffer, loading
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