
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, PageLayout } from '../components/UI';

export const Login: React.FC = () => {
  const { login } = useAuth();
  
  // States
  const [mode, setMode] = useState<'client' | 'admin'>('client');
  const [email, setEmail] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulamos un pequeño delay de red
    setTimeout(() => {
        if (mode === 'client') {
            if (!email.trim() || !email.includes('@')) {
                setError('Por favor ingresa un correo válido.');
                setLoading(false);
                return;
            }
            // Login cliente: solo email
            login(email, undefined, false);
        } else {
            // Login Admin: Usuario y Contraseña
            const success = login(adminUser, adminPass, true);
            if (!success) {
                setError('Usuario o contraseña incorrectos.');
                setLoading(false);
                return;
            }
        }
        // El redireccionamiento ocurre en App.tsx al detectar el usuario en el contexto
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden font-sans text-dark">
      
      {/* SECCIÓN IZQUIERDA (Visible solo en PC/Tablet) - Visual Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-orange-600 relative items-center justify-center text-white overflow-hidden">
         
         {/* Elementos decorativos de fondo */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
         <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
         <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>

         <div className="z-10 text-center p-12 max-w-lg">
            <div className="w-64 h-64 mx-auto mb-8 relative hover:scale-105 transition-transform duration-500">
                 <img 
                    src="/images/logo.png" 
                    alt="Logo Empresa" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
                <div className="hidden w-full h-full bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30">
                     <span className="text-8xl">🍔</span>
                </div>
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
                Food Box <span className="text-yellow-300">Smart</span>
            </h1>
            <p className="text-xl text-orange-100 font-medium leading-relaxed">
                {mode === 'client' 
                    ? "La forma más rápida y deliciosa de pedir tu comida. Sin filas, directo a tu caja." 
                    : "Panel de control administrativo. Gestiona pedidos y monitorea cajas en tiempo real."}
            </p>
         </div>
      </div>

      {/* SECCIÓN DERECHA - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
         <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-orange-500/5 border border-orange-100/50 relative">
            
            {/* Logo visible solo en Móvil */}
            <div className="lg:hidden text-center mb-8">
                <img src="/images/logo.png" className="w-32 h-32 object-contain mx-auto mb-2" />
                <h2 className="text-2xl font-black text-dark">Food Box Smart</h2>
            </div>

            {/* Cabecera del Formulario */}
            <div className="mb-8">
                <h3 className="text-3xl font-bold text-dark mb-2">
                    {mode === 'client' ? '¡Bienvenido!' : 'Acceso Admin'}
                </h3>
                <p className="text-gray-400">
                    {mode === 'client' 
                        ? 'Ingresa tus datos para comenzar tu pedido.' 
                        : 'Por favor ingresa tus credenciales.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {mode === 'client' ? (
                    <div className="animate-fade-in space-y-4">
                         <Input
                            label="Correo Electrónico"
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={error}
                            className="!bg-gray-50 !border-gray-100 focus:!bg-white"
                            autoFocus
                            icon={<span className="text-gray-400">📧</span>}
                        />
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <Input
                            label="Usuario"
                            type="text"
                            placeholder="admin"
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            autoFocus
                            className="!bg-gray-50 !border-gray-100 focus:!bg-white"
                            icon={<span className="text-gray-400">👤</span>}
                        />
                         <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            error={error}
                            className="!bg-gray-50 !border-gray-100 focus:!bg-white"
                            icon={<span className="text-gray-400">🔒</span>}
                        />
                    </div>
                )}

                <Button 
                    type="submit" 
                    fullWidth 
                    isLoading={loading} 
                    className={`text-lg py-4 shadow-xl transition-transform hover:scale-[1.02] ${
                        mode === 'admin' 
                        ? '!bg-dark hover:!bg-black shadow-gray-900/20' 
                        : 'shadow-orange-500/30'
                    }`}
                >
                    {loading ? 'Procesando...' : mode === 'client' ? 'Ingresar' : 'Iniciar Sesión'}
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 mb-3">
                    {mode === 'client' ? '¿Eres administrador?' : '¿Quieres realizar un pedido?'}
                </p>
                {mode === 'client' ? (
                    <button 
                        onClick={() => { setMode('admin'); setError(''); }}
                        className="text-dark font-bold hover:text-primary transition-colors text-sm"
                    >
                        Ingresar como Admin
                    </button>
                ) : (
                    <button 
                        onClick={() => { setMode('client'); setError(''); }}
                        className="text-primary font-bold hover:text-orange-600 transition-colors text-sm"
                    >
                        Volver a modo Cliente
                    </button>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};
