
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

const ASSETS = {
    // Estas rutas funcionan porque los archivos están en public/images/
    LOGO: '/images/logo.png',
    SECURITY_GIF: '/images/calavera.gif',
    FALLBACK_EMOJI: '🍔',
    SECURITY_FALLBACK: '🛡️'
};

const FloatingItem: React.FC<{ emoji: string, delay: number, duration: number, left: string, top: string, size: string }> = ({ emoji, delay, duration, left, top, size }) => (
  <div 
    className="absolute pointer-events-none select-none animate-float opacity-[0.06]"
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

  // Gestión de carga de imágenes
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
      
      {/* FONDO DINÁMICO */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-colors duration-1000 ${isAdminMode ? 'bg-primary/10' : 'bg-primary/15'}`}></div>
          <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] transition-colors duration-1000 ${isAdminMode ? 'bg-accent/5' : 'bg-accent/10'}`}></div>
          
          {Array.from({ length: 20 }).map((_, i) => (
            <FloatingItem 
              key={i}
              emoji={['🍔', '🍕', '🍟', '🥤', '🌮', '🍦', '🍩', '🍣'][i % 8]}
              delay={i * 0.7}
              duration={15 + (i % 5)}
              left={`${(i * 15) % 100}%`}
              top={`${(i * 13) % 100}%`}
              size={['1rem', '2rem', '3rem'][i % 3]}
            />
          ))}
      </div>

      <div className={`w-full max-w-5xl bg-white/80 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/60 transition-transform duration-500 ${shouldShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* PANEL IZQUIERDO: Branding */}
        <div className={`md:w-[42%] p-10 lg:p-16 flex flex-col items-center justify-center relative overflow-hidden text-center transition-all duration-1000 ${isAdminMode ? 'bg-slate-900' : 'bg-primary'}`}>
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
             
             <div className="relative z-10 mb-8 group flex items-center justify-center">
                {/* Glow circular suave detrás del logo */}
                <div className="absolute inset-0 bg-white/30 rounded-full blur-3xl transition-all duration-500 scale-125 group-hover:scale-150 group-hover:bg-white/40"></div>
                
                <div className="relative transition-all duration-500 hover:scale-[1.05]">
                  {!logoError ? (
                      <img 
                          src={ASSETS.LOGO}
                          alt="Logo Food Box" 
                          className={`w-52 h-52 md:w-72 md:h-72 object-contain rounded-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.25)] transition-opacity duration-700 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`} 
                          onLoad={() => setLogoLoaded(true)}
                          onError={() => setLogoError(true)}
                      />
                  ) : (
                      <div className="text-8xl animate-bounce-soft">{ASSETS.FALLBACK_EMOJI}</div>
                  )}
                  {!logoLoaded && !logoError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
             </div>
             
             <div className="relative z-10 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-md">Food Box<br/>Smart</h1>
                <div className="h-1.5 w-16 bg-white/30 mx-auto rounded-full"></div>
                <p className="text-white/70 text-xs font-black tracking-[0.4em] uppercase">
                    {isAdminMode ? 'System Node v3.0' : 'Intelligent Dining'}
                </p>
             </div>

             {/* Ajuste del GIF para que no se vea recortado y tenga buen aire */}
             <div className="absolute bottom-10 left-10 z-20 flex items-center gap-5 bg-black/20 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/20 transition-all hover:bg-black/30 group shadow-2xl">
                {!gifError ? (
                    <img 
                        src={ASSETS.SECURITY_GIF}
                        alt="Security" 
                        className="w-14 h-14 object-contain mix-blend-screen brightness-125 group-hover:scale-110 transition-transform"
                        onError={() => setGifError(true)}
                    />
                ) : (
                    <div className="text-lg opacity-40">{ASSETS.SECURITY_FALLBACK}</div>
                )}
                <div className="text-left">
                  <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em] leading-none mb-1">Protection</p>
                  <p className="text-[11px] font-black text-white uppercase tracking-tight">IoT Secured System</p>
                </div>
             </div>
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="md:w-[58%] p-8 lg:p-20 flex flex-col justify-center bg-white/20 relative">
            <div className="absolute top-8 right-8 flex bg-gray-100/50 backdrop-blur-2xl p-1 rounded-2xl border border-gray-200/30 z-30 shadow-sm">
                <button 
                    onClick={() => { setIsAdminMode(false); setError(''); }}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all duration-300 ${!isAdminMode ? 'bg-white text-primary shadow-lg' : 'text-gray-400'}`}
                >
                    CLIENTE
                </button>
                <button 
                    onClick={() => { setIsAdminMode(true); setError(''); }}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all duration-300 ${isAdminMode ? 'bg-slate-800 text-white shadow-lg' : 'text-gray-400'}`}
                >
                    ADMIN
                </button>
            </div>

            <div className="max-w-sm mx-auto w-full animate-slide-up">
                <div className="mb-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-[9px] uppercase tracking-widest mb-4">
                        <span className="animate-pulse">●</span> {greeting}
                    </div>
                    <h2 className="text-4xl font-black text-dark tracking-tighter mb-1">
                        {isRegistering ? 'Crear Perfil' : 'Hola de nuevo'}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">Ingresa para gestionar tus pedidos.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isRegistering && !isAdminMode && (
                        <div className="animate-fade-in">
                            <Input 
                                label="Nombre" 
                                placeholder="Tu nombre aquí" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                icon="👤"
                            />
                        </div>
                    )}

                    <Input
                        label={isAdminMode ? "ID Admin" : "Email"}
                        type={isAdminMode ? "text" : "email"}
                        placeholder={isAdminMode ? "admin_user" : "tu@email.com"}
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
                            className="absolute right-4 top-[38px] text-gray-300 hover:text-primary transition-all p-1"
                        >
                            {showPassword ? '👁️‍🗨️' : '👁️'}
                        </button>
                    </div>

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            fullWidth 
                            isLoading={loading} 
                            className={`py-4 text-sm font-black tracking-widest uppercase transition-all duration-300 rounded-2xl ${isAdminMode ? 'bg-slate-800 shadow-slate-900/10' : ''}`}
                        >
                            {isRegistering ? 'REGISTRARME' : 'ACCEDER'}
                        </Button>
                    </div>
                </form>

                {!isAdminMode && (
                    <div className="mt-8 text-center space-y-5">
                        <button 
                            onClick={loginAnonymously}
                            className="text-gray-400 hover:text-primary font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                        >
                            Ver menú como invitado
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest"><span className="px-3 bg-white/50 text-gray-300">O</span></div>
                        </div>

                        <p className="text-xs text-gray-500 font-medium">
                            {isRegistering ? '¿Ya eres miembro?' : '¿Sin cuenta?'}
                            <button 
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="ml-2 font-black text-primary hover:text-orange-600 transition-colors"
                            >
                                {isRegistering ? 'Loguéate' : 'Crea una'}
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
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
