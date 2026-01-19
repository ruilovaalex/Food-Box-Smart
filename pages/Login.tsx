import React, { useState, useMemo } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, PageLayout, Badge, Input } from '../components/UI';
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
    const { orders, resetDatabase, realTemps, boxStatus, inventory, toggleProduct } = useMqtt();
    const { logout } = useAuth();
    const navigate = useNavigate();
    
    const [currentTab, setCurrentTab] = useState<TabView>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [isSimMode, setIsSimMode] = useState(false);

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
            {/* Header */}
            <div className="bg-dark text-white rounded-b-[3rem] pt-10 pb-16 px-6 shadow-2xl relative overflow-hidden mb-10">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-3xl">🛠️</div>
                        <div><h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Administración</h2><h1 className="text-3xl font-black">Panel Food Box</h1></div>
                     </div>
                     <Button variant="secondary" onClick={() => { logout(); navigate('/'); }} className="!bg-white/10 !text-white border-white/20">Cerrar Sesión</Button>
                 </div>
            </div>

            {/* Nav Tabs */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-10">
                <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar border border-gray-100">
                    {[
                        { id: 'dashboard', label: 'Resumen', icon: '📊' },
                        { id: 'inventory', label: 'Stock', icon: '🥦' },
                        { id: 'history', label: 'Ventas', icon: '📜' },
                        { id: 'sensors', label: 'IoT', icon: '🌡️' },
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

            {/* Content Area */}
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
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.map(prod => {
                            const isAvailable = inventory[prod.id.toString()] !== false;
                            return (
                                <Card key={prod.id} className="p-6">
                                    <div className="flex gap-4 mb-4">
                                        <img src={prod.image} className={`w-20 h-20 rounded-2xl object-cover ${!isAvailable ? 'grayscale opacity-50' : ''}`} />
                                        <div>
                                            <h4 className="font-bold text-dark text-lg">{prod.name}</h4>
                                            <Badge type={prod.type} className="scale-75 origin-left" />
                                        </div>
                                    </div>
                                    <Button variant={isAvailable ? 'primary' : 'outline'} fullWidth onClick={() => toggleProduct(prod.id, !isAvailable)}>
                                        {isAvailable ? 'En Stock ✓' : 'Marcar disponible'}
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {currentTab === 'history' && (
                    <div className="animate-fade-in space-y-6">
                        <Input placeholder="🔍 Buscar por nombre o ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} icon="🔎" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrders.map(order => (
                                <Card key={order.id} className="p-5 border-l-4 border-primary">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-black text-dark">{order.customerDetails?.name || 'Cliente'}</p>
                                        <Badge type={order.status === 'delivered' ? 'Entregado' : 'Listo'} className="scale-75" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>#{order.id}</span>
                                        <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {currentTab === 'sensors' && (
                    <div className="animate-fade-in space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="p-12 text-center border-b-8 border-red-500 shadow-xl">
                                <div className="text-6xl mb-4">🔥</div>
                                <p className="text-gray-400 font-bold uppercase text-xs mb-2">Sensor Caliente</p>
                                <div className="text-8xl font-black text-red-600">{realTemps.hot}°C</div>
                            </Card>
                            <Card className="p-12 text-center border-b-8 border-teal-500 shadow-xl">
                                <div className="text-6xl mb-4">❄️</div>
                                <p className="text-gray-400 font-bold uppercase text-xs mb-2">Sensor Frío</p>
                                <div className="text-8xl font-black text-teal-600">{realTemps.cold}°C</div>
                            </Card>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="font-black text-dark text-xl uppercase tracking-tighter italic">Simulador de Sensores</h3>
                                <button onClick={() => setIsSimMode(!isSimMode)} className={`w-16 h-8 rounded-full transition-all flex items-center px-1 ${isSimMode ? 'bg-primary' : 'bg-gray-200'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full transition-all ${isSimMode ? 'translate-x-8' : ''}`}></div>
                                </button>
                            </div>
                            {isSimMode && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-slide-up">
                                    <div><p className="text-xs font-bold text-gray-400 mb-4">Ajustar Calor (°C)</p><input type="range" min="40" max="90" value={realTemps.hot} onChange={(e) => handleTempChange('hot', parseInt(e.target.value))} className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-600" /></div>
                                    <div><p className="text-xs font-bold text-gray-400 mb-4">Ajustar Frío (°C)</p><input type="range" min="-10" max="15" value={realTemps.cold} onChange={(e) => handleTempChange('cold', parseInt(e.target.value))} className="w-full h-2 bg-teal-100 rounded-lg appearance-none cursor-pointer accent-teal-600" /></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};
