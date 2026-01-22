
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Card, Button, PageLayout, Badge, Input, Alert } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { database } from '../services/database';
import { PRODUCTS } from '../constants';

type TabView = 'dashboard' | 'inventory' | 'history' | 'sensors';

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
    const { orders, realTemps, boxStatus, inventory, toggleProduct } = useMqtt();
    const { logout } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    
    const [currentTab, setCurrentTab] = useState<TabView>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSimMode, setIsSimMode] = useState(false);
    
    // Referencias para evitar spam de notificaciones
    const lastAlertTime = useRef({ hot: 0, cold: 0 });

    const tempAlerts = useMemo(() => {
        const alerts: { msg: string; type: 'warning' | 'critical' }[] = [];
        const now = Date.now();
        const COOLDOWN = 60000; // 1 minuto de cooldown entre notificaciones push del mismo sensor

        if (realTemps.hot < 60) {
            alerts.push({ msg: "Calor Insuficiente: Riesgo de bacterias", type: 'critical' });
            if (now - lastAlertTime.current.hot > COOLDOWN) {
                addNotification({ title: "🚨 ALERTA CALOR", body: "Temperatura del módulo caliente por debajo de 60°C", type: 'critical' });
                lastAlertTime.current.hot = now;
            }
        } else if (realTemps.hot > 85) {
            alerts.push({ msg: "Calor Excesivo: Riesgo de sobrecocción", type: 'warning' });
        }

        if (realTemps.cold > 8) {
            alerts.push({ msg: "Pérdida de Frío: Riesgo de descomposición", type: 'critical' });
            if (now - lastAlertTime.current.cold > COOLDOWN) {
                addNotification({ title: "❄️ ALERTA FRÍO", body: "Módulo frío ha superado los 8°C. ¡Acción requerida!", type: 'critical' });
                lastAlertTime.current.cold = now;
            }
        } else if (realTemps.cold < -2) {
            alerts.push({ msg: "Frío Extremo: Riesgo de congelación", type: 'warning' });
        }
        
        return alerts;
    }, [realTemps, addNotification]);

    const stats = useMemo(() => {
        const productCounts: { [id: number]: { name: string, count: number } } = {};
        const customerCounts: { [name: string]: { totalSpent: number, count: number } } = {};
        let income = 0;
        let units = 0;

        orders.forEach(o => {
            if (o.status === 'cancelled') return;
            income += (o.total || 0);
            o.items?.forEach(item => {
                units += item.quantity;
                if (!productCounts[item.id]) productCounts[item.id] = { name: item.name, count: 0 };
                productCounts[item.id].count += item.quantity;
            });
            const custName = o.customerDetails?.name || 'Usuario';
            if (!customerCounts[custName]) customerCounts[custName] = { totalSpent: 0, count: 0 };
            customerCounts[custName].totalSpent += o.total;
            customerCounts[custName].count += 1;
        });

        const sortedProds = Object.entries(productCounts).sort((a,b) => b[1].count - a[1].count);
        return {
            income, units,
            topProduct: sortedProds[0]?.[1] || { name: 'N/A', count: 0 },
            worstProduct: sortedProds[sortedProds.length-1]?.[1] || { name: 'N/A', count: 0 },
            topCustomers: Object.entries(customerCounts).sort((a,b) => b[1].totalSpent - a[1].totalSpent).slice(0, 3)
        };
    }, [orders]);

    const filteredOrders = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        return (o.id || '').toLowerCase().includes(term) || (o.customerDetails?.name || '').toLowerCase().includes(term);
    });

    const handleTempChange = async (type: 'hot' | 'cold', val: number) => {
        const newTemps = { ...realTemps, [type]: val };
        await database.updateSensors(newTemps.hot, newTemps.cold);
    };

    return (
        <PageLayout className="bg-[#F3F4F6]">
            <div className="bg-dark text-white rounded-b-[3rem] pt-10 pb-16 px-6 shadow-2xl relative overflow-hidden mb-10">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-3xl">🛠️</div>
                        <div><h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Administración</h2><h1 className="text-3xl font-black">Panel Food Box</h1></div>
                     </div>
                     <div className="flex items-center gap-3">
                         {tempAlerts.length > 0 && (
                             <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-xl animate-pulse">
                                 <span className="text-sm font-black text-red-400">🚨 {tempAlerts.length} ALERTAS</span>
                             </div>
                         )}
                         <Button variant="secondary" onClick={() => { logout(); navigate('/'); }} className="!bg-white/10 !text-white border-white/20">Cerrar Sesión</Button>
                     </div>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-10">
                <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar border border-gray-100">
                    {[
                        { id: 'dashboard', label: 'Resumen', icon: '📊' },
                        { id: 'inventory', label: 'Stock', icon: '🥦' },
                        { id: 'history', label: 'Ventas', icon: '📜' },
                        { id: 'sensors', label: 'IoT & Alertas', icon: '🌡️' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id as TabView)}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                currentTab === tab.id ? 'bg-dark text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <span>{tab.icon}</span> <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                {currentTab === 'dashboard' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Ganancia" value={`$${stats.income.toFixed(2)}`} sub="Total acumulado" icon="💰" colorClass="from-yellow-400 to-orange-500" />
                            <StatCard title="Pedidos" value={stats.units} sub="Unidades vendidas" icon="📦" colorClass="from-blue-400 to-indigo-500" />
                            <StatCard title="Top Venta" value={stats.topProduct.name} sub="El favorito" icon="⭐" colorClass="from-orange-400 to-red-500" />
                            <StatCard title="Box Status" value={boxStatus.isOccupied ? 'Ocupado' : 'Libre'} sub="Estado actual" icon="🏢" colorClass="from-teal-400 to-emerald-500" />
                        </div>
                    </div>
                )}

                {currentTab === 'inventory' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-col">
                                <h3 className="font-black text-dark text-xl uppercase tracking-tighter italic">Gestión de Inventario</h3>
                                <p className="text-xs text-gray-400 font-medium">Controla la disponibilidad en tiempo real de {PRODUCTS.length} platos.</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge type="hot" />
                                <Badge type="cold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {PRODUCTS.map(prod => {
                                const isAvailable = inventory[prod.id.toString()] !== false;
                                return (
                                    <Card key={prod.id} className="relative group transition-all duration-500">
                                        <div className={`relative h-40 overflow-hidden ${!isAvailable ? 'grayscale opacity-40' : ''}`}>
                                            <img src={prod.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            {prod.onSale && (
                                                <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded text-[8px]">OFERTA</div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <Badge type={prod.type} className="shadow-lg backdrop-blur-md bg-white/90" />
                                            </div>
                                            {!isAvailable && (
                                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <span className="bg-red-500 text-white font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest shadow-xl">Agotado</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-bold text-dark text-sm truncate mb-4">{prod.name}</h4>
                                            <Button 
                                                variant={isAvailable ? 'primary' : 'outline'} 
                                                fullWidth 
                                                onClick={() => toggleProduct(prod.id, !isAvailable)}
                                                className="!py-2.5 !text-[10px] uppercase tracking-widest"
                                            >
                                                {isAvailable ? 'En Stock ✓' : 'Habilitar'}
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentTab === 'sensors' && (
                    <div className="animate-fade-in space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className={`p-12 text-center border-b-8 transition-all duration-500 ${
                                realTemps.hot < 60 || realTemps.hot > 85 ? 'border-red-600 ring-4 ring-red-500/20 bg-red-50 animate-pulse' : 'border-red-500'
                            }`}>
                                <div className="text-6xl mb-4">🔥</div>
                                <p className="text-gray-400 font-bold uppercase text-xs mb-2">Sensor Caliente</p>
                                <div className={`text-8xl font-black ${realTemps.hot < 60 || realTemps.hot > 85 ? 'text-red-700' : 'text-red-600'}`}>
                                    {realTemps.hot}°C
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">Óptimo: 60°C - 80°C</p>
                            </Card>

                            <Card className={`p-12 text-center border-b-8 transition-all duration-500 ${
                                realTemps.cold > 8 || realTemps.cold < -2 ? 'border-red-600 ring-4 ring-red-500/20 bg-red-50 animate-pulse' : 'border-teal-500'
                            }`}>
                                <div className="text-6xl mb-4">❄️</div>
                                <p className="text-gray-400 font-bold uppercase text-xs mb-2">Sensor Frío</p>
                                <div className={`text-8xl font-black ${realTemps.cold > 8 || realTemps.cold < -2 ? 'text-red-700' : 'text-teal-600'}`}>
                                    {realTemps.cold}°C
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">Óptimo: 0°C - 7°C</p>
                            </Card>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex flex-col">
                                    <h3 className="font-black text-dark text-xl uppercase tracking-tighter italic">Simulador IoT</h3>
                                    <p className="text-xs text-gray-400 font-medium">Prueba el sistema de notificaciones críticas</p>
                                </div>
                                <button onClick={() => setIsSimMode(!isSimMode)} className={`w-16 h-8 rounded-full transition-all flex items-center px-1 ${isSimMode ? 'bg-primary' : 'bg-gray-200'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full transition-all ${isSimMode ? 'translate-x-8' : ''}`}></div>
                                </button>
                            </div>
                            {isSimMode && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-slide-up">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Calor</p>
                                            <span className="text-xl font-bold text-red-600">{realTemps.hot}°C</span>
                                        </div>
                                        <input type="range" min="30" max="100" value={realTemps.hot} onChange={(e) => handleTempChange('hot', parseInt(e.target.value))} className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-600" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Frío</p>
                                            <span className="text-xl font-bold text-teal-600">{realTemps.cold}°C</span>
                                        </div>
                                        <input type="range" min="-15" max="25" value={realTemps.cold} onChange={(e) => handleTempChange('cold', parseInt(e.target.value))} className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};
