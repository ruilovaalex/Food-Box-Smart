
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

    // Trigger de oferta al entrar
    if (!offerTriggered.current) {
      const offerProds = PRODUCTS.filter(p => p.onSale);
      if (offerProds.length > 0) {
        const randomOffer = offerProds[Math.floor(Math.random() * offerProds.length)];
        setTimeout(() => {
          addNotification({
            title: "🔥 ¡Flash Deal!",
            body: `Disfruta hoy: ${randomOffer.name} por solo $${randomOffer.price.toFixed(2)}`,
            type: 'offer'
          });
        }, 1500);
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
      {/* Notification Center Overlay */}
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
                            <p className="font-bold">No tienes alertas pendientes</p>
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
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-2xl">👋</div>
                <div>
                    <p className="text-orange-100 text-sm font-medium">Bienvenido,</p>
                    <h1 className="text-white text-2xl font-black tracking-tight">{user?.name}</h1>
                </div>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={() => setShowNotifCenter(true)} 
                    className="relative w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20"
                 >
                    🔔
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-primary rounded-full text-[10px] font-black flex items-center justify-center animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                 </button>
                 <button onClick={() => navigate('/history')} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 hover:bg-white/20">📜</button>
                 <button onClick={() => { logout(); navigate('/'); }} className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-red-500/80 transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                 </button>
            </div>
        </div>
        <div className="relative z-10 mb-6">
            <h2 className="text-3xl font-bold text-white leading-tight">Food Box Smart <br/> <span className="opacity-80 font-normal">Tu comida fresca y lista.</span></h2>
        </div>
      </div>

      <div className="px-6 -mt-14 mb-8 relative z-20 flex justify-center">
         <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar border border-gray-100">
            {[
              { id: 'all', label: 'Todo', icon: '🍽️' }, 
              { id: 'favs', label: 'Favoritos', icon: '❤️' },
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

      <div className="px-6 pb-32 max-w-7xl mx-auto min-h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                  const available = isAvailable(product.id);
                  const isFav = favorites.includes(product.id);
                  return (
                  <Card key={product.id} className={`flex flex-col h-full group !rounded-[2rem] border-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden ${!available ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                      <div className="relative h-64 p-4 bg-white flex items-center justify-center overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105" />
                          
                          {product.onSale && (
                              <div className="absolute top-6 left-6 z-40 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl animate-pulse ring-4 ring-amber-400/20">
                                  {product.saleText}
                              </div>
                          )}

                          <button 
                            onClick={(e) => toggleFavorite(e, product.id)}
                            className={`absolute top-6 right-6 z-40 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 active:scale-125 ${
                              isFav ? 'bg-red-500/90 border-red-400 text-white shadow-lg shadow-red-500/40' : 'bg-white/70 border-white/50 text-gray-400 hover:bg-white hover:text-red-500'
                            }`}
                          >
                            <svg className={`w-5 h-5 transition-transform ${isFav ? 'scale-110' : ''}`} fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>

                          <div className={`absolute bottom-6 left-6 z-20 ${product.onSale ? 'hidden' : 'block'}`}>
                              <Badge type={product.type} className="shadow-lg backdrop-blur-md bg-white/95" />
                          </div>
                          {!available && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex items-center justify-center">
                                  <span className="bg-white text-dark font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-xl">Agotado</span>
                              </div>
                          )}
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col relative bg-white">
                          <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold text-dark">{product.name}</h3>
                              <div className="flex flex-col items-end">
                                  {product.originalPrice && (
                                      <span className="text-[10px] text-gray-400 line-through font-bold">${product.originalPrice.toFixed(2)}</span>
                                  )}
                                  <span className="text-lg font-black text-primary">${product.price.toFixed(2)}</span>
                              </div>
                          </div>
                          <div className="mt-auto pt-4">
                              {getProductQty(product.id) > 0 ? (
                              <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2">
                                  <span className="text-xs font-bold text-gray-500 ml-2">Cantidad:</span>
                                  <QuantityControl qty={getProductQty(product.id)} onInc={() => handleAddToCart(product)} onDec={() => decreaseQuantity(product.id)} />
                              </div>
                              ) : (
                              <Button onClick={() => handleAddToCart(product)} fullWidth disabled={!available} className="!rounded-xl">
                                  {available ? 'Agregar +' : 'No disponible'}
                              </Button>
                              )}
                          </div>
                      </div>
                  </Card>
                  );
              })}
          </div>
      </div>
      
      {/* Drawer Animation Styles */}
      <style>{`
        @keyframes slideLeft {
            0% { transform: translateX(100%); }
            100% { transform: translateX(0); }
        }
        .animate-slide-left {
            animation: slideLeft 0.3s ease-out forwards;
        }
      `}</style>
    </PageLayout>
  );
};
