import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Il tuo Profilo</h1>
      
      {user && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Informazioni Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-lg">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-lg">{user.mail}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Statistiche Gioco</h3>
            <p className="text-gray-600">Le statistiche verranno implementate presto...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;