
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

export const Login: React.FC = () => {
  const { login, register, loginAnonymously } = useAuth();
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const logoUrl = '/images/logo.png';
  const gifUrl = '/images/calavera.gif';

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Buenos días');
    else if (hours < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  // Memorizamos la malla de emojis para evitar cálculos pesados en cada render
  const backgroundEmojis = useMemo(() => {
    const emojis = ['🍔', '🍕', '🍟', '🌭', '🌮', '🍦', '🍩', '🥤'];
    return Array.from({ length: 60 }).map((_, i) => (
      <div key={i} className="text-4xl md:text-6xl animate-pulse" style={{ animationDuration: `${3 + Math.random() * 4}s` }}>
          {emojis[i % emojis.length]}
      </div>
    ));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isAdminMode) {
            const adminEmail = email.toLowerCase().includes('@') ? email.toLowerCase() : `${email.toLowerCase()}@foodbox.com`;
            try {
                await login(adminEmail, password);
            } catch (loginErr: any) {
                const isPossibleNewUser = loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential';
                if (isPossibleNewUser) {
                    try {
                        await register("Administrador", adminEmail, password);
                    } catch (regErr: any) {
                        if (regErr.code === 'auth/email-already-in-use') throw new Error("Contraseña incorrecta.");
                        throw regErr;
                    }
                } else throw loginErr;
            }
        } else {
            if (isRegistering) {
                if (!name.trim()) throw new Error("El nombre es obligatorio.");
                await register(name, email, password);
            } else {
                await login(email, password);
            }
        }
    } catch (err: any) {
        let msg = "Error de acceso.";
        if (err.code === 'auth/invalid-email') msg = "Correo inválido.";
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Credenciales incorrectas.";
        setError(err.message || msg);
        setLoading(false);
    }
  }, [isAdminMode, isRegistering, email, password, name, login, register]);

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 lg:p-8 relative overflow-hidden transition-colors duration-500 ${isAdminMode ? 'bg-slate-900' : 'bg-[#FFF9F5]'}`}>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className={`grid grid-cols-6 md:grid-cols-8 gap-8 md:gap-16 transform -rotate-12 scale-110 transition-opacity duration-500 ${isAdminMode ? 'opacity-[0.03]' : 'opacity-20 grayscale-[20%]'}`}>
              {backgroundEmojis}
          </div>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px] animate-fade-in border border-white/50">
        
        <div className={`md:w-[45%] p-8 lg:p-14 flex flex-col items-center justify-center relative overflow-hidden text-center transition-colors duration-500 ${isAdminMode ? 'bg-slate-800' : 'bg-[#FF8A2B]'}`}>
             <div className="relative z-10 mb-4 transform hover:scale-105 transition-transform duration-500 group">
                <img 
                    src={logoUrl}
                    alt="Logo" 
                    className="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-2xl" 
                    onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                />
             </div>
             
             <h1 className="relative z-10 text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Food Box</h1>
             <p className="relative z-10 text-white/90 text-sm md:text-lg font-medium">
                {isAdminMode ? 'Panel de Administración' : 'Tu comida favorita, sin filas.'}
             </p>

             <div className="absolute bottom-4 right-4 z-20 opacity-90 animate-bounce-soft">
                <img 
                    src={gifUrl}
                    alt="" 
                    className="w-20 h-20 md:w-28 object-contain drop-shadow-lg mix-blend-screen"
                    onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                />
             </div>
        </div>

        <div className="md:w-[55%] p-6 md:p-8 lg:p-14 flex flex-col justify-center bg-white relative">
            <div className="absolute top-4 right-4 flex bg-gray-50 p-1 rounded-full border border-gray-100 z-30">
                <button 
                    onClick={() => { setIsAdminMode(false); setIsRegistering(false); setError(''); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isAdminMode ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400'}`}
                >
                    Cliente
                </button>
                <button 
                    onClick={() => { setIsAdminMode(true); setIsRegistering(false); setError(''); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isAdminMode ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400'}`}
                >
                    Admin
                </button>
            </div>

            <div className="max-w-sm mx-auto w-full">
                <div className="mb-8">
                    <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2">{greeting} 👋</p>
                    <h2 className="text-2xl md:text-3xl font-black text-dark tracking-tight">
                        {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && !isAdminMode && (
                        <Input label="Nombre Completo" placeholder="Ej. Alex Ruilova" value={name} onChange={(e) => setName(e.target.value)} />
                    )}
                    <Input label={isAdminMode ? "Usuario Admin" : "Correo Electrónico"} type={isAdminMode ? "text" : "email"} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={error} />
                    <Button type="submit" fullWidth isLoading={loading} className={`py-4 ${isAdminMode ? 'bg-slate-800' : ''}`}>
                        Ingresar ahora
                    </Button>
                </form>

                {!isAdminMode && (
                    <div className="mt-6">
                        <Button type="button" variant="secondary" fullWidth onClick={loginAnonymously} className="text-gray-500 py-3">
                            👀 Ver menú como Invitado
                        </Button>
                        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                            {isRegistering ? '¿Ya tienes una cuenta?' : '¿Nuevo aquí?'}
                            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="ml-2 font-bold text-primary underline underline-offset-4">
                                {isRegistering ? 'Inicia Sesión' : 'Crea una cuenta'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
