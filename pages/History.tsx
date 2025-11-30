
import React from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Navbar, Card, PageLayout } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const History: React.FC = () => {
    const { orders } = useMqtt();
    const { user } = useAuth();
    const navigate = useNavigate();

    const myOrders = orders
        .filter(o => o.userId === user?.id)
        .sort((a, b) => b.createdAt - a.createdAt);

    return (
        <PageLayout>
            <Navbar title="Mis Pedidos" onBack={() => navigate('/menu')} />
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {myOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                        <span className="text-4xl mb-4">📜</span>
                        <p>No tienes pedidos registrados.</p>
                    </div>
                ) : (
                    myOrders.map((order, index) => (
                        <Card 
                            key={order.id} 
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="p-5 flex justify-between items-center group animate-slide-up"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-12 rounded-2xl flex items-center justify-center text-xs font-bold shadow-sm ${
                                    order.status === 'delivered' ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-primary'
                                }`}>
                                    {order.id}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">
                                        {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                    <p className="text-sm font-semibold text-dark">
                                        {order.items.length} ítems • <span className="text-primary">${order.total.toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                    order.status === 'delivered' 
                                    ? 'bg-gray-50 text-gray-500 border-gray-100' 
                                    : order.status === 'ready' 
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                    {order.status === 'pending' && 'En cocina'}
                                    {order.status === 'ready' && 'Listo'}
                                    {order.status === 'delivered' && 'Entregado'}
                                    {order.status === 'cancelled' && 'Cancelado'}
                                </span>
                                <span className="text-gray-300 group-hover:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </span>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </PageLayout>
    );
};
