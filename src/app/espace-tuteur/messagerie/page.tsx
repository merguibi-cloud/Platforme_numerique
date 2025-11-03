"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Send, Search, Paperclip } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
}

interface Conversation {
  id: number;
  studentName: string;
  lastMessage: string;
  time: string;
  unread: number;
  image: string;
}

export default function MessagerieTuteur() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(1);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations: Conversation[] = [
    {
      id: 1,
      studentName: "Jean Bobine",
      lastMessage: "Merci pour votre retour !",
      time: "14:32",
      unread: 0,
      image: "/images/student-library/IMG_1719 2.PNG"
    },
    {
      id: 2,
      studentName: "Marie Durand",
      lastMessage: "J'ai une question sur le bloc 2",
      time: "10:15",
      unread: 2,
      image: "/images/student-library/IMG_1719 2.PNG"
    },
    {
      id: 3,
      studentName: "Pierre Martin",
      lastMessage: "Quand est notre prochain RDV ?",
      time: "Hier",
      unread: 1,
      image: "/images/student-library/IMG_1719 2.PNG"
    },
    {
      id: 4,
      studentName: "Sophie Dubois",
      lastMessage: "J'ai terminé l'exercice",
      time: "09:30",
      unread: 0,
      image: "/images/student-library/IMG_1719 2.PNG"
    },
    {
      id: 5,
      studentName: "Lucas Moreau",
      lastMessage: "Pouvez-vous revoir mon projet ?",
      time: "08:45",
      unread: 3,
      image: "/images/student-library/IMG_1719 2.PNG"
    }
  ];

  const messagesData: { [key: number]: Message[] } = {
    1: [
      {
        id: 1,
        sender: "Jean Bobine",
        content: "Bonjour, j'ai terminé le bloc 1 !",
        time: "14:20",
        isMe: false
      },
      {
        id: 2,
        sender: "Moi",
        content: "Excellent travail ! Continuez comme ça.",
        time: "14:25",
        isMe: true
      },
      {
        id: 3,
        sender: "Jean Bobine",
        content: "Merci pour votre retour !",
        time: "14:32",
        isMe: false
      }
    ],
    2: [
      {
        id: 1,
        sender: "Marie Durand",
        content: "Bonjour, j'ai une question sur le bloc 2",
        time: "10:10",
        isMe: false
      },
      {
        id: 2,
        sender: "Marie Durand",
        content: "Pouvez-vous m'aider avec les exercices ?",
        time: "10:15",
        isMe: false
      }
    ],
    3: [
      {
        id: 1,
        sender: "Pierre Martin",
        content: "Bonjour, quand est notre prochain RDV ?",
        time: "Hier 16:00",
        isMe: false
      }
    ],
    4: [
      {
        id: 1,
        sender: "Sophie Dubois",
        content: "Bonjour, j'ai terminé l'exercice",
        time: "09:30",
        isMe: false
      }
    ],
    5: [
      {
        id: 1,
        sender: "Lucas Moreau",
        content: "Bonjour, pouvez-vous revoir mon projet ?",
        time: "08:40",
        isMe: false
      },
      {
        id: 2,
        sender: "Lucas Moreau",
        content: "J'aimerais avoir votre avis avant la soumission",
        time: "08:42",
        isMe: false
      },
      {
        id: 3,
        sender: "Lucas Moreau",
        content: "Merci d'avance",
        time: "08:45",
        isMe: false
      }
    ]
  };

  const [messages, setMessages] = useState<Message[]>(messagesData[1] || []);

  useEffect(() => {
    if (selectedStudent) {
      setMessages(messagesData[selectedStudent] || []);
    }
  }, [selectedStudent]);

  const handleSendMessage = () => {
    if (message.trim() && selectedStudent) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "Moi",
        content: message,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedStudent);

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <h1 
        className="text-4xl font-bold text-[#032622] mb-8"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        MESSAGERIE
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Liste des conversations */}
        <div className="bg-[#F8F5E4] border-2 border-[#032622] flex flex-col">
          {/* En-tête avec recherche */}
          <div className="p-4 border-b-2 border-[#032622] bg-[#032622]">
            <h2 
              className="text-lg font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              CONVERSATIONS
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un étudiant..."
                className="w-full pl-10 pr-4 py-2 bg-white text-[#032622] border-2 border-gray-300 focus:outline-none focus:border-[#6B9A8E]"
              />
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedStudent(conv.id)}
                  className={`w-full p-4 border-b border-[#032622] flex items-center space-x-3 transition-colors ${
                    selectedStudent === conv.id 
                      ? 'bg-[#6B9A8E] text-white' 
                      : 'bg-[#F8F5E4] hover:bg-gray-100 text-[#032622]'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#032622]">
                      <Image
                        src={conv.image}
                        alt={conv.studentName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {conv.unread > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div 
                      className={`font-bold truncate ${
                        selectedStudent === conv.id ? 'text-white' : 'text-[#032622]'
                      }`}
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {conv.studentName}
                    </div>
                    <div 
                      className={`text-sm truncate ${
                        selectedStudent === conv.id ? 'text-white/80' : 'text-gray-600'
                      }`}
                    >
                      {conv.lastMessage}
                    </div>
                  </div>
                  <div 
                    className={`text-xs ${
                      selectedStudent === conv.id ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {conv.time}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Aucune conversation trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="lg:col-span-2 bg-[#F8F5E4] border-2 border-[#032622] flex flex-col">
          {selectedStudent && selectedConversation ? (
            <>
              {/* En-tête de la conversation */}
              <div className="p-4 border-b-2 border-[#032622] bg-[#032622]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                    <Image
                      src={selectedConversation.image}
                      alt={selectedConversation.studentName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 
                      className="text-lg font-bold text-white"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {selectedConversation.studentName}
                    </h2>
                    <p className="text-xs text-white/70">En ligne</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F8F5E4]">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 ${
                          msg.isMe
                            ? 'bg-[#032622] text-white'
                            : 'bg-white border-2 border-[#032622] text-[#032622]'
                        }`}
                      >
                        {!msg.isMe && (
                          <div 
                            className="text-xs font-bold mb-1 opacity-70"
                            style={{ fontFamily: 'var(--font-termina-bold)' }}
                          >
                            {msg.sender}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.isMe ? 'text-white/70' : 'text-[#032622]/70'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Aucun message</p>
                  </div>
                )}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t-2 border-[#032622] bg-white">
                <div className="flex items-end space-x-2">
                  <button className="p-2 text-[#032622] hover:bg-gray-100 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Écrivez votre message..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#6B9A8E] resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    <Send className="w-5 h-5" />
                    <span>ENVOYER</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">Sélectionnez une conversation</p>
                <p className="text-sm">Choisissez un étudiant pour commencer à discuter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
