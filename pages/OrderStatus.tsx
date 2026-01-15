
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Navbar, Card, Button, PageLayout, Badge } from '../components/UI';

const StatusStep: React.FC<{ active: boolean; completed: boolean; label: string; icon: string }> = ({ active, completed, label, icon }) => (
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

const TempCard: React.FC<{ label: string; value: number; type: 'hot' | 'cold' }> = ({ label, value, type }) => {
    const isHot = type === 'hot';
    return (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
            isHot ? 'bg-red-50/50 border-red-100' : 'bg-teal-50/50 border-teal-100'
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
  const { orders, realTemps, boxStatus, keyBuffer, confirmOrderDelivery } = useMqtt();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const order = orders.find(o => o.id === id);

  if (!order) {
      return (
        <PageLayout className="flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm mx-auto">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-xl font-black text-dark mb-2">Orden no encontrada</h2>
                <p className="text-gray-500 text-sm mb-6">Parece que este pedido ya fue procesado o no existe.</p>
                <Button onClick={() => navigate('/menu')} fullWidth>Ir al inicio</Button>
            </div>
        </PageLayout>
      );
  }

  const isPending = order.status === 'pending';
  const isReady = order.status === 'ready';
  const isDelivered = order.status === 'delivered';
  
  const isBoxBusyByOther = boxStatus.isOccupied && boxStatus.currentUserId !== user?.id;
  const isCodeMatched = keyBuffer === order.code;

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    await confirmOrderDelivery(order.id);
    setConfirming(false);
  };

  const hasHot = order.items.some(i => i.type === 'hot');
  const hasCold = order.items.some(i => i.type === 'cold');

  // Vista de Factura Final
  if (isDelivered) {
    return (
        <PageLayout className="bg-gray-100">
            <div className="max-w-md mx-auto p-6 flex flex-col items-center min-h-screen justify-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mb-6 shadow-xl shadow-green-500/20 animate-bounce-soft">
                    ✓
                </div>
                
                <div className="w-full bg-white rounded-t-3xl shadow-2xl relative p-8 pb-4">
                    {/* Estilo Ticket */}
                    <div className="absolute -top-2 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}></div>
                    
                    <div className="text-center border-b border-dashed border-gray-200 pb-6 mb-6">
                        <h2 className="text-2xl font-black text-dark uppercase tracking-tighter italic">Food Box Smart</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Recibo de Entrega Digital</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-[11px] font-mono text-gray-500">
                            <span>TRANSACCIÓN:</span>
                            <span className="font-bold text-dark">{order.id}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-gray-500">
                            <span>FECHA:</span>
                            <span className="font-bold text-dark">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono text-gray-500">
                            <span>CLIENTE:</span>
                            <span className="font-bold text-dark uppercase">{order.customerDetails?.name || 'Usuario'}</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Detalle de Productos</p>
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700 font-medium">{item.quantity}x {item.name}</span>
                                <span className="font-bold text-dark">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t-2 border-dark pt-4 flex justify-between items-end mb-6">
                        <span className="text-sm font-black text-dark">TOTAL PAGADO</span>
                        <span className="text-3xl font-black text-primary">${order.total.toFixed(2)}</span>
                    </div>

                    <div className="text-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400">¡Gracias por tu compra!</p>
                        <p className="text-[9px] text-gray-300 mt-1 uppercase tracking-tighter">Es un placer servirte comida fresca</p>
                    </div>
                </div>
                
                {/* Parte inferior del ticket (jagged edge) */}
                <div className="w-full h-4 bg-white shadow-2xl" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>

                <div className="w-full mt-8 animate-slide-up">
                    <Button 
                        onClick={() => navigate('/menu')} 
                        fullWidth 
                        className="!rounded-2xl py-5 text-lg shadow-xl shadow-dark/20 bg-dark text-white hover:bg-black"
                    >
                        Cerrar y Finalizar
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
  }

  return (
    <PageLayout>
       <Navbar title={`Pedido #${order.id.slice(-4)}`} onBack={() => navigate('/menu')} transparent />
       
       <div className="max-w-md mx-auto p-6 flex flex-col items-center gap-8">
          
          <div className="w-full relative flex items-center justify-between mb-4">
              <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 -z-0"></div>
              <div 
                className="absolute left-0 top-5 h-1 bg-gradient-to-r from-primary to-green-400 transition-all duration-1000 -z-0"
                style={{ width: isReady ? '50%' : '10%' }}
              ></div>
              
              <StatusStep active={isPending} completed={!isPending} label="Cocinando" icon="🍳" />
              <StatusStep active={isReady} completed={false} label="En Caja" icon="🥡" />
              <StatusStep active={false} completed={false} label="Contigo" icon="😋" />
          </div>

          <div className="w-full flex flex-col gap-6">
            <Card className={`w-full p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 ${isBoxBusyByOther ? 'bg-gray-50 opacity-80' : 'bg-white border-gray-100 shadow-xl'}`}>
                {isBoxBusyByOther ? (
                    <div className="animate-pulse space-y-4">
                        <span className="text-4xl">⏳</span>
                        <h3 className="font-bold text-dark">Caja en uso</h3>
                        <p className="text-sm text-gray-400">Otro cliente está retirando su pedido. Por favor espera un momento.</p>
                    </div>
                ) : (
                    <>
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-400 to-primary animate-pulse" />
                        <h2 className="text-gray-400 font-medium uppercase tracking-widest text-xs mb-4">Código de Retiro</h2>
                        <div className={`text-7xl font-black transition-colors duration-300 tracking-widest font-mono mb-4 ${isCodeMatched ? 'text-green-500' : 'text-dark'}`}>
                            {isReady && isCodeMatched ? keyBuffer : order.code}
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isCodeMatched ? 'bg-green-100 text-green-700 font-black' : isReady ? 'bg-orange-50 text-orange-600 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                            {isCodeMatched ? "✅ CÓDIGO DETECTADO" : isReady ? "✨ Tu pedido te espera en la caja" : "⏳ Estamos preparando tu comida..."}
                        </div>
                    </>
                )}
            </Card>

            {isReady && !isBoxBusyByOther && (
                <div className="animate-slide-up space-y-4">
                    <Button 
                        onClick={handleConfirmDelivery} 
                        isLoading={confirming}
                        fullWidth 
                        className="bg-primary hover:bg-orange-600 text-white text-lg py-6 shadow-2xl shadow-orange-500/30 ring-4 ring-orange-50"
                        icon={<span className="text-2xl">🧺</span>}
                    >
                        Abrir Food Box y Retirar
                    </Button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                        ¡Presiona el botón para desbloquear la puerta!
                    </p>
                </div>
            )}

            {isReady && !isBoxBusyByOther && (
                <div className="space-y-4 animate-fade-in pt-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                        <span className="text-2xl">💡</span>
                        <p className="text-xs text-blue-700 font-medium">
                            Al abrir la puerta, retira tus productos de las zonas: <br/>
                            <span className="font-bold">{hasHot ? '🔥 Caliente' : ''} {hasHot && hasCold ? 'y' : ''} {hasCold ? '❄️ Fría' : ''}</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <TempCard label="Caliente" value={realTemps.hot} type="hot" />
                        <TempCard label="Frío" value={realTemps.cold} type="cold" />
                    </div>
                </div>
            )}

            {isPending && (
                <div className="text-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-2xl">👨‍🍳</div>
                    <p className="text-gray-500 text-sm font-medium">Mantendremos tu comida a la temperatura ideal hasta que llegues.</p>
                </div>
            )}
          </div>
       </div>
    </PageLayout>
  );
};
