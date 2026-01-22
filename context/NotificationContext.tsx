
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppNotification } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 50));

    // Push Nativa si hay permiso
    if (permission === 'granted') {
      new Notification(newNotif.title, {
        body: newNotif.body,
        icon: '/images/logo.png',
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, unreadCount }}>
      {children}
      
      {/* Toast Overlay UI */}
      <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {notifications.filter(n => !n.read).slice(0, 3).map((n, i) => (
          <div 
            key={n.id} 
            className={`pointer-events-auto animate-slide-up p-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/50 flex items-start gap-4 transform transition-all hover:scale-105 cursor-pointer ${
              n.type === 'critical' ? 'bg-red-500/90 text-white' : 
              n.type === 'offer' ? 'bg-amber-400/90 text-amber-950' : 
              'bg-white/90 text-dark'
            }`}
            onClick={() => markAsRead(n.id)}
          >
            <div className="text-2xl">
              {n.type === 'critical' ? '🚨' : n.type === 'offer' ? '✨' : '🔔'}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-xs uppercase tracking-widest opacity-80 mb-0.5">{n.title}</h4>
              <p className="text-sm font-bold leading-tight">{n.body}</p>
            </div>
            <button className="opacity-50 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};
