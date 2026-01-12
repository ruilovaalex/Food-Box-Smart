
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [addedNotification, setAddedNotification] = useState<string | null>(null);

  const getProductQty = useCallback((id: number) => items.find(i => i.id === id)?.quantity || 0, [items]);
  
  const filteredProducts = useMemo(() => 
    PRODUCTS.filter(p => filter === 'all' || p.type === filter),
  [filter]);

  const handleAddToCart = useCallback((product: Product) => {
      addToCart(product);
      setAddedNotification(`¡${product.name} agregado! 😋`);
      setTimeout(() => setAddedNotification(null), 2000);
  }, [addToCart]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, type: string) => {
      const target = e.currentTarget;
      target.onerror = null;
      target.src = type === 'hot' 
        ? "https://cdn-icons-png.flaticon.com/512/3075/3075977.png" 
        : "https://cdn-icons-png.flaticon.com/512/938/938063.png";
  };

  const cartTotalQty = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);

  return (
    <PageLayout className="bg-[#F8F9FD]">
      <div className="relative bg-primary pt-8 pb-16 px-6 rounded-b-[3rem] shadow-xl shadow-orange-500/20 mb-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-orange-600"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-2xl">👋</div>
                <div>
                    <p className="text-orange-100 text-sm font-medium">Bienvenido,</p>
                    <h1 className="text-white text-2xl font-black tracking-tight">{user?.name}</h1>
                </div>
            </div>
            <div className="flex gap-2">
                 <button onClick={() => navigate('/history')} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">📜</button>
                 <button onClick={() => { logout(); navigate('/'); }} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-red-500/80 transition-all">🚪</button>
            </div>
        </div>

        <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white leading-tight">¿Qué se te antoja <br/> <span className="opacity-80 font-normal">comer hoy?</span></h2>
        </div>
        
        <div className="absolute bottom-4 right-10 z-20 hidden md:block animate-bounce-soft">
            <img 
                src="/images/calavera.gif" 
                alt="" 
                className="w-32 h-32 object-contain mix-blend-screen opacity-90" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
        </div>
      </div>

      <div className="px-6 -mt-14 mb-8 relative z-20 flex justify-center">
         <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar border border-gray-100">
            {[
                { id: 'all', label: 'Todo', icon: '🍽️' },
                { id: 'hot', label: 'Caliente', icon: '🔥' },
                { id: 'cold', label: 'Frío', icon: '🍦' }
            ].map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${filter === cat.id ? 'bg-dark text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <span className={filter !== cat.id ? 'grayscale opacity-70' : ''}>{cat.icon}</span> {cat.label}
                </button>
            ))}
         </div>
      </div>

      <div className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredProducts.map(product => (
            <Card key={product.id} className="flex flex-col h-full group !rounded-[2rem] border-0 shadow-lg overflow-hidden">
                <div className="relative h-64 p-4 bg-white flex items-center justify-center overflow-hidden">
                    <img 
                        src={product.image} 
                        alt={product.name} 
                        onError={(e) => handleImageError(e, product.type)}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-6 left-6 z-20">
                        <Badge type={product.type} className="shadow-lg backdrop-blur-md bg-white/95" />
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col bg-white">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-dark">{product.name}</h3>
                        <span className="text-lg font-black text-primary bg-orange-50 px-3 py-1 rounded-lg">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="mt-auto pt-4">
                        {getProductQty(product.id) > 0 ? (
                        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
                            <span className="text-xs font-bold text-gray-500 ml-2">Cantidad:</span>
                            <QuantityControl qty={getProductQty(product.id)} onInc={() => handleAddToCart(product)} onDec={() => decreaseQuantity(product.id)} />
                        </div>
                        ) : (
                        <Button onClick={() => handleAddToCart(product)} fullWidth className="!rounded-xl">Agregar +</Button>
                        )}
                    </div>
                </div>
            </Card>
            ))}
        </div>
      </div>

      {addedNotification && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
              <div className="bg-dark/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 font-bold text-sm">
                  {addedNotification}
              </div>
          </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-40 max-w-md mx-auto animate-slide-up">
           <div onClick={() => navigate('/cart')} className="bg-dark text-white rounded-3xl p-4 pr-6 shadow-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform backdrop-blur-xl border border-gray-700/50">
             <div className="flex items-center gap-4">
               <div className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg">{cartTotalQty}</div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-400 font-bold uppercase">Total</span>
                 <span className="text-xl font-black leading-none">${total.toFixed(2)}</span>
               </div>
             </div>
             <div className="flex items-center gap-2 font-bold text-sm bg-white/10 px-5 py-2.5 rounded-xl">Ver Pedido</div>
           </div>
        </div>
      )}
    </PageLayout>
  );
};
