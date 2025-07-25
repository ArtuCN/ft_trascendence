import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../components/ui/AuthModal';

interface SocialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Friend {
  id: number;
  username: string;
  status: 'online' | 'offline';
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
}

const Social: React.FC<SocialProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [friends] = useState<Friend[]>([
    { id: 1, username: 'gesù', status: 'online' },
    {id : 2, username: 'mario', status: 'offline' },
  ]);

  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({
    1: [
      { id: 1, sender: 'Mario', content: 'dio merda?', timestamp: new Date() },
      { id: 2, sender: user?.username || 'Tu', content: 'ovvio', timestamp: new Date() },
    ],
    2: [
      { id: 3, sender: 'mario', content: 'come va?', timestamp: new Date() },
    ],
  });

  if (!isOpen || !isAuthenticated) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendMessage = () => {
    if (!selectedFriend || !newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      sender: user?.username || 'Tu',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [selectedFriend.id]: [...(prev[selectedFriend.id] || []), message],
    }));

    setNewMessage('');
  };

  const handleAddFriend = () => {
    alert('Aggiungi Amico');
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col p-8 relative h-3/4"
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
          Social
        </h2>
        
        <div className="flex-1 overflow-hidden" style={{ color: COLORS.white }}>
          <table className="w-full h-full border-separate border-spacing-4">
            <tbody>
              <tr className="h-full">
                <td className="w-1/3 align-top">
                  <div className="h-full flex flex-col">
                    <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.primary }}>
                      Amici
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                      {friends.map((friend) => (
                        <div
                          key={friend.id}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedFriend?.id === friend.id ? 'bg-opacity-30' : 'bg-opacity-10'
                          }`}
                          style={{ 
                            backgroundColor: selectedFriend?.id === friend.id 
                              ? COLORS.primary + '30' 
                              : 'rgba(255, 255, 255, 0.1)' 
                          }}
                          onClick={() => setSelectedFriend(friend)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{friend.username}</span>
                            <span 
                              className={`w-3 h-3 rounded-full ${
                                friend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="text-white px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity focus:outline-none w-full"
                      style={{ backgroundColor: COLORS.primary }}
                      onClick={handleAddFriend}
                    >
                      + Aggiungi Amico
                    </button>
                    <input type="text" className='bg-gray-800 text-white px-4 py-2 rounded text-sm w-full' placeholder='id amico' />
                  </div>
                </td>
                <td className="w-2/3 align-top">
                  <div className="h-full flex flex-col">
                    {selectedFriend ? (
                      <>
                        <div className="flex items-center mb-4">
                          <h3 className="text-lg font-bold" style={{ color: COLORS.primary }}>
                            Chat con {selectedFriend.username}
                          </h3>
                          <span 
                            className={`ml-3 w-3 h-3 rounded-full ${
                              selectedFriend.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-800 rounded p-4 mb-4 space-y-3">
                          {(messages[selectedFriend.id] || []).map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.sender === (user?.username || 'Tu') 
                                  ? 'justify-end' 
                                  : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-xs px-3 py-2 rounded text-sm ${
                                  message.sender === (user?.username || 'Tu')
                                    ? 'text-white'
                                    : 'bg-gray-600 text-white'
                                }`}
                                style={{
                                  backgroundColor: message.sender === (user?.username || 'Tu')
                                    ? COLORS.primary
                                    : undefined
                                }}
                              >
                                <div className="font-medium text-xs mb-1 opacity-70">
                                  {message.sender}
                                </div>
                                <div>{message.content}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 px-3 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="text-white px-4 py-2 rounded hover:opacity-90 transition-opacity focus:outline-none"
                            style={{ backgroundColor: COLORS.primary }}
                          >
                            Invia
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400 text-center">
                          Seleziona un amico per iniziare a chattare
                        </p>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Social;
