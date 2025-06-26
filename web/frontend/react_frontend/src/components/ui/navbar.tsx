import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

interface NavButtonProps {
  onClick: () => void;
  className: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

interface AuthButtonsProps {
  onAuthClick: () => void;
}

interface LogoProps {
  onClick?: () => void;
}

function NavButton({ onClick, className, style, onMouseEnter, onMouseLeave, children }: NavButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className={className} 
      style={{...style, outline: 'none', border: 'none'}}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={(e) => (e.target as HTMLButtonElement).style.outline = 'none'}
    >
      {children}
    </button>
  );
}

function NavLogo({ onClick }: LogoProps) {
  return (
    <div>
      <NavButton 
        onClick={onClick || (() => {})}
        className="text-white font-semibold text-lg flex items-center gap-2 hover:text-orange-300 transition-colors"
        style={{color: '#E67923'}}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        Home
      </NavButton>
    </div>
  );
}

function AuthButtons({ onAuthClick }: AuthButtonsProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-white">Ciao, {user.username}!</span>
        <NavButton
          onClick={() => navigate('/profile')}
          className="text-white px-3 py-1.5 rounded transition-all focus:outline-none"
          style={{ backgroundColor: '#E67923', border: 'none', outline: 'none' }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = '#D16A1E';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = '#E67923';
          }}
        >
          Profilo
        </NavButton>
        <NavButton
          onClick={logout}
          className="text-white px-3 py-1.5 rounded transition-all focus:outline-none"
          style={{ backgroundColor: '#6B7280', border: 'none', outline: 'none' }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = '#4B5563';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = '#6B7280';
          }}
        >
          Logout
        </NavButton>
      </div>
    );
  }

  const buttons = [    
    { 
      text: 'Sign up', 
      className: 'text-white px-3 py-1.5 rounded transition-all focus:outline-none', 
      style: { backgroundColor: '#B20000', border: 'none', outline: 'none' },
      hoverStyle: { backgroundColor: '#D32F2F', border: 'none', outline: 'none' }
    }
  ];

  return (
    <div className="flex items-center">
      {buttons.map((button) => (
        <NavButton
          key={button.text}
          onClick={onAuthClick}
          className={button.className}
          style={button.style}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            Object.assign(target.style, button.hoverStyle);
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            const target = e.target as HTMLButtonElement;
            Object.assign(target.style, button.style);
          }}
        >
          {button.text}
        </NavButton>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleAuthClick = () => setIsAuthModalOpen(true);
  const handleCloseModal = () => setIsAuthModalOpen(false);
  const handleHomeClick = () => {
    console.log('Navigate to home');
  };  return (
    <>
      <nav className="py-3 px-4" style={{ backgroundColor: '#3B2E27' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <NavLogo onClick={handleHomeClick} />
          <AuthButtons onAuthClick={handleAuthClick} />
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );

		//da implementare la logica per il login e la registrazione e il cambio	di stato della nabvar(cambio icone/bottoni successive al	login)
}