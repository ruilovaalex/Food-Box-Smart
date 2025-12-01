
import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button, QuantityControl, PageLayout } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

export const Menu: React.FC = () => {
  const { addToCart, items, decreaseQuantity, total } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'hot' | 'cold'>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProductQty = (id: number) => items.find(i => i.id === id)?.quantity || 0;
  const filteredProducts = PRODUCTS.filter(p => filter === 'all' || p.type === filter);

  const handleAddToCart = (product: Product) => {
      addToCart(product);
      setAddedNotification(`¡${product.name} agregado! 😋`);
      setTimeout(() => setAddedNotification(null), 2000);
  };

  return (
    <PageLayout className="bg-[#F8F9FD]">
      
      {/* --- HERO HEADER ORGANICO --- */}
      <div className="relative bg-primary pt-8 pb-16 px-6 rounded-b-[3rem] shadow-xl shadow-orange-500/20 mb-8 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-orange-600"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-yellow-400 opacity-20 rounded-full blur-2xl"></div>

        {/* Top Navigation */}
        <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-2xl shadow-lg">
                    👋
                </div>
                <div>
                    <p className="text-orange-100 text-sm font-medium">Bienvenido,</p>
                    <h1 className="text-white text-2xl font-black tracking-tight">{user?.name}</h1>
                </div>
            </div>
            <div className="flex gap-2">
                 <button 
                  onClick={() => navigate('/history')} 
                  className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                   📜
                </button>
                <button 
                  onClick={() => { logout(); navigate('/'); }} 
                  className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-red-500/80 transition-all"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </div>

        {/* Search/Title Area */}
        <div className="relative z-10 mb-6">
            <h2 className="text-3xl font-bold text-white leading-tight">
                ¿Qué se te antoja <br/> <span className="opacity-80 font-normal">comer hoy?</span>
            </h2>
        </div>
      </div>

      {/* --- CATEGORY TABS (Floating) --- */}
      <div className="px-6 -mt-14 mb-8 relative z-20 flex justify-center">
         <div className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 flex gap-2 overflow-x-auto no-scrollbar border border-gray-100">
            {[
                { id: 'all', label: 'Todo', icon: '🍽️' },
                { id: 'hot', label: 'Caliente', icon: '🔥' },
                { id: 'cold', label: 'Frío', icon: '🍦' }
            ].map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        filter === cat.id 
                        ? 'bg-dark text-white shadow-lg shadow-gray-900/20' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <span className={filter !== cat.id ? 'grayscale opacity-70' : ''}>{cat.icon}</span> 
                    {cat.label}
                </button>
            ))}
         </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="px-6 pb-32 max-w-7xl mx-auto">
        <h3 className="font-bold text-dark text-lg mb-4 flex items-center gap-2">
            Resultados <span className="text-gray-400 text-sm font-normal">({filteredProducts.length})</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredProducts.map(product => (
            <Card key={product.id} className="flex flex-col h-full group !rounded-[2rem] border-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                <div className="relative h-56 p-6 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center overflow-hidden">
                    {/* Background blob for product */}
                    <div className="absolute w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                    
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-40 h-40 object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10" 
                    />
                    <div className="absolute top-4 left-4 z-20">
                        <Badge type={product.type} className="shadow-sm backdrop-blur-md bg-white/90" />
                    </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col relative bg-white">
                {/* Curved Connector attempt visually */}
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-dark leading-tight">{product.name}</h3>
                    <span className="text-lg font-black text-primary bg-orange-50 px-3 py-1 rounded-lg">
                        ${product.price.toFixed(2)}
                    </span>
                </div>
                
                <p className="text-gray-400 text-xs mb-6 font-medium line-clamp-2">
                    Preparado con ingredientes frescos para el mejor sabor.
                </p>
                
                <div className="mt-auto">
                    {getProductQty(product.id) > 0 ? (
                    <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 ml-2">Cantidad:</span>
                        <QuantityControl 
                        qty={getProductQty(product.id)}
                        onInc={() => handleAddToCart(product)}
                        onDec={() => decreaseQuantity(product.id)}
                        />
                    </div>
                    ) : (
                    <Button 
                        onClick={() => handleAddToCart(product)} 
                        fullWidth 
                        className="!rounded-xl group-hover:shadow-orange-500/40 transition-shadow"
                    >
                        Agregar +
                    </Button>
                    )}
                </div>
                </div>
            </Card>
            ))}
        </div>
      </div>

      {/* --- TOAST NOTIFICATION --- */}
      {addedNotification && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
              <div className="bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
                  <div className="bg-green-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-bold text-sm">{addedNotification}</span>
              </div>
          </div>
      )}

      {/* --- FLOATING CART BAR --- */}
      {items.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-40 max-w-md mx-auto animate-slide-up">
           <div 
             onClick={() => navigate('/cart')}
             className="bg-dark text-white rounded-3xl p-4 pr-6 shadow-2xl shadow-gray-900/40 flex items-center justify-between cursor-pointer active:scale-95 transition-transform border border-gray-700/50 backdrop-blur-xl"
           >
             <div className="flex items-center gap-4">
               <div className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/30">
                 {items.reduce((acc, i) => acc + i.quantity, 0)}
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</span>
                 <span className="text-xl font-black leading-none">${total.toFixed(2)}</span>
               </div>
             </div>
             <div className="flex items-center gap-2 font-bold text-sm bg-white/10 px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors">
               Ver Pedido
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
             </div>
           </div>
        </div>
      )}
    </PageLayout>
  );
};
