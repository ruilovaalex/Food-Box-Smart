
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

export const Login: React.FC = () => {
  const { login, register, loginAnonymously } = useAuth();
  
  // Estados de Modo
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Campos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Solo para registro cliente
  
  // UI States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isAdminMode) {
            // LÓGICA ESPECIAL ADMIN:
            const adminEmail = email.toLowerCase() === 'admin' ? 'admin@foodbox.com' : email;
            
            try {
                // 1. Intentamos iniciar sesión
                await login(adminEmail, password);
            } catch (loginErr: any) {
                // 2. Si falla porque el usuario NO EXISTE, lo creamos automáticamente (Solo la primera vez)
                // Firebase devuelve 'auth/user-not-found' o 'auth/invalid-credential' (dependiendo de la versión)
                if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/invalid-login-credentials') {
                    try {
                        console.log("Admin no encontrado. Intentando registrar automáticamente...");
                        await register("Administrador", adminEmail, password);
                        return; // Registro exitoso, el AuthContext manejará la redirección
                    } catch (regErr: any) {
                        // Si falla el registro porque ya existe (ej: contraseña incorrecta en el login original),
                        // lanzamos el error original de login
                        if (regErr.code === 'auth/email-already-in-use') {
                            throw loginErr;
                        }
                        throw regErr;
                    }
                }
                throw loginErr; // Si es otro error (ej. red), lo lanzamos
            }

        } else {
            // LÓGICA CLIENTE NORMAL
            if (isRegistering) {
                if (!name.trim()) throw new Error("El nombre es obligatorio.");
                await register(name, email, password);
            } else {
                await login(email, password);
            }
        }
        // El redireccionamiento es automático gracias a onAuthStateChanged en App.tsx
    } catch (err: any) {
        console.error(err);
        let msg = "Ocurrió un error.";
        if (err.code === 'auth/invalid-email') msg = "El correo no es válido.";
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') msg = isAdminMode ? "Contraseña incorrecta o error de credenciales." : "Usuario no encontrado o contraseña incorrecta.";
        if (err.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
        if (err.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
        if (err.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
        if (err.code === 'auth/operation-not-allowed') msg = "El acceso como invitado no está habilitado en Firebase.";
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
          console.error(err);
          let msg = "Error al entrar como invitado.";
          if (err.code === 'auth/operation-not-allowed') msg = "Debes habilitar 'Anónimo' en Firebase Authentication.";
          setError(msg);
          setLoading(false);
      }
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden font-sans text-dark">
      
      {/* SECCIÓN IZQUIERDA (PC) - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 relative items-center justify-center text-white overflow-hidden transition-colors duration-500 ${isAdminMode ? 'bg-dark' : 'bg-gradient-to-br from-primary to-orange-600'}`}>
         
         {/* Elementos decorativos */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
         {!isAdminMode && (
             <>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
             </>
         )}

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
                Food Box <span className={isAdminMode ? "text-primary" : "text-yellow-300"}>Smart</span>
            </h1>
            <p className={`text-xl font-medium leading-relaxed ${isAdminMode ? "text-gray-400" : "text-orange-100"}`}>
                {isAdminMode ? 'Panel de Control Administrativo' : 'Automatización inteligente para comedores.'}
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

            {/* Selector de Modo (Arriba a la derecha) */}
            <div className="absolute top-4 right-4">
                <button 
                    onClick={() => {
                        setIsAdminMode(!isAdminMode);
                        setIsRegistering(false); // Resetear registro al cambiar modo
                        setError('');
                        setEmail('');
                        setPassword('');
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                        isAdminMode 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                >
                    {isAdminMode ? '👤 Volver a Cliente' : '🔒 Soy Admin'}
                </button>
            </div>

            {/* Cabecera del Formulario */}
            <div className="mb-6 mt-4">
                <h3 className="text-3xl font-bold text-dark mb-2">
                    {isAdminMode ? 'Acceso Admin' : (isRegistering ? 'Crear Cuenta' : 'Bienvenido')}
                </h3>
                <p className="text-gray-400">
                    {isAdminMode 
                        ? 'Ingresa tus credenciales de administrador.'
                        : (isRegistering ? 'Llena tus datos para comenzar.' : 'Ingresa para ordenar tu comida.')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Nombre (Solo Registro Cliente) */}
                {isRegistering && !isAdminMode && (
                    <div className="animate-fade-in">
                        <Input
                            label="Nombre Completo"
                            type="text"
                            placeholder="Ej. Juan Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="!bg-gray-50 !border-gray-100 focus:!bg-white"
                            icon={<span className="text-gray-400">👤</span>}
                        />
                    </div>
                )}

                {/* Usuario / Email */}
                <Input
                    label={isAdminMode ? "Usuario" : "Correo Electrónico"}
                    type={isAdminMode ? "text" : "email"}
                    placeholder={isAdminMode ? "admin" : "tucorreo@ejemplo.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="!bg-gray-50 !border-gray-100 focus:!bg-white"
                    icon={<span className="text-gray-400">{isAdminMode ? '🛡️' : '📧'}</span>}
                />

                {/* Password */}
                <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={error}
                    className="!bg-gray-50 !border-gray-100 focus:!bg-white"
                    icon={<span className="text-gray-400">🔒</span>}
                />

                <Button 
                    type="submit" 
                    fullWidth 
                    isLoading={loading} 
                    className={`text-lg py-4 shadow-xl transition-transform hover:scale-[1.02] ${
                        isAdminMode ? 'bg-dark shadow-gray-900/20 hover:bg-black' : 'shadow-orange-500/30'
                    }`}
                >
                    {loading ? 'Procesando...' : isAdminMode ? 'Entrar como Admin' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
                </Button>
            </form>

            {/* Opciones Adicionales Cliente */}
            {!isAdminMode && (
                <>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">O también</span></div>
                    </div>

                    <Button 
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={handleGuestLogin}
                        className="py-3 border-dashed border-2 text-gray-500 hover:text-primary hover:border-primary hover:bg-orange-50"
                    >
                        👀 Ver menú sin registrarse
                    </Button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400 mb-2">
                            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
                        </p>
                        <button 
                            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                            className="text-primary font-bold hover:text-orange-600 transition-colors text-sm"
                        >
                            {isRegistering ? 'Iniciar Sesión' : 'Crear Cuenta Nueva'}
                        </button>
                    </div>
                </>
            )}
         </div>
      </div>
    </div>
  );
};
