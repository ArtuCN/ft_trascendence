import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Profile from '../../app/profile/profile';
import Social from '../../app/social/Social';

interface NavButtonProps {
  onClick: () => void;
  className: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
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
    <div className="mb-8">
      <NavButton 
        onClick={onClick || (() => {})}
        className="text-white font-semibold text-lg flex flex-col items-center gap-2 hover:text-orange-300 transition-colors w-full p-4"
        style={{color: '#E67923'}}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className="text-sm">Home</span>
      </NavButton>
    </div>
  );
}

function AuthButtons() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSocialOpen, setSocialOpen] = useState(false);

  // Only show user info and logout when authenticated
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="text-white text-center text-sm mb-4 px-2">
        Ciao, {user?.username}!
      </div>
      <NavButton
        onClick={() => setProfileOpen(true)}
        className="text-white px-3 py-2 rounded transition-all focus:outline-none w-full text-center"
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
        onClick={() => navigate('/play')}
        className="text-white px-3 py-2 rounded-md transition-all w-full text-center bg-orange-500 hover:bg-orange-600 focus:outline-none"
      >
        Play
      </NavButton>
      <NavButton
        onClick={() => setSocialOpen(true)}
        className="text-white px-3 py-2 rounded-md transition-all w-full text-center bg-orange-500 hover:bg-orange-600 focus:outline-none"
      >
        Social
      </NavButton>
      <NavButton
        onClick={logout}
        className="text-white px-3 py-2 rounded transition-all focus:outline-none w-full text-center"
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
      <Profile
        isOpen={isProfileOpen}
        onClose={() => setProfileOpen(false)}
        stats={{
          matchesPlayed: 10,
          matchesWon: 5,
          matchesLost: 5,
          goalsScored: 20,
          tournamentsWon: 2,
          rank: 1
        }}
      />
      <Social
        isOpen={isSocialOpen}
        onClose={() => setSocialOpen(false)}
      />
    </div>
  );
}export default function Navbar() {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <>
      <nav 
        className="fixed left-0 top-0 h-full w-44 py-6 px-4 flex flex-col shadow-lg z-50" 
        style={{ backgroundColor: '#3B2E27' }}
      >
        <NavLogo onClick={handleHomeClick} />
        <div className="flex-1 flex flex-col justify-center">
          <AuthButtons />
        </div>
      </nav>
    </>
  );

  //da implementare la logica per il login e la registrazione e il cambio di stato della navbar(cambio icone/bottoni successive al login)
}