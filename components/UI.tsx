import React from 'react';

// --- Layout Wrapper ---
export const PageLayout: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen bg-gray-50 text-dark font-sans animate-fade-in ${className}`}>
    {children}
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ type: 'hot' | 'cold' | string, className?: string }> = ({ type, className = '' }) => {
  const isHot = type === 'hot';
  const isCold = type === 'cold';
  
  let styles = "bg-gray-100 text-gray-600 border-gray-200";
  let icon = "";

  if (isHot) {
    styles = "bg-orange-100 text-orange-700 border-orange-200";
    icon = "🔥";
  } else if (isCold) {
    styles = "bg-teal-100 text-teal-700 border-teal-200";
    icon = "❄️";
  } else {
    styles = "bg-gray-100 text-gray-600";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${styles} ${className}`}>
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
  const baseStyle = "flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-orange-600 shadow-md shadow-orange-500/20",
    secondary: "bg-white text-primary border border-primary hover:bg-orange-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
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
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">{label}</label>}
    <div className="relative">
        <input 
        className={`w-full px-4 py-3 rounded-xl bg-white border-2 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-100 focus:border-primary focus:ring-orange-100'} text-dark placeholder-gray-400 outline-none transition-all ${icon ? 'pl-11' : ''} ${className}`}
        {...props}
        />
        {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </div>
        )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{error}</p>}
  </div>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Navbar ---
export const Navbar: React.FC<{ title?: React.ReactNode; onBack?: () => void; rightAction?: React.ReactNode, transparent?: boolean }> = ({ title, onBack, rightAction, transparent }) => (
  <div className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-colors duration-300 ${transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm'}`}>
    <div className="flex items-center gap-3 flex-1">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-dark transition-colors">
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
  <div className={`flex items-center gap-3 ${small ? 'bg-gray-50 rounded-lg p-1' : ''}`}>
    <button 
        onClick={onDec} 
        className={`${small ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg bg-white border border-gray-200 text-dark font-bold hover:bg-gray-50 active:scale-90 transition-transform shadow-sm`}
    >
        -
    </button>
    <span className={`${small ? 'text-sm' : 'text-base'} font-bold text-dark tabular-nums`}>
        {qty}
    </span>
    <button 
        onClick={onInc} 
        className={`${small ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg bg-primary text-white font-bold hover:bg-orange-600 active:scale-90 transition-transform shadow-sm`}
    >
        +
    </button>
  </div>
);