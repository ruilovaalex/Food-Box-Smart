import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MqttProvider } from './context/MqttContext';
import { Login } from './pages/Login';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { OrderStatusPage } from './pages/OrderStatus';
import { History } from './pages/History';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/menu" replace />;
  
  return <>{children}</>;
};

// Public Route Wrapper (redirects to menu if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/menu'} replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
            
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderStatusPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MqttProvider>
          <Router>
             <AppRoutes />
          </Router>
        </MqttProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;