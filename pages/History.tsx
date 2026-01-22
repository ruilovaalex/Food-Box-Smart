
import React from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Navbar, Card, PageLayout, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const History: React.FC = () => {
    const { orders } = useMqtt();
    const { user } = useAuth();
    const navigate = useNavigate();

    const myOrders = orders
        .filter(o => o.userId === user?.id)
        .sort((a, b) => b.createdAt - a.createdAt);

    return (
        <PageLayout className="bg-[#F8F9FD]">
            <Navbar title="Mi Actividad" onBack={() => navigate('/menu')} />
            
            <div className="max-w-2xl mx-auto p-6">
                <header className="mb-8">
                    <h2 className="text-3xl font-black text-dark tracking-tight">Historial de <br/><span className="text-primary italic">Momentos Food Box</span></h2>
                    <p className="text-gray-400 text-sm font-medium mt-1">Has disfrutado de {myOrders.length} pedidos inteligentes.</p>
                </header>

                <div className="space-y-6">
                    {myOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in bg-white rounded-[3rem] shadow-sm border border-gray-100">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 grayscale opacity-50">📜</div>
                            <h3 className="text-xl font-black text-dark mb-2">Aún no hay historias</h3>
                            <p className="text-gray-400 max-w-[200px] text-sm font-medium">Tus pedidos aparecerán aquí una vez que realices tu primera compra.</p>
                            <button 
                                onClick={() => navigate('/menu')}
                                className="mt-8 text-primary font-black text-xs uppercase tracking-[0.2em] border-b-2 border-primary pb-1"
                            >
                                Ir al menú ahora
                            </button>
                        </div>
                    ) : (
                        myOrders.map((order, index) => {
                            const isDelivered = order.status === 'delivered';
                            const isReady = order.status === 'ready';
                            
                            return (
                                <Card 
                                    key={order.id} 
                                    onClick={() => navigate(`/order/${order.id}`)}
                                    className="p-6 !rounded-[2.5rem] border-white hover:border-primary/20 transition-all group animate-slide-up relative overflow-hidden"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Decoración lateral de estado */}
                                    <div className={`absolute left-0 top-0 w-2 h-full ${
                                        isDelivered ? 'bg-gray-100' : isReady ? 'bg-green-500' : 'bg-primary'
                                    }`} />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Orden de Retiro</span>
                                            <h4 className="text-lg font-black text-dark font-mono">{order.id}</h4>
                                        </div>
                                        <Badge 
                                            type={order.status} 
                                            className={`${
                                                isDelivered ? 'bg-gray-50 text-gray-400 border-gray-100' : 
                                                isReady ? 'bg-green-50 text-green-600 border-green-100' : 
                                                'bg-orange-50 text-orange-600 border-orange-100'
                                            }`}
                                        >
                                            {order.status === 'pending' && 'En Cocina 🍳'}
                                            {order.status === 'ready' && 'Listo en Box ✨'}
                                            {order.status === 'delivered' && 'Disfrutado 😋'}
                                        </Badge>
                                    </div>

                                    {/* Visualización de Productos (Thumbnails) */}
                                    <div className="flex items-center gap-3 mb-6 overflow-x-auto no-scrollbar pb-1">
                                        {order.items.slice(0, 4).map((item, i) => (
                                            <div key={i} className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-50 flex-shrink-0">
                                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                                                {item.quantity > 1 && (
                                                    <div className="absolute -top-1 -right-1 bg-dark text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                                        {item.quantity}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 border border-dashed border-gray-200">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-5 border-t border-gray-50">
                                        <div className="flex flex-col">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monto Total</p>
                                            <p className="text-xl font-black text-primary">${order.total.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black text-gray-300 group-hover:text-primary transition-colors uppercase tracking-widest">
                                            Detalles
                                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>

                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-bold text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Espaciador inferior */}
            <div className="h-20" />
        </PageLayout>
    );
};
