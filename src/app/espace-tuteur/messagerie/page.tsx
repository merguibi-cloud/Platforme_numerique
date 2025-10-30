"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function MessagerieTuteur() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(1);
  const [message, setMessage] = useState('');

  const conversations = [
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
    }
  ];

  const messages = [
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
  ];

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
        <div className="bg-[#F8F5E4] border-2 border-black overflow-y-auto">
          <div className="p-4 border-b-2 border-black bg-[#032622]">
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
              CONVERSATIONS
            </h2>
          </div>
          <div>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedStudent(conv.id)}
                className={`w-full p-4 border-b border-black flex items-center space-x-3 hover:bg-gray-100 transition-colors ${
                  selectedStudent === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="relative">
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
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-[#032622]">{conv.studentName}</div>
                  <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
                </div>
                <div className="text-xs text-gray-500">{conv.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="lg:col-span-2 bg-[#F8F5E4] border-2 border-black flex flex-col">
          {selectedStudent ? (
            <>
              {/* En-tête */}
              <div className="p-4 border-b-2 border-black bg-[#032622]">
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  {conversations.find(c => c.id === selectedStudent)?.studentName}
                </h2>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 ${
                        msg.isMe
                          ? 'bg-[#032622] text-white'
                          : 'bg-white border border-black text-[#032622]'
                      }`}
                    >
                      <p className="text-sm mb-1">{msg.content}</p>
                      <p className="text-xs opacity-70">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t-2 border-black">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] focus:outline-none"
                  />
                  <button className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors">
                    ENVOYER
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

