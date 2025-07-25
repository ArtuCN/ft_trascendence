import React from 'react';
import { COLORS } from '../../components/ui/AuthModal';

interface StatsPageProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    goalsScored: number;
    tournamentsWon: number;
    rank: number;
  };
}

const StatsPage: React.FC<StatsPageProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col p-8 relative"
        style={{ backgroundColor: COLORS.dark }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 hover:opacity-70 transition-opacity focus:outline-none z-10"
          onClick={onClose} 
          style={{ color: COLORS.primary }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-6 mt-2 text-center pr-10" style={{ color: COLORS.primary }}>
          Player Statistics
        </h2>
        
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md space-y-4" style={{ color: COLORS.white }}>
            <div className="flex justify-between items-center py-2 border-b border-gray-600">
              <span className="text-sm font-medium">Matches Played:</span>
              <span className="text-sm font-semibold">{stats.matchesPlayed}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-600">
              <span className="text-sm font-medium">Matches Won:</span>
              <span className="text-sm font-semibold text-green-400">{stats.matchesWon}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-600">
              <span className="text-sm font-medium">Matches Lost:</span>
              <span className="text-sm font-semibold text-red-400">{stats.matchesLost}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-600">
              <span className="text-sm font-medium">Goals Scored:</span>
              <span className="text-sm font-semibold">{stats.goalsScored}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-600">
              <span className="text-sm font-medium">Tournaments Won:</span>
              <span className="text-sm font-semibold text-yellow-400">{stats.tournamentsWon}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Rank:</span>
              <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>{stats.rank || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;