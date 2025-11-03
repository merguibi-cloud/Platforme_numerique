"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function TutorDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('SEPTEMBRE 2025');
  
  // Données de l'étudiant
  const studentData = {
    name: "CHADI EL ASSOWAD",
    lastConnection: "24/09/2025 À 14H32",
    totalTime: "5H",
    competenceBlocks: { current: 2, total: 19 },
    quizPosted: 12,
    responsabilityProgress: 10,
    memberSince: "LE 02/10/2025",
    lastConnectionInfo: "LE 02/10/2025 À 16:52",
    totalPlatformTime: "12H",
    profileImage: "/images/student-library/IMG_1719 2.PNG"
  };

  // Données des notes
  const notes = [
    { bloc: "MODULE 1", note: "19,5", subject: "14", duration: "20H" },
    { bloc: "MODULE 2", note: "-", subject: "11", duration: "13H" },
    { bloc: "MODULE 3", note: "-", subject: "17", duration: "OH" },
    { bloc: "MODULE 4", note: "-", subject: "12", duration: "OH" },
    { bloc: "MODULE 5", note: "-", subject: "14", duration: "OH" }
  ];

  // Données temps de connexion (barres du graphique)
  const connectionData = [
    { day: 'L', height: 60 },
    { day: 'M', height: 50 },
    { day: 'M', height: 70 },
    { day: 'J', height: 80 },
    { day: 'V', height: 85 },
    { day: 'S', height: 65 },
    { day: 'D', height: 40 }
  ];

  // Calendrier pour septembre 2025
  const calendarDays = [
    [30, 31, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 1, 2, 3]
  ];

  const specialDays = [2, 3, 9, 10, 16, 17, 23, 24, 30, 1]; // Jours avec événements

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      {/* En-tête avec nom de l'utilisateur tuteur */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span 
            className="inline-block bg-[#6B9A8E] text-white px-4 py-1 text-xs font-bold mb-3"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            ÉTUDIANT
          </span>
          <h1 
            className="text-4xl font-bold text-[#032622]"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {studentData.name}
          </h1>
          <p className="text-sm text-[#032622] mt-2">
            DERNIÈRE CONNEXION À LA FORMATION : {studentData.lastConnection}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-[#032622] hover:bg-gray-100 rounded-full relative">
            <Image 
              src="/menue_etudiant/nonselectionner/Clocheverte.png" 
              alt="Notifications" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-[#032622] flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-[#032622] font-medium">Ymir Fritz</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Statistiques et graphiques */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte principale avec statistiques */}
          <div className="bg-[#F8F5E4] border border-black">
            {/* En-tête avec responsabilité */}
            <div className="flex justify-between items-center p-6 border-b border-black">
              <h3 
                className="text-base font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS
              </h3>
              <span className="text-2xl font-bold text-[#032622]">{studentData.responsabilityProgress}%</span>
            </div>
            
            {/* Statistiques principales */}
            <div className="grid grid-cols-3 p-6 border-b border-black">
              <div className="text-center border-r border-black">
                <div className="text-5xl font-bold text-[#032622] mb-2">{studentData.totalTime}</div>
                <div className="text-sm text-[#032622]">Temps total</div>
              </div>
              <div className="text-center border-r border-black">
                <div className="text-5xl font-bold text-[#032622] mb-2">
                  {studentData.competenceBlocks.current}/{studentData.competenceBlocks.total}
                </div>
                <div className="text-sm text-[#032622]">Blocs de compétences</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#032622] mb-2">{studentData.quizPosted}</div>
                <div className="text-sm text-[#032622]">Quiz postés</div>
              </div>
            </div>

            {/* Section avec notes et graphique */}
            <div className="grid grid-cols-2">
              {/* Dernières notes */}
              <div className="border-r border-black">
                <div className="p-4 bg-[#032622] border-b border-black">
                  <h4 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    DERNIÈRES NOTES
                  </h4>
                </div>
                <div>
                  {notes.map((note, index) => (
                    <div 
                      key={index} 
                      className={`grid grid-cols-4 text-center py-2 ${index < notes.length - 1 ? 'border-b border-black' : ''}`}
                    >
                      <div className="text-xs text-[#032622] font-medium">{note.bloc}</div>
                      <div className="text-sm font-bold text-[#032622]">{note.note}</div>
                      <div className="text-sm text-[#032622]">{note.subject}</div>
                      <div className="text-sm text-[#032622]">{note.duration}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center">
                  <button className="text-xs text-[#032622] font-medium">
                    VOIR RELEVÉ DE NOTE
                  </button>
                </div>
              </div>

              {/* Temps de connexion */}
              <div>
                <div className="p-4 bg-[#032622] border-b border-black">
                  <h4 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    TEMPS DE CONNEXION
                  </h4>
                </div>
                <div className="p-6">
                  <div className="flex items-end justify-center space-x-3 h-32">
                    {connectionData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-[#6B9A8E] w-6 transition-all duration-300 hover:bg-[#032622]"
                          style={{ height: `${data.height}px` }}
                        ></div>
                        <span className="text-xs text-[#032622] mt-2 font-medium">{data.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="flex justify-between items-center p-4 border-b border-black">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                AGENDA
              </h3>
              <button className="text-[#032622] text-sm font-medium">TOUT VOIR</button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-sm font-bold text-[#032622] bg-transparent border-none"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <option>SEPTEMBRE 2025</option>
                  <option>OCTOBRE 2025</option>
                  <option>NOVEMBRE 2025</option>
                </select>
              </div>

              {/* Calendrier */}
              <div className="border border-black">
                <div className="grid grid-cols-7 bg-[#032622] border-b border-black">
                  {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'].map((day) => (
                    <div key={day} className="text-center text-white text-xs font-bold py-2 border-r border-black last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                {calendarDays.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 border-b border-black last:border-b-0">
                    {week.map((day, dayIndex) => {
                      const isSpecialDay = specialDays.includes(day);
                      const isCurrentDay = day === 8;
                      return (
                        <div 
                          key={dayIndex} 
                          className={`text-center py-3 border-r border-black last:border-r-0 text-sm font-medium
                            ${isCurrentDay ? 'bg-[#032622] text-white' : ''}
                            ${isSpecialDay && !isCurrentDay ? 'bg-[#D1D5DB] text-[#032622]' : 'text-[#032622]'}
                            ${day > 26 && weekIndex === 0 ? 'text-gray-400' : ''}
                            ${day <= 3 && weekIndex === 4 ? 'text-gray-400' : ''}
                          `}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Légende */}
              <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#032622]"></div>
                  <span className="text-[#032622]">AUJOURD'HUI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#D1D5DB]"></div>
                  <span className="text-[#032622]">JOUR EN ENTREPRISE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Profil et informations */}
        <div className="space-y-6">
          {/* Photo de profil */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#F8F5E4] via-[#f0ebd8] to-[#eae5cf] rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 group border border-[#032622]/10">
            {/* Effet de brillance premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-[#032622]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Motif décoratif en arrière-plan */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#032622]/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#032622]/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Contenu principal */}
            <div className="relative p-8 text-center">
              {/* Photo de profil avec design premium amélioré */}
              <div className="relative mb-8">
                {/* Conteneur principal pour la photo */}
                <div className="w-48 h-48 mx-auto relative">
                  {/* Ombre portée multiple */}
                  <div className="absolute inset-0 rounded-full bg-[#032622]/15 blur-xl scale-125"></div>
                  <div className="absolute inset-0 rounded-full bg-[#032622]/10 blur-lg scale-115"></div>
                  
                  {/* Cercle principal avec bordure premium */}
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                    <Image
                      src={studentData.profileImage}
                      alt="Photo étudiant"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover object-center scale-110 transition-transform duration-700 group-hover:scale-100"
                      style={{ objectPosition: 'center top' }}
                    />
                  </div>
                  
                  {/* Bordures décoratives multiples */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#032622]/20 scale-105"></div>
                  <div className="absolute inset-0 rounded-full border border-white/50 scale-110"></div>
                  
                  {/* Effet de halo */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
                
                {/* Badge de statut ultra moderne */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#032622] via-[#01302C] to-[#032622] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md border border-white/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                      <span className="tracking-wider">ACTIF</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations du profil avec design amélioré */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#032622] tracking-wide" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    {studentData.name}
                  </h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#032622] to-transparent mx-auto"></div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-[#032622] rounded-full animate-pulse"></div>
                  <span className="text-sm text-[#032622]/80 font-semibold tracking-wide uppercase">ÉTUDIANT</span>
                  <div className="w-2 h-2 bg-[#032622] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                {/* Indicateurs de statut cohérents */}
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#032622]/60 font-medium">En ligne</span>
                  </div>
                  <div className="w-1 h-1 bg-[#032622]/30 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#032622]/60 font-medium">Connecté</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Effet de bordure animée premium */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-[#032622] via-transparent to-[#032622] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>

          {/* Informations membres */}
          <div className="bg-[#F8F5E4] border border-black p-6 space-y-4">
            <div>
              <div className="text-xs text-[#032622] font-bold mb-1">MEMBRE DEPUIS</div>
              <div className="text-sm text-[#032622]">{studentData.memberSince}</div>
            </div>
            <div>
              <div className="text-xs text-[#032622] font-bold mb-1">DERNIÈRE CONNEXION :</div>
              <div className="text-sm text-[#032622]">{studentData.lastConnectionInfo}</div>
            </div>
            <div>
              <div className="text-xs text-[#032622] font-bold mb-1">TEMPS GLOBAL SUR LA PLATEFORME :</div>
              <div className="text-sm text-[#032622]">{studentData.totalPlatformTime}</div>
            </div>
          </div>

          {/* Signalements */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="p-4 bg-[#032622] border-b border-black">
              <h4 className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                SIGNALEMENTS
              </h4>
            </div>
            <div className="p-4">
              <div className="bg-orange-100 border-l-4 border-orange-500 p-3">
                <div className="flex items-start">
                  <span className="text-orange-500 mr-2">⚠</span>
                  <div>
                    <p className="text-xs text-orange-700 font-medium">SUSPENSION DE 48H+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

