
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

  // Rutas de archivos
  const logoUrl = '/images/logo.png';
  const gifUrl = '/images/calavera.gif';
  
  const [logoError, setLogoError] = useState(false);
  const [gifError, setGifError] = useState(false);

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
            const adminEmail = email.toLowerCase().includes('@') ? email.toLowerCase() : `${email.toLowerCase()}@foodbox.com`;
            await login(adminEmail, password);
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
        setError(msg);
        setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${isAdminMode ? 'bg-slate-950' : 'bg-[#FFF9F5]'}`}>
      
      {/* Fondo decorativo con comida */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] select-none">
          <div className="grid grid-cols-6 md:grid-cols-10 gap-10 transform -rotate-12 scale-125">
              {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="text-4xl">{['🍔', '🍕', '🍟', '🥤'][i % 4]}</div>
              ))}
          </div>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in border border-white/50">
        
        {/* LADO IZQUIERDO: Visual & Branding */}
        <div className={`md:w-[45%] p-10 lg:p-16 flex flex-col items-center justify-center relative overflow-hidden text-center transition-colors duration-500 ${isAdminMode ? 'bg-slate-900' : 'bg-primary'}`}>
             
             {/* Logo Principal */}
             <div className="relative z-10 mb-8 transform hover:scale-105 transition-transform duration-500">
                {!logoError ? (
                    <img 
                        src={logoUrl}
                        alt="Logo Food Box" 
                        className="w-40 h-40 md:w-64 md:h-64 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)]" 
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <div className="text-8xl">🍔</div>
                )}
             </div>
             
             <h1 className="relative z-10 text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter uppercase">Food Box Smart</h1>
             <p className="relative z-10 text-white/80 text-sm md:text-base font-bold tracking-widest uppercase">
                {isAdminMode ? 'Panel de Control IoT' : 'Pide. Retira. Disfruta.'}
             </p>

             {/* GIF Animado (Calavera) en la esquina */}
             {!gifError && (
                <div className="absolute bottom-6 right-6 z-20 animate-bounce-soft transition-opacity duration-500">
                    <img 
                        src={gifUrl}
                        alt="Calavera Animada" 
                        className="w-16 h-16 md:w-24 md:h-24 object-contain mix-blend-screen drop-shadow-lg"
                        onError={() => setGifError(true)}
                    />
                </div>
             )}
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="md:w-[55%] p-8 lg:p-16 flex flex-col justify-center bg-white relative">
            <div className="absolute top-6 right-8 flex bg-gray-50 p-1 rounded-full border border-gray-100 z-30">
                <button 
                    onClick={() => { setIsAdminMode(false); setError(''); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isAdminMode ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400'}`}
                >
                    Cliente
                </button>
                <button 
                    onClick={() => { setIsAdminMode(true); setError(''); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isAdminMode ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400'}`}
                >
                    Admin
                </button>
            </div>

            <div className="max-w-sm mx-auto w-full">
                <div className="mb-8">
                    <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">{greeting} 👋</p>
                    <h2 className="text-3xl font-black text-dark tracking-tight">
                        {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && !isAdminMode && (
                        <Input label="Tu Nombre" placeholder="Ej. Alex Ruilova" value={name} onChange={(e) => setName(e.target.value)} />
                    )}

                    <Input
                        label={isAdminMode ? "Usuario Administrador" : "Correo Electrónico"}
                        type={isAdminMode ? "text" : "email"}
                        placeholder={isAdminMode ? "admin" : "ejemplo@correo.com"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={error}
                    />

                    <div className="pt-4">
                        <Button 
                            type="submit" 
                            fullWidth 
                            isLoading={loading} 
                            className={`py-4 text-base shadow-xl ${isAdminMode ? '!bg-slate-800' : ''}`}
                        >
                            {isRegistering ? 'Registrarme' : 'Entrar ahora'}
                        </Button>
                    </div>
                </form>

                {!isAdminMode && (
                    <div className="mt-8 animate-fade-in text-center">
                        <button 
                            onClick={loginAnonymously}
                            className="text-gray-400 hover:text-primary font-bold text-sm transition-colors mb-6"
                        >
                            Ver menú como invitado 👀
                        </button>

                        <p className="text-sm text-gray-500 font-medium border-t pt-6">
                            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                            <button 
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="ml-2 font-black text-primary hover:underline"
                            >
                                {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
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
