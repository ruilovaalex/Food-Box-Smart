
import React from 'react';

// --- Layout Wrapper ---
export const PageLayout: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-[#F8F9FD] text-dark font-sans animate-fade-in ${className}`}>
    {children}
  </div>
);

// --- Badge ---
// Fixed: Added children to props and updated rendering logic to prefer children if provided.
export const Badge: React.FC<{ children?: React.ReactNode, type: 'hot' | 'cold' | string, className?: string }> = ({ children, type, className = '' }) => {
  const isHot = type === 'hot';
  const isCold = type === 'cold';
  
  let styles = "bg-gray-100 text-gray-600";
  let icon = "";

  if (isHot) {
    styles = "bg-orange-50 text-orange-600 border border-orange-100";
    icon = "🔥";
  } else if (isCold) {
    styles = "bg-teal-50 text-teal-600 border border-teal-100";
    icon = "❄️";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles} ${className}`}>
      {icon && <span>{icon}</span>}
      {children || (isHot ? 'Caliente' : isCold ? 'Frío' : type)}
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
  const baseStyle = "flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5",
    secondary: "bg-white text-primary border-2 border-primary/10 hover:border-primary hover:bg-orange-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-dark",
    outline: "bg-transparent border-2 border-gray-200 text-gray-500 hover:border-dark hover:text-dark"
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
          {icon && <span>{icon}</span>}
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
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', icon, ...props }) => (
  <div className="w-full group">
    {label && <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-primary transition-colors">{label}</label>}
    <div className="relative">
        <input 
        className={`w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white ${error ? 'border-red-300 focus:border-red-500 bg-red-50' : 'group-hover:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10'} text-dark placeholder-gray-400 outline-none transition-all duration-300 ${icon ? 'pl-12' : ''} ${className}`}
        {...props}
        />
        {icon && (
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-primary'}`}>
                {icon}
            </div>
        )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium animate-slide-up">⚠️ {error}</p>}
  </div>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Navbar ---
export const Navbar: React.FC<{ title?: React.ReactNode; onBack?: () => void; rightAction?: React.ReactNode, transparent?: boolean, className?: string }> = ({ title, onBack, rightAction, transparent, className = '' }) => (
  <div className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-all duration-300 ${transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm'} ${className}`}>
    <div className="flex items-center gap-3 flex-1">
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-dark hover:bg-gray-50 hover:shadow-md transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      <div className={`font-bold text-lg text-dark truncate transition-opacity duration-300 ${!transparent && !title ? 'opacity-0' : 'opacity-100'}`}>
        {title || 'Food Box'}
      </div>
    </div>
    <div className="flex-none">{rightAction}</div>
  </div>
);

// --- Quantity Control ---
export const QuantityControl: React.FC<{ qty: number; onInc: () => void; onDec: () => void; small?: boolean }> = ({ qty, onInc, onDec, small }) => (
  <div className={`flex items-center gap-3 ${small ? 'bg-gray-50 rounded-xl p-1' : ''}`}>
    <button 
        onClick={onDec} 
        className={`${small ? 'w-7 h-7' : 'w-10 h-10'} flex items-center justify-center rounded-xl bg-white border border-gray-200 text-dark font-bold hover:bg-gray-50 active:scale-90 transition-transform shadow-sm`}
    >
        -
    </button>
    <span className={`${small ? 'text-sm' : 'text-lg'} font-bold text-dark tabular-nums min-w-[1.5ch] text-center`}>
        {qty}
    </span>
    <button 
        onClick={onInc} 
        className={`${small ? 'w-7 h-7' : 'w-10 h-10'} flex items-center justify-center rounded-xl bg-primary text-white font-bold hover:bg-orange-600 active:scale-90 transition-transform shadow-md shadow-orange-500/20`}
    >
        +
    </button>
  </div>
);
