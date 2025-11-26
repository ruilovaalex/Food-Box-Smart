import React, { useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Navbar, Card, Button, PageLayout, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';

type TabView = 'dashboard' | 'history' | 'simulator';

// --- Helper Components ---

interface StatCardProps {
    title: string;
    value: string | number;
    sub: string;
    icon: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color }) => (
    <Card className="p-5 flex items-center gap-4 border-none shadow-sm">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${color}`}>
            {icon}
            </div>
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">{title}</p>
                <h3 className={`text-2xl font-black ${title === 'Ingresos Totales' ? 'text-green-600' : 'text-primary'}`}>
                {value}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
            </div>
    </Card>
);

interface OrderRowCardProps {
    order: Order;
    onViewDetails: (order: Order) => void;
}

const OrderRowCard: React.FC<OrderRowCardProps> = ({ order, onViewDetails }) => (
    <Card className="p-5 mb-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            {/* ID & Code */}
            <div className="flex items-center gap-4 min-w-[150px]">
                <div>
                    <p className="text-xs text-gray-400 mb-1">Código:</p>
                    <h4 className="text-2xl font-bold text-primary tracking-wide font-mono">{order.code}</h4>
                </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">👤</span>
                    <span className="font-bold text-dark">{order.userId.split('@')[0]}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {order.items.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                            {item.quantity}x {item.name}
                        </span>
                    ))}
                    {order.items.length > 2 && <span className="text-xs text-gray-400 px-1">+{order.items.length - 2} más</span>}
                </div>
            </div>

            {/* Meta & Status */}
            <div className="flex flex-row md:flex-col justify-between items-end gap-2 md:gap-1 min-w-[140px]">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                    }`}>
                        {order.status === 'delivered' ? '✓ Completado' : 
                        order.status === 'ready' ? '⚡ Listo' : 
                        order.status === 'pending' ? '⏳ Pendiente' : order.status}
                    </span>
                    <p className="text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                    ${order.total.toFixed(2)}
                    </p>
            </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
            <button 
                onClick={() => onViewDetails(order)}
                className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
            >
                <span>📄</span> Ver Detalles Completos
            </button>
        </div>
    </Card>
);

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
    if (!order) return null;
    const hasHot = order.items.some(i => i.type === 'hot');
    const hasCold = order.items.some(i => i.type === 'cold');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <h3 className="font-bold text-lg text-dark">Detalles del Pedido</h3>
                        </div>
                        <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="text-center mb-6">
                        <p className="text-sm text-primary font-bold mb-1">Código de Retiro</p>
                        <span className="text-5xl font-black text-primary font-mono tracking-widest">{order.code}</span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-3">Cliente</h4>
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                                <p><span className="font-bold text-dark">Nombre:</span> {order.userId.split('@')[0]}</p>
                                <p><span className="font-bold text-dark">Email:</span> {order.userId}</p>
                                <p><span className="font-bold text-dark">ID Orden:</span> #{order.id}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-primary mb-3">Productos</h4>
                            <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-500">{item.quantity}x</span>
                                            <span className="text-dark font-medium">{item.name}</span>
                                            <Badge type={item.type} className="scale-75 origin-left" />
                                        </div>
                                        <span className="font-bold text-green-600">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                <span className="text-xl font-extrabold text-dark">Total:</span>
                                <span className="text-3xl font-black text-green-600">${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-primary mb-3">Información Adicional</h4>
                            <div className="text-sm space-y-2 text-gray-600">
                                <p><span className="font-bold">Fecha:</span> {new Date(order.createdAt).toLocaleString()}</p>
                                <p className="flex items-center gap-2">
                                    <span className="font-bold">Estado:</span> 
                                    {order.status === 'delivered' ? <span className="text-green-600 font-bold">✓ Completado</span> : order.status}
                                </p>
                                <p><span className="font-bold">Tiene fríos:</span> {hasCold ? '✅ Sí' : '❌ No'}</p>
                                <p><span className="font-bold">Tiene calientes:</span> {hasHot ? '✅ Sí' : '❌ No'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const AdminDashboard: React.FC = () => {
    const { orders, simulateBoxKeypadEntry, resetDatabase } = useMqtt();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    
    const [currentTab, setCurrentTab] = useState<TabView>('dashboard');
    const [simulatedKeypadInput, setSimulatedKeypadInput] = useState('');
    const [selectedOrderIdForSim, setSelectedOrderIdForSim] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

    // --- Stats Calculations ---
    const totalIncome = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0);
    const completedOrders = orders.filter(o => o.status !== 'cancelled').length;
    const totalItemsSold = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.items.reduce((s, i) => s + i.quantity, 0) : 0), 0);
    
    const today = new Date();
    const ordersToday = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;

    // Top Products Calculation
    const productStats: Record<string, {name: string, count: number, revenue: number}> = {};
    orders.forEach(o => {
        if(o.status !== 'cancelled') {
            o.items.forEach(item => {
                if(!productStats[item.name]) productStats[item.name] = { name: item.name, count: 0, revenue: 0 };
                productStats[item.name].count += item.quantity;
                productStats[item.name].revenue += (item.price * item.quantity);
            });
        }
    });
    const topProducts = Object.values(productStats).sort((a,b) => b.count - a.count).slice(0, 3);

    // Filtered History Logic
    const filteredOrders = orders.filter(o => 
        o.id.includes(searchTerm) || 
        o.code.includes(searchTerm) ||
        o.userId.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => b.createdAt - a.createdAt);


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
        if(window.confirm("¿Estás seguro de que quieres borrar TODOS los pedidos? Esta acción no se puede deshacer.")) {
            resetDatabase();
            alert("Base de datos reiniciada.");
        }
    };

    return (
        <PageLayout className="bg-gray-100">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                    <div className="hidden w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">🍔</div>
                    <div>
                        <h1 className="font-extrabold text-dark text-lg leading-tight">Food Box <span className="text-primary">Smart</span></h1>
                        <p className="text-xs text-primary font-bold">{user?.name}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                     <div className="hidden md:flex items-center px-3 py-1.5 bg-dark text-white rounded-lg text-xs font-medium">
                         👤 Admin: {user?.name}
                     </div>
                     <Button 
                        variant="danger" 
                        onClick={() => { logout(); navigate('/'); }} 
                        className="!py-2 !px-4 !text-xs !rounded-lg"
                     >
                        Salir
                     </Button>
                 </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                        { id: 'history', label: 'Historial de Ventas', icon: '📜' },
                        { id: 'simulator', label: 'Control de Cajas', icon: '🎛️' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id as TabView)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                currentTab === tab.id 
                                ? 'bg-primary text-white shadow-lg shadow-orange-500/20' 
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- DASHBOARD TAB --- */}
                {currentTab === 'dashboard' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="text-2xl">📊</span>
                             <h2 className="text-2xl font-black text-dark">Dashboard - Resumen General</h2>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                             <StatCard 
                                title="Ingresos Totales" 
                                value={`$${totalIncome.toFixed(2)}`} 
                                sub="Total acumulado"
                                icon="💰"
                                color="bg-yellow-100 text-yellow-600"
                             />
                             <StatCard 
                                title="Total Pedidos" 
                                value={completedOrders} 
                                sub="Pedidos completados"
                                icon="🛒"
                                color="bg-blue-100 text-blue-600"
                             />
                             <StatCard 
                                title="Items Vendidos" 
                                value={totalItemsSold} 
                                sub="Productos totales"
                                icon="📦"
                                color="bg-orange-100 text-orange-600"
                             />
                             <StatCard 
                                title="Pedidos Hoy" 
                                value={ordersToday} 
                                sub="Pedidos del día"
                                icon="📅"
                                color="bg-indigo-100 text-indigo-600"
                             />
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm">
                            <h3 className="text-center text-xl font-bold text-dark mb-8 flex items-center justify-center gap-2">
                                <span>🏆</span> Productos Más Vendidos
                            </h3>
                            
                            <div className="space-y-6">
                                {topProducts.map((prod, idx) => (
                                    <div key={idx} className="bg-surface rounded-2xl p-4">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-black text-blue-200">#{idx + 1}</span>
                                                <span className="font-bold text-dark text-lg">{prod.name}</span>
                                            </div>
                                            <span className="text-2xl font-black text-primary">{Math.round((prod.count / totalItemsSold) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className="bg-primary h-full rounded-full" 
                                                style={{ width: `${(prod.count / totalItemsSold) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">📦 {prod.count} vendidos</span>
                                            <span className="flex items-center gap-1">💰 ${prod.revenue.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                                {topProducts.length === 0 && <p className="text-center text-gray-400">No hay datos suficientes.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- HISTORY TAB --- */}
                {currentTab === 'history' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📜</span>
                                <h2 className="text-2xl font-black text-dark">Historial de Ventas</h2>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm px-3 py-1 flex items-center gap-2 border border-gray-200 w-full md:w-64">
                                <span className="text-gray-400">🔍</span>
                                <span className="text-xs text-gray-300 font-bold hidden sm:inline">Total de pedidos: <span className="text-primary text-lg">{filteredOrders.length}</span></span>
                            </div>
                        </div>

                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Buscar por cliente, código o email..."
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(order => (
                                    <OrderRowCard key={order.id} order={order} onViewDetails={setSelectedOrderDetails} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-gray-400">
                                    No se encontraron resultados.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- SIMULATOR TAB --- */}
                {currentTab === 'simulator' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🎛️</span>
                                <h2 className="text-2xl font-black text-dark">Control y Simulador</h2>
                            </div>
                            <p className="text-gray-500 mb-6">Selecciona una orden "Lista" para simular la interacción física con la caja.</p>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {orders.filter(o => o.status === 'ready').map(order => (
                                    <div 
                                        key={order.id}
                                        onClick={() => setSelectedOrderIdForSim(order.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                            selectedOrderIdForSim === order.id 
                                            ? 'bg-dark text-white border-dark transform scale-105 shadow-xl' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-primary'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">#{order.id.slice(-4)}</span>
                                            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">Code: {order.code}</span>
                                        </div>
                                    </div>
                                ))}
                                {orders.filter(o => o.status === 'ready').length === 0 && (
                                    <p className="text-center text-gray-400 italic bg-white p-6 rounded-xl border border-dashed">
                                        No hay órdenes listas para retirar en este momento.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 sticky top-24 h-fit">
                            <Card className="bg-dark text-white p-8 border-gray-800 shadow-2xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                                    <h3 className="font-mono text-xl tracking-wider">ESP32_SIMULATOR_V1</h3>
                                </div>

                                <form onSubmit={handleSimulateKeypad} className="space-y-6">
                                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 block">ID Destino</label>
                                        <div className="font-mono text-2xl text-primary font-bold">
                                            {selectedOrderIdForSim ? `#${selectedOrderIdForSim.slice(-4)}` : '---'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 block">Teclado Numérico</label>
                                        <input 
                                            type="text" 
                                            maxLength={4}
                                            className="w-full bg-gray-900 text-white text-center text-4xl tracking-[0.5em] py-6 rounded-2xl border border-gray-700 focus:border-primary outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono placeholder-gray-800"
                                            value={simulatedKeypadInput}
                                            onChange={(e) => setSimulatedKeypadInput(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="0000"
                                            disabled={!selectedOrderIdForSim}
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        fullWidth 
                                        disabled={!selectedOrderIdForSim}
                                        className={!selectedOrderIdForSim ? 'opacity-50 grayscale' : 'bg-primary hover:bg-orange-600 !py-4'}
                                    >
                                        ABRIR CAJA (SIMULACIÓN)
                                    </Button>
                                </form>
                            </Card>

                            <Button 
                                variant="outline"
                                onClick={handleResetDB}
                                fullWidth
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                icon={<span>🗑️</span>}
                            >
                                Resetear Base de Datos
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Render Modal */}
            {selectedOrderDetails && (
                <OrderDetailModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} />
            )}
        </PageLayout>
    );
};