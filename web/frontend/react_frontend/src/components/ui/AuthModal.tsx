import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
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

const TABS = [
  { id: 'login' as const, label: 'Log In' },
  { id: 'register' as const, label: 'Sign Up' }
];

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

function AuthForm({ type, onClose }: { type: 'login' | 'register'; onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { login, register, isLoading, error, successMessage, clearError, clearSuccessMessage } = useAuth();
  const isLogin = type === 'login';
  const buttonText = isLogin ? 'Log in' : 'Create Account';

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) {
      clearError();
    }
    if (successMessage) {
      clearSuccessMessage();
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isLogin && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.username, formData.password);
      }
      
      // Success - close modal
      onClose();
    } catch (err) {
      // Error handling is done in the context
      console.error('Auth error:', err);
    }
  };

  // Helper function to get field props
  const getFieldValue = (field: string) => formData[field as keyof typeof formData];
  const getFieldError = (field: string) => errors[field];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-4 px-8 pb-6 flex-1 min-h-[300px] items-center">
      {error && (
        <div className="w-full max-w-sm mb-4">
          <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="w-full max-w-sm mb-4">
          <p className="text-green-500 text-sm text-center bg-green-100 p-2 rounded">{successMessage}</p>
        </div>
      )}
      
      <div className="flex flex-col gap-6 flex-grow w-full max-w-sm">
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-white text-center mb-2 w-full">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email address..."
            value={getFieldValue('email')}
            onChange={handleInputChange('email')}
            className="w-4/5 px-4 py-3 border rounded-lg outline-none transition-all text-center text-black placeholder-gray-500"
            style={{ 
              backgroundColor: COLORS.inputBg, 
              borderColor: getFieldError('email') ? COLORS.error : COLORS.darkText,
              color: '#000000'
            }}
          />
          {getFieldError('email') && (
            <p className="text-red-500 text-sm mt-1 text-center">{getFieldError('email')}</p>
          )}
        </div>
        {!isLogin && (
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-white text-center mb-2 w-full">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username..."
              value={getFieldValue('username')}
              onChange={handleInputChange('username')}
              className={`w-4/5 px-4 py-3 border rounded-lg outline-none transition-all text-center text-black placeholder-gray-500 ${getFieldError('username') ? 'border-red-500' : 'border-gray-700'} bg-gray-100`}
            />
            {getFieldError('username') && (
              <p className="text-red-500 text-sm mt-1 text-center">{getFieldError('username')}</p>
            )}
          </div>
        )}
        <div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-white text-center mb-2 w-full">
            Password
          </label>
          <input
            type="password"
            placeholder={isLogin ? "Enter your password..." : "Create a password..."}
            value={getFieldValue('password')}
            onChange={handleInputChange('password')}
            className={`w-4/5 px-4 py-3 border rounded-lg outline-none transition-all text-center text-black placeholder-gray-500 ${getFieldError('password') ? 'border-red-500' : 'border-gray-700'} bg-gray-100`}
          />
          {getFieldError('password') && (
            <p className="text-red-500 text-sm mt-1 text-center">{getFieldError('password')}</p>
          )}
        </div>
        {!isLogin && (
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-white text-center mb-2 w-full">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password..."
              value={getFieldValue('confirmPassword')}
              onChange={handleInputChange('confirmPassword')}
              className={`w-4/5 px-4 py-3 border rounded-lg outline-none transition-all text-center text-black placeholder-gray-500 ${getFieldError('confirmPassword') ? 'border-red-500' : 'border-gray-700'} bg-gray-100`}
            />
            {getFieldError('confirmPassword') && (
              <p className="text-red-500 text-sm mt-1 text-center">{getFieldError('confirmPassword')}</p>
            )}
          </div>
        )}
        
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
            type="submit"
            disabled={isLoading}
            className="flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center focus:outline-none disabled:opacity-50" 
            style={{ 
              backgroundColor: isHovered ? COLORS.loginButtonHover : COLORS.loginButton,
              outline: 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isLoading ? 'Loading...' : buttonText}
          </button>
          <GoogleButton />
        </div>
      </div>
    </form>
  );
}

export default function AuthModal({ isOpen, onClose, showCloseButton = true }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={showCloseButton ? onClose : undefined}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 h-[500px] overflow-hidden flex flex-col" 
        style={{ backgroundColor: COLORS.dark }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pt-4 pb-4">
          {showCloseButton && (
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 hover:opacity-70 transition-opacity focus:outline-none" 
              style={{ color: COLORS.primary }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col">
          <AuthForm type={activeTab} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

export { COLORS };