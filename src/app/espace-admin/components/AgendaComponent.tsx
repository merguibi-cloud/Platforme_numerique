"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Données d'exemple pour les événements
  const events: Event[] = [
    { id: "1", title: "Visio tuteur – suivi individuel Chadi", type: "important", date: "2025-10-15", time: "09:00" },
    { id: "2", title: "Comité pédagogique · Bloc 2", type: "normal", date: "2025-10-16", time: "14:00" },
    { id: "3", title: "Correction devoir Bloc 2", type: "late", date: "2025-10-18", time: "16:30" },
    { id: "4", title: "Visio groupe promo Digital Legacy", type: "normal", date: "2025-10-19", time: "11:00" },
    { id: "5", title: "Préparation masterclass marketing", type: "important", date: "2025-10-21", time: "17:00" },
    { id: "6", title: "Suivi projets étudiants", type: "normal", date: "2025-10-23", time: "10:30" },
    { id: "7", title: "Point formateurs Bloc 3", type: "normal", date: "2025-10-24", time: "15:00" },
    { id: "8", title: "Review anti-triche Bloc 1", type: "important", date: "2025-10-25", time: "09:30" },
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
                      className={`${getEventTypeColor(event.type)} text-white text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                      title={`${event.title} - ${event.time}`}
                      onClick={() => setSelectedEvent(event)}
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

      {/* Modal détail événement */}
      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default AgendaComponent;

// ----- Modale de détails d'événement -----
const EventDetailsModal = ({ event, onClose }: { event: Event; onClose: () => void }) => {
  // Construit la date complète au format Date à partir de date (YYYY-MM-DD) et time (HH:mm)
  const eventDate: Date = useMemo(() => {
    const [year, month, day] = event.date.split("-").map((v) => parseInt(v, 10));
    const [hours, minutes] = event.time.split(":").map((v) => parseInt(v, 10));
    return new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0);
  }, [event.date, event.time]);

  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const isFuture = now.getTime() < eventDate.getTime();
  const diffSeconds = Math.abs(Math.floor((eventDate.getTime() - now.getTime()) / 1000));
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  const colorByType = event.type === "important" ? "bg-[#D96B6B]" : event.type === "late" ? "bg-[#F0C75E]" : "bg-[#032622]";

  // Informations fictives pour un rendu réaliste
  const fakeData = {
    location: event.type === "normal" ? "Salle 3.2 · Campus La Défense" : "Visio Google Meet",
    meetLink: "https://meet.google.com/abc-defg-hij",
    participants: [
      { name: "Samantha Leroy", role: "Formatrice" },
      { name: "Chadi El Assowad", role: "Étudiant" },
      { name: "Nicolas Bernard", role: "Coach référent" },
    ],
    description:
      "Session de suivi focalisée sur l'avancement des livrables Bloc 2, points bloquants et plan d'action jusqu'au prochain jalon.",
    attachments: [
      { name: "Ordre du jour.pdf", size: "232 Ko" },
      { name: "Liste des livrables.xlsx", size: "89 Ko" },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-[#F8F5E4] border border-[#032622] shadow-xl">
        <header className={`flex items-center justify-between px-6 py-4 border-b border-[#032622] ${colorByType}`}>
          <h3 className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-termina-bold)" }}>
            {event.title}
          </h3>
          <button onClick={onClose} className="text-white/90 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="px-6 py-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4 text-[#032622]">
            <span className="inline-flex items-center border border-[#032622] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{event.date}</span>
            <span className="inline-flex items-center border border-[#032622] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">{event.time}</span>
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white ${colorByType}`}>{event.type}</span>
            <span className="ml-auto text-sm font-semibold text-[#032622]">
              {isFuture ? "Début dans" : "Écoulement"} {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#032622]">
            <div className="space-y-2">
              <p className="font-semibold">Lieu</p>
              <p>{fakeData.location}</p>
              {fakeData.location.includes("Visio") && (
                <a href={fakeData.meetLink} target="_blank" className="underline text-[#032622]">Rejoindre la visio</a>
              )}
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Participants</p>
              <ul className="list-disc pl-5 space-y-1">
                {fakeData.participants.map((p, idx) => (
                  <li key={idx}>{p.name} · {p.role}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2 text-sm text-[#032622]">
            <p className="font-semibold">Description</p>
            <p className="leading-relaxed">{fakeData.description}</p>
          </div>

          <div className="space-y-2 text-sm text-[#032622]">
            <p className="font-semibold">Pièces jointes</p>
            <ul className="space-y-1">
              {fakeData.attachments.map((a, idx) => (
                <li key={idx} className="flex items-center justify-between border border-[#032622]/30 bg-[#032622]/5 px-3 py-2">
                  <span>{a.name}</span>
                  <span className="text-[#032622]/70">{a.size}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-1">
            <button className="border border-[#032622] bg-[#032622] text-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#01302C] transition-colors">
              Démarrer la session
            </button>
            <button onClick={onClose} className="border border-[#032622] bg-[#f8f5e4] text-[#032622] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


    </div>
  );
};

export default AgendaComponent;
