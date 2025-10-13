"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import CreateEventModal from "./CreateEventModal";

interface Event {
  id: string;
  title: string;
  type: "important" | "normal" | "late";
  date: string;
  time: string;
}

const AgendaComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month">("month");

  // Données d'exemple pour les événements
  const events: Event[] = [
    { id: "1", title: "Visio tuteur – Bloc 3", type: "important", date: "2025-09-07", time: "14:00" },
    { id: "2", title: "Atelier SEO", type: "normal", date: "2025-09-14", time: "10:00" },
    { id: "3", title: "Feedback campagnes", type: "late", date: "2025-09-14", time: "15:30" },
    { id: "4", title: "Sprint design", type: "normal", date: "2025-09-22", time: "09:00" },
    { id: "5", title: "Correction devoir UX", type: "important", date: "2025-09-24", time: "16:00" },
    { id: "6", title: "Suivi projets", type: "normal", date: "2025-09-27", time: "11:00" },
    { id: "7", title: "Workshop IA générative", type: "important", date: "2025-09-29", time: "13:30" },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent pour remplir le début
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
    return events.filter(event => event.date === date);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "important":
        return "bg-[#D96B6B]";
      case "late":
        return "bg-[#F0C75E]";
      default:
        return "bg-[#032622]";
    }
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

  return (
    <div className="space-y-6">
      {/* Header avec navigation et boutons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-[#eae5cf] rounded transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#032622]" />
          </button>
          <h2
            className="text-2xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-[#eae5cf] rounded transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#032622]" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Boutons SEMAINE / MOIS */}
          <div className="flex border border-[#032622]">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === "week"
                  ? "bg-[#F8F5E4] text-[#032622] border-2 border-[#032622]"
                  : "bg-[#F8F5E4] text-[#032622] hover:bg-[#eae5cf]"
              }`}
            >
              SEMAINE
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === "month"
                  ? "bg-[#F8F5E4] text-[#032622] border-2 border-[#032622]"
                  : "bg-[#F8F5E4] text-[#032622] hover:bg-[#eae5cf]"
              }`}
            >
              MOIS
            </button>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-12 h-12 bg-[#F8F5E4] text-[#032622] border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="border border-[#032622] bg-[#F8F5E4]">
        {/* En-têtes des jours de la semaine */}
        <div className="grid grid-cols-7 border-b border-[#032622]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-semibold text-[#032622] border-r border-[#032622] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7">
          {getDaysInMonth(currentDate).map((day, index) => {
            const dayEvents = getEventsForDate(day.fullDate);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-[#032622]/20 last:border-r-0 ${
                  !day.isCurrentMonth ? "text-[#032622]/40" : "text-[#032622]"
                } ${day.isToday ? "bg-[#eae5cf]" : "bg-[#F8F5E4]"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-sm font-medium ${
                      day.isToday ? "bg-[#F8F5E4] text-[#032622] border border-[#032622] px-2 py-1 rounded" : ""
                    }`}
                  >
                    {day.date}
                  </span>
                </div>
                
                {/* Événements du jour */}
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`${getEventTypeColor(event.type)} text-[#032622] text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                      title={`${event.title} - ${event.time}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de création d'événement */}
      {isCreateModalOpen && (
        <CreateEventModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(eventData) => {
            console.log("Nouvel événement:", eventData);
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AgendaComponent;

