
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

const ASSETS = {
    LOGO: '/images/logo.png',
    SECURITY_GIF: '/images/calavera.gif',
    FALLBACK_EMOJI: '🍔',
    SECURITY_FALLBACK: '🛡️'
};

const FloatingItem: React.FC<{ emoji: string, delay: number, duration: number, left: string, top: string, size: string }> = ({ emoji, delay, duration, left, top, size }) => (
  <div 
    className="absolute pointer-events-none select-none animate-float opacity-[0.4]"
    style={{ 
      left, 
      top, 
      fontSize: size,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    }}
  >
    {emoji}
  </div>
);

export const Login: React.FC = () => {
  const { login, register, loginAnonymously } = useAuth();
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [gifError, setGifError] = useState(false);

  useEffect(() => {
    setError('');
  }, [email, password, name, isAdminMode, isRegistering]);

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('¡Buen día!');
    else if (hours < 18) setGreeting('¡Buena tarde!');
    else setGreeting('¡Buena noche!');
  }, []);

  const triggerShake = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isAdminMode) {
            const adminEmail = email.toLowerCase().includes('@') ? email.toLowerCase() : `${email.toLowerCase()}@foodbox.com`;
            await login(adminEmail, password);
        } else {
            if (isRegistering) {
                if (!name.trim()) throw new Error("Necesitamos tu nombre.");
                await register(name, email, password);
            } else {
                await login(email, password);
            }
        }
    } catch (err: any) {
        let msg = "Acceso denegado.";
        if (err.code === 'auth/invalid-email') msg = "Correo no válido.";
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Clave incorrecta.";
        setError(msg);
        triggerShake();
        setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-all duration-1000 ${isAdminMode ? 'bg-slate-950' : 'bg-[#FDFCFB]'}`}>
      
      {/* FONDO DINÁMICO: ALIMENTOS MÁS VISIBLES */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-white">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          <div className={`absolute top-[-5%] left-[-5%] w-[80%] h-[80%] rounded-full blur-[160px] transition-colors duration-1000 ${isAdminMode ? 'bg-primary/15' : 'bg-primary/30'}`}></div>
          <div className={`absolute bottom-[-5%] right-[-5%] w-[80%] h-[80%] rounded-full blur-[160px] transition-colors duration-1000 ${isAdminMode ? 'bg-accent/15' : 'bg-accent/25'}`}></div>
          
          {Array.from({ length: 30 }).map((_, i) => (
            <FloatingItem 
              key={i}
              emoji={['🍔', '🍕', '🍟', '🥤', '🌮', '🍦', '🍩', '🍣', '🥨', '🍪'][i % 10]}
              delay={i * 0.4}
              duration={12 + (i % 8)}
              left={`${(i * 13) % 100}%`}
              top={`${(i * 17) % 100}%`}
              size={['1.5rem', '2.5rem', '3.5rem', '4rem'][i % 4]}
            />
          ))}
      </div>

      <div className={`w-full max-w-5xl bg-white/90 backdrop-blur-3xl rounded-[4rem] shadow-[0_50px_150px_-30px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white transition-transform duration-500 ${shouldShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* PANEL IZQUIERDO: Branding */}
        <div className={`md:w-[45%] p-12 lg:p-20 flex flex-col items-center justify-center relative overflow-hidden text-center transition-all duration-1000 ${isAdminMode ? 'bg-slate-900' : 'bg-primary'}`}>
             <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
             
             {/* LOGO: Circular y limpio */}
             <div className="relative z-10 mb-10 group flex items-center justify-center">
                <div className="relative transition-all duration-500 hover:scale-[1.05]">
                  {!logoError ? (
                      <img 
                          src={ASSETS.LOGO}
                          alt="Logo Food Box" 
                          className={`w-64 h-64 md:w-80 md:h-80 object-contain rounded-full transition-opacity duration-700 ${logoLoaded ? 'opacity-100' : 'opacity-0'} drop-shadow-[0_25px_45px_rgba(0,0,0,0.3)]`} 
                          onLoad={() => setLogoLoaded(true)}
                          onError={() => setLogoError(true)}
                      />
                  ) : (
                      <div className="text-9xl animate-bounce-soft">{ASSETS.FALLBACK_EMOJI}</div>
                  )}
                  {!logoLoaded && !logoError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
             </div>
             
             {/* TEXTO */}
             <div className="relative z-10 mb-12">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
                  Food Box<br/>Smart
                </h1>
                <div className="h-2 w-24 bg-white/20 mx-auto rounded-full mt-6 mb-2"></div>
                <p className="text-white/60 text-[10px] font-black tracking-[0.6em] uppercase">Gastronomía Inteligente</p>
             </div>

             {/* GIF DE SEGURIDAD: Ajustado a w-24 h-24 en la esquinita */}
             <div className="absolute bottom-10 left-10 z-20 group">
                {!gifError ? (
                    <img 
                        src={ASSETS.SECURITY_GIF}
                        alt="Security" 
                        className="w-24 h-24 object-contain mix-blend-screen brightness-125 transition-transform duration-500 group-hover:scale-110"
                        onError={() => setGifError(true)}
                    />
                ) : (
                    <div className="text-2xl opacity-20">{ASSETS.SECURITY_FALLBACK}</div>
                )}
             </div>
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="md:w-[55%] p-10 lg:p-24 flex flex-col justify-center bg-white/5 relative">
            <div className="absolute top-10 right-10 flex bg-gray-100/50 backdrop-blur-2xl p-1.5 rounded-2xl border border-gray-200/30 z-30 shadow-sm">
                <button 
                    onClick={() => { setIsAdminMode(false); setError(''); }}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${!isAdminMode ? 'bg-white text-primary shadow-lg ring-1 ring-black/5' : 'text-gray-400'}`}
                >
                    CLIENTE
                </button>
                <button 
                    onClick={() => { setIsAdminMode(true); setError(''); }}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${isAdminMode ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/10' : 'text-gray-400'}`}
                >
                    ADMIN
                </button>
            </div>

            <div className="max-w-md mx-auto w-full animate-slide-up">
                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-6">
                        <span className="animate-pulse">●</span> {greeting}
                    </div>
                    <h2 className="text-5xl font-black text-dark tracking-tighter mb-2">
                        {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
                    </h2>
                    <p className="text-gray-400 text-lg font-medium">Ingresa para gestionar tus pedidos.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegistering && !isAdminMode && (
                        <div className="animate-fade-in">
                            <Input 
                                label="Nombre" 
                                placeholder="Escribe tu nombre" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                icon="👤"
                            />
                        </div>
                    )}

                    <Input
                        label={isAdminMode ? "ID Administrador" : "Correo Electrónico"}
                        type={isAdminMode ? "text" : "email"}
                        placeholder={isAdminMode ? "admin_root" : "ejemplo@box.com"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={isAdminMode ? "🔑" : "✉️"}
                    />

                    <div className="relative group">
                        <Input
                            label="Contraseña"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                            icon="🔒"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-[42px] text-gray-300 hover:text-primary transition-all p-2"
                        >
                            {showPassword ? '👁️‍🗨️' : '👁️'}
                        </button>
                    </div>

                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            fullWidth 
                            isLoading={loading} 
                            className={`py-6 text-base font-black tracking-widest uppercase transition-all duration-300 rounded-[2rem] ${isAdminMode ? 'bg-slate-800 shadow-slate-900/20' : 'shadow-primary/30'}`}
                        >
                            {isRegistering ? 'REGISTRARME AHORA' : 'ENTRAR AL SISTEMA'}
                        </Button>
                    </div>
                </form>

                {!isAdminMode && (
                    <div className="mt-12 text-center space-y-8">
                        <button 
                            onClick={loginAnonymously}
                            className="text-gray-400 hover:text-primary font-black text-[11px] uppercase tracking-[0.4em] transition-all"
                        >
                            Explorar como invitado
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="px-4 bg-white/50 text-gray-300">Smart Hub</span></div>
                        </div>

                        <p className="text-sm text-gray-500 font-medium">
                            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                            <button 
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="ml-3 font-black text-primary hover:text-orange-600 transition-colors"
                            >
                                {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-50px) rotate(10deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
