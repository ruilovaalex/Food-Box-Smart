
import React, { useState, useMemo, useRef } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Card, Button, PageLayout, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { database } from '../services/database';
import { PRODUCTS } from '../constants';

type TabView = 'dashboard' | 'kitchen' | 'history' | 'inventory' | 'sensors';

const StatCard: React.FC<{ title: string, value: string | number, sub: string, icon: string, colorClass: string }> = ({ title, value, sub, icon, colorClass }) => (
    <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 transition-all duration-300">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-[3rem]`}></div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-2xl mb-4 shadow-sm`}>{icon}</div>
            <h3 className="text-3xl font-black text-dark tracking-tight mb-1">{value}</h3>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
            <p className="text-gray-400 text-xs">{sub}</p>
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    const { orders, realTemps, boxStatus, inventory, toggleProduct, updateOrderStatus } = useMqtt();
    const { logout } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    
    const [currentTab, setCurrentTab] = useState<TabView>('kitchen');
    const [searchTerm, setSearchTerm] = useState('');
    
    const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
    const allOrdersSorted = useMemo(() => [...orders].sort((a, b) => b.createdAt - a.createdAt), [orders]);

    const tempAlerts = useMemo(() => {
        const alerts: { msg: string; type: 'warning' | 'critical' }[] = [];
        if (realTemps.hot < 60) {
            alerts.push({ msg: "Calor Crítico: Temperatura insuficiente", type: 'critical' });
        }
        if (realTemps.cold > 8) {
            alerts.push({ msg: "Frío Crítico: Pérdida de refrigeración", type: 'critical' });
        }
        return alerts;
    }, [realTemps]);

    const stats = useMemo(() => {
        let income = 0;
        let units = 0;
        const salesByProduct: { [id: number]: { units: number, total: number, lastUser: string } } = {};
        const dailySales: { [date: string]: number } = {};

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailySales[d.toLocaleDateString('es-ES', { weekday: 'short' })] = 0;
        }

        orders.forEach(o => {
            if (o.status !== 'cancelled') {
                income += (o.total || 0);
                
                const dayLabel = new Date(o.createdAt).toLocaleDateString('es-ES', { weekday: 'short' });
                if (dailySales[dayLabel] !== undefined) {
                    dailySales[dayLabel] += o.total;
                }

                o.items?.forEach(i => {
                    units += i.quantity;
                    if (!salesByProduct[i.id]) salesByProduct[i.id] = { units: 0, total: 0, lastUser: 'Sin registros' };
                    salesByProduct[i.id].units += i.quantity;
                    salesByProduct[i.id].total += (i.price * i.quantity);
                    salesByProduct[i.id].lastUser = o.customerDetails?.name || 'Cliente';
                });
            }
        });

        const sortedPerformance = PRODUCTS
            .map(p => ({
                ...p,
                ...(salesByProduct[p.id] || { units: 0, total: 0, lastUser: 'Sin ventas' })
            }))
            .sort((a, b) => b.units - a.units);

        return { 
            income, 
            units, 
            sortedPerformance,
            dailySales: Object.entries(dailySales).map(([day, val]) => ({ day, val }))
        };
    }, [orders]);

    const handleTempChange = async (type: 'hot' | 'cold', val: number) => {
        const newTemps = { ...realTemps, [type]: val };
        await database.updateSensors(newTemps.hot, newTemps.cold);
    };

    const handleSendToBox = (orderId: string) => {
        updateOrderStatus(orderId, 'ready');
        addNotification({ 
            title: "✅ PEDIDO EN CAJA", 
            body: `La orden ${orderId} ha sido colocada en la Food Box.`, 
            type: 'success' 
        });
    };

    return (
        <PageLayout className="bg-[#F3F4F6]">
            <div className="bg-dark text-white rounded-b-[4rem] pt-12 pb-20 px-8 shadow-2xl relative overflow-hidden mb-12">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/20 text-4xl shadow-2xl">👨‍🍳</div>
                        <div>
                            <h2 className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-1">Kitchen Console</h2>
                            <h1 className="text-4xl font-black tracking-tighter">Food Box Admin</h1>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                         <Button variant="secondary" onClick={() => { logout(); navigate('/'); }} className="!bg-white/5 !text-white border-white/10 hover:!bg-red-500/20 transition-all px-8">Cerrar Sesión</Button>
                     </div>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 mb-12">
                <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-2xl flex gap-2 overflow-x-auto no-scrollbar border border-white/50">
                    {[
                        { id: 'kitchen', label: 'Cocina', icon: '🔥' },
                        { id: 'history', label: 'Órdenes', icon: '📜' },
                        { id: 'dashboard', label: 'Reportes', icon: '📊' },
                        { id: 'inventory', label: 'Stock', icon: '📦' },
                        { id: 'sensors', label: 'Sensores', icon: '🌡️' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id as TabView)}
                            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black text-sm transition-all whitespace-nowrap ${
                                currentTab === tab.id ? 'bg-primary text-white shadow-2xl scale-105' : 'text-gray-400 hover:bg-white/50'
                            }`}
                        >
                            <span>{tab.icon}</span> <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-24">
                {currentTab === 'kitchen' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-2xl font-black text-dark tracking-tight">Pedidos por Preparar ({pendingOrders.length})</h3>
                            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                                <div className={`w-3 h-3 rounded-full ${boxStatus.isOccupied ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                <span className="text-xs font-black uppercase tracking-widest text-dark">
                                    Caja: {boxStatus.isOccupied ? 'OCUPADA' : 'DISPONIBLE'}
                                </span>
                            </div>
                        </div>

                        {pendingOrders.length === 0 ? (
                            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                                <span className="text-6xl mb-6 block">😴</span>
                                <h4 className="text-xl font-black text-dark">Sin pedidos pendientes</h4>
                                <p className="text-gray-400 mt-2">Todo está bajo control en la cocina.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingOrders.map(order => (
                                    <Card key={order.id} className="p-8 !rounded-[2.5rem] border-2 border-orange-50 flex flex-col h-full hover:border-primary transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Orden #{order.id.slice(-5)}</span>
                                                <h4 className="text-lg font-black text-dark truncate max-w-[150px]">{order.customerDetails?.name || 'Cliente'}</h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400 font-bold block">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4 mb-8">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                                    <span className="text-lg">{item.type === 'hot' ? '🔥' : '❄️'}</span>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-dark">{item.quantity}x {item.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                                            <Button 
                                                onClick={() => handleSendToBox(order.id)}
                                                fullWidth
                                                className="!py-4 bg-dark text-white hover:bg-primary shadow-xl"
                                                icon="📦"
                                            >
                                                COLOCAR EN CAJA
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {currentTab === 'history' && (
                    <div className="animate-fade-in bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex justify-between items-end">
                            <div>
                                <h3 className="text-2xl font-black text-dark tracking-tight uppercase italic">Registro Maestro de Ventas</h3>
                                <p className="text-gray-400 text-sm font-medium">Revisión detallada de cada orden generada en el sistema.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Órdenes</span>
                                <p className="text-2xl font-black text-dark">{allOrdersSorted.length}</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha y Hora</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cliente</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ID Orden</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {allOrdersSorted.map(order => {
                                        const isCompleted = order.status === 'delivered' || order.status === 'ready';
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-dark">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="font-black text-dark text-sm uppercase tracking-tight">{order.customerDetails?.name || 'Invitado'}</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-primary transition-colors">#{order.id}</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-500 ${isCompleted ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20 animate-pulse'}`}></div>
                                                        <Badge type={order.status} className="!text-[9px]" />
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <span className="font-black text-dark tracking-tighter text-lg">${order.total.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {currentTab === 'dashboard' && (
                    <div className="animate-fade-in space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <StatCard title="Ingresos" value={`$${stats.income.toFixed(2)}`} sub="Total ventas brutas" icon="💰" colorClass="from-green-400 to-emerald-600" />
                            <StatCard title="Vendidos" value={stats.units} sub="Unidades totales" icon="📦" colorClass="from-blue-400 to-indigo-600" />
                            <StatCard title="Box" value={boxStatus.isOccupied ? 'OCUPADO' : 'LIBRE'} sub="Estado actual" icon="🏢" colorClass="from-teal-400 to-cyan-600" />
                            <StatCard title="Alertas" value={tempAlerts.length} sub="Incidencias activas" icon="🚨" colorClass="from-red-400 to-orange-600" />
                        </div>

                        <Card className="p-10 !rounded-[3rem] border border-gray-100">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-dark tracking-tighter italic uppercase">Ventas última semana</h3>
                                    <p className="text-gray-400 font-medium text-sm">Rendimiento diario de ingresos (USD)</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Promedio</span>
                                    <p className="text-xl font-black text-primary">${(stats.income / 7).toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <div className="h-64 flex items-end justify-between gap-4 px-4">
                                {stats.dailySales.map((data, i) => {
                                    const maxVal = Math.max(...stats.dailySales.map(d => d.val), 1);
                                    const heightPercent = (data.val / maxVal) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-dark text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none">
                                                ${data.val.toFixed(2)}
                                            </div>
                                            <div 
                                                className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-2xl transition-all duration-1000 shadow-lg shadow-orange-500/10 hover:brightness-110" 
                                                style={{ height: `${heightPercent}%`, minHeight: data.val > 0 ? '8px' : '2px' }}
                                            />
                                            <span className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                )}

                {currentTab === 'inventory' && (
                    <div className="animate-fade-in bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-dark tracking-tight">Maestro de Inventario</h3>
                                <p className="text-gray-400 text-sm font-medium">Gestiona la disponibilidad de tus productos por nombre.</p>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-4 border border-gray-100">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Filtrar por nombre:</span>
                                <input 
                                    type="text" 
                                    placeholder="Buscar..." 
                                    className="bg-transparent border-none outline-none font-bold text-dark w-40"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Producto</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categoría</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Precio</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {PRODUCTS.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(prod => {
                                        const isAvailable = inventory[prod.id.toString()] !== false;
                                        return (
                                            <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-400">{prod.id}</div>
                                                        <span className="font-bold text-dark text-lg group-hover:text-primary transition-colors">{prod.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <Badge type={prod.type} />
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="font-black text-dark tracking-tighter text-lg">${prod.price.toFixed(2)}</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${isAvailable ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                                        <span className="text-[10px] font-black uppercase">{isAvailable ? 'En Stock' : 'Agotado'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <button 
                                                        onClick={() => toggleProduct(prod.id, !isAvailable)}
                                                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                            isAvailable ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-dark text-white hover:bg-primary shadow-xl'
                                                        }`}
                                                    >
                                                        {isAvailable ? 'Marcar Agotado' : 'Habilitar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {currentTab === 'sensors' && (
                    <div className="animate-fade-in space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <Card className={`p-16 text-center border-b-8 transition-all duration-700 !rounded-[3.5rem] ${
                                realTemps.hot < 60 ? 'border-red-600 bg-red-50/30' : 'border-orange-500'
                            }`}>
                                <div className="text-7xl mb-6">🔥</div>
                                <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em] mb-4">Módulo Caliente</p>
                                <div className={`text-9xl font-black ${realTemps.hot < 60 ? 'text-red-700' : 'text-dark'}`}>
                                    {realTemps.hot}°C
                                </div>
                                <div className="mt-8 flex justify-center">
                                     <span className="px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100 text-[10px] font-black uppercase text-gray-400">Objetivo: 65°C</span>
                                </div>
                            </Card>

                            <Card className={`p-16 text-center border-b-8 transition-all duration-700 !rounded-[3.5rem] ${
                                realTemps.cold > 8 ? 'border-red-600 bg-red-50/30' : 'border-teal-500'
                            }`}>
                                <div className="text-7xl mb-6">❄️</div>
                                <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em] mb-4">Módulo Frío</p>
                                <div className={`text-9xl font-black ${realTemps.cold > 8 ? 'text-red-700' : 'text-dark'}`}>
                                    {realTemps.cold}°C
                                </div>
                                <div className="mt-8 flex justify-center">
                                     <span className="px-6 py-2 rounded-full bg-white shadow-sm border border-gray-100 text-[10px] font-black uppercase text-gray-400">Objetivo: 4°C</span>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};
