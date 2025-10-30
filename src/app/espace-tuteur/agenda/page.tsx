"use client";
import { useState } from 'react';

export default function AgendaTuteur() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = [
    {
      id: 1,
      title: "Visio avec Jean Bobine",
      date: "15/10/2025",
      time: "09:00",
      type: "meeting",
      student: "Jean Bobine"
    },
    {
      id: 2,
      title: "Suivi Marie Durand",
      date: "16/10/2025",
      time: "14:00",
      type: "meeting",
      student: "Marie Durand"
    },
    {
      id: 3,
      title: "Point d'avancement Pierre Martin",
      date: "17/10/2025",
      time: "10:30",
      type: "meeting",
      student: "Pierre Martin"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <h1 
        className="text-4xl font-bold text-[#032622] mb-8"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        AGENDA
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des événements */}
        <div className="lg:col-span-2 space-y-4">
          <h2 
            className="text-2xl font-bold text-[#032622] mb-4"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            PROCHAINS RENDEZ-VOUS
          </h2>

          {events.map((event) => (
            <div key={event.id} className="bg-[#F8F5E4] border-2 border-black p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 
                    className="text-lg font-bold text-[#032622] mb-2"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {event.title}
                  </h3>
                  <p className="text-sm text-[#032622]">Étudiant : {event.student}</p>
                </div>
                <span className="bg-[#6B9A8E] text-white px-3 py-1 text-xs font-bold">
                  {event.type.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-[#032622]">
                  <span>📅 {event.date}</span>
                  <span>🕐 {event.time}</span>
                </div>
                <button className="bg-[#032622] text-white px-6 py-2 font-bold hover:bg-[#044a3a] transition-colors">
                  REJOINDRE
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Calendrier rapide */}
        <div className="bg-[#F8F5E4] border-2 border-black p-6">
          <h3 
            className="text-lg font-bold text-[#032622] mb-4"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            OCTOBRE 2025
          </h3>
          <div className="text-sm text-[#032622]">
            <p>Calendrier à venir...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

