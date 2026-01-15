
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
            <div className="text-center">
                <p className="text-lg text-gray-500 mb-4">Orden no encontrada</p>
                <Button onClick={() => navigate('/menu')}>Volver al menú</Button>
            </div>
        </PageLayout>
      );
  }

  const isPending = order.status === 'pending';
  const isReady = order.status === 'ready';
  const isDelivered = order.status === 'delivered';
  
  // Lógica de "Fila Virtual": Si la caja está ocupada por otro usuario
  const isBoxBusyByOther = boxStatus.isOccupied && boxStatus.currentUserId !== user?.id;

  // Verificación de código opcional (si el usuario decide usar el teclado físico)
  const isCodeMatched = keyBuffer === order.code;

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    await confirmOrderDelivery(order.id);
    setConfirming(false);
  };

  const hasHot = order.items.some(i => i.type === 'hot');
  const hasCold = order.items.some(i => i.type === 'cold');

  return (
    <PageLayout>
       <Navbar title={`Pedido #${order.id.slice(-4)}`} onBack={() => navigate('/menu')} transparent />
       
       <div className="max-w-md mx-auto p-6 flex flex-col items-center gap-8">
          
          <div className="w-full relative flex items-center justify-between mb-4">
              <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 -z-0"></div>
              <div 
                className="absolute left-0 top-5 h-1 bg-gradient-to-r from-primary to-green-400 transition-all duration-1000 -z-0"
                style={{ width: isDelivered ? '100%' : isReady ? '50%' : '10%' }}
              ></div>
              
              <StatusStep active={isPending} completed={!isPending} label="Cocinando" icon="🍳" />
              <StatusStep active={isReady} completed={isDelivered} label="En Caja" icon="🥡" />
              <StatusStep active={false} completed={isDelivered} label="Contigo" icon="😋" />
          </div>

          {!isDelivered ? (
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

                {/* BOTÓN DE CONFIRMACIÓN PRINCIPAL - Aparece cuando está listo sin obligar el código */}
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
          ) : (
            <div className="w-full text-center animate-fade-in flex flex-col items-center">
                <div className="text-6xl mb-4 animate-bounce-soft">🎉</div>
                <h2 className="text-3xl font-black text-dark tracking-tight">¡Pedido Entregado!</h2>
                <p className="text-gray-500 mt-2 mb-6 font-medium">Gracias por confiar en Food Box Smart.</p>
                
                <div className="w-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-3">Resumen de tu retiro</h3>
                    <div className="space-y-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-xs font-bold">{item.quantity}x</div>
                                    <span className="text-dark font-bold text-sm">{item.name}</span>
                                </div>
                                <Badge type={item.type} className="scale-75" />
                            </div>
                        ))}
                    </div>
                </div>

                <Button onClick={() => navigate('/menu')} variant="secondary" className="w-full py-4 !rounded-2xl">Volver al Menú</Button>
            </div>
          )}
       </div>
    </PageLayout>
  );
};
