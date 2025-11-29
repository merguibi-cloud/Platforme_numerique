"use client";
import { useState } from 'react';

type ViewType = 'today' | 'week' | 'month';

export default function AgendaPage() {
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [currentDate] = useState(new Date());

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
      </div>
    </div>
  );
}


