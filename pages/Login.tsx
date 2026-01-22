
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

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

  // Rutas de archivos
  const logoUrl = '/images/logo.png';
  const gifUrl = '/images/calavera.gif';
  
  const [logoError, setLogoError] = useState(false);
  const [gifError, setGifError] = useState(false);

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
    <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-all duration-700 ${isAdminMode ? 'bg-slate-950' : 'bg-surface'}`}>
      
      {/* Fondo Animado de Comida Flotante */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] select-none">
          <div className="grid grid-cols-6 md:grid-cols-10 gap-20 transform -rotate-12 scale-150">
              {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className={`text-5xl animate-bounce-soft`} style={{ animationDelay: `${i * 0.2}s`, animationDuration: `${2 + (i % 3)}s` }}>
                    {['🍔', '🍕', '🍟', '🥤', '🌮', '🍦'][i % 6]}
                  </div>
              ))}
          </div>
      </div>

      <div className={`w-full max-w-5xl bg-white/80 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50 transition-transform duration-500 ${shouldShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* PANEL IZQUIERDO: Visual & Branding */}
        <div className={`md:w-[45%] p-10 lg:p-16 flex flex-col items-center justify-center relative overflow-hidden text-center transition-all duration-700 ${isAdminMode ? 'bg-slate-900' : 'bg-primary'}`}>
             
             {/* Círculos decorativos de fondo */}
             <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
             <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
             
             <div className="relative z-10 mb-10 group">
                {!logoError ? (
                    <img 
                        src={logoUrl}
                        alt="Logo Food Box" 
                        className="w-44 h-44 md:w-64 md:h-64 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <div className="text-9xl animate-bounce-soft">🍔</div>
                )}
             </div>
             
             <div className="relative z-10 space-y-3">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Food Box<br/>Smart</h1>
                <div className="h-1 w-12 bg-white/30 mx-auto rounded-full"></div>
                <p className="text-white/70 text-xs md:text-sm font-black tracking-[0.3em] uppercase">
                    {isAdminMode ? 'Control Center v2.5' : 'Tu comida, tu tiempo.'}
                </p>
             </div>

             {/* GIF Animado (Calavera) mejor posicionado */}
             {!gifError && (
                <div className="absolute bottom-8 left-8 z-20 transition-opacity duration-500 opacity-40 hover:opacity-100 group">
                    <img 
                        src={gifUrl}
                        alt="Security" 
                        className="w-12 h-12 md:w-16 md:h-16 object-contain mix-blend-screen grayscale brightness-200"
                        onError={() => setGifError(true)}
                    />
                </div>
             )}
        </div>

        {/* PANEL DERECHO: Formulario Interactivos */}
        <div className="md:w-[55%] p-8 lg:p-20 flex flex-col justify-center bg-white/40 relative">
            
            {/* Selector de Modo con Estilo */}
            <div className="absolute top-10 right-10 flex bg-gray-100/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/50 z-30">
                <button 
                    onClick={() => { setIsAdminMode(false); setError(''); }}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${!isAdminMode ? 'bg-white text-primary shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    CLIENTE
                </button>
                <button 
                    onClick={() => { setIsAdminMode(true); setError(''); }}
                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${isAdminMode ? 'bg-slate-800 text-white shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    ADMIN
                </button>
            </div>

            <div className="max-w-sm mx-auto w-full animate-slide-up">
                <div className="mb-10 text-center md:text-left">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest mb-4">
                        {greeting} ✨
                    </span>
                    <h2 className="text-4xl font-black text-dark tracking-tighter mb-2">
                        {isRegistering ? 'Únete al Club' : 'Te extrañamos'}
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">Ingresa tus datos para continuar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                            className="absolute right-4 top-[42px] text-gray-400 hover:text-primary transition-colors p-1"
                        >
                            {showPassword ? '👁️‍🗨️' : '👁️'}
                        </button>
                    </div>

                    <div className="pt-6">
                        <Button 
                            type="submit" 
                            fullWidth 
                            isLoading={loading} 
                            className={`py-5 text-lg font-black tracking-widest uppercase transition-all duration-500 ${isAdminMode ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20' : 'shadow-orange-500/30'}`}
                        >
                            {isRegistering ? 'CREAR CUENTA' : 'ENTRAR AHORA'}
                        </Button>
                    </div>
                </form>

                {!isAdminMode && (
                    <div className="mt-10 text-center space-y-6">
                        <button 
                            onClick={loginAnonymously}
                            className="group flex items-center justify-center gap-2 mx-auto text-gray-400 hover:text-primary font-black text-xs uppercase tracking-[0.2em] transition-all"
                        >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
                            Ver menú como invitado
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>
                        </button>

                        <div className="relative pt-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-gray-300 font-bold uppercase tracking-widest">O</span></div>
                        </div>

                        <p className="text-sm text-gray-500 font-medium">
                            {isRegistering ? '¿Ya eres parte?' : '¿Eres nuevo aquí?'}
                            <button 
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="ml-2 font-black text-primary hover:text-orange-600 transition-colors underline-offset-4 hover:underline"
                            >
                                {isRegistering ? 'Inicia Sesión' : 'Crea tu Cuenta'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Estilo para la animación de vibración de error */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};
