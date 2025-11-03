"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';

type ViewType = 'today' | 'week' | 'month';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  student: string;
  type: 'meeting' | 'follow-up' | 'evaluation';
}

export default function AgendaTuteur() {
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const savedEvents = localStorage.getItem('tutor-events');
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
      const exampleEvents: Event[] = [
        {
          id: '1',
      title: "Visio avec Jean Bobine",
          description: "Point d'avancement sur le bloc 1",
          date: new Date(2025, 9, 15, 9, 0),
          time: '09:00',
          student: 'Jean Bobine',
          type: 'meeting'
        },
        {
          id: '2',
      title: "Suivi Marie Durand",
          description: "Révision des compétences du bloc 2",
          date: new Date(2025, 9, 16, 14, 0),
          time: '14:00',
          student: 'Marie Durand',
          type: 'follow-up'
        },
        {
          id: '3',
      title: "Point d'avancement Pierre Martin",
          description: "Évaluation des résultats du quiz",
          date: new Date(2025, 9, 17, 10, 30),
          time: '10:30',
          student: 'Pierre Martin',
          type: 'evaluation'
        }
      ];
      setEvents(exampleEvents);
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('tutor-events', JSON.stringify(events));
    }
  }, [events]);

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const dates = [];
    const currentDateIterator = new Date(startDate);
    
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

  // Lecture seule: aucune création/modification d'événements depuis l'UI

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'RENDEZ-VOUS';
      case 'follow-up':
        return 'SUIVI';
      case 'evaluation':
        return 'ÉVALUATION';
      default:
        return type.toUpperCase();
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return '#6B9A8E';
      case 'follow-up':
        return '#032622';
      case 'evaluation':
        return '#8B4513';
      default:
        return '#032622';
    }
  };

  const renderTodayView = () => {
    const todayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="bg-[#F8F5E4] border-2 border-[#032622] p-6">
          <h2 
            className="text-2xl font-bold text-[#032622] mb-6"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {formatDate(currentDate).toUpperCase()}
          </h2>
          <div className="space-y-4">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-white border-2 border-[#032622] p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-bold text-[#032622] mb-2"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-[#032622] mb-3">{event.description}</p>
                      )}
                      <div className="flex items-center space-x-6 text-sm text-[#032622]">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{event.student}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(event.time)}</span>
                        </div>
                      </div>
                    </div>
                    <span 
                      className="text-white px-3 py-1 text-xs font-bold"
                      style={{ 
                        backgroundColor: getTypeColor(event.type),
                        fontFamily: 'var(--font-termina-bold)'
                      }}
                    >
                      {getTypeLabel(event.type)}
                    </span>
                  </div>
                  <button 
                    className="bg-[#032622] text-white px-6 py-2 font-bold hover:bg-[#044a3a] transition-colors"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    REJOINDRE
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-[#032622] py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucun rendez-vous prévu pour aujourd'hui</p>
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
        <div className="bg-[#F8F5E4] border-2 border-[#032622]">
          <div className="grid grid-cols-7 border-b-2 border-[#032622]">
            {days.map((day, index) => (
              <div key={day} className="p-4 text-center border-r-2 border-[#032622] last:border-r-0">
                <div 
                  className="font-bold text-[#032622] text-sm mb-2"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {day}
                </div>
                <div 
                  className={`text-lg font-bold ${isToday(weekDates[index]) ? 'bg-[#032622] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-[#032622]'}`}
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {weekDates[index].getDate()}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-96">
            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div key={index} className="border-r-2 border-[#032622] last:border-r-0 p-2 bg-[#F8F5E4] min-h-32">
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="text-xs p-2 rounded text-white font-medium"
                        style={{ 
                          backgroundColor: getTypeColor(event.type),
                          fontFamily: 'var(--font-termina-bold)'
                        }}
                      >
                        <div>{formatTime(event.time)}</div>
                        <div className="truncate">{event.title}</div>
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
        <div className="bg-[#F8F5E4] border-2 border-[#032622]">
          <div className="grid grid-cols-7 border-b-2 border-[#032622]">
            {days.map((day) => (
              <div key={day} className="p-4 text-center border-r-2 border-[#032622] last:border-r-0">
                <div 
                  className="font-bold text-[#032622] text-sm"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {day}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div key={index} className="border-r-2 border-b-2 border-[#032622] last:border-r-0 p-2 h-24 bg-[#F8F5E4] relative">
                  <div 
                    className={`text-sm font-bold ${!isSameMonth(date, currentDate) ? 'text-gray-400' : isToday(date) ? 'bg-[#032622] text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-[#032622]'}`}
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div 
                        key={event.id} 
                        className="text-xs p-1 rounded text-white font-medium truncate"
                        style={{ 
                          backgroundColor: getTypeColor(event.type),
                          fontFamily: 'var(--font-termina-bold)'
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-[#032622] font-medium" style={{ fontFamily: 'var(--font-termina-bold)' }}>
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
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <h1 
        className="text-4xl font-bold text-[#032622] mb-8"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        AGENDA
      </h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentView('today')}
            className={`px-6 py-3 text-sm font-bold border-2 border-[#032622] transition-colors ${
              currentView === 'today' 
                ? 'bg-[#032622] text-white' 
                : 'bg-[#F8F5E4] text-[#032622] hover:bg-gray-100'
            }`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            AUJOURD'HUI
          </button>
          <button 
            onClick={() => setCurrentView('week')}
            className={`px-6 py-3 text-sm font-bold border-2 border-[#032622] transition-colors ${
              currentView === 'week' 
                ? 'bg-[#032622] text-white' 
                : 'bg-[#F8F5E4] text-[#032622] hover:bg-gray-100'
            }`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            SEMAINE
          </button>
          <button 
            onClick={() => setCurrentView('month')}
            className={`px-6 py-3 text-sm font-bold border-2 border-[#032622] transition-colors ${
              currentView === 'month' 
                ? 'bg-[#032622] text-white' 
                : 'bg-[#F8F5E4] text-[#032622] hover:bg-gray-100'
            }`}
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            MOIS
          </button>
        </div>
      </div>

      {currentView === 'today' && renderTodayView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'month' && renderMonthView()}

      {/* Lecture seule : aucune modale d'ajout */}
    </div>
  );
}
