import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormFieldProps {
  label: string;
  type: string;
  placeholder: string;
}

const COLORS = {
  primary: '#E67923',
  error: '#DC2626',
  errorHover: '#D32F2F',
  dark: '#2A2A2A',
  darkText: '#3C3C3C',
  loginButton: '#B20000',
  loginButtonHover: '#D32F2F',
  inputBg: '#f9fafb',
  white: '#ffffff',
  lightGray: '#f5f5f5'
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FORM_FIELDS = {
  login: [
    { label: 'Email Address', type: 'email', placeholder: 'Enter your email address...' },
    { label: 'Password', type: 'password', placeholder: 'Enter your password...' }
  ],
  register: [
    { label: 'Username', type: 'text', placeholder: 'Enter your username...' },
    { label: 'Email Address', type: 'email', placeholder: 'Enter your email address...' },
    { label: 'Password', type: 'password', placeholder: 'Create a password...' },
    { label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password...' }
  ]
} as const;

const TABS = [
  { id: 'login' as const, label: 'Log In' },
  { id: 'register' as const, label: 'Sign Up' }
];

function FormField({ label, type, placeholder }: FormFieldProps) {
  const [isEmailValid, setIsEmailValid] = useState(true);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'email') {
      const isValid = EMAIL_REGEX.test(e.target.value) || e.target.value === '';
      setIsEmailValid(isValid);
    }
  };

  const borderColor = type === 'email' && !isEmailValid ? COLORS.error : COLORS.darkText;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = type === 'email' && !isEmailValid ? COLORS.error : COLORS.primary;
    e.target.style.outline = 'none';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = borderColor;
  };

  return (
    <div className="flex flex-col items-center">
      <label className="block text-sm font-medium text-white text-center mb-2 w-full">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-4/5 px-4 py-3 border rounded-lg outline-none transition-all text-center text-black placeholder-gray-500"
        style={{ 
          backgroundColor: COLORS.inputBg, 
          borderColor,
          color: '#000000'
        }}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
}

function AuthTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: 'login' | 'register') => void }) {
  return (
    <div className="px-6 mt-4">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="pb-3 px-1 text-lg font-semibold border-b-2 transition-all mr-8 focus:outline-none hover:opacity-70"
          style={{
            color: activeTab === tab.id ? COLORS.primary : COLORS.darkText,
            borderBottomColor: activeTab === tab.id ? COLORS.primary : 'transparent',
            outline: 'none'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function GoogleButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button 
      className="flex items-center justify-center px-4 py-3 border rounded-lg font-semibold cursor-pointer h-12 whitespace-nowrap transition-all focus:outline-none text-black" 
      style={{ 
        backgroundColor: isHovered ? COLORS.lightGray : COLORS.white,
        borderColor: COLORS.darkText,
        outline: 'none',
        color: '#000000'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </button>
  );
}

function AuthForm({ type }: { type: 'login' | 'register' }) {
  const [isHovered, setIsHovered] = useState(false);
  const isLogin = type === 'login';
  const fields = FORM_FIELDS[type];
  const buttonText = isLogin ? 'Log in' : 'Create Account';

  return (
    <div className="flex flex-col gap-5 pt-4 px-8 pb-6 flex-1 min-h-[300px] items-center">
      <div className="flex flex-col gap-6 flex-grow w-full max-w-sm">
        {fields.map((field, index) => (
          <FormField key={`${type}-${index}`} {...field} />
        ))}
        {isLogin && <div className="h-16" />}
      </div>

      <div className="relative my-6 w-full max-w-sm">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: COLORS.darkText }} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-white" style={{ backgroundColor: COLORS.dark }}>or</span>
        </div>
      </div>
      
      <div className="mt-auto w-full max-w-sm">
        <div className="flex gap-3 mb-4 h-12">
          <button 
            className="flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center focus:outline-none" 
            style={{ 
              backgroundColor: isHovered ? COLORS.loginButtonHover : COLORS.loginButton,
              outline: 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {buttonText}
          </button>
          <GoogleButton />
        </div>
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 h-[500px] overflow-hidden flex flex-col" 
        style={{ backgroundColor: COLORS.dark }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pt-4 pb-4">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 hover:opacity-70 transition-opacity focus:outline-none" 
            style={{ color: COLORS.primary }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <AuthForm type={activeTab} />
        </div>
      </div>
    </div>
  );
}