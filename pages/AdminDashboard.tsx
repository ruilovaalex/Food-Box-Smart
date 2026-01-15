
import React, { useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { useAuth } from '../context/AuthContext';
import { Card, Button, PageLayout, Badge, Input } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { database } from '../services/database';

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

const OrderRowCard: React.FC<{ order: Order; onViewDetails: (order: Order) => void }> = ({ order, onViewDetails }) => {
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

const OrderDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
    if (!order) return null;
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
    const { orders, resetDatabase, realTemps, boxStatus, physicalKeyPress } = useMqtt();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    
    const [currentTab, setCurrentTab] = useState<TabView>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    // --- Stats Logic ---
    const totalIncome = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? (o.total || 0) : 0), 0);
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const totalItemsSold = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' && o.items ? o.items.reduce((s, i) => s + i.quantity, 0) : 0), 0);
    
    const filteredOrders = orders.filter(o => {
        const term = searchTerm.toLowerCase();
        return (o.id || '').toLowerCase().includes(term) || 
               (o.code || '').includes(term) ||
               (o.customerDetails?.name || '').toLowerCase().includes(term);
    }).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Órdenes que están esperando ser abiertas (estatus 'ready')
    const readyOrders = orders.filter(o => o.status === 'ready');

    const handleKeypress = async (key: string) => {
        await database.sendKeypress(key);
    };

    const handleResetDB = async () => {
        if(window.confirm("ATENCIÓN: Esto borrará todo el historial permanentemente. ¿Estás seguro?")) {
            setIsResetting(true);
            try {
                await resetDatabase();
            } finally {
                setIsResetting(false);
            }
        }
    };

    return (
        <PageLayout className="bg-[#F3F4F6]">
            
            <div className="bg-dark text-white rounded-b-[3rem] pt-8 pb-12 px-6 shadow-2xl relative overflow-hidden mb-8">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-3xl">🛡️</div>
                        <div>
                            <h2 className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Panel de Control Admin</h2>
                            <h1 className="text-3xl font-black tracking-tight">Food Box Smart</h1>
                        </div>
                     </div>
                     <div className="flex gap-3">
                        <span className="hidden md:flex items-center text-sm font-bold text-gray-400 mr-2">Admin: {user?.name}</span>
                        <Button variant="secondary" onClick={() => { logout(); navigate('/'); }} className="!bg-white/10 !border-white/10 !text-white hover:!bg-red-500 shadow-lg">Salir</Button>
                     </div>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 mb-10">
                <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'dashboard', label: 'Resumen', icon: '📊' },
                        { id: 'history', label: 'Historial', icon: '📜' },
                        { id: 'simulator', label: 'Teclado IoT', icon: '⌨️' },
                        { id: 'sensors', label: 'Monitoreo Real', icon: '🌡️' },
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
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <StatCard title="Ingresos" value={`$${totalIncome.toFixed(2)}`} sub="Acumulado" icon="💰" colorClass="from-yellow-400 to-orange-500" />
                         <StatCard title="Entregados" value={completedOrders} sub="Órdenes" icon="🛒" colorClass="from-blue-400 to-indigo-500" />
                         <StatCard title="Ventas" value={totalItemsSold} sub="Unidades" icon="📦" colorClass="from-orange-400 to-red-500" />
                         <StatCard title="Estado" value="Online" sub="Sincronizado" icon="🟢" colorClass="from-teal-400 to-green-500" />
                    </div>
                )}

                {currentTab === 'history' && (
                    <div className="animate-fade-in space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 w-full">
                                <Input placeholder="🔍 Buscar por nombre, código..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <Button variant="danger" onClick={handleResetDB} isLoading={isResetting}>Limpiar Historial</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredOrders.map(order => (
                                <OrderRowCard key={order.id} order={order} onViewDetails={setSelectedOrderDetails} />
                            ))}
                        </div>
                    </div>
                )}

                {currentTab === 'simulator' && (
                    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
                        {/* Panel de Códigos Activos */}
                        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-xl flex items-center gap-2"><span>🏷️</span> Cajas esperando retiro</h3>
                                <Badge type="ready" className="!bg-blue-50 !text-blue-600 !border-blue-100">{readyOrders.length} activas</Badge>
                            </div>
                            
                            {readyOrders.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {readyOrders.map(ro => (
                                        <div key={ro.id} className="bg-gray-50 border border-gray-100 p-4 rounded-[2rem] flex flex-col items-center text-center hover:border-primary/30 transition-colors">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 truncate w-full">
                                                {ro.customerDetails?.name || 'Cliente'}
                                            </p>
                                            <div className="text-3xl font-mono font-black text-primary tracking-widest">
                                                {ro.code}
                                            </div>
                                            <p className="text-[9px] text-gray-400 mt-1 font-mono">{ro.id}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p className="text-sm font-medium">No hay cajas pendientes de apertura.</p>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-6 italic text-center">
                                Digite estos códigos en la terminal de abajo para simular que el cliente los ingresa físicamente.
                            </p>
                        </div>

                        {/* Terminal Física Virtual */}
                        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${boxStatus.isOccupied ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Estado Sistema: {boxStatus.isOccupied ? 'OCUPADO' : 'LIBRE'}</span>
                                </div>
                                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-primary">
                                    {boxStatus.currentUserId ? `USER: ${boxStatus.currentUserId.slice(0, 8)}` : 'READY_TO_PICKUP'}
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-[2rem] p-8 mb-10 border border-white/10 text-center">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-4 tracking-widest">Monitor Terminal IoT</p>
                                <div className="text-6xl font-mono text-primary tracking-[0.6em] min-h-[1.2em]">
                                    {physicalKeyPress?.key || '_'}
                                </div>
                                <p className="text-[10px] text-blue-400 mt-4 font-mono">Pulsación: {physicalKeyPress ? new Date(physicalKeyPress.timestamp).toLocaleTimeString() : '--:--:--'}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto w-full mb-10">
                                {[1,2,3,4,5,6,7,8,9, '*', 0, '#'].map(key => (
                                    <button 
                                        key={key}
                                        onClick={() => handleKeypress(key.toString())}
                                        className="bg-white/5 hover:bg-white/10 text-white font-mono text-3xl py-6 rounded-2xl transition-all border border-white/5 active:scale-95 shadow-lg"
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                            
                            <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed opacity-60">
                                Las pulsaciones se sincronizan vía Firebase para simular el hardware real.<br/>
                                Use "*" para borrar el buffer de entrada.
                            </p>
                        </div>
                    </div>
                )}
                
                {currentTab === 'sensors' && (
                    <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-gray-100 flex flex-col items-center animate-fade-in">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black text-dark mb-2">Monitoreo Real</h2>
                            <p className="text-gray-400 font-medium">Lectura en tiempo real de los compartimentos</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-5xl">
                            <div className="flex flex-col items-center text-center p-12 bg-red-50 rounded-[3rem] border border-red-100 shadow-sm transition-all hover:shadow-md">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">🔥</div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Zona Caliente</p>
                                <div className="text-8xl font-black text-red-600 mb-6 font-mono">{realTemps.hot}°</div>
                                <div className="w-full bg-red-200 rounded-full h-4 overflow-hidden shadow-inner">
                                    <div className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-1000" style={{ width: `${Math.min(realTemps.hot, 100)}%` }}></div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center text-center p-12 bg-cyan-50 rounded-[3rem] border border-cyan-100 shadow-sm transition-all hover:shadow-md">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm">❄️</div>
                                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Zona Fría</p>
                                <div className="text-8xl font-black text-cyan-600 mb-6 font-mono">{realTemps.cold}°</div>
                                <div className="w-full bg-cyan-200 rounded-full h-4 overflow-hidden shadow-inner">
                                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-1000" style={{ width: `${Math.min(realTemps.cold * 3, 100)}%` }}></div>
                                </div>
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
