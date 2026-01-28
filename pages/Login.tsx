
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

const ASSETS = {
    // Estas rutas asumen que tienes una carpeta "images" en la raíz del proyecto
    LOGO: '/images/logo.png',
    SECURITY_GIF: '/images/calavera.gif',
    FALLBACK_EMOJI: '🍔',
    SECURITY_FALLBACK: '🛡️'
};

const FloatingItem: React.FC<{ emoji: string, delay: number, duration: number, left: string, top: string, size: string }> = ({ emoji, delay, duration, left, top, size }) => (
  <div 
    className="absolute pointer-events-none select-none animate-float opacity-[0.08]"
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

  // Estados de error de carga de assets
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
      
      {/* FONDO DINÁMICO MEJORADO (UX UPGRADE) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Capa de textura sutil para mayor calidad visual */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          
          {/* Orbes de luz con transiciones más suaves y profundidad */}
          <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-colors duration-1000 ${isAdminMode ? 'bg-primary/10' : 'bg-primary/20'}`}></div>
          <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-colors duration-1000 ${isAdminMode ? 'bg-accent/5' : 'bg-accent/15'}`}></div>
          
          {/* Comida flotante con varianza mejorada */}
          {Array.from({ length: 22 }).map((_, i) => (
            <FloatingItem 
              key={i}
              emoji={['🍔', '🍕', '🍟', '🥤', '🌮', '🍦', '🍩', '🍣'][i % 8]}
              delay={i * 0.6}
              duration={14 + (i % 6)}
              left={`${(i * 18) % 100}%`}
              top={`${(i * 14) % 100}%`}
              size={['1.2rem', '2.2rem', '3.2rem'][i % 3]}
            />
          ))}
      </div>

      <div className={`w-full max-w-5xl bg-white/75 backdrop-blur-3xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/60 transition-transform duration-500 ${shouldShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* PANEL IZQUIERDO: Branding y Assets Propios */}
        <div className={`md:w-[45%] p-10 lg:p-16 flex flex-col items-center justify-center relative overflow-hidden text-center transition-all duration-1000 ${isAdminMode ? 'bg-slate-900' : 'bg-primary'}`}>
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
             <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
             
             {/* Contenedor del Logo con Glassmorphism mejorado */}
             <div className="relative z-10 mb-10 group">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-500 scale-110"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-[3.5rem] p-10 border border-white/20 shadow-2xl transition-all duration-500 group-hover:scale-[1.03] group-hover:rotate-1">
                  {!logoError ? (
                      <img 
                          src={ASSETS.LOGO}
                          alt="Logo Food Box" 
                          className="w-44 h-44 md:w-60 md:h-60 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)] transition-all duration-700" 
                          onError={() => setLogoError(true)}
                      />
                  ) : (
                      <div className="text-9xl animate-bounce-soft">{ASSETS.FALLBACK_EMOJI}</div>
                  )}
                </div>
             </div>
             
             <div className="relative z-10 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-lg">Food Box<br/>Smart</h1>
                <div className="h-1.5 w-16 bg-white/40 mx-auto rounded-full"></div>
                <p className="text-white/80 text-xs md:text-sm font-black tracking-[0.4em] uppercase">
                    {isAdminMode ? 'Control Center v3.0' : 'Tu comida, tu tiempo.'}
                </p>
             </div>

             {/* Contenedor del GIF de Seguridad propio */}
             <div className="absolute bottom-10 left-10 z-20 flex items-center gap-3 bg-black/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 transition-all duration-500 hover:bg-black/40 group">
                {!gifError ? (
                    <img 
                        src={ASSETS.SECURITY_GIF}
                        alt="Security" 
                        className="w-10 h-10 object-contain mix-blend-screen brightness-125 group-hover:scale-125 transition-transform"
                        onError={() => setGifError(true)}
                    />
                ) : (
                    <div className="text-xl opacity-50 grayscale">{ASSETS.SECURITY_FALLBACK}</div>
                )}
                <div className="text-left">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Secure Node</p>
                  <p className="text-[10px] font-bold text-white uppercase tracking-tighter">IoT Verified</p>
                </div>
             </div>
        </div>

        {/* PANEL DERECHO: Formulario de Acceso */}
        <div className="md:w-[55%] p-8 lg:p-20 flex flex-col justify-center bg-white/10 relative">
            <div className="absolute top-10 right-10 flex bg-gray-100/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-gray-200/40 z-30 shadow-sm">
                <button 
                    onClick={() => { setIsAdminMode(false); setError(''); }}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-500 ${!isAdminMode ? 'bg-white text-primary shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    CLIENTE
                </button>
                <button 
                    onClick={() => { setIsAdminMode(true); setError(''); }}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-500 ${isAdminMode ? 'bg-slate-800 text-white shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    ADMIN
                </button>
            </div>

            <div className="max-w-sm mx-auto w-full animate-slide-up">
                <div className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-[10px] uppercase tracking-widest mb-4">
                        <span className="animate-pulse">●</span> {greeting}
                    </div>
                    <h2 className="text-4xl font-black text-dark tracking-tighter mb-2 leading-none">
                        {isRegistering ? 'Únete al Club' : 'Te extrañamos'}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">Ingresa tus credenciales maestras.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegistering && !isAdminMode && (
                        <div className="animate-fade-in">
                            <Input 
                                label="Nombre Completo" 
                                placeholder="Ej. Juan Pérez" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                icon="👤"
                            />
                        </div>
                    )}

                    <Input
                        label={isAdminMode ? "Usuario Maestro" : "Email"}
                        type={isAdminMode ? "text" : "email"}
                        placeholder={isAdminMode ? "admin_foodbox" : "tu@correo.com"}
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
                            className="absolute right-4 top-[42px] text-gray-400 hover:text-primary transition-all p-1 active:scale-90"
                        >
                            {showPassword ? '👁️‍🗨️' : '👁️'}
                        </button>
                    </div>

                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            fullWidth 
                            isLoading={loading} 
                            className={`py-5 text-lg font-black tracking-widest uppercase transition-all duration-500 rounded-3xl ${isAdminMode ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20' : 'shadow-orange-500/30'}`}
                        >
                            {isRegistering ? 'CREAR CUENTA' : 'ENTRAR AHORA'}
                        </Button>
                    </div>
                </form>

                {!isAdminMode && (
                    <div className="mt-10 text-center space-y-6">
                        <button 
                            onClick={loginAnonymously}
                            className="group flex items-center justify-center gap-2 mx-auto text-gray-400 hover:text-primary font-black text-xs uppercase tracking-[0.3em] transition-all"
                        >
                            <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">✨</span>
                            Ver menú como invitado
                            <span className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">✨</span>
                        </button>

                        <div className="relative pt-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-white/50 backdrop-blur-md text-gray-300 font-black uppercase tracking-widest">O</span></div>
                        </div>

                        <p className="text-sm text-gray-500 font-medium">
                            {isRegistering ? '¿Ya tienes cuenta?' : '¿Nuevo en Food Box?'}
                            <button 
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="ml-2 font-black text-primary hover:text-orange-600 transition-colors underline-offset-8 hover:underline"
                            >
                                {isRegistering ? 'Inicia Sesión' : 'Crea una aquí'}
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
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.08; }
          50% { transform: translateY(-45px) rotate(10deg); opacity: 0.12; }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
