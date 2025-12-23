"use client";
import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, X, Save, Palette } from 'lucide-react';

type ViewType = 'today' | 'week' | 'month';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  attendees: string;
  type: 'personal' | 'academic' | 'social';
  color: string;
}

export default function AgendaPage() {
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [currentDate] = useState(new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  // Couleurs prédéfinies pour les événements
  const predefinedColors = [
    '#032622', '#01302C', '#8B4513', '#03B094', '#DC143C', 
    '#9A83FF', '#FF7400', '#231BFA', '#FF6B6B', '#4ECDC4',
    '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF',
    '#5F27CD', '#00D2D3', '#FF9F43', '#EE5A24', '#0ABDE3'
  ];

  // État pour le formulaire d'ajout d'événement
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    attendees: '',
    type: 'personal' as 'personal' | 'academic' | 'social',
    color: '#032622'
  });

  // Charger les événements depuis localStorage au montage du composant
  useEffect(() => {
    const savedEvents = localStorage.getItem('student-events');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
      }
    } else {
      // Ajouter des événements d'exemple si aucun n'existe
      const exampleEvents: Event[] = [
        {
          id: '1',
          title: 'Révision Mathématiques',
          description: 'Révision des équations du second degré',
          date: new Date(2024, 11, 25, 14, 0),
          time: '14:00',
          location: 'Bibliothèque',
          attendees: 'Solo',
          type: 'academic',
          color: '#032622'
        },
        {
          id: '2',
          title: 'Projet de groupe',
          description: 'Présentation du projet marketing',
          date: new Date(2024, 11, 26, 10, 30),
          time: '10:30',
          location: 'Salle 201',
          attendees: 'Groupe de 4',
          type: 'academic',
          color: '#03B094'
        },
        {
          id: '3',
          title: 'Soirée entre amis',
          description: 'Dîner et cinéma',
          date: new Date(2024, 11, 27, 19, 0),
          time: '19:00',
          location: 'Centre-ville',
          attendees: 'Groupe de 6',
          type: 'social',
          color: '#FF6B6B'
        },
        {
          id: '4',
          title: 'Rendez-vous médecin',
          description: 'Contrôle annuel',
          date: new Date(2024, 11, 28, 15, 30),
          time: '15:30',
          location: 'Cabinet médical',
          attendees: 'Solo',
          type: 'personal',
          color: '#8B4513'
        }
      ];
      setEvents(exampleEvents);
    }
  }, []);

  // Sauvegarder les événements dans localStorage à chaque modification
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('student-events', JSON.stringify(events));
    }
  }, [events]);

  // Fonction pour ajouter un nouvel événement
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      return; // Validation basique
    }

    const eventDate = new Date(newEvent.date);
    const [hours, minutes] = newEvent.time.split(':').map(Number);
    eventDate.setHours(hours, minutes);

    const newEventData: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: eventDate,
      time: newEvent.time,
      location: newEvent.location,
      attendees: newEvent.attendees,
      type: newEvent.type,
      color: newEvent.color
    };

    setEvents([...events, newEventData]);
    setShowAddEventModal(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      attendees: '',
      type: 'personal',
      color: '#032622'
    });
  };

  // Fonction pour obtenir les dates de la semaine courante
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  // Fonction pour obtenir les dates du mois courant
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Commencer par le lundi précédent si nécessaire
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const dates = [];
    const currentDateIterator = new Date(startDate);
    
    // Générer 6 semaines (42 jours) pour couvrir tout le mois
    for (let i = 0; i < 42; i++) {
      dates.push(new Date(currentDateIterator));
      currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short'
    });
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, referenceDate: Date) => {
    return date.getMonth() === referenceDate.getMonth() && date.getFullYear() === referenceDate.getFullYear();
  };

  const renderTodayView = () => (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-[#F8F5E4] p-4 sm:p-5 md:p-6 border border-black">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#032622] mb-3 sm:mb-4">
          {formatDate(currentDate).toUpperCase()}
        </h2>
        <div className="min-h-64 sm:min-h-80 md:min-h-96 border border-gray-300 bg-[#F8F5E4] p-3 sm:p-4">
          <div className="text-center text-gray-500 mt-12 sm:mt-16 md:mt-20">
            <p className="text-xs sm:text-sm md:text-base">Aucun événement prévu pour aujourd'hui</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-[#F8F5E4] border border-black overflow-x-auto">
          <div className="grid grid-cols-7 border-b border-black min-w-[600px]">
            {days.map((day, index) => (
              <div key={day} className="p-2 sm:p-3 md:p-4 text-center border-r border-black last:border-r-0">
                <div className="font-bold text-[#032622] text-[10px] sm:text-xs md:text-sm">{day}</div>
                <div className={`text-sm sm:text-base md:text-lg font-bold mt-1 ${isToday(weekDates[index]) ? 'bg-[#032622] text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center mx-auto' : 'text-[#032622]'}`}>
                  {weekDates[index].getDate()}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-64 sm:min-h-80 md:min-h-96 min-w-[600px]">
            {weekDates.map((date, index) => (
              <div key={index} className="border-r border-black last:border-r-0 p-1.5 sm:p-2 bg-[#F8F5E4]">
                {/* Espace vide pour les événements */}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-[#F8F5E4] border border-black overflow-x-auto">
          <div className="grid grid-cols-7 border-b border-black min-w-[600px]">
            {days.map((day) => (
              <div key={day} className="p-2 sm:p-3 md:p-4 text-center border-r border-black last:border-r-0">
                <div className="font-bold text-[#032622] text-[10px] sm:text-xs md:text-sm">{day}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-w-[600px]">
            {monthDates.map((date, index) => (
              <div key={index} className="border-r border-black border-b border-black last:border-r-0 p-1 sm:p-1.5 md:p-2 h-16 sm:h-20 md:h-24 bg-[#F8F5E4] relative">
                <div className={`text-[10px] sm:text-xs md:text-sm font-bold ${!isSameMonth(date, currentDate) ? 'text-gray-400' : isToday(date) ? 'bg-[#032622] text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center' : 'text-[#032622]'}`}>
                  {date.getDate()}
                </div>
                {/* Espace vide pour les événements */}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6">
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* En-tête avec bannière verte */}
        <div className="bg-[#032622] h-20 sm:h-24 md:h-28 lg:h-32 -mx-3 sm:-mx-4 md:-mx-5 lg:-mx-6 -mt-3 sm:-mt-4 md:-mt-5 lg:-mt-6 mb-4 sm:mb-5 md:mb-6"></div>
        
        {/* Contrôles de tri et vue */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4">
            <select className="border border-black px-2 sm:px-3 py-1.5 sm:py-2 bg-[#F8F5E4] text-[#032622] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#032622]">
              <option>TRIER PAR ▼</option>
            </select>
            
            <button className="bg-[#032622] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors whitespace-nowrap">
              + AJOUTER UN ÉVÉNEMENT
            </button>
          </div>
          
          <div className="flex space-x-1.5 sm:space-x-2">
            <button 
              onClick={() => setCurrentView('today')}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-bold border border-black transition-colors flex-1 sm:flex-initial ${currentView === 'today' ? 'bg-[#032622] text-white' : 'bg-[#F8F5E4] text-[#032622] hover:bg-[#032622]/5 active:bg-[#032622]/10'}`}
            >
              AUJOURD'HUI
            </button>
            <button 
              onClick={() => setCurrentView('week')}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-bold border border-black transition-colors flex-1 sm:flex-initial ${currentView === 'week' ? 'bg-[#032622] text-white' : 'bg-[#F8F5E4] text-[#032622] hover:bg-[#032622]/5 active:bg-[#032622]/10'}`}
            >
              SEMAINE
            </button>
            <button 
              onClick={() => setCurrentView('month')}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-bold border border-black transition-colors flex-1 sm:flex-initial ${currentView === 'month' ? 'bg-[#032622] text-white' : 'bg-[#F8F5E4] text-[#032622] hover:bg-[#032622]/5 active:bg-[#032622]/10'}`}
            >
              MOIS
            </button>
          </div>
        </div>

        {/* Contenu de l'agenda selon la vue */}
        {currentView === 'today' && renderTodayView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'month' && renderMonthView()}

        {/* Modal pour ajouter un événement */}
        {showAddEventModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg p-6 w-full max-w-md">
              {/* En-tête du modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  NOUVEL ÉVÉNEMENT
                </h3>
                <button 
                  onClick={() => setShowAddEventModal(false)}
                  className="w-8 h-8 bg-[#032622] text-white flex items-center justify-center hover:bg-[#01302C] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulaire */}
              <div className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider">
                    TITRE *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C]"
                    placeholder="Nom de l'événement"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C] h-20 resize-none"
                    placeholder="Description de l'événement"
                  />
                </div>

                {/* Date et heure */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider">
                      DATE *
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider">
                      HEURE *
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C]"
                    />
                  </div>
                </div>

                {/* Lieu */}
                <div>
                  <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider">
                    LIEU
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C]"
                    placeholder="Où se déroule l'événement ?"
                  />
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider">
                    PARTICIPANTS
                  </label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C]"
                    placeholder="Qui participe ?"
                  />
                </div>

                {/* Type d'événement */}
                <div>
                  <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider">
                    TYPE D'ÉVÉNEMENT
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as 'personal' | 'academic' | 'social'})}
                    className="w-full px-3 py-2 border border-[#032622] bg-white text-[#032622] focus:outline-none focus:border-[#01302C]"
                  >
                    <option value="personal">PERSONNEL</option>
                    <option value="academic">ACADÉMIQUE</option>
                    <option value="social">SOCIAL</option>
                  </select>
                </div>

                {/* Sélecteur de couleur */}
                <div>
                  <label className="block text-sm font-bold text-[#032622] mb-2 uppercase tracking-wider flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>COULEUR DE L'ÉVÉNEMENT</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2 p-3 border border-[#032622] bg-white rounded">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewEvent({...newEvent, color})}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          newEvent.color === color ? 'border-[#032622] scale-110 shadow-lg' : 'border-gray-300 hover:border-[#032622]'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border border-[#032622]"
                      style={{ backgroundColor: newEvent.color }}
                    ></div>
                    <span className="text-sm text-[#032622]/70 font-medium">
                      Couleur sélectionnée: {newEvent.color}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 px-4 py-2 border border-[#032622] text-[#032622] font-bold hover:bg-[#032622] hover:text-white transition-colors"
                >
                  ANNULER
                </button>
                <button
                  onClick={handleAddEvent}
                  className="flex-1 px-4 py-2 bg-[#032622] text-white font-bold hover:bg-[#01302C] transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>CRÉER</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


