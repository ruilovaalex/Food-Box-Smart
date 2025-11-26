import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, PageLayout, Card } from '../components/UI';

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
    <PageLayout className="flex items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-white">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8 flex flex-col items-center">
            {/* LOGO EMPRESARIAL */}
            <div className="w-48 h-48 mb-6 relative">
                <img 
                    src="/images/logo.png" 
                    alt="Logo Empresa" 
                    className="w-full h-full object-contain drop-shadow-xl"
                    onError={(e) => {
                        // Fallback si la imagen no existe
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                />
                {/* Fallback visual si no se carga el logo */}
                <div className="hidden w-full h-full bg-gradient-to-tr from-primary to-orange-400 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20 transform rotate-3">
                    <span className="text-6xl">🍔</span>
                </div>
            </div>
            
            <h1 className="text-2xl font-extrabold text-dark tracking-tight mb-1">Food Box Smart</h1>
            <p className="text-gray-500 font-medium text-sm">
                {mode === 'client' ? 'Pide tu comida favorita al instante.' : 'Panel de Administración'}
            </p>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-white/90 relative overflow-hidden shadow-2xl border-white/50">
            {/* Indicador visual del modo */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${mode === 'admin' ? 'bg-dark' : 'bg-primary'}`} />

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {mode === 'client' ? (
                    <div className="animate-fade-in">
                         <Input
                            label="Correo Electrónico"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={error}
                            autoFocus
                        />
                         <p className="text-xs text-gray-400 mt-2 ml-1">
                            Ingresa tu correo para recibir tu comprobante.
                        </p>
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
                        />
                         <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            error={error}
                        />
                    </div>
                )}

                <Button 
                    type="submit" 
                    fullWidth 
                    isLoading={loading} 
                    className={mode === 'admin' ? '!bg-dark hover:!bg-black shadow-gray-500/30' : ''}
                >
                    {loading ? 'Iniciando...' : mode === 'client' ? 'Ingresar' : 'Entrar'}
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
                {mode === 'client' ? (
                    <button 
                        onClick={() => { setMode('admin'); setError(''); }}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-dark hover:bg-gray-100 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Admin
                    </button>
                ) : (
                    <button 
                        onClick={() => { setMode('client'); setError(''); }}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-primary hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                        Volver a Cliente
                    </button>
                )}
            </div>
        </Card>
      </div>
    </PageLayout>
  );
};