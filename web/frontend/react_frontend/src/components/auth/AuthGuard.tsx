import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../ui/AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen fixed inset-0 bg-cover bg-center bg-no-repeat bg-[url(/testAero.jpg)]">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url(/public/testAero.jpg)] opacity-20"></div>
        <div className="relative z-10 text-center pt-16 pb-8">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">
            <span className="text-green-500">ft_</span>
            <span className="text-purple-500">transcendence</span>
          </h1>
          <p className="text-white text-lg drop-shadow-md">
            Don't be like other players
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full -mt-32">
          <div className="w-full max-w-md mx-auto px-6">
            <AuthModal 
              isOpen={true} 
              onClose={() => {}}
              showCloseButton={false} 
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
