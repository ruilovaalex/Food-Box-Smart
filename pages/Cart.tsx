
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Navbar, Card, Button, QuantityControl, PageLayout, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';

export const Cart: React.FC = () => {
  const { items, total, decreaseQuantity, addToCart, removeFromCart, clearCart } = useCart();
  const { createOrder } = useMqtt();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  
  // Card States
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
        <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center animate-fade-in">
          <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-6">
             <span className="text-6xl">🛒</span>
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8 max-w-xs">¡No dejes que tu estómago espere! Agrega algo delicioso del menú.</p>
          <Button onClick={() => navigate('/menu')} className="px-8 shadow-xl shadow-orange-500/20">
            Explorar Menú
          </Button>
        </div>
      </PageLayout>
    );
  }

  const validateForm = () => {
      const errors: typeof formErrors = {};
      if(!name.trim()) errors.name = "El nombre es obligatorio.";
      if(!phone.trim() || phone.length < 7) errors.phone = "Ingresa un teléfono válido.";
      
      if (paymentMethod === 'card') {
          if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) errors.cardNumber = "Número de tarjeta incompleto.";
          if (!cardExpiry) errors.cardExpiry = "Requerido.";
          if (!cardCvv || cardCvv.length < 3) errors.cardCvv = "Inválido.";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  };

  const handleCheckout = () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    // Simulate payment processing delay with randomness
    // REDUCIDO: De 2000ms a 500ms para mayor fluidez
    setTimeout(() => {
        const orderCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        const newOrder: Order = {
            id: Date.now().toString(),
            userId: user?.id || 'guest',
            items: [...items],
            total: total,
            status: 'pending',
            code: orderCode,
            createdAt: Date.now(),
            customerDetails: {
                name,
                phone,
                paymentMethod
            }
        };

        createOrder(newOrder);
        clearCart();
        setIsProcessing(false);
        navigate(`/order/${newOrder.id}`);
    }, 500);
  };

  // Helper para formatear tarjeta
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 16);
      val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setCardExpiry(val);
  };

  return (
    <PageLayout className="pb-32">
      <Navbar title="Mi Pedido" onBack={() => navigate('/menu')} 
        rightAction={
            <button onClick={clearCart} className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                Vaciar
            </button>
        }
      />
      
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Products List */}
        <div className="space-y-3">
            <h3 className="font-bold text-dark text-sm uppercase tracking-wide ml-1">Productos</h3>
            {items.map((item, index) => (
            <div 
                key={item.id} 
                className="bg-white p-3 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-50 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-dark truncate">{item.name}</h4>
                    <p className="text-sm text-gray-400 mb-2 font-medium">{item.type === 'hot' ? '🔥 Caliente' : '❄️ Frío'}</p>
                    <div className="flex items-center justify-between">
                        <p className="text-primary font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <QuantityControl 
                        small
                        qty={item.quantity}
                        onInc={() => addToCart(item)}
                        onDec={() => decreaseQuantity(item.id)}
                    />
                </div>
            </div>
            ))}
        </div>

        {/* Checkout Form */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
            <h3 className="font-bold text-dark text-lg mb-4 flex items-center gap-2">
                <span>📝</span> Datos de Pago
            </h3>
            <div className="space-y-4">
                <Input 
                    label="Nombre Completo"
                    placeholder="Ej. Juan Pérez"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={formErrors.name}
                />
                <Input 
                    label="Número de Teléfono"
                    type="tel"
                    placeholder="099..."
                    name="phone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={formErrors.phone}
                />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button 
                            className={`p-3 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                paymentMethod === 'cash' 
                                ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' 
                                : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                            }`}
                            onClick={() => setPaymentMethod('cash')}
                        >
                            <span>💵</span> Efectivo
                        </button>
                        <button 
                            className={`p-3 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                paymentMethod === 'card' 
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                                : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                            }`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <span>💳</span> Tarjeta
                        </button>
                    </div>

                    {/* Card Input Fields - Conditional Rendering */}
                    {paymentMethod === 'card' && (
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-4 animate-fade-in">
                            <Input 
                                label="Número de Tarjeta"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                error={formErrors.cardNumber}
                                maxLength={19}
                                icon={<span className="text-gray-400">💳</span>}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Expiración"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={handleExpiryChange}
                                    error={formErrors.cardExpiry}
                                    maxLength={5}
                                />
                                <Input 
                                    label="CVV"
                                    placeholder="123"
                                    type="password"
                                    maxLength={3}
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                    error={formErrors.cardCvv}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Receipt Style Summary */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 relative overflow-hidden">
            {/* Decoration: jagged line top */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-100 to-orange-50" />
            
            <h3 className="font-bold text-lg text-dark mb-6">Resumen de Pago</h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>Tarifa de servicio</span>
                    <span>$0.00</span>
                </div>
                <div className="my-4 border-t border-dashed border-gray-300"></div>
                <div className="flex justify-between text-xl font-extrabold text-dark">
                    <span>Total a Pagar</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg p-5 border-t border-gray-100 z-40 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto">
            <Button 
                onClick={handleCheckout} 
                disabled={isProcessing} 
                isLoading={isProcessing}
                fullWidth 
                className="text-lg py-4 shadow-xl shadow-orange-500/20"
            >
                {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
            </Button>
          </div>
      </div>
    </PageLayout>
  );
};
