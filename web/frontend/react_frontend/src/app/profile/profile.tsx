import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../components/ui/AuthModal';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    goalsScored: number;
    tournamentsWon: number;
    rank: number;
  };
}

const Profile: React.FC<ProfileProps> = ({ isOpen, onClose, stats }) => {
  const { user, isAuthenticated } = useAuth();
  const defaultStats = {
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    goalsScored: 0,
    tournamentsWon: 0,
    rank: 0
  };

  const playerStats = stats || defaultStats;

  if (!isOpen || !isAuthenticated) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col p-8 relative"
        style={{ backgroundColor: COLORS.dark }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 hover:opacity-70 transition-opacity focus:outline-none"
          onClick={onClose} 
          style={{ color: COLORS.primary }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: COLORS.primary }}>
          Profilo:  {user?.username || 'Giocatore'}
        </h2>
        
        {user && (
          <div className="flex flex-col items-center" style={{ color: COLORS.white }}>
            <div className="w-full max-w-lg mb-8">
              <table className="w-full mb-4 border-separate border-spacing-10">
                <tbody>
                  <tr>
                    <td className="align-middle w-32">
                      <div 
                        className="w-20 h-20 rounded-lg flex items-center justify-center border-4 border-orange-500 bg-gray-700"
                        style={{ borderColor: COLORS.primary }}
                      >
                        <span className="text-white font-bold text-2xl">PG</span>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="space-y-5">
                        <div className="text-sm text-left">
                          <span><strong>Mail:</strong> {user.mail}</span>
                        </div>
                        <div className="text-sm text-left">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2"><strong>Wallet:</strong></span>
                            <button
                              className="text-white px-3 py-1 rounded text-sm hover:opacity-90 transition-opacity focus:outline-none"
                              style={{ backgroundColor: COLORS.primary }}
                              onClick={() => alert('Collega Wallet')}
                            >
                              Collega Wallet
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full max-w-lg mb-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>#{playerStats.rank || 1}</div>
                  <div className="text-sm">Posizione</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{((playerStats.matchesWon / Math.max(playerStats.matchesPlayed, 1)) * 100).toFixed(1)}%</div>
                  <div className="text-sm">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>{playerStats.tournamentsWon}</div>
                  <div className="text-sm">Tornei</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <div className="text-sm text-green-400 mb-2">🎯 Goal Fatti</div>
                  <div className="text-3xl font-bold mb-1">{playerStats.goalsScored}</div>
                  <div className="text-xs">Media: {(playerStats.goalsScored / Math.max(playerStats.matchesPlayed, 1)).toFixed(1)} per partita</div>
                </div>
                <div className="text-center p-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <div className="text-sm text-red-400 mb-2">🥅 Goal Ricevuti</div>
                  <div className="text-3xl font-bold mb-1">{Math.floor(playerStats.goalsScored * 0.7)}</div>
                  <div className="text-xs">Media: {(Math.floor(playerStats.goalsScored * 0.7) / Math.max(playerStats.matchesPlayed, 1)).toFixed(1)} per partita</div>
                </div>
                <div className="text-center p-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <div className="text-sm text-blue-400 mb-2">🎮 Partite Totali</div>
                  <div className="text-3xl font-bold mb-1">{playerStats.matchesPlayed}</div>
                  <div className="text-xs">Esperienza di gioco</div>
                </div>
                <div className="text-center p-4 rounded" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                  <div className="text-sm text-yellow-400 mb-2">🏆 Tornei Vinti</div>
                  <div className="text-3xl font-bold mb-1">{playerStats.tournamentsWon}</div>
                  <div className="text-xs">Campione</div>
                </div>
              </div>
            </div>
            <div className="w-full max-w-lg">
              <h3 className="text-lg font-bold mb-6" style={{ color: COLORS.primary }}>
                Risultati Partite
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">📈 Partite Vinte</span>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-400 mr-3">{playerStats.matchesWon}</span>
                    <span className="text-sm">{((playerStats.matchesWon / Math.max(playerStats.matchesPlayed, 1)) * 100).toFixed(1)}% win rate</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm">📉 Partite Perse</span>
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-400 mr-3">{playerStats.matchesLost}</span>
                    <span className="text-sm">{((playerStats.matchesLost / Math.max(playerStats.matchesPlayed, 1)) * 100).toFixed(1)}% loss rate</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-md font-bold mb-4" style={{ color: COLORS.primary }}>
                  Analisi Goal
                </h4>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-green-400 h-3 rounded-full" 
                    style={{ width: `${Math.min((playerStats.goalsScored / Math.max(playerStats.goalsScored + Math.floor(playerStats.goalsScored * 0.7), 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{playerStats.goalsScored}</div>
                    <div className="text-sm">Segnati</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{Math.floor(playerStats.goalsScored * 0.7)}</div>
                    <div className="text-sm">Subiti</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;