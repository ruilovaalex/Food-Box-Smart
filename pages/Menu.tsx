
import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMqtt } from '../context/MqttContext';
import { useNotifications } from '../context/NotificationContext';
import { Card, Badge, Button, QuantityControl, PageLayout } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

export const Menu: React.FC = () => {
  const { addToCart, items, decreaseQuantity, total } = useCart();
  const { inventory } = useMqtt();
  const { user, logout } = useAuth();
  const { addNotification, unreadCount, notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'hot' | 'cold' | 'favs'>('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const offerTriggered = useRef(false);

  useEffect(() => {
    const savedFavs = localStorage.getItem(`favs_${user?.id}`);
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    if (!offerTriggered.current) {
      const offerProds = PRODUCTS.filter(p => p.onSale);
      if (offerProds.length > 0) {
        const randomOffer = offerProds[Math.floor(Math.random() * offerProds.length)];
        setTimeout(() => {
          addNotification({
            title: "✨ ¡SUPER OFERTA! ✨",
            body: `No te pierdas: ${randomOffer.name} a solo $${randomOffer.price.toFixed(2)}`,
            type: 'offer'
          });
        }, 1200);
      }
      offerTriggered.current = true;
    }
  }, [user?.id, addNotification]);

  const toggleFavorite = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    const newFavs = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavs);
    localStorage.setItem(`favs_${user?.id}`, JSON.stringify(newFavs));
  };

  const getProductQty = (id: number) => items.find(i => i.id === id)?.quantity || 0;
  
  const isAvailable = (productId: number) => {
    const status = inventory[productId.toString()];
    return status === undefined ? true : status;
  };

  const filteredProducts = PRODUCTS.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'favs') return favorites.includes(p.id);
    return p.type === filter;
  });

  const handleAddToCart = (product: Product) => {
      if (!isAvailable(product.id)) return;
      addToCart(product);
  };

  return (
    <PageLayout className="bg-[#F8F9FD]">
      {showNotifCenter && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fade-in flex justify-end">
            <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-left">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-black text-dark text-lg uppercase tracking-widest">Notificaciones</h3>
                    <button onClick={() => setShowNotifCenter(false)} className="text-gray-400 hover:text-dark">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                            <span className="text-6xl mb-4">📭</span>
                            <p className="font-bold">Sin alertas nuevas</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => markAsRead(n.id)}
                                className={`p-4 rounded-2xl border transition-all ${!n.read ? 'bg-orange-50/50 border-orange-100' : 'bg-white border-gray-100 opacity-60'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                        n.type === 'critical' ? 'bg-red-500 text-white' : 
                                        n.type === 'offer' ? 'bg-amber-400 text-amber-950' : 
                                        'bg-gray-100 text-gray-400'
                                    }`}>
                                        {n.type}
                                    </span>
                                    <span className="text-[10px] text-gray-300">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <h4 className="font-bold text-dark text-sm">{n.title}</h4>
                                <p className="text-gray-500 text-xs mt-1">{n.body}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="relative bg-primary pt-8 pb-16 px-6 rounded-b-[3rem] shadow-xl shadow-orange-500/20 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-600"></div>
        <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-2xl shadow-inner">👋</div>
                <div>
                    <p className="text-orange-100 text-xs font-bold uppercase tracking-wider">Hola,</p>
                    <h1 className="text-white text-2xl font-black tracking-tight">{user?.name}</h1>
                </div>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={() => setShowNotifCenter(true)} 
                    className="relative w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
                 >
                    🔔
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-primary rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                 </button>
                 <button onClick={() => navigate('/history')} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all">📜</button>
                 <button onClick={() => { logout(); navigate('/'); }} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-red-500/80 transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                 </button>
            </div>
        </div>
        <div className="relative z-10 mb-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Food Box Smart <br/> <span className="opacity-70 font-medium text-lg md:text-xl">Tecnología a tu mesa.</span></h2>
        </div>
      </div>

      <div className="px-6 -mt-14 mb-10 relative z-20 flex justify-center">
         <div className="bg-white p-2 rounded-[2rem] shadow-xl flex gap-2 overflow-x-auto no-scrollbar border border-gray-100 max-w-full">
            {[
              { id: 'all', label: 'Todo', icon: '🍽️' }, 
              { id: 'favs', label: 'Favoritos', icon: '❤️' },
              { id: 'hot', label: 'Caliente', icon: '🔥' }, 
              { id: 'cold', label: 'Frío', icon: '❄️' }
            ].map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id as any)}
                    className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${filter === cat.id ? 'bg-dark text-white shadow-lg scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <span className={filter !== cat.id ? 'grayscale opacity-50' : ''}>{cat.icon}</span> {cat.label}
                </button>
            ))}
         </div>
      </div>

      <div className="px-6 pb-40 max-w-7xl mx-auto min-h-[500px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => {
                  const available = isAvailable(product.id);
                  const isFav = favorites.includes(product.id);
                  return (
                  <Card key={product.id} className={`flex flex-col h-full group !rounded-[2.5rem] border-0 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] overflow-hidden bg-white ${!available ? 'opacity-70 grayscale-[0.8]' : ''}`}>
                      <div className="relative h-72 w-full overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          />
                          
                          {product.onSale && (
                              <div className="absolute top-6 left-6 z-40 bg-primary text-white px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl animate-pulse border border-white/30">
                                  {product.saleText}
                              </div>
                          )}

                          <button 
                            onClick={(e) => toggleFavorite(e, product.id)}
                            className={`absolute top-6 right-6 z-40 w-11 h-11 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 active:scale-125 ${
                              isFav ? 'bg-red-500/90 border-red-400 text-white shadow-xl shadow-red-500/40' : 'bg-white/60 border-white/50 text-gray-500 hover:bg-white hover:text-red-500'
                            }`}
                          >
                            <svg className={`w-6 h-6 transition-transform ${isFav ? 'scale-110' : ''}`} fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>

                          <div className={`absolute bottom-6 left-6 z-20 ${product.onSale ? 'hidden' : 'block'}`}>
                              <Badge type={product.type} className="shadow-2xl backdrop-blur-md bg-white/90 !px-4 !py-2" />
                          </div>
                          
                          {!available && (
                              <div className="absolute inset-0 bg-dark/70 backdrop-blur-[4px] z-30 flex items-center justify-center">
                                  <span className="bg-white text-dark font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-[0.3em] shadow-2xl ring-4 ring-white/10">Agotado</span>
                              </div>
                          )}
                      </div>
                      
                      <div className="p-8 flex-1 flex flex-col relative">
                          <div className="flex justify-between items-start mb-4">
                              <h3 className="text-xl font-black text-dark tracking-tight leading-tight">{product.name}</h3>
                              <div className="flex flex-col items-end">
                                  {product.originalPrice && (
                                      <span className="text-xs text-gray-400 line-through font-bold opacity-60">${product.originalPrice.toFixed(2)}</span>
                                  )}
                                  <span className="text-2xl font-black text-primary tracking-tighter">${product.price.toFixed(2)}</span>
                              </div>
                          </div>
                          <div className="mt-auto">
                              {getProductQty(product.id) > 0 ? (
                              <div className="flex items-center justify-between bg-gray-50 rounded-[1.5rem] p-2 border border-gray-100">
                                  <span className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-widest">En orden</span>
                                  <QuantityControl qty={getProductQty(product.id)} onInc={() => handleAddToCart(product)} onDec={() => decreaseQuantity(product.id)} />
                              </div>
                              ) : (
                              <Button onClick={() => handleAddToCart(product)} fullWidth disabled={!available} className="!rounded-2xl !py-4 shadow-xl">
                                  {available ? 'Lo quiero +' : 'No disponible'}
                              </Button>
                              )}
                          </div>
                      </div>
                  </Card>
                  );
              })}
          </div>
      </div>
      
      {items.length > 0 && (
        <div className="fixed bottom-8 left-6 right-6 z-40 max-w-md mx-auto animate-slide-up">
           <div onClick={() => navigate('/cart')} className="bg-dark text-white rounded-[2.5rem] p-5 shadow-2xl flex items-center justify-between cursor-pointer border border-white/10 backdrop-blur-2xl group active:scale-95 transition-all">
             <div className="flex items-center gap-5">
               <div className="bg-primary text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl shadow-orange-500/40">{items.reduce((acc, i) => acc + i.quantity, 0)}</div>
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-80">Total del Pedido</span>
                  <span className="text-2xl font-black tracking-tight text-white">${total.toFixed(2)}</span>
               </div>
             </div>
             <div className="flex items-center gap-2 font-black text-xs bg-white/10 px-6 py-3 rounded-2xl group-hover:bg-primary transition-colors uppercase tracking-widest">
                Confirmar <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
             </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideLeft {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
        }
        .animate-slide-left {
            animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </PageLayout>
  );
};
