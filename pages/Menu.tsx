import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navbar, Card, Badge, Button, QuantityControl, PageLayout } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const Menu: React.FC = () => {
  const { addToCart, items, decreaseQuantity, total } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'hot' | 'cold'>('all');
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to toggle navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProductQty = (id: number) => items.find(i => i.id === id)?.quantity || 0;

  const handleLogout = () => {
    // Logout directly without confirmation
    logout();
    navigate('/');
  };

  const filteredProducts = PRODUCTS.filter(p => filter === 'all' || p.type === filter);

  return (
    <PageLayout>
      <Navbar 
        transparent={!isScrolled}
        title={
            <div className="flex flex-col py-1">
                <span className="text-xs text-gray-500 font-normal">Hola, {user?.name} 👋</span>
                <span className="text-primary font-bold text-xl leading-tight">¿Qué vas a pedir?</span>
            </div>
        }
        rightAction={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/history')} 
              className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-primary transition-colors"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-red-500 transition-colors"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        }
      />

      {/* Category Filter - Added margin top to prevent visual overlap */}
      <div className="px-4 py-2 mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-4 relative z-10">
        {[
            { id: 'all', label: 'Todo', icon: '🍽️' },
            { id: 'hot', label: 'Caliente', icon: '🔥' },
            { id: 'cold', label: 'Frío', icon: '🍦' }
        ].map(cat => (
            <button
                key={cat.id}
                onClick={() => setFilter(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                    filter === cat.id 
                    ? 'bg-dark text-white shadow-lg shadow-gray-400/30 transform scale-105' 
                    : 'bg-white text-gray-500 border border-gray-100 shadow-sm'
                }`}
            >
                <span>{cat.icon}</span> {cat.label}
            </button>
        ))}
      </div>
      
      {/* Product Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32 animate-fade-in">
        {filteredProducts.map(product => (
          <Card key={product.id} className="flex flex-col h-full group">
            <div className="relative h-52 overflow-hidden bg-gray-100">
               <img 
                 src={product.image} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               />
               <div className="absolute top-3 left-3">
                 <Badge type={product.type} className="shadow-sm backdrop-blur-md bg-white/90" />
               </div>
               <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg shadow-md font-bold text-dark">
                 ${product.price.toFixed(2)}
               </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-dark mb-1 leading-tight">{product.name}</h3>
              <p className="text-gray-400 text-xs mb-4 line-clamp-2">Deliciosa opción preparada con ingredientes frescos y de alta calidad.</p>
              
              <div className="mt-auto pt-2">
                {getProductQty(product.id) > 0 ? (
                  <div className="flex items-center justify-between bg-orange-50 rounded-2xl p-2 border border-orange-100 animate-fade-in">
                    <span className="text-xs font-bold text-orange-700 ml-2">Agregado</span>
                    <QuantityControl 
                      qty={getProductQty(product.id)}
                      onInc={() => addToCart(product)}
                      onDec={() => decreaseQuantity(product.id)}
                    />
                  </div>
                ) : (
                  <Button 
                    onClick={() => addToCart(product)} 
                    fullWidth 
                    variant="secondary"
                    className="group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                  >
                    Agregar al pedido
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Floating Cart Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 animate-slide-up">
           <div 
             onClick={() => navigate('/cart')}
             className="bg-dark text-white rounded-2xl p-4 shadow-2xl shadow-gray-900/30 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
           >
             <div className="flex items-center gap-3">
               <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                 {items.reduce((acc, i) => acc + i.quantity, 0)}
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-400 font-medium">Total</span>
                 <span className="text-lg font-bold leading-none">${total.toFixed(2)}</span>
               </div>
             </div>
             <div className="flex items-center gap-2 font-bold text-sm bg-white/10 px-4 py-2 rounded-xl">
               Ver Carrito
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
             </div>
           </div>
        </div>
      )}
    </PageLayout>
  );
};