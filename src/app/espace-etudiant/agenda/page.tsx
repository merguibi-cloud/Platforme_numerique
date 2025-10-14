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

  // Fonctions pour gérer les événements
  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const eventDate = new Date(newEvent.date + 'T' + newEvent.time);

      const event: Event = {
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

      setEvents([...events, event]);
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
      setShowAddEventModal(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const renderTodayView = () => {
    const todayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="bg-[#F8F5E4] p-6 border border-black">
          <h2 className="text-xl font-bold text-[#032622] mb-4">
            {formatDate(currentDate).toUpperCase()}
          </h2>
          <div className="min-h-96 border border-gray-300 bg-[#F8F5E4] p-4">
            {todayEvents.length > 0 ? (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div key={event.id} className="bg-white border-l-4 p-4 rounded-lg shadow-sm" style={{ borderLeftColor: event.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#032622]">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.attendees && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{event.attendees}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-2 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: event.color }}>
                        {event.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Aucun événement prévu pour aujourd'hui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

    return (
      <div className="space-y-4">
        <div className="bg-[#F8F5E4] border border-black">
          <div className="grid grid-cols-7 border-b border-black">
            {days.map((day, index) => (
              <div key={day} className="p-4 text-center border-r border-black last:border-r-0">
                <div className="font-bold text-[#032622] text-sm">{day}</div>
                <div className={`text-lg font-bold mt-1 ${isToday(weekDates[index]) ? 'bg-[#032622] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-[#032622]'}`}>
                  {weekDates[index].getDate()}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-96">
            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div key={index} className="border-r border-black last:border-r-0 p-2 bg-[#F8F5E4]">
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="text-xs p-1 rounded text-white font-medium truncate" style={{ backgroundColor: event.color }}>
                        {formatTime(event.time)} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const days = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

    return (
      <div className="space-y-4">
        <div className="bg-[#F8F5E4] border border-black">
          <div className="grid grid-cols-7 border-b border-black">
            {days.map((day) => (
              <div key={day} className="p-4 text-center border-r border-black last:border-r-0">
                <div className="font-bold text-[#032622] text-sm">{day}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div key={index} className="border-r border-black border-b border-black last:border-r-0 p-2 h-24 bg-[#F8F5E4] relative">
                  <div className={`text-sm font-bold ${!isSameMonth(date, currentDate) ? 'text-gray-400' : isToday(date) ? 'bg-[#032622] text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-[#032622]'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="text-xs p-0.5 rounded text-white font-medium truncate" style={{ backgroundColor: event.color }}>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayEvents.length - 2} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* En-tête avec bannière verte */}
        <div className="bg-[#032622] h-32 -mx-6 -mt-6 mb-6"></div>
        
        {/* Contrôles de tri et vue */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <select className="border border-black px-3 py-2 bg-[#F8F5E4] text-[#032622] text-sm">
              <option>TRIER PAR ▼</option>
            </select>
            
            <button 
              onClick={() => setShowAddEventModal(true)}
              className="bg-[#032622] text-white px-4 py-2 text-sm font-bold hover:bg-[#01302C] transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>AJOUTER UN ÉVÉNEMENT</span>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentView('today')}
              className={`px-4 py-2 text-sm font-bold border border-black ${currentView === 'today' ? 'bg-[#032622] text-white' : 'bg-[#F8F5E4] text-[#032622]'}`}
            >
              AUJOURD'HUI
            </button>
            <button 
              onClick={() => setCurrentView('week')}
              className={`px-4 py-2 text-sm font-bold border border-black ${currentView === 'week' ? 'bg-[#032622] text-white' : 'bg-[#F8F5E4] text-[#032622]'}`}
            >
              SEMAINE
            </button>
            <button 
              onClick={() => setCurrentView('month')}
              className={`px-4 py-2 text-sm font-bold border border-black ${currentView === 'month' ? 'bg-[#032622] text-white' : 'bg-[#F8F5E4] text-[#032622]'}`}
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


