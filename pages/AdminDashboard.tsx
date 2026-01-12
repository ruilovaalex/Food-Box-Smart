
import React, { useState, useEffect } from 'react';
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
    colorClass: string; 
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
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-lg">👤</div>
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
    const displayName = order.customerDetails?.name || 'Cliente';
    const displayEmail = order.userEmail || order.userId || 'No registrado';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-primary"></div>
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors backdrop-blur-md">✕</button>
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
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">👤</div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-dark truncate">{displayName}</h4>
                                <p className="text-sm text-gray-500 truncate">{displayEmail}</p>
                            </div>
                        </div>
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
    const { 
        orders, 
        simulateBoxKeypadEntry, 
        resetDatabase, 
        realTemps, 
        lastPhysicalKeyPress,
        physicalBuffer // Usar buffer global
    } = useMqtt();
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
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-3xl shadow-lg">🛡️</div>
                        <div>
                            <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Panel de Control</h2>
                            <h1 className="text-3xl font-black tracking-tight">Hola, {user?.name}</h1>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                         <Button variant="secondary" onClick={() => { logout(); navigate('/'); }} className="!bg-white/10 !border-white/10 !text-white hover:!bg-red-500 shadow-lg" icon={<span>🚪</span>}>Salir</Button>
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
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${currentTab === tab.id ? 'bg-dark text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-dark'}`}
                        >
                            <span>{tab.icon}</span> <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                {currentTab === 'dashboard' && (
                    <div className="animate-fade-in space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <StatCard title="Ingresos" value={`$${totalIncome.toFixed(2)}`} sub="Acumulado Total" icon="💰" colorClass="from-yellow-400 to-orange-500" />
                             <StatCard title="Pedidos" value={completedOrders} sub="Completados" icon="🛒" colorClass="from-blue-400 to-indigo-500" />
                             <StatCard title="Productos" value={totalItemsSold} sub="Unidades vendidas" icon="📦" colorClass="from-orange-400 to-red-500" />
                             <StatCard title="Hoy" value={ordersToday} sub="Nuevas órdenes" icon="📅" colorClass="from-teal-400 to-green-500" />
                        </div>
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-dark flex items-center gap-2 mb-8"><span>🏆</span> Productos Estrella</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {topProducts.map((prod, idx) => (
                                    <div key={idx} className="relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100 group hover:-translate-y-1 transition-all">
                                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center font-bold shadow-lg text-sm border-2 border-white">#{idx + 1}</div>
                                        <h4 className="text-lg font-bold text-dark mt-2 mb-1">{prod.name}</h4>
                                        <p className="text-primary font-black text-2xl mb-4">{Math.round((prod.count / (totalItemsSold || 1)) * 100)}%</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3"><div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${(prod.count / (totalItemsSold || 1)) * 100}%` }}></div></div>
                                        <div className="flex justify-between text-xs font-medium text-gray-400"><span>{prod.count} ventas</span><span>${prod.revenue.toFixed(0)}</span></div>
                                    </div>
                                ))}
                                {topProducts.length === 0 && <p className="text-center text-gray-400 w-full col-span-3">Aún no hay datos de ventas.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'history' && (
                    <div className="animate-fade-in space-y-6">
                        <input type="text" placeholder="🔍 Buscar por nombre, código o email..." className="w-full pl-6 pr-6 py-4 rounded-2xl bg-white border-none shadow-sm text-dark focus:ring-4 focus:ring-primary/10 outline-none transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredOrders.length > 0 ? filteredOrders.map(order => <OrderRowCard key={order.id} order={order} onViewDetails={setSelectedOrderDetails} />) : (
                                <div className="col-span-full py-20 text-center"><p className="text-gray-400 font-medium">No se encontraron resultados.</p></div>
                            )}
                        </div>
                    </div>
                )}

                {currentTab === 'simulator' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in items-start">
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-sm border border-gray-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-10 rounded-full blur-2xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xl">🔌</div>
                                        <div>
                                            <h3 className="font-bold text-lg">Prueba de Teclado Físico</h3>
                                            <p className="text-xs text-gray-400">Datos recibidos del ESP32 en tiempo real</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 rounded-2xl p-6 border border-white/10 text-center">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Entrada Recibida</p>
                                        <div className="text-5xl font-mono text-green-400 tracking-[0.5em] h-16 flex items-center justify-center">{physicalBuffer || '____'}</div>
                                        <p className="text-xs text-gray-500 mt-4">Presiona <span className="text-white font-bold bg-white/20 px-1 rounded">*</span> o <span className="text-white font-bold bg-white/20 px-1 rounded">#</span> en el teclado físico para limpiar.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[300px]">
                                <h3 className="font-bold text-dark text-xl mb-6">Órdenes Listas para Retirar</h3>
                                <div className="space-y-3">
                                    {orders.filter(o => o.status === 'ready').map(order => (
                                        <div key={order.id} onClick={() => setSelectedOrderIdForSim(order.id)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center group ${selectedOrderIdForSim === order.id ? 'border-primary bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${selectedOrderIdForSim === order.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>📦</div>
                                                <div>
                                                    <h4 className="font-bold text-dark">Orden #{order.id.slice(-4)}</h4>
                                                    <p className="text-xs text-gray-400">Código de retiro: {order.code}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 space-y-6 sticky top-8">
                            <div className="bg-dark text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="flex justify-between items-center mb-8 relative z-10"><span className="text-xs font-mono text-gray-400 tracking-widest">SIMULADOR WEB</span><span className="text-2xl">📟</span></div>
                                <div className="bg-gray-800/50 rounded-2xl p-4 mb-6 border border-white/5"><div className="text-3xl font-mono text-primary tracking-[0.2em] h-10">{simulatedKeypadInput || '_ _ _ _'}</div></div>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[1,2,3,4,5,6,7,8,9,0].map(num => (
                                        <button key={num} onClick={() => simulatedKeypadInput.length < 4 && setSimulatedKeypadInput(prev => prev + num)} className="bg-gray-700/50 hover:bg-gray-600 text-white font-mono text-xl py-4 rounded-xl transition-colors">{num}</button>
                                    ))}
                                    <button onClick={() => setSimulatedKeypadInput('')} className="bg-red-500/20 text-red-400 font-bold py-4 rounded-xl">C</button>
                                    <button onClick={handleSimulateKeypad} disabled={!selectedOrderIdForSim} className={`font-bold py-4 rounded-xl transition-all ${selectedOrderIdForSim ? 'bg-primary text-white hover:bg-orange-600' : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'}`}>OK</button>
                                </div>
                            </div>
                            <button onClick={handleResetDB} className="w-full py-4 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl flex items-center justify-center gap-2"><span>🗑️</span> Resetear Base de Datos</button>
                        </div>
                    </div>
                )}
                
                {currentTab === 'sensors' && (
                    <div className="relative overflow-hidden bg-white rounded-[3rem] border border-gray-100 shadow-2xl min-h-[70vh] flex flex-col items-center justify-center p-8 lg:p-12 animate-fade-in">
                        <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tight mb-2">Sensores IoT</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-red-100 flex flex-col items-center text-center">
                                <div className="text-4xl mb-6">🔥</div>
                                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Zona Caliente</h3>
                                <div className="text-7xl lg:text-8xl font-black text-red-600 tracking-tighter mb-4 tabular-nums">{realTemps.hot}<span className="text-4xl align-top text-red-400 opacity-60">°C</span></div>
                            </div>
                            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-cyan-100 flex flex-col items-center text-center">
                                <div className="text-4xl mb-6">❄️</div>
                                <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Zona Fría</h3>
                                <div className="text-7xl lg:text-8xl font-black text-cyan-600 tracking-tighter mb-4 tabular-nums">{realTemps.cold}<span className="text-4xl align-top text-cyan-400 opacity-60">°C</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {selectedOrderDetails && <OrderDetailModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} />}
        </PageLayout>
    );
};
