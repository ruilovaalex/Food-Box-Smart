import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password?: string, isAdmin?: boolean) => boolean; // Returns success/fail
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (identifier: string, password?: string, isAdmin: boolean = false): boolean => {
    if (isAdmin) {
      // Validación estricta para Admin
      if (identifier === 'admin' && password === 'admin123') {
        setUser({
          id: 'admin-master-id',
          name: 'Administrador',
          email: 'admin@foodbox.com',
          role: 'admin'
        });
        return true;
      }
      return false; // Login fallido
    } else {
      // Login de Cliente (Solo Email)
      // AQUI EL CAMBIO: Usamos el email como ID único para separar historiales
      setUser({
        id: identifier.toLowerCase().trim(), // El ID es el email
        name: identifier.split('@')[0], // Usa la parte antes del @ como nombre
        email: identifier,
        role: 'client'
      });
      return true;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};