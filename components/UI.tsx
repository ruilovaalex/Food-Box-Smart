import React from 'react';

// --- Layout Wrapper ---
// Provides consistent background and padding structure
export const PageLayout: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-surface text-dark font-sans animate-fade-in ${className}`}>
    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-100/50 to-transparent -z-10" />
    {children}
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ type: 'hot' | 'cold' | string, className?: string }> = ({ type, className = '' }) => {
  const isHot = type === 'hot';
  const isCold = type === 'cold';
  
  let styles = "bg-gray-100 text-gray-600";
  let icon = "";

  if (isHot) {
    styles = "bg-orange-100 text-orange-600 border border-orange-200";
    icon = "🔥";
  } else if (isCold) {
    styles = "bg-teal-50 text-teal-600 border border-teal-200";
    icon = "❄️";
  } else {
    // Generic fallback
    styles = "bg-gray-100 text-gray-600";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles} ${className}`}>
      {icon && <span>{icon}</span>}
      {isHot ? 'Caliente' : isCold ? 'Frío' : type}
    </span>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth, 
  isLoading, 
  className = '', 
  icon,
  disabled,
  ...props 
}) => {
  const baseStyle = "relative flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 focus:ring-primary border border-transparent",
    secondary: "bg-white text-primary border border-orange-100 shadow-sm hover:bg-orange-50 focus:ring-orange-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 focus:ring-red-200",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-dark shadow-none",
    outline: "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-dark shadow-none"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className="w-5 h-5">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

// --- Input Field ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">{label}</label>}
    <input 
      className={`w-full px-4 py-3.5 rounded-2xl bg-white border ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-orange-100 focus:border-primary'} text-dark placeholder-gray-400 outline-none focus:ring-4 transition-all shadow-sm ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
  </div>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white/50 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-2xl hover:shadow-orange-500/10 transition-shadow duration-300' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Navbar (Glassmorphism) ---
export const Navbar: React.FC<{ title?: React.ReactNode; onBack?: () => void; rightAction?: React.ReactNode, transparent?: boolean }> = ({ title, onBack, rightAction, transparent }) => (
  <div className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-all duration-300 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm'}`}>
    <div className="flex items-center gap-3 flex-1">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors text-dark">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      <div className="font-bold text-lg text-dark tracking-tight truncate">{title || 'Food Box'}</div>
    </div>
    <div className="flex-none">{rightAction}</div>
  </div>
);

// --- Quantity Control ---
export const QuantityControl: React.FC<{ qty: number; onInc: () => void; onDec: () => void; small?: boolean }> = ({ qty, onInc, onDec, small }) => (
  <div className={`flex items-center gap-3 bg-gray-50 rounded-xl ${small ? 'p-1' : 'p-1.5'}`}>
    <button onClick={onDec} className={`${small ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center bg-white rounded-lg shadow-sm text-dark font-bold hover:bg-gray-100 active:scale-95 transition-transform`}>-</button>
    <span className={`${small ? 'w-4 text-sm' : 'w-6 text-base'} text-center font-bold text-dark`}>{qty}</span>
    <button onClick={onInc} className={`${small ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center bg-primary rounded-lg shadow-md shadow-orange-200 text-white font-bold hover:bg-orange-600 active:scale-95 transition-transform`}>+</button>
  </div>
);