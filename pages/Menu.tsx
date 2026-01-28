
import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMqtt } from '../context/MqttContext';
import { useNotifications } from '../context/NotificationContext';
import { Card, Badge, Button, QuantityControl, PageLayout } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Product, AppNotification } from '../types';

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
            title: "✨ ¡OFERTA EXCLUSIVA! ✨",
            body: `${randomOffer.name} disponible a precio especial solo por tiempo limitado.`,
            type: 'offer'
          });
        }, 800);
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

  const offerNotifications = notifications.filter(n => n.type === 'offer');

  const handleAddToCart = (product: Product) => {
      if (!isAvailable(product.id)) return;
      addToCart(product);
  };

  return (
    <PageLayout className="bg-[#F4F6F9]">
      {showNotifCenter && (
        <div className="fixed inset-0 z-[100] bg-dark/60 backdrop-blur-md animate-fade-in flex justify-end">
            <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-left border-l border-gray-100">
                <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="font-black text-dark text-xl tracking-tight">Notificaciones</h3>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Alertas y Ofertas</p>
                    </div>
                    <button onClick={() => setShowNotifCenter(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                            <span className="text-7xl mb-6">📭</span>
                            <p className="font-black text-dark text-lg">Buzón vacío</p>
                            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Vuelve más tarde</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => markAsRead(n.id)}
                                className={`p-5 rounded-[2rem] border transition-all duration-300 group cursor-pointer ${!n.read ? 'bg-orange-50/40 border-orange-100 ring-2 ring-orange-50' : 'bg-white border-gray-100 opacity-60 hover:opacity-100'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                        n.type === 'critical' ? 'bg-red-500 text-white' : 
                                        n.type === 'offer' ? 'bg-primary text-white' : 
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                        {n.type}
                                    </span>
                                    <span className="text-[9px] text-gray-300 font-bold">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <h4 className="font-black text-dark text-sm leading-tight group-hover:text-primary transition-colors">{n.title}</h4>
                                <p className="text-gray-500 text-[11px] font-medium mt-1.5 leading-relaxed">{n.body}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="relative bg-dark pt-12 pb-24 px-8 rounded-b-[4.5rem] shadow-2xl shadow-dark/10 mb-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent opacity-5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/10 text-3xl shadow-2xl">⚡</div>
                <div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-0.5">Food Box Smart</p>
                    <h1 className="text-white text-3xl font-black tracking-tighter">Hola, {user?.name.split(' ')[0]}</h1>
                </div>
            </div>
            <div className="flex gap-3">
                 <button 
                    onClick={() => setShowNotifCenter(true)} 
                    className="relative w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
                 >
                    🔔
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary border-4 border-dark rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-lg">
                            {unreadCount}
                        </span>
                    )}
                 </button>
                 <button onClick={() => navigate('/history')} className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95">📜</button>
                 <button onClick={() => { logout(); navigate('/'); }} className="w-12 h-12 bg-red-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all hover:scale-105 active:scale-95">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                 </button>
            </div>
        </div>
        <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">Elige tu mejor<br/><span className="text-primary italic">experiencia gourmet.</span></h2>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-6 -mt-16 mb-12 relative z-20 flex justify-center">
         <div className="bg-white/90 backdrop-blur-2xl p-2.5 rounded-[2.5rem] shadow-2xl shadow-dark/5 flex gap-2 overflow-x-auto no-scrollbar border border-white">
            {[
              { id: 'all', label: 'Todo', icon: '🍽️' }, 
              { id: 'favs', label: 'Favoritos', icon: '❤️' },
              { id: 'hot', label: 'Caliente', icon: '🔥' }, 
              { id: 'cold', label: 'Frío', icon: '❄️' }
            ].map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id as any)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap ${
                        filter === cat.id 
                        ? 'bg-dark text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] scale-105 ring-4 ring-dark/5' 
                        : 'text-gray-400 hover:bg-gray-100/50 hover:text-dark'
                    }`}
                >
                    <span className={`text-base transition-transform duration-500 ${filter === cat.id ? 'scale-125 rotate-12' : 'grayscale opacity-60'}`}>{cat.icon}</span> 
                    {cat.label}
                </button>
            ))}
         </div>
      </div>

      {/* Product Grid */}
      <div className="px-8 pb-48 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* Premium Offer Cards */}
              {filter === 'all' && offerNotifications.map(notif => (
                  <Card key={notif.id} className="!rounded-[3rem] bg-gradient-to-br from-amber-400 to-orange-600 p-1 flex flex-col h-full shadow-[0_30px_60px_-15px_rgba(255,138,43,0.3)] animate-fade-in group overflow-hidden border-0">
                      <div className="absolute top-0 right-0 p-12 opacity-10 text-[10rem] font-black italic select-none -translate-y-8 translate-x-8">!</div>
                      <div className="flex-1 bg-white rounded-[2.8rem] p-10 flex flex-col items-center justify-center text-center relative z-10 transition-transform duration-500 group-hover:scale-[0.98]">
                          <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-4xl mb-6 animate-bounce-soft shadow-inner border border-amber-100">✨</div>
                          <h3 className="text-2xl font-black text-dark uppercase italic tracking-tighter mb-3 leading-tight">{notif.title}</h3>
                          <p className="text-gray-500 text-[13px] font-bold leading-relaxed mb-8 max-w-[200px]">{notif.body}</p>
                          <Button onClick={() => markAsRead(notif.id)} variant="primary" className="!rounded-[1.5rem] !py-4 px-10 shadow-2xl shadow-orange-500/40 font-black tracking-widest uppercase text-xs">
                              LO QUIERO
                          </Button>
                      </div>
                  </Card>
              ))}

              {filteredProducts.map((product, idx) => {
                  const available = isAvailable(product.id);
                  const isFav = favorites.includes(product.id);
                  return (
                  <Card 
                    key={product.id} 
                    className={`flex flex-col h-full group !rounded-[3rem] border-0 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.06)] overflow-hidden bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-dark/5 hover:-translate-y-2 animate-slide-up ${!available ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                      <div className="relative h-80 w-full overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          />
                          
                          {/* Modern Offer Badge */}
                          {product.onSale && (
                              <div className="absolute top-8 left-8 z-40 bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/30 shadow-2xl">
                                  <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] drop-shadow-md">{product.saleText}</span>
                              </div>
                          )}

                          {/* Fav Button */}
                          <button 
                            onClick={(e) => toggleFavorite(e, product.id)}
                            className={`absolute top-8 right-8 z-40 w-12 h-12 rounded-2xl backdrop-blur-2xl border flex items-center justify-center transition-all duration-500 active:scale-125 ${
                              isFav ? 'bg-red-500 border-red-400 text-white shadow-xl shadow-red-500/30 scale-110' : 'bg-white/40 border-white/50 text-white hover:bg-white hover:text-red-500 hover:scale-110'
                            }`}
                          >
                            <svg className={`w-6 h-6 transition-transform ${isFav ? 'scale-110 animate-pulse' : ''}`} fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>

                          <div className={`absolute bottom-8 left-8 z-20 transition-all duration-500 group-hover:translate-x-2 ${product.onSale ? 'hidden' : 'block'}`}>
                              <Badge type={product.type} className="shadow-2xl backdrop-blur-xl bg-white/40 text-white border-white/20 !px-5 !py-2.5 !rounded-2xl !text-[9px] font-black tracking-[0.2em]" />
                          </div>
                          
                          {!available && (
                              <div className="absolute inset-0 bg-dark/80 backdrop-blur-[6px] z-30 flex items-center justify-center">
                                  <span className="bg-white/10 text-white font-black px-8 py-4 rounded-[2rem] text-[10px] uppercase tracking-[0.4em] shadow-2xl border border-white/20 backdrop-blur-md">Sold Out</span>
                              </div>
                          )}
                      </div>
                      
                      <div className="p-10 flex-1 flex flex-col relative bg-white">
                          <div className="mb-6">
                              <h3 className="text-2xl font-black text-dark tracking-tighter leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5 opacity-60">Delicia Seleccionada</p>
                          </div>
                          
                          <div className="flex items-end justify-between mt-auto pt-6 border-t border-gray-50">
                              <div className="flex flex-col">
                                  {product.originalPrice && (
                                      <span className="text-[11px] text-gray-300 line-through font-bold">${product.originalPrice.toFixed(2)}</span>
                                  )}
                                  <span className="text-3xl font-black text-dark tracking-tighter group-hover:text-primary transition-colors">${product.price.toFixed(2)}</span>
                              </div>
                              
                              <div className="w-1/2">
                                  {getProductQty(product.id) > 0 ? (
                                    <div className="bg-gray-50 rounded-[1.5rem] p-1.5 border border-gray-100 flex items-center justify-center">
                                        <QuantityControl qty={getProductQty(product.id)} onInc={() => handleAddToCart(product)} onDec={() => decreaseQuantity(product.id)} small />
                                    </div>
                                  ) : (
                                    <Button onClick={() => handleAddToCart(product)} disabled={!available} className="!rounded-2xl !py-3 !px-4 shadow-xl font-black text-[10px] uppercase tracking-widest !w-full">
                                        + AÑADIR
                                    </Button>
                                  )}
                              </div>
                          </div>
                      </div>
                  </Card>
                  );
              })}
          </div>
      </div>
      
      {/* Premium Floating Cart Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-10 left-6 right-6 z-[60] max-w-xl mx-auto animate-slide-up">
           <div 
             onClick={() => navigate('/cart')} 
             className="bg-dark/90 backdrop-blur-3xl text-white rounded-[3rem] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] flex items-center justify-between cursor-pointer border border-white/10 group active:scale-95 hover:bg-dark transition-all duration-500"
           >
             <div className="flex items-center gap-6">
               <div className="relative">
                   <div className="bg-primary text-white w-16 h-16 rounded-[1.8rem] flex items-center justify-center font-black text-2xl shadow-[0_10px_30px_-5px_rgba(255,138,43,0.5)] group-hover:scale-110 transition-transform duration-500">
                     {items.reduce((acc, i) => acc + i.quantity, 0)}
                   </div>
                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-4 border-dark animate-pulse"></div>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-0.5">Total estimado</span>
                  <span className="text-3xl font-black tracking-tighter text-white group-hover:text-primary transition-colors">${total.toFixed(2)}</span>
               </div>
             </div>
             <div className="flex items-center gap-3 font-black text-[11px] bg-white/5 border border-white/5 px-8 py-4 rounded-[1.5rem] group-hover:bg-primary group-hover:text-white transition-all duration-500 uppercase tracking-[0.2em] shadow-inner">
                VER ORDEN <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </PageLayout>
  );
};
