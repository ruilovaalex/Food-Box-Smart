
import React, { useState, useEffect } from 'react';
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

  // Efecto visual para cambiar el título
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Buenos días');
    else if (hours < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isAdminMode) {
            const adminEmail = email.toLowerCase() === 'admin' ? 'admin@foodbox.com' : email;
            try {
                await login(adminEmail, password);
            } catch (loginErr: any) {
                if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/invalid-login-credentials') {
                    try {
                        await register("Administrador", adminEmail, password);
                        return;
                    } catch (regErr: any) {
                        if (regErr.code === 'auth/email-already-in-use') throw loginErr;
                        throw regErr;
                    }
                }
                throw loginErr;
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
        console.error(err);
        let msg = "Ocurrió un error.";
        if (err.code === 'auth/invalid-email') msg = "El correo no es válido.";
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') msg = "Credenciales incorrectas.";
        if (err.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
        if (err.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
        if (err.code === 'auth/weak-password') msg = "Contraseña muy débil.";
        if (err.code === 'auth/operation-not-allowed') msg = "Acceso invitado no habilitado.";
        setError(msg);
        setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
      setLoading(true);
      setError('');
      try {
          await loginAnonymously();
      } catch (err: any) {
          setError("Habilita el acceso anónimo en Firebase.");
          setLoading(false);
      }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 lg:p-8 relative overflow-hidden transition-colors duration-500 ${isAdminMode ? 'bg-slate-900' : 'bg-[#FFF9F5]'}`}>
      
      {/* --- BACKGROUND PATTERN (FOOD) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Aumentamos opacidad y cantidad de elementos */}
          <div className={`grid grid-cols-6 md:grid-cols-8 gap-8 md:gap-16 transform -rotate-12 scale-110 transition-opacity duration-500 ${isAdminMode ? 'opacity-[0.07]' : 'opacity-20 grayscale-[20%]'}`}>
              {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} className="text-4xl md:text-6xl animate-pulse" style={{ animationDuration: `${3 + Math.random() * 4}s` }}>
                      {['🍔', '🍕', '🍟', '🌭', '🌮', '🍦', '🍩', '🥤'][i % 8]}
                  </div>
              ))}
          </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 min-h-[600px] animate-fade-in border border-white/50">
        
        {/* LEFT SIDE: BRANDING (Naranja Sólido) */}
        {/* Mobile: Menos padding (p-8), Desktop: Más padding (p-14) */}
        <div className={`md:w-[45%] p-8 lg:p-14 flex flex-col items-center justify-center relative overflow-hidden text-center transition-colors duration-500 ${isAdminMode ? 'bg-slate-800' : 'bg-[#FF8A2B]'}`}>
             
             {/* Decorative Background Elements on Orange Card */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/10 to-transparent"></div>

             {/* 1. LOGO - Responsive Size */}
             {/* Mobile: w-32 (pequeño), Desktop: w-64/w-80 (grande) */}
             <div className="relative z-10 mb-4 md:mb-8 transform hover:scale-105 transition-transform duration-500 group cursor-pointer">
                <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img 
                    src="/images/logo.png" 
                    alt="Food Box Logo" 
                    className="w-32 h-32 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl relative z-10" 
                    onError={(e) => {e.currentTarget.style.display='none'}}
                />
             </div>
             
             {/* Textos - Ajustados para móvil */}
             <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">
                Food Box
             </h1>
             <p className="relative z-10 text-white/90 text-sm md:text-lg font-medium max-w-[200px] mx-auto leading-relaxed">
                {isAdminMode ? 'Panel de Administración' : 'Tu comida favorita, sin filas.'}
             </p>

             {/* 2. CALAVERA GIF - Responsive Position & Size */}
             <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 opacity-90 hover:opacity-100 transition-opacity animate-bounce-soft">
                <img 
                    src="/images/calavera.gif" 
                    alt="Fun" 
                    className="w-20 h-20 md:w-32 md:h-32 lg:w-44 lg:h-44 object-contain drop-shadow-lg mix-blend-screen"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                />
             </div>

             <div className="absolute bottom-4 left-6 text-[10px] text-white/50 font-bold uppercase tracking-widest hidden md:block">
                 v1.0 Smart Dining
             </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="md:w-[55%] p-6 md:p-8 lg:p-14 flex flex-col justify-center bg-white relative">
            
            {/* Mode Switcher */}
            <div className="absolute top-4 right-4 lg:top-10 lg:right-10 flex bg-gray-50 p-1 rounded-full border border-gray-100 z-30">
                <button 
                    onClick={() => { setIsAdminMode(false); setIsRegistering(false); setError(''); }}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${!isAdminMode ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Cliente
                </button>
                <button 
                    onClick={() => { setIsAdminMode(true); setIsRegistering(false); setError(''); }}
                    className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${isAdminMode ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Admin
                </button>
            </div>

            <div className="max-w-sm mx-auto w-full mt-8 md:mt-0">
                <div className="mb-6 md:mb-8">
                    <p className="text-primary font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        {greeting} <span className="text-xl">👋</span>
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black text-dark tracking-tight">
                        {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                        {isAdminMode ? 'Acceso restringido para personal.' : (isRegistering ? 'Regístrate para ordenar rápido.' : 'Bienvenido de nuevo.')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {isRegistering && !isAdminMode && (
                        <div className="animate-slide-up" style={{animationDelay: '0ms'}}>
                            <Input
                                label="Nombre Completo"
                                placeholder="Ej. Alex Ruilova"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-gray-50 border-gray-100 focus:bg-white focus:border-orange-200"
                            />
                        </div>
                    )}

                    <div className="animate-slide-up" style={{animationDelay: '100ms'}}>
                        <Input
                            label={isAdminMode ? "Usuario" : "Correo Electrónico"}
                            type={isAdminMode ? "text" : "email"}
                            placeholder={isAdminMode ? "admin" : "alex@ejemplo.com"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-gray-50 border-gray-100 focus:bg-white focus:border-orange-200"
                        />
                    </div>

                    <div className="animate-slide-up" style={{animationDelay: '200ms'}}>
                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                            className="bg-gray-50 border-gray-100 focus:bg-white focus:border-orange-200"
                        />
                    </div>

                    <div className="pt-2 animate-slide-up" style={{animationDelay: '300ms'}}>
                        <Button 
                            type="submit" 
                            fullWidth 
                            isLoading={loading} 
                            className={`py-3 md:py-4 text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${isAdminMode ? 'bg-slate-800 shadow-slate-900/20' : 'shadow-orange-500/30'}`}
                            variant={isAdminMode ? 'ghost' : 'primary'}
                            style={isAdminMode ? { backgroundColor: '#1e293b', color: 'white' } : {}}
                        >
                            {loading ? 'Procesando...' : (isRegistering ? 'Registrarse Gratis' : 'Ingresar ahora')}
                        </Button>
                    </div>
                </form>

                {!isAdminMode && (
                    <div className="mt-6 md:mt-8 animate-fade-in pb-4 md:pb-0">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="absolute inset-0 border-t border-gray-100"></div>
                            <span className="relative bg-white px-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest">O continúa como</span>
                        </div>

                        <Button 
                            type="button"
                            variant="secondary"
                            fullWidth
                            onClick={handleGuestLogin}
                            className="border-2 border-gray-100 bg-white hover:border-primary/30 hover:bg-orange-50 text-gray-500 hover:text-primary py-3"
                        >
                            👀 Ver menú como Invitado
                        </Button>

                        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                            {isRegistering ? '¿Ya tienes una cuenta?' : '¿Nuevo en Food Box?'}
                            <button 
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="ml-2 font-bold text-primary hover:text-orange-600 underline decoration-2 underline-offset-4 transition-colors"
                            >
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
