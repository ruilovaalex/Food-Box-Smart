
import React, { useState, useMemo } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, PageLayout, Badge, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { database } from '../services/database';
import { PRODUCTS } from '../constants';

type TabView = 'dashboard' | 'inventory' | 'history' | 'simulator' | 'sensors';

interface StatCardProps {
    title: string;
    value: string | number;
    sub: string;
    icon: string;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, colorClass }) => (
    <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 group transition-all duration-300">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-[3rem]`}></div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-2xl mb-4`}>{icon}</div>
            <h3 className="text-3xl font-black text-dark tracking-tight mb-1">{value}</h3>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
            <p className="text-gray-400 text-xs">{sub}</p>
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    const { orders, resetDatabase, realTemps, boxStatus, keyBuffer, confirmOrderDelivery, inventory, toggleProduct } = useMqtt();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    
    const [currentTab, setCurrentTab] = useState<TabView>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    // --- Cálculos de Estadísticas Avanzadas ---
    const stats = useMemo(() => {
        const productCounts: { [id: number]: { name: string, count: number } } = {};
        const customerCounts: { [name: string]: { totalSpent: number, count: number } } = {};
        let income = 0;
        let units = 0;

        orders.forEach(o => {
            if (o.status === 'cancelled') return;
            income += (o.total || 0);
            
            // Stats por Producto
            o.items?.forEach(item => {
                units += item.quantity;
                if (!productCounts[item.id]) productCounts[item.id] = { name: item.name, count: 0 };
                productCounts[item.id].count += item.quantity;
            });

            // Stats por Cliente
            const custName = o.customerDetails?.name || o.userId;
            if (!customerCounts[custName]) customerCounts[custName] = { totalSpent: 0, count: 0 };
            customerCounts[custName].totalSpent += o.total;
            customerCounts[custName].count += 1;
        });

        const sortedProds = Object.entries(productCounts).sort((a,b) => b[1].count - a[1].count);
        const topCustomers = Object.entries(customerCounts).sort((a,b) => b[1].totalSpent - a[1].totalSpent).slice(0, 3);

        return {
            income,
            units,
            topProduct: sortedProds[0]?.[1] || { name: 'N/A', count: 0 },
            worstProduct: sortedProds[sortedProds.length-1]?.[1] || { name: 'N/A', count: 0 },
            topCustomers
        };
    }, [orders]);

    const filteredOrders = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        return (o.id || '').toLowerCase().includes(term) || 
               (o.customerDetails?.name || '').toLowerCase().includes(term);
    });

    const readyOrders = orders.filter(o => o.status === 'ready');
    const matchingOrder = readyOrders.find(o => o.code === keyBuffer);

    const handleResetDB = async () => {
        if (window.confirm('¿Estás seguro de que deseas resetear la base de datos? Esto eliminará todos los pedidos.')) {
            setIsResetting(true);
            try {
                await resetDatabase();
            } catch (error) {
                console.error("Error al resetear la base de datos:", error);
                alert("Ocurrió un error al intentar resetear la base de datos.");
            } finally {
                setIsResetting(false);
            }
        }
    };

    const handleTempChange = async (type: 'hot' | 'cold', val: number) => {
        const newTemps = { ...realTemps, [type]: val };
        await database.updateSensors(newTemps.hot, newTemps.cold);
    };

    return (
        <PageLayout className="bg-[#F3F4F6]">
            <div className="bg-dark text-white rounded-b-[3rem] pt-8 pb-12 px-6 shadow-2xl relative overflow-hidden mb-8">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-3xl">🛡️</div>
                        <div><h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Admin Panel</h2><h1 className="text-3xl font-black">Food Box Smart</h1></div>
                     </div>
                     <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => { logout(); navigate('/'); }} className="!bg-white/10 !text-white shadow-lg">Salir</Button>
                     </div>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-10">
                <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                        { id: 'inventory', label: 'Inventario', icon: '🥦' },
                        { id: 'history', label: 'Órdenes', icon: '📜' },
                        { id: 'simulator', label: 'Teclado IoT', icon: '⌨️' },
                        { id: 'sensors', label: 'Sensores', icon: '🌡️' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id as TabView)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
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
                            <StatCard title="Ingresos" value={`$${stats.income.toFixed(2)}`} sub="Total Neto" icon="💰" colorClass="from-yellow-400 to-orange-500" />
                            <StatCard title="Ventas" value={stats.units} sub="Unidades totales" icon="📦" colorClass="from-blue-400 to-indigo-500" />
                            <StatCard title="Estrella" value={stats.topProduct.name} sub={`${stats.topProduct.count} vendidos`} icon="⭐" colorClass="from-orange-400 to-red-500" />
                            <StatCard title="Menos Vendido" value={stats.worstProduct.name} sub="Revisar stock" icon="📉" colorClass="from-gray-400 to-slate-500" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <Card className="lg:col-span-2 p-8">
                                <h3 className="font-bold text-lg mb-6 border-b pb-4">Ranking de Clientes</h3>
                                <div className="space-y-4">
                                    {stats.topCustomers.map(([name, data], i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-primary shadow-sm">{i+1}</div>
                                                <div><p className="font-bold text-dark">{name}</p><p className="text-xs text-gray-400">{data.count} pedidos realizados</p></div>
                                            </div>
                                            <p className="font-black text-lg text-primary">${data.totalSpent.toFixed(2)}</p>
                                        </div>
                                    ))}
                                    {stats.topCustomers.length === 0 && <p className="text-center text-gray-400 py-10">Sin datos de clientes aún.</p>}
                                </div>
                            </Card>
                            <Card className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="text-5xl mb-4">🏪</div>
                                <h3 className="font-bold text-xl mb-2">Estado de Caja</h3>
                                <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${boxStatus.isOccupied ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                    {boxStatus.isOccupied ? 'Ocupada' : 'Disponible'}
                                </div>
                                <p className="text-xs text-gray-400 mt-4 max-w-[200px]">La caja es liberada automáticamente 8 segundos después de un retiro.</p>
                            </Card>
                        </div>
                    </div>
                )}

                {currentTab === 'inventory' && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PRODUCTS.map(prod => {
                            const isAvailable = inventory[prod.id.toString()] === undefined ? true : inventory[prod.id.toString()];
                            return (
                                <Card key={prod.id} className="p-6">
                                    <div className="flex gap-4 mb-4">
                                        <img src={prod.image} alt={prod.name} className="w-16 h-16 rounded-xl object-cover" />
                                        <div>
                                            <h4 className="font-bold text-dark">{prod.name}</h4>
                                            <p className="text-xs text-gray-400">${prod.price.toFixed(2)}</p>
                                            <Badge type={prod.type} className="scale-75 origin-left mt-1" />
                                        </div>
                                    </div>
                                    <Button 
                                        variant={isAvailable ? 'primary' : 'outline'} 
                                        fullWidth 
                                        className={!isAvailable ? '!text-red-500 !border-red-100 !bg-red-50' : ''}
                                        onClick={() => toggleProduct(prod.id, !isAvailable)}
                                    >
                                        {isAvailable ? 'Disponible ✓' : 'Agotado ✕'}
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {currentTab === 'history' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1"><Input placeholder="🔍 Buscar por nombre o código..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                            <Button variant="danger" onClick={handleResetDB} isLoading={isResetting}>Reset DB</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrders.map(order => (
                                <Card key={order.id} className="p-5 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">{order.code}</div>
                                            <p className="text-xs font-bold text-dark truncate max-w-[120px]">{order.customerDetails?.name || 'Cliente'}</p>
                                        </div>
                                        <Badge type={order.status === 'delivered' ? '✓' : order.status === 'ready' ? 'Listo' : 'Cocina'} className="scale-75" />
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{order.id}</span>
                                        <span className="font-black text-primary">${order.total.toFixed(2)}</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {currentTab === 'sensors' && (
                    <div className="animate-fade-in max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 flex flex-col items-center text-center bg-white">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">🔥</div>
                            <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2">Zona Caliente</h3>
                            <div className="text-6xl font-black text-red-600 mb-8 tabular-nums">{realTemps.hot}°C</div>
                            <div className="w-full space-y-4">
                                <p className="text-xs text-gray-500 font-medium italic">Simular Temperatura</p>
                                <input 
                                    type="range" min="40" max="90" step="1" 
                                    value={realTemps.hot} 
                                    onChange={(e) => handleTempChange('hot', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-gray-300">
                                    <span>40°C</span>
                                    <span>90°C</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 flex flex-col items-center text-center bg-white">
                            <div className="w-20 h-20 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">❄️</div>
                            <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2">Zona Fría</h3>
                            <div className="text-6xl font-black text-teal-600 mb-8 tabular-nums">{realTemps.cold}°C</div>
                            <div className="w-full space-y-4">
                                <p className="text-xs text-gray-500 font-medium italic">Simular Temperatura</p>
                                <input 
                                    type="range" min="-10" max="15" step="1" 
                                    value={realTemps.cold} 
                                    onChange={(e) => handleTempChange('cold', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                                <div className="flex justify-between text-[10px] font-bold text-gray-300">
                                    <span>-10°C</span>
                                    <span>15°C</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {currentTab === 'simulator' && (
                    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
                        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col items-center">
                            <div className="bg-black/40 rounded-[2rem] p-8 mb-10 w-full text-center border border-white/10">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-4 tracking-widest">Monitor Terminal IoT</p>
                                <div className={`text-6xl font-mono tracking-[0.6em] min-h-[1.2em] transition-colors ${matchingOrder ? 'text-green-400' : 'text-primary'}`}>
                                    {keyBuffer || '_'}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 max-w-sm w-full">
                                {[1,2,3,4,5,6,7,8,9, '*', 0, '#'].map(key => (
                                    <button 
                                        key={key}
                                        onClick={async () => await database.sendKeypress(key.toString())}
                                        className="bg-white/5 hover:bg-white/10 text-white font-mono text-3xl py-6 rounded-2xl transition-all border border-white/5 active:scale-95"
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                            {matchingOrder && (
                                <Button 
                                    className="mt-10 bg-green-600 hover:bg-green-500 py-4 !rounded-2xl" 
                                    onClick={() => confirmOrderDelivery(matchingOrder.id)}
                                    fullWidth
                                >
                                    Confirmar Entrega (Simular Apertura)
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};
