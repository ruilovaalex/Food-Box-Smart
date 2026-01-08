
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMqtt } from '../context/MqttContext';
import { Navbar, Card, Button, PageLayout } from '../components/UI';

const StatusStep: React.FC<{ active: boolean; completed: boolean; label: string; icon: string }> = ({ active, completed, label, icon }) => {
    return (
        <div className="flex flex-col items-center flex-1 relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all duration-500 ${
                active ? 'bg-primary text-white scale-110 ring-4 ring-orange-100' : 
                completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
                {completed ? '✓' : icon}
            </div>
            <span className={`text-xs font-bold mt-2 transition-colors duration-300 ${active ? 'text-primary' : completed ? 'text-green-600' : 'text-gray-300'}`}>
                {label}
            </span>
        </div>
    );
}

const TempCard: React.FC<{ label: string; value: number; type: 'hot' | 'cold' }> = ({ label, value, type }) => {
    const isHot = type === 'hot';
    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
            isHot 
            ? 'bg-red-50/50 border-red-100' 
            : 'bg-teal-50/50 border-teal-100'
        }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm ${isHot ? 'bg-white text-red-500' : 'bg-white text-teal-500'}`}>
                {isHot ? '🔥' : '❄️'}
            </div>
            <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-bold tabular-nums ${isHot ? 'text-red-600' : 'text-teal-600'}`}>{value}°C</p>
            </div>
        </div>
    );
};

export const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orders, updateOrderStatus } = useMqtt();
  const navigate = useNavigate();
  const [confirmStep, setConfirmStep] = useState(0); 
  const [isInitializing, setIsInitializing] = useState(true);

  const order = orders.find(o => o.id === id);

  // Dar 2 segundos de cortesía para que Firestore sincronice si la orden no se encuentra de inmediato
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsInitializing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Si se encuentra la orden, quitamos el estado de inicialización
  useEffect(() => {
    if (order) setIsInitializing(false);
  }, [order]);

  if (isInitializing) {
      return (
        <PageLayout className="flex items-center justify-center">
            <div className="text-center animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-gray-500 font-medium">Buscando tu pedido...</p>
            </div>
        </PageLayout>
      );
  }

  if (!order) {
      return (
        <PageLayout className="flex items-center justify-center">
            <div className="text-center animate-fade-in p-8">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-dark mb-2">Pedido no encontrado</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">No pudimos localizar la orden #{id?.slice(-5)}. Si acabas de pagar, espera unos segundos.</p>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => window.location.reload()} variant="secondary">Reintentar</Button>
                    <Button onClick={() => navigate('/menu')}>Volver al menú</Button>
                </div>
            </div>
        </PageLayout>
      );
  }

  const hasHot = order.items.some(i => i.type === 'hot');
  const hasCold = order.items.some(i => i.type === 'cold');
  const isPending = order.status === 'pending';
  const isReady = order.status === 'ready';
  const isDelivered = order.status === 'delivered';

  const handleConfirmPickup = () => {
      if (confirmStep === 0) {
          setConfirmStep(1);
      } else {
          updateOrderStatus(order.id, 'delivered');
          setConfirmStep(0);
      }
  };

  return (
    <PageLayout>
       <Navbar title={`Pedido #${order.id.slice(-5)}`} onBack={() => navigate('/menu')} transparent />
       
       <div className="max-w-md mx-auto p-6 flex flex-col items-center gap-8">
          
          {/* Timeline */}
          <div className="w-full relative flex items-center justify-between mb-4">
              <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 -z-0"></div>
              <div 
                className="absolute left-0 top-5 h-1 bg-gradient-to-r from-primary to-green-400 transition-all duration-1000 -z-0"
                style={{ width: isDelivered ? '100%' : isReady ? '50%' : '10%' }}
              ></div>
              
              <StatusStep active={isPending} completed={!isPending} label="Preparando" icon="🍳" />
              <StatusStep active={isReady} completed={isDelivered} label="Listo" icon="🥡" />
              <StatusStep active={false} completed={isDelivered} label="Entregado" icon="😋" />
          </div>

          {/* The Code Card */}
          {!isDelivered ? (
             <div className="w-full flex flex-col gap-6">
                <Card className="w-full p-8 flex flex-col items-center text-center relative overflow-hidden bg-white border border-gray-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-400 to-primary animate-pulse" />
                    
                    <h2 className="text-gray-400 font-medium uppercase tracking-widest text-xs mb-4">Código de Retiro</h2>
                    <div className="text-7xl font-black text-dark tracking-widest font-mono mb-4">
                        {order.code}
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium ${isReady ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        {isReady ? "✨ Ingresa el código en la caja" : "⏳ Espera a que tu pedido esté listo"}
                    </div>
                </Card>

                {/* Botón de Confirmación Manual */}
                {isReady && (
                    <div className="animate-fade-in">
                        <Button 
                            onClick={handleConfirmPickup}
                            fullWidth
                            className={`text-lg py-4 shadow-xl transition-all ${
                                confirmStep === 1 
                                ? '!bg-green-600 scale-105 shadow-green-600/30' 
                                : '!bg-green-500 hover:!bg-green-600 shadow-green-500/20'
                            }`}
                            icon={<span className="text-xl">{confirmStep === 1 ? '🤔' : '🛍️'}</span>}
                        >
                            {confirmStep === 1 ? '¿Confirmar que ya lo tienes?' : 'Ya retiré mi pedido'}
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-2 px-4">
                            {confirmStep === 1 ? 'Haz clic nuevamente para confirmar.' : 'Presiona este botón solo cuando la caja se haya abierto y tengas tu comida.'}
                        </p>
                    </div>
                )}
             </div>
          ) : (
            <div className="text-center animate-bounce-soft py-10">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-dark">¡Disfrútalo!</h2>
                <p className="text-gray-500 mt-2">Gracias por usar Food Box Smart.</p>
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mt-4 text-sm font-medium inline-block">
                    Pedido completado exitosamente
                </div>
            </div>
          )}

          {/* Monitoring Section */}
          {(hasHot || hasCold) && !isDelivered && (
              <div className="w-full space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <h3 className="font-bold text-gray-700 text-sm">Temperatura en tiempo real</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {hasHot && <TempCard label="Zona Caliente" value={order.simulatedTemps?.hot || 0} type="hot" />}
                    {hasCold && <TempCard label="Zona Fría" value={order.simulatedTemps?.cold || 0} type="cold" />}
                  </div>
              </div>
          )}

          {isDelivered && (
              <Button onClick={() => navigate('/menu')} fullWidth className="mt-8">Hacer otro pedido</Button>
          )}

       </div>
    </PageLayout>
  );
};
