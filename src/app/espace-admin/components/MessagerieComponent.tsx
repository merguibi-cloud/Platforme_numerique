'use client';

import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  avatar: string;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Étudiant - Marie Dubois',
    lastMessage: 'Bonjour, j\'ai un problème avec mon compte',
    timestamp: new Date('2024-01-15T10:30:00'),
    unreadCount: 2,
    avatar: '👩‍🎓'
  },
  {
    id: '2',
    name: 'Professeur Martin',
    lastMessage: 'Demande d\'ajout de cours',
    timestamp: new Date('2024-01-15T09:15:00'),
    unreadCount: 0,
    avatar: '👨‍🏫'
  },
  {
    id: '3',
    name: 'Support Technique',
    lastMessage: 'Rapport de maintenance terminé',
    timestamp: new Date('2024-01-14T16:45:00'),
    unreadCount: 1,
    avatar: '🛠️'
  },
  {
    id: '4',
    name: 'Étudiant - Thomas Leroy',
    lastMessage: 'Question sur les frais de scolarité',
    timestamp: new Date('2024-01-14T14:20:00'),
    unreadCount: 0,
    avatar: '👨‍🎓'
  }
];

const mockMessages: { [conversationId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      content: 'Bonjour, j\'ai un problème avec mon compte étudiant',
      sender: 'other',
      timestamp: new Date('2024-01-15T10:00:00'),
      isRead: true
    },
    {
      id: '2',
      content: 'Bonjour Marie, pouvez-vous me décrire le problème ?',
      sender: 'user',
      timestamp: new Date('2024-01-15T10:05:00'),
      isRead: true
    },
    {
      id: '3',
      content: 'Je n\'arrive pas à me connecter à la plateforme',
      sender: 'other',
      timestamp: new Date('2024-01-15T10:10:00'),
      isRead: true
    },
    {
      id: '4',
      content: 'Je vais vérifier votre compte et vous recontacter',
      sender: 'user',
      timestamp: new Date('2024-01-15T10:15:00'),
      isRead: false
    }
  ]
};

export default function MessagerieComponent() {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = mockMessages[selectedConversation] || [];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Ici, vous pourriez ajouter la logique pour envoyer le message
      console.log('Envoi du message:', newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-[#F8F5E4] border border-black">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r border-black flex flex-col">
        {/* En-tête avec recherche */}
        <div className="p-4 border-b border-black bg-[#F8F5E4]">
          <h2 className="text-lg font-semibold text-[#032622] mb-3">Conversations</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-black rounded bg-[#F8F5E4] text-[#032622] placeholder-gray-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-[#F8F5E4]/50 ${
                selectedConversation === conversation.id ? 'bg-[#F8F5E4]' : 'bg-[#F8F5E4]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[#032622] truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="bg-[#F8F5E4] text-[#032622] border border-[#032622] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {/* En-tête de la conversation */}
        <div className="p-4 border-b border-black bg-[#F8F5E4]">
          {(() => {
            const conversation = mockConversations.find(c => c.id === selectedConversation);
            return conversation ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                  {conversation.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#032622]">
                    {conversation.name}
                  </h3>
                  <p className="text-sm text-gray-600">En ligne</p>
                </div>
              </div>
            ) : null;
          })()}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#F8F5E4] text-[#032622] border border-[#032622]'
                    : 'bg-gray-200 text-[#032622]'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Zone de saisie */}
        <div className="p-4 border-t border-black bg-[#F8F5E4]">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tapez votre message..."
              className="flex-1 p-3 border border-black rounded bg-[#F8F5E4] text-[#032622] placeholder-gray-500"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-[#F8F5E4] text-[#032622] border border-[#032622] rounded hover:bg-[#eae5cf] transition-colors"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
