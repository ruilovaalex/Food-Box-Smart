
import React, { useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, PageLayout, Badge, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';

type TabView = 'dashboard' | 'history' | 'simulator' | 'sensors';

// --- Helper Components ---

interface StatCardProps {
    title: string;
    value: string | number;
    sub: string;
    icon: string;
    colorClass: string; // Ej: from-blue-500 to-blue-600
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, colorClass }) => (
    <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-lg shadow-gray-200/50 border border-gray-100 group hover:-translate-y-1 transition-all duration-300">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-[3rem] transition-all group-hover:scale-110`}></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-2xl shadow-md mb-4`}>
                {icon}
            </div>
            <div>
                <h3 className="text-3xl font-black text-dark tracking-tight mb-1">{value}</h3>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
                <p className="text-gray-400 text-xs">{sub}</p>
            </div>
        </div>
    </div>
);

interface OrderRowCardProps {
    order: Order;
    onViewDetails: (order: Order) => void;
}

const OrderRowCard: React.FC<OrderRowCardProps> = ({ order, onViewDetails }) => {
    const displayName = order.customerDetails?.name || order.userId;
    const isReady = order.status === 'ready';
    
    return (
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group relative overflow-hidden">
            {isReady && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>}
            
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg">
                        👤
                    </div>
                    <div>
                        <h4 className="font-bold text-dark text-sm">{displayName}</h4>
                        <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium flex items-center gap-1">
                           <span>📅</span>
                           {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                    order.status === 'ready' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-orange-50 text-orange-600 border-orange-100'
                }`}>
                    {order.status === 'pending' && '⏳ Pendiente'}
                    {order.status === 'ready' && '⚡ Listo'}
                    {order.status === 'delivered' && '✓ Entregado'}
                    {order.status === 'cancelled' && '✕ Cancelado'}
                </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50/50 rounded-xl p-3 mb-4">
                 <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Código</p>
                    <p className="text-xl font-black text-primary tracking-widest font-mono">{order.code}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-bold">Total</p>
                    <p className="text-lg font-bold text-dark">${order.total.toFixed(2)}</p>
                 </div>
            </div>

            <button 
                onClick={() => onViewDetails(order)}
                className="w-full py-3 rounded-xl bg-white border-2 border-gray-100 text-gray-500 font-bold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
                <span>📄</span> Ver Detalles
            </button>
        </div>
    );
};

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
    if (!order) return null;
    const hasHot = order.items ? order.items.some(i => i.type === 'hot') : false;
    const hasCold = order.items ? order.items.some(i => i.type === 'cold') : false;
    const displayName = order.customerDetails?.name || 'Cliente';
    const displayEmail = order.userEmail || order.userId || 'No registrado';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-primary"></div>
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors backdrop-blur-md">
                        ✕
                    </button>
                </div>
                
                <div className="relative pt-8 px-8 pb-8">
                    <div className="bg-white rounded-[2rem] p-6 shadow-lg mb-6 text-center">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Código de Retiro</p>
                         <h2 className="text-6xl font-black text-primary font-mono tracking-widest mb-2">{order.code}</h2>
                         
                         <p className="text-xs text-gray-500 mb-3 font-medium">
                            {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </p>

                         <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${order.status === 'ready' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                            {order.status === 'ready' ? 'Esperando retiro' : order.status}
                         </div>
                    </div>

                    <div className="space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {/* Cliente Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">👤</div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-dark truncate">{displayName}</h4>
                                <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                            </div>
                        </div>

                        {/* Productos */}
                        <div>
                            <h4 className="text-sm font-bold text-dark mb-3 ml-2">Productos</h4>
                            <div className="space-y-2">
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-100 text-orange-700 w-6 h-6 rounded flex items-center justify-center text-xs font-bold">{item.quantity}</div>
                                            <span className="text-dark font-medium text-sm">{item.name}</span>
                                        </div>
                                        <Badge type={item.type} className="scale-75" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totales */}
                        <div className="flex justify-between items-center bg-dark text-white p-5 rounded-2xl shadow-lg shadow-gray-400/50">
                            <span className="font-medium">Total Pagado</span>
                            <span className="text-2xl font-black text-green-400">${(order.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const AdminDashboard: React.FC = () => {
    const { orders, simulateBoxKeypadEntry, resetDatabase, realTemps } = useMqtt();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    
    const [currentTab, setCurrentTab] = useState<TabView>('dashboard');
    const [simulatedKeypadInput, setSimulatedKeypadInput] = useState('');
    const [selectedOrderIdForSim, setSelectedOrderIdForSim] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

    // --- Stats Logic ---
    const totalIncome = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? (o.total || 0) : 0), 0);
    const completedOrders = orders.filter(o => o.status !== 'cancelled').length;
    const totalItemsSold = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' && o.items ? o.items.reduce((s, i) => s + i.quantity, 0) : 0), 0);
    const ordersToday = orders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        const t = new Date();
        return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    }).length;

    const productStats: Record<string, {name: string, count: number, revenue: number}> = {};
    orders.forEach(o => {
        if(o.status !== 'cancelled' && o.items) {
            o.items.forEach(item => {
                if(!productStats[item.name]) productStats[item.name] = { name: item.name, count: 0, revenue: 0 };
                productStats[item.name].count += item.quantity;
                productStats[item.name].revenue += (item.price * item.quantity);
            });
        }
    });
    const topProducts = Object.values(productStats).sort((a,b) => b.count - a.count).slice(0, 3);

    const filteredOrders = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        return (o.id || '').toLowerCase().includes(term) || 
               (o.code || '').includes(term) ||
               (o.customerDetails?.name || '').toLowerCase().includes(term) ||
               (o.userEmail || '').toLowerCase().includes(term);
    }).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));


    // --- Handlers ---
    const handleSimulateKeypad = (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedOrderIdForSim) return;
        const success = simulateBoxKeypadEntry(selectedOrderIdForSim, simulatedKeypadInput);
        if (success) {
            alert("✅ ¡Caja Abierta Exitosamente!");
            setSimulatedKeypadInput('');
            setSelectedOrderIdForSim(null);
        } else {
            alert("❌ Código Incorrecto.");
        }
    };

    const handleResetDB = () => {
        if(window.confirm("ATENCIÓN: Esto borrará todo el historial. ¿Continuar?")) {
            resetDatabase();
        }
    };

    return (
        <PageLayout className="bg-[#F3F4F6]">
            
            {/* --- ADMIN HEADER --- */}
            <div className="bg-dark text-white rounded-b-[3rem] pt-8 pb-12 px-6 shadow-2xl relative overflow-hidden mb-8">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-3xl shadow-lg">
                            🛡️
                        </div>
                        <div>
                            <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Panel de Control</h2>
                            <h1 className="text-3xl font-black tracking-tight">Hola, {user?.name}</h1>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                         <div className="hidden md:block text-right mr-4">
                             <p className="text-xs text-gray-400 font-bold">{new Date().toLocaleDateString()}</p>
                             <p className="text-xs text-gray-500">Estado: En línea 🟢</p>
                         </div>
                         <Button 
                            variant="secondary"
                            onClick={() => { logout(); navigate('/'); }} 
                            className="!bg-white/10 !border-white/10 !text-white hover:!bg-red-500 hover:!border-red-500 shadow-lg"
                            icon={<span>🚪</span>}
                         >
                            Salir
                         </Button>
                     </div>
                 </div>
            </div>

            {/* --- NAVIGATION TABS --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-10">
                <div className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-900/5 inline-flex gap-2 overflow-x-auto">
                    {[
                        { id: 'dashboard', label: 'Resumen', icon: '📊' },
                        { id: 'history', label: 'Historial', icon: '📜' },
                        { id: 'simulator', label: 'Simulador IoT', icon: '🎛️' },
                        { id: 'sensors', label: 'Sensores', icon: '🌡️' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id as TabView)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                                currentTab === tab.id 
                                ? 'bg-dark text-white shadow-lg shadow-gray-900/20 scale-105' 
                                : 'text-gray-400 hover:bg-gray-50 hover:text-dark'
                            }`}
                        >
                            <span>{tab.icon}</span> <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                
                {/* 1. DASHBOARD VIEW */}
                {currentTab === 'dashboard' && (
                    <div className="animate-fade-in space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <StatCard 
                                title="Ingresos" 
                                value={`$${totalIncome.toFixed(2)}`} 
                                sub="Acumulado Total"
                                icon="💰"
                                colorClass="from-yellow-400 to-orange-500"
                             />
                             <StatCard 
                                title="Pedidos" 
                                value={completedOrders} 
                                sub="Completados"
                                icon="🛒"
                                colorClass="from-blue-400 to-indigo-500"
                             />
                             <StatCard 
                                title="Productos" 
                                value={totalItemsSold} 
                                sub="Unidades vendidas"
                                icon="📦"
                                colorClass="from-orange-400 to-red-500"
                             />
                             <StatCard 
                                title="Hoy" 
                                value={ordersToday} 
                                sub="Nuevas órdenes"
                                icon="📅"
                                colorClass="from-teal-400 to-green-500"
                             />
                        </div>

                        {/* Top Products Section */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-dark flex items-center gap-2">
                                    <span>🏆</span> Productos Estrella
                                </h3>
                                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Top 3</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {topProducts.map((prod, idx) => (
                                    <div key={idx} className="relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100 group hover:-translate-y-1 transition-all">
                                        <div className="absolute top-4 right-4 text-6xl opacity-5 grayscale group-hover:grayscale-0 transition-all">🍔</div>
                                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center font-bold shadow-lg text-sm border-2 border-white">
                                            #{idx + 1}
                                        </div>
                                        
                                        <h4 className="text-lg font-bold text-dark mt-2 mb-1">{prod.name}</h4>
                                        <p className="text-primary font-black text-2xl mb-4">{Math.round((prod.count / (totalItemsSold || 1)) * 100)}%</p>
                                        
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
                                            <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${(prod.count / (totalItemsSold || 1)) * 100}%` }}></div>
                                        </div>
                                        
                                        <div className="flex justify-between text-xs font-medium text-gray-400">
                                            <span>{prod.count} ventas</span>
                                            <span>${prod.revenue.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ))}
                                {topProducts.length === 0 && <p className="text-center text-gray-400 w-full col-span-3">Aún no hay datos de ventas.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. HISTORY VIEW */}
                {currentTab === 'history' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="🔍 Buscar por nombre, código o email..."
                                className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white border-none shadow-sm text-dark focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder-gray-400"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <OrderRowCard key={order.id} order={order} onViewDetails={setSelectedOrderDetails} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📂</div>
                                    <p className="text-gray-400 font-medium">No se encontraron resultados.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. SIMULATOR VIEW */}
                {currentTab === 'simulator' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in items-start">
                        <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[500px]">
                            <h3 className="font-bold text-dark text-xl mb-6">Órdenes Listas para Retirar</h3>
                            <div className="space-y-3">
                                {orders.filter(o => o.status === 'ready').map(order => (
                                    <div 
                                        key={order.id}
                                        onClick={() => setSelectedOrderIdForSim(order.id)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center group ${
                                            selectedOrderIdForSim === order.id 
                                            ? 'border-primary bg-orange-50' 
                                            : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${selectedOrderIdForSim === order.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                📦
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-dark">Orden #{order.code}</h4>
                                                <p className="text-xs text-gray-400">ID: {order.id}</p>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                            {selectedOrderIdForSim === order.id && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                        </div>
                                    </div>
                                ))}
                                {orders.filter(o => o.status === 'ready').length === 0 && (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400">No hay órdenes esperando retiro.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-5 space-y-6 sticky top-8">
                            <div className="bg-dark text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 rounded-full blur-2xl"></div>
                                
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-xs font-mono text-gray-400 tracking-widest">ESP32_V1</span>
                                    </div>
                                    <span className="text-2xl">📟</span>
                                </div>

                                <div className="bg-gray-800/50 rounded-2xl p-4 mb-6 border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Display</p>
                                    <div className="text-3xl font-mono text-primary tracking-[0.2em] h-10">
                                        {simulatedKeypadInput || '_ _ _ _'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[1,2,3,4,5,6,7,8,9].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => simulatedKeypadInput.length < 4 && setSimulatedKeypadInput(prev => prev + num)}
                                            className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-mono text-xl py-4 rounded-xl transition-colors border border-white/5"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <button onClick={() => setSimulatedKeypadInput('')} className="bg-red-500/20 text-red-400 font-bold py-4 rounded-xl hover:bg-red-500/30">C</button>
                                    <button onClick={() => simulatedKeypadInput.length < 4 && setSimulatedKeypadInput(prev => prev + '0')} className="bg-gray-700/50 text-white font-mono text-xl py-4 rounded-xl">0</button>
                                    <button 
                                        onClick={handleSimulateKeypad}
                                        disabled={!selectedOrderIdForSim}
                                        className={`font-bold py-4 rounded-xl transition-all ${
                                            selectedOrderIdForSim 
                                            ? 'bg-primary text-white hover:bg-orange-600 shadow-lg shadow-orange-500/30' 
                                            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleResetDB} 
                                className="w-full py-4 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors flex items-center justify-center gap-2"
                            >
                                <span>🗑️</span> Resetear Base de Datos
                            </button>
                        </div>
                    </div>
                )}
                
                {/* 4. SENSORS VIEW */}
                {currentTab === 'sensors' && (
                    <div className="relative overflow-hidden bg-white rounded-[3rem] border border-gray-100 shadow-2xl min-h-[70vh] flex flex-col items-center justify-center p-8 lg:p-12 animate-fade-in">
                        
                        {/* BACKGROUND PATTERN */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none overflow-hidden">
                             <div className="grid grid-cols-6 md:grid-cols-8 gap-8 md:gap-16 transform -rotate-12 scale-110">
                                {Array.from({ length: 60 }).map((_, i) => (
                                    <div key={i} className="text-4xl md:text-6xl">
                                        {['🍔', '🍕', '🍟', '🌭', '🌮', '🍦', '🍩', '🥤'][i % 8]}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* DECORATIVE GRADIENTS */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/50 to-white/80 pointer-events-none z-0"></div>

                        {/* CONTENT WRAPPER */}
                        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                            
                            {/* LOGO & TITLE HEADER */}
                            <div className="flex flex-col items-center mb-12 text-center animate-slide-up">
                                <div className="w-32 h-32 bg-white rounded-full p-4 shadow-xl shadow-orange-100 border-4 border-orange-50 mb-6 relative hover:scale-105 transition-transform duration-500">
                                    <img 
                                        src="/images/logo.png" 
                                        alt="Food Box Logo" 
                                        className="w-full h-full object-contain drop-shadow-md"
                                        onError={(e) => {
                                            // Fallback Seguro
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/7541/7541258.png';
                                        }} 
                                    />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight mb-2">
                                    Sensores IoT
                                </h2>
                                <p className="text-gray-400 font-medium text-lg">Monitoreo de temperatura en tiempo real</p>
                            </div>

                            {/* CARDS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                {/* Hot Sensor Card */}
                                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-red-500/10 border border-red-100 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-red-500/10"></div>
                                    
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-4xl mb-6 shadow-inner ring-4 ring-red-50/50">
                                            🔥
                                        </div>
                                        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Zona Caliente</h3>
                                        <div className="text-7xl lg:text-8xl font-black text-red-600 tracking-tighter mb-4 tabular-nums drop-shadow-sm">
                                            {realTemps.hot}<span className="text-4xl align-top text-red-400 opacity-60">°C</span>
                                        </div>
                                        <div className="w-full bg-gray-100/50 rounded-full h-4 overflow-hidden mb-3 border border-gray-100">
                                            <div 
                                                className="h-full bg-gradient-to-r from-orange-400 to-red-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                                style={{ width: `${Math.min(Math.max(realTemps.hot, 0), 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm font-medium text-red-400 bg-red-50 px-4 py-1 rounded-full">Meta: 60°C - 75°C</p>
                                    </div>
                                </div>

                                {/* Cold Sensor Card */}
                                <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-cyan-500/10 border border-cyan-100 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-cyan-500/10"></div>
                                    
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center text-4xl mb-6 shadow-inner ring-4 ring-cyan-50/50">
                                            ❄️
                                        </div>
                                        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Zona Fría</h3>
                                        <div className="text-7xl lg:text-8xl font-black text-cyan-600 tracking-tighter mb-4 tabular-nums drop-shadow-sm">
                                            {realTemps.cold}<span className="text-4xl align-top text-cyan-400 opacity-60">°C</span>
                                        </div>
                                        <div className="w-full bg-gray-100/50 rounded-full h-4 overflow-hidden mb-3 border border-gray-100">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                                style={{ width: `${Math.min(Math.max(realTemps.cold * 3, 0), 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm font-medium text-cyan-500 bg-cyan-50 px-4 py-1 rounded-full">Meta: 2°C - 8°C</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 text-center">
                                <p className="text-gray-400 text-sm bg-white/50 backdrop-blur px-6 py-2 rounded-full inline-flex items-center gap-2 shadow-sm border border-gray-100">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Sincronización en tiempo real activa
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedOrderDetails && (
                <OrderDetailModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} />
            )}
        </PageLayout>
    );
};
