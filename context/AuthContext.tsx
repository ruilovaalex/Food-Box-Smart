
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAnonymously: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de sesión en tiempo real (Persistencia automática)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        mapFirebaseUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const mapFirebaseUser = (firebaseUser: FirebaseUser) => {
    // 1. Caso Invitado (Anónimo)
    if (firebaseUser.isAnonymous) {
      setUser({
        id: 'guest-' + firebaseUser.uid.slice(0, 5),
        name: 'Invitado',
        email: '', // Invitados no tienen email
        role: 'client'
      });
      return;
    }

    // 2. LÓGICA DE ROLES:
    // Si el email contiene 'admin', asignamos rol admin.
    const isAdmin = firebaseUser.email?.includes('admin@foodbox.com');

    setUser({
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
      email: firebaseUser.email || '',
      role: isAdmin ? 'admin' : 'client'
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Actualizar el nombre del usuario en Firebase
    await updateProfile(userCredential.user, {
      displayName: name
    });
    // Forzar actualización del estado local
    mapFirebaseUser(userCredential.user);
  };

  const loginAnonymously = async () => {
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAnonymously, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
