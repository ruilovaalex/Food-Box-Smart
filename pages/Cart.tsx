
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Navbar, Button, QuantityControl, PageLayout, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';

export const Cart: React.FC = () => {
  const { items, total, decreaseQuantity, addToCart, removeFromCart, clearCart } = useCart();
  const { createOrder } = useMqtt();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const isGuest = user?.id.startsWith('guest-');

  const [name, setName] = useState(user?.name && !isGuest ? user.name : '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [formErrors, setFormErrors] = useState<{
      name?: string, 
      phone?: string,
      cardNumber?: string,
      cardExpiry?: string,
      cardCvv?: string
    }>({});

  if (items.length === 0) {
    return (
      <PageLayout className="bg-white">
        <Navbar title="Carrito" onBack={() => navigate('/')} />
        <div className="flex flex-col items-center justify-center h-[80vh] p-8 text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center animate-bounce-soft">
               <span className="text-7xl">🛒</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl">❓</div>
          </div>
          <h2 className="text-3xl font-black text-dark mb-3">¿Hambre acumulada?</h2>
          <p className="text-gray-400 mb-10 max-w-xs font-medium">Tu carrito está esperando ser llenado con lo mejor de Food Box.</p>
          <Button onClick={() => navigate('/menu')} className="px-12 py-5 text-lg shadow-2xl shadow-orange-500/40">
            Explorar el Menú
          </Button>
        </div>
      </PageLayout>
    );
  }

  const validateForm = () => {
      const errors: typeof formErrors = {};
      if(!name.trim()) errors.name = "Nombre requerido";
      if(!phone.trim() || phone.length < 7) errors.phone = "Teléfono inválido";
      
      if (paymentMethod === 'card') {
          if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = "Tarjeta incompleta";
          if (!cardExpiry) errors.cardExpiry = "Requerido";
          if (!cardCvv || cardCvv.length < 3) errors.cardCvv = "CVV inválido";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const handleCheckout = () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    setTimeout(() => {
        const orderCode = "1234";
        const shortId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const newOrder: Order = {
            id: shortId,
            userId: user?.id || 'guest',
            userEmail: user?.email || 'Invitado',
            items: [...items],
            total: total,
            status: 'pending',
            code: orderCode,
            createdAt: Date.now(),
            customerDetails: { name, phone, paymentMethod }
        };
        createOrder(newOrder);
        clearCart();
        setIsProcessing(false);
        navigate(`/order/${newOrder.id}`);
    }, 800);
  };

  return (
    <PageLayout className="pb-40 bg-[#F8F9FD]">
      <Navbar title="Finalizar Pedido" onBack={() => navigate('/menu')} 
        rightAction={
            <button onClick={clearCart} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors">
                Limpiar
            </button>
        }
      />
      
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        
        {/* Lista de Productos con Animación */}
        <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-dark text-xs uppercase tracking-[0.2em]">Tus Elecciones</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{items.length} productos</span>
            </div>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div 
                        key={item.id} 
                        className="bg-white p-4 rounded-[2rem] flex items-center gap-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] border border-white group animate-slide-up"
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        <div className="relative overflow-hidden w-20 h-20 rounded-2xl shadow-inner bg-gray-50 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px]">{item.type === 'hot' ? '🔥' : '❄️'}</span>
                                <h4 className="font-black text-dark truncate text-sm uppercase tracking-tight">{item.name}</h4>
                            </div>
                            <p className="text-primary font-black text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <QuantityControl 
                            small
                            qty={item.quantity}
                            onInc={() => addToCart(item)}
                            onDec={() => decreaseQuantity(item.id)}
                        />
                    </div>
                ))}
            </div>
        </section>

        {/* Datos del Cliente */}
        {!isGuest ? (
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-black text-dark text-lg flex items-center gap-3">
                    <span className="w-8 h-8 bg-orange-100 text-primary rounded-xl flex items-center justify-center text-sm">👤</span>
                    Datos de Entrega
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="¿Quién retira?"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={formErrors.name}
                        icon="👤"
                    />
                    <Input 
                        label="Teléfono de contacto"
                        type="tel"
                        placeholder="099-999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={formErrors.phone}
                        icon="📱"
                    />
                </div>
                
                <div className="pt-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest ml-1">Método de Pago</label>
                    <div className="flex gap-3">
                        {['cash', 'card'].map((method) => (
                            <button 
                                key={method}
                                onClick={() => setPaymentMethod(method as any)}
                                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest ${
                                    paymentMethod === method 
                                    ? 'bg-dark text-white border-dark shadow-xl scale-[1.02]' 
                                    : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
                                }`}
                            >
                                {method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
                            </button>
                        ))}
                    </div>

                    {paymentMethod === 'card' && (
                        <div className="mt-6 p-6 bg-slate-900 rounded-3xl space-y-4 animate-slide-up shadow-2xl">
                            <Input 
                                label="Número de Tarjeta"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19))}
                                error={formErrors.cardNumber}
                                className="!bg-white/10 !text-white !border-white/10 focus:!border-white/30"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Expiración"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, '');
                                        if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                        setCardExpiry(v);
                                    }}
                                    error={formErrors.cardExpiry}
                                    className="!bg-white/10 !text-white !border-white/10"
                                />
                                <Input 
                                    label="CVV"
                                    type="password"
                                    maxLength={3}
                                    placeholder="***"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                    error={formErrors.cardCvv}
                                    className="!bg-white/10 !text-white !border-white/10"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>
        ) : (
            <div className="bg-orange-50 p-8 rounded-[2.5rem] border-2 border-dashed border-orange-200 text-center animate-pulse">
                <span className="text-4xl mb-3 block">🔒</span>
                <h3 className="font-black text-primary text-sm uppercase tracking-widest mb-2">Modo Invitado</h3>
                <p className="text-orange-800/60 text-xs font-bold leading-relaxed">
                    Debes iniciar sesión para completar la compra y recibir tu código de Food Box.
                </p>
            </div>
        )}

        {/* Resumen Estilo Ticket */}
        <section className="relative">
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-50 px-8 py-4 border-b border-dashed border-gray-200 flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen Digital</span>
                    <span className="text-[10px] font-mono text-gray-400">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="p-8 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold text-sm">Subtotal</span>
                        <span className="text-dark font-black font-mono">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold text-sm">Servicio Smart</span>
                        <span className="text-green-500 font-black font-mono">GRATIS</span>
                    </div>
                    <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
                        <span className="text-dark font-black text-lg uppercase tracking-tighter">Total a Pagar</span>
                        <span className="text-4xl font-black text-primary font-mono tracking-tighter">${total.toFixed(2)}</span>
                    </div>
                </div>
                {/* Dientes de ticket inferior */}
                <div className="flex justify-between px-2 pb-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-[#F8F9FD] rounded-full -mb-1.5 shadow-inner"></div>
                    ))}
                </div>
            </div>
        </section>
      </div>

      {/* Botón Flotante de Acción */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8F9FD] via-[#F8F9FD] to-transparent z-40">
          <div className="max-w-2xl mx-auto">
            {!isGuest ? (
                <Button 
                    onClick={handleCheckout} 
                    disabled={isProcessing} 
                    isLoading={isProcessing}
                    fullWidth 
                    className="py-5 text-lg shadow-[0_20px_50px_rgba(255,138,43,0.3)] hover:scale-[1.02] active:scale-95"
                >
                    {isProcessing ? 'PROCESANDO PAGO...' : 'CONFIRMAR Y PAGAR'}
                </Button>
            ) : (
                <Button 
                    onClick={() => { logout(); navigate('/'); }} 
                    fullWidth 
                    variant="secondary"
                    className="py-5 border-2 border-primary text-primary hover:bg-orange-50"
                >
                    🔑 INICIAR SESIÓN PARA PAGAR
                </Button>
            )}
          </div>
      </div>
    </PageLayout>
  );
};
