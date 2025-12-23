"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import CreateEventModal from "./CreateEventModal";
import EventDetailsModal from "./EventDetailsModal";

interface Event {
  id: string;
  title: string;
  type: "important" | "normal" | "late" | "masterclass" | "rendezvous" | "evenement" | "rappel";
  date: string;
  time: string;
  endTime?: string;
  ecole?: string; // École qui a créé l'événement
  created_by?: string;
  [key: string]: any; // Pour les champs supplémentaires
}

const AgendaComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"today" | "week" | "month">("month");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // Charger les événements depuis l'API
  useEffect(() => {
    loadEvents();
  }, [currentDate, viewMode]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      // Calculer la plage de dates selon la vue
      let dateStart: string;
      let dateEnd: string;
      
      if (viewMode === "today") {
        const today = new Date(currentDate);
        dateStart = today.toISOString().split('T')[0];
        dateEnd = today.toISOString().split('T')[0];
      } else if (viewMode === "week") {
        const weekDates = getWeekDates(currentDate);
        dateStart = weekDates[0].toISOString().split('T')[0];
        dateEnd = weekDates[6].toISOString().split('T')[0];
      } else {
        // Mois
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        dateStart = new Date(year, month, 1).toISOString().split('T')[0];
        dateEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
      }

      const response = await fetch(
        `/api/espace-admin/agenda?dateStart=${dateStart}&dateEnd=${dateEnd}`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des événements');
      }

      const result = await response.json();
      
      if (result.success) {
        // Formater les événements pour correspondre à l'interface Event
        const formattedEvents: Event[] = result.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          type: event.type,
          date: event.date,
          time: event.time,
          endTime: event.endTime,
          ecole: event.ecole,
        }));
        
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCreated = () => {
    // Recharger les événements après création
    loadEvents();
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleEventUpdate = () => {
    loadEvents();
    setSelectedEvent(null);
  };

  const handleEventDelete = () => {
    loadEvents();
    setSelectedEvent(null);
  };

  // Générer la légende basée sur les événements présents
  const generateLegend = () => {
    const legendItems: Array<{ color: string; label: string; ecole?: string }> = [];
    const seen = new Set<string>();

    events.forEach((event) => {
      const color = getEventTypeColor(event);
      const eventIcon = getEventIcon(event);
      
      // Pour les événements, créer une entrée par école
      if (event.type === 'evenement' && event.ecole) {
        const key = `evenement-${event.ecole}`;
        if (!seen.has(key)) {
          seen.add(key);
          legendItems.push({
            color,
            label: 'ÉVÉNEMENT',
            ecole: event.ecole,
          });
        }
      } 
      // Pour les rendez-vous
      else if (event.type === 'rendezvous') {
        const key = 'rendezvous';
        if (!seen.has(key)) {
          seen.add(key);
          legendItems.push({
            color: '#9370DB',
            label: 'RENDEZ-VOUS',
          });
        }
      }
      // Pour les rappels
      else if (event.type === 'rappel') {
        const key = 'rappel';
        if (!seen.has(key)) {
          seen.add(key);
          legendItems.push({
            color: '#808080',
            label: 'RAPPEL',
          });
        }
      }
    });

    return legendItems;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Convertir pour que lundi = 0, mardi = 1, ..., dimanche = 6
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];
    
    // Jours du mois précédent pour remplir le début
    // Si startingDayOfWeek = 0 (lundi), on n'ajoute pas de jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(year, month, -i);
      days.push({
        date: prevMonthDay.getDate(),
        isCurrentMonth: false,
        fullDate: prevMonthDay.toISOString().split('T')[0],
        isToday: false,
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: currentDay.toISOString().split('T')[0],
        isToday: currentDay.toDateString() === new Date().toDateString(),
      });
    }

    // Jours du mois suivant pour remplir la fin
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: nextMonthDay.toISOString().split('T')[0],
        isToday: false,
      });
    }

    return days;
  };

  const getEventsForDate = (date: string) => {
    // Éliminer les doublons basés sur l'ID de l'événement
    const filteredEvents = events.filter(event => event.date === date);
    return Array.from(
      new Map(filteredEvents.map(event => [event.id, event])).values()
    );
  };

  // Configuration des écoles avec leurs couleurs et icônes
  const getSchoolConfig = (schoolName: string) => {
    const schoolConfigs: Record<string, { color: string; icon: string }> = {
      '1001': { color: '#8B4513', icon: '/logos/1001.png' },
      'EDIFICE': { color: '#FF7400', icon: '/logos/edifice.png' },
      'KEOS': { color: '#03B094', icon: '/logos/keos.png' },
      'LEADER SOCIETY': { color: '#DC143C', icon: '/logos/leader.png' },
      'DIGITAL LEGACY': { color: '#9A83FF', icon: '/logos/digital.png' },
      'FINANCE SOCIETY': { color: '#231BFA', icon: '/logos/finance.png' },
      'AFRICAN BUSINESS SCHOOL': { color: '#DC143C', icon: '/logos/leader.png' },
      'CREATIVE NATION': { color: '#9A83FF', icon: '/logos/digital.png' },
      'CSAM': { color: '#DC143C', icon: '/logos/leader.png' },
      'STUDIO CAMPUS': { color: '#9A83FF', icon: '/logos/digital.png' },
      'TALENT BUSINESS SCHOOL': { color: '#DC143C', icon: '/logos/talent.png' },
      'ELITE SOCIETY ONLINE': { color: '#DC143C', icon: '/logos/leader.png' }
    };
    
    return schoolConfigs[schoolName] || { color: '#032622', icon: '/logos/leader.png' };
  };

  const getEventTypeColor = (event: Event) => {
    switch (event.type) {
      case "evenement":
        // Pour les événements, utiliser la couleur de l'école
        if (event.ecole) {
          const schoolConfig = getSchoolConfig(event.ecole);
          return schoolConfig.color;
        }
        return "#032622"; // Par défaut si pas d'école
      case "rappel":
        return "#808080"; // Gris pour les rappels
      case "rendezvous":
        return "#9370DB"; // Violet pour les rendez-vous
      case "masterclass":
        return "#FFA500"; // Orange pour masterclass (LEADER SOCIETY)
      case "important":
        return "#FFA500"; // Orange pour LEADER SOCIETY
      case "late":
        return "#4B5563"; // Gris foncé pour ELITE SOCIETY
      default:
        return "#032622";
    }
  };

  const getEventIcon = (event: Event) => {
    if (event.type === "evenement" && event.ecole) {
      const schoolConfig = getSchoolConfig(event.ecole);
      return schoolConfig.icon;
    }
    return null; // Pas d'icône pour les rappels et rendez-vous
  };

  const getDayName = (date: Date) => {
    const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    return days[date.getDay()];
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      week.push(currentDay);
    }
    return week;
  };

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const getEventsForTimeSlot = (date: string, hour: number) => {
    return events.filter(event => {
      if (event.date !== date) return false;
      const eventHour = parseInt(event.time.split(':')[0]);
      return eventHour === hour;
    });
  };

  const getTimeSlotPosition = (time: string, endTime?: string) => {
    const [startHours, startMins] = time.split(':').map(Number);
    const startMinutes = startHours * 60 + startMins;
    
    let endMinutes: number;
    if (endTime) {
      const [endHours, endMins] = endTime.split(':').map(Number);
      endMinutes = endHours * 60 + endMins;
    } else {
      endMinutes = startMinutes + 60; // Par défaut 1 heure
    }
    
    const totalMinutes = (23 - 9) * 60; // 14 heures (9h à 23h)
    const startPercent = ((startMinutes - 9 * 60) / totalMinutes) * 100;
    const heightPercent = ((endMinutes - startMinutes) / totalMinutes) * 100;
    
    return { 
      top: startPercent, 
      height: heightPercent,
      topPx: ((startMinutes - 9 * 60) * (64 / 60)), // En pixels pour le positionnement absolu
      heightPx: ((endMinutes - startMinutes) * (64 / 60)) // En pixels
    };
  };

  // Calculer les positions simples des événements (sans gestion de chevauchements)
  const calculateEventPositions = (events: Event[]) => {
    if (events.length === 0) return [];

    interface EventPosition {
      event: Event;
      top: number;
      height: number;
      left: number;
      width: number;
    }

    // Éliminer les doublons basés sur l'ID de l'événement
    const uniqueEvents = Array.from(
      new Map(events.map(event => [event.id, event])).values()
    );

    // Calculer les positions simples pour chaque événement
    const positions: EventPosition[] = uniqueEvents.map((event) => {
      const position = getTimeSlotPosition(event.time, event.endTime);
      
      return {
        event: event,
        top: position.topPx,
        height: position.heightPx,
        left: 0,
        width: 100,
      };
    });

    return positions;
  };

  const formatDateForHeader = (date: Date) => {
    const dayNames = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    return `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const formatDateForTodayHeader = (date: Date) => {
    const dayNames = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    return `${dayNames[date.getDay()]} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateForWeekHeader = (date: Date) => {
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const weekDays = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

  const getHeaderTitle = () => {
    if (viewMode === "today") {
      return formatDateForTodayHeader(currentDate).toUpperCase();
    } else if (viewMode === "week") {
      const weekDates = getWeekDates(currentDate);
      return formatDateForWeekHeader(weekDates[0]).toUpperCase();
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const handleNavigation = (direction: "prev" | "next") => {
    if (viewMode === "today") {
      navigateDay(direction);
    } else if (viewMode === "week") {
      navigateWeek(direction);
    } else {
      navigateMonth(direction);
    }
  };

  const hours = Array.from({ length: 15 }, (_, i) => i + 9); // 9h à 23h

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header avec navigation et boutons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          <button
            onClick={() => handleNavigation("prev")}
            className="p-1.5 sm:p-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded transition-colors border border-gray-400"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622]" />
          </button>
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 border border-gray-400 rounded text-xs sm:text-sm md:text-base text-[#032622] font-semibold whitespace-nowrap">
            {getHeaderTitle()}
          </div>
          <button
            onClick={() => handleNavigation("next")}
            className="p-1.5 sm:p-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded transition-colors border border-gray-400"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622]" />
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 w-full sm:w-auto">
          {/* Boutons AUJOURD'HUI / SEMAINE / MOIS */}
          <div className="flex border border-[#032622] flex-1 sm:flex-initial">
            <button
              onClick={() => {
                setViewMode("today");
                setCurrentDate(new Date());
              }}
              className={`flex-1 sm:flex-initial px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold transition-colors ${
                viewMode === "today"
                  ? "bg-[#032622] text-white"
                  : "bg-white text-[#032622] hover:bg-gray-100 active:bg-gray-200"
              }`}
            >
              AUJOURD'HUI
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex-1 sm:flex-initial px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold transition-colors ${
                viewMode === "week"
                  ? "bg-white text-[#032622] border-2 border-[#032622]"
                  : "bg-white text-[#032622] hover:bg-gray-100 active:bg-gray-200"
              }`}
            >
              SEMAINE
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`flex-1 sm:flex-initial px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold transition-colors ${
                viewMode === "month"
                  ? "bg-[#032622] text-white"
                  : "bg-white text-[#032622] hover:bg-gray-100 active:bg-gray-200"
              }`}
            >
              MOIS
            </button>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[#032622] text-white border border-[#032622] flex items-center justify-center hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors flex-shrink-0"
            aria-label="Ajouter un événement"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Vue AUJOURD'HUI */}
      {viewMode === "today" && (
        <div className="border border-[#032622] bg-[#F8F5E4] overflow-x-auto">
          {/* En-tête du jour */}
          <div className="bg-[#032622] text-white p-3 sm:p-4 font-bold text-sm sm:text-base md:text-lg">
            {formatDateForHeader(currentDate).toUpperCase()}
          </div>
          
          {/* Planning horaire */}
          <div className="flex relative" style={{ minHeight: "400px", minWidth: "320px" }}>
            {/* Colonne des heures */}
            <div className="w-16 sm:w-20 border-r border-[#032622] bg-[#F8F5E4] flex-shrink-0">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-12 sm:h-16 border-b border-[#032622] flex items-start justify-end pr-1 sm:pr-2 pt-1 text-xs sm:text-sm text-[#032622]"
                >
                  {hour}:00
                </div>
              ))}
            </div>
            
            {/* Zone des événements */}
            <div className="flex-1 relative">
              {/* Lignes horaires */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-[#032622]"
                />
              ))}
              
              {/* Événements positionnés avec gestion des chevauchements */}
              {calculateEventPositions(getEventsForDate(currentDate.toISOString().split('T')[0])).map(({ event, top, height, left, width }) => {
                const eventColor = getEventTypeColor(event);
                const eventIcon = getEventIcon(event);
                return (
                  <div
                    key={event.id}
                    className="absolute border-2 border-[#032622] p-2 text-sm font-semibold text-white flex items-center gap-2 z-10 overflow-hidden"
                    style={{ 
                      top: `${top}px`, 
                      height: `${Math.max(height, 40)}px`, // Hauteur minimum de 40px
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: eventColor,
                      boxSizing: 'border-box',
                      minWidth: '50px' // Largeur minimum pour garantir la visibilité
                    }}
                    title={`${event.title} - ${event.time}${event.endTime ? ` à ${event.endTime}` : ''}`}
                  >
                    {eventIcon && (
                      <img 
                        src={eventIcon} 
                        alt={event.ecole || ''} 
                        className="w-6 h-6 object-contain flex-shrink-0"
                      />
                    )}
                    <span className="truncate text-xs leading-tight">{event.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Vue SEMAINE */}
      {viewMode === "week" && (
        <div className="border border-[#032622] bg-[#F8F5E4] overflow-x-auto">
          {/* En-têtes des jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-[#032622] min-w-[560px]">
            {weekDays.map((day, index) => {
              const weekDates = getWeekDates(currentDate);
              const dayDate = weekDates[index];
              return (
                <div
                  key={day}
                  className="p-2 sm:p-3 md:p-4 text-center border-r border-[#032622] last:border-r-0 bg-[#032622] text-white font-semibold"
                >
                  <div className="text-[10px] sm:text-xs mb-0.5 sm:mb-1">{day}</div>
                  <div className="text-xs sm:text-sm">{dayDate.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Grille de la semaine */}
          <div className="grid grid-cols-7 min-w-[560px]">
            {getWeekDates(currentDate).map((dayDate, index) => {
              const dateStr = dayDate.toISOString().split('T')[0];
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dayDate.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[300px] sm:min-h-[350px] md:min-h-[400px] p-1.5 sm:p-2 border-r border-b border-[#032622] last:border-r-0 ${
                    isToday ? "bg-[#eae5cf]" : "bg-[#F8F5E4]"
                  }`}
                >
                  {/* Événements du jour */}
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                      const eventColor = getEventTypeColor(event);
                      const eventIcon = getEventIcon(event);
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="text-white text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity border border-[#032622] flex items-center gap-1"
                          style={{ backgroundColor: eventColor }}
                          title={`${event.title} - ${event.time}`}
                        >
                          {eventIcon && (
                            <img 
                              src={eventIcon} 
                              alt={event.ecole || ''} 
                              className="w-8 h-8 object-contain flex-shrink-0"
                            />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue MOIS */}
      {viewMode === "month" && (
        <div className="border border-[#032622] bg-[#F8F5E4] overflow-x-auto">
          {/* En-têtes des jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-[#032622] min-w-[560px]">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-2 sm:p-3 md:p-4 text-center text-[10px] sm:text-xs md:text-sm font-semibold text-[#032622] border-r border-[#032622] last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 min-w-[560px]">
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayEvents = getEventsForDate(day.fullDate);
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1 sm:p-1.5 md:p-2 border-r border-b border-[#032622] last:border-r-0 ${
                    !day.isCurrentMonth ? "text-[#032622]/40 bg-gray-100" : "text-[#032622] bg-[#F8F5E4]"
                  } ${day.isToday ? "bg-[#eae5cf]" : ""}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">
                      {day.date}
                    </span>
                  </div>
                  
                  {/* Événements du jour */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const eventColor = getEventTypeColor(event);
                      const eventIcon = getEventIcon(event);
                      return (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="text-white text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity border border-[#032622] flex items-center gap-1"
                          style={{ backgroundColor: eventColor }}
                          title={`${event.title} - ${event.time}`}
                        >
                          {eventIcon && (
                            <img 
                              src={eventIcon} 
                              alt={event.ecole || ''} 
                              className="w-6 h-6 object-contain flex-shrink-0"
                            />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div
                        className="text-[#032622] text-xs px-2 py-1 rounded cursor-pointer hover:bg-[#032622]/10 transition-colors border border-[#032622] font-semibold text-center"
                        title={`${dayEvents.length - 2} autre(s) événement(s) ce jour`}
                      >
                        + {dayEvents.length - 2} autre{dayEvents.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Légende dynamique */}
          {generateLegend().length > 0 && (
            <div className="p-4 border-t border-[#032622] flex items-center gap-6 flex-wrap">
              {generateLegend().map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-[#032622] font-semibold">
                    {item.label}
                    {item.ecole && ` - ${item.ecole}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de création d'événement */}
      {isCreateModalOpen && (
        <CreateEventModal
          onClose={() => {
            setIsCreateModalOpen(false);
            // Nettoyer les paramètres d'URL quand on ferme le modal
            const params = new URLSearchParams(window.location.search);
            params.delete('type');
            const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }}
          onSubmit={handleEventCreated}
        />
      )}

      {/* Modal de détails d'événement */}
      {selectedEvent && (selectedEvent.type === "evenement" || selectedEvent.type === "rendezvous" || selectedEvent.type === "rappel") && (
        <EventDetailsModal
          event={{
            ...selectedEvent,
            type: selectedEvent.type as "evenement" | "rendezvous" | "rappel",
            isOwner: selectedEvent.created_by === currentUserId,
          }}
          onClose={() => setSelectedEvent(null)}
          onUpdate={handleEventUpdate}
          onDelete={handleEventDelete}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default AgendaComponent;
