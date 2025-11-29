import { ArrowRight, MessageCircle, Search, Filter } from "lucide-react";

const heroImage = "/images/student-library/Header.jpg";

const campusCards = [
  {
    id: "forum",
    title: "FORUM",
    image: "/images/student-library/Forum.jpg",
  },
  {
    id: "events",
    title: "ÉVÉNEMENTS",
    image: "/images/student-library/Actu.jpg",
  },
  {
    id: "news",
    title: "ACTUALITÉ",
    image: "/images/student-library/Actualité.jpg",
  },
];

const weeklyHighlights = [
  { id: "highlight-1", title: "Sprint Design", label: "Mardi 10h00" },
  { id: "highlight-2", title: "Club Innovation", label: "Mercredi 18h30" },
  { id: "highlight-3", title: "Coaching carrière", label: "Jeudi 14h00" },
];

export default function BibliothequePage() {
  return (
    <div className="relative space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 p-3 sm:p-4 md:p-5 lg:p-6">
      {/* Section Hero */}
      <section
        className="relative overflow-hidden border border-[#032622] bg-[#032622] text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.7), rgba(3, 38, 34, 0.4)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em]">
              MASTERCLASS
            </span>
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold uppercase leading-tight"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DU PROJET À LA RÉUSSITE
            </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-md">
              Découvre les clés pour évoluer plus vite dans ton parcours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
            <button className="bg-white text-[#032622] px-4 sm:px-5 md:px-6 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-[#032622] hover:bg-gray-100 active:bg-gray-200 transition-colors w-full sm:w-auto">
              S&apos;INSCRIRE
            </button>
            <button className="bg-[#032622] text-white px-4 sm:px-5 md:px-6 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-white hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors w-full sm:w-auto">
              EN SAVOIR PLUS
            </button>
          </div>
          {/* Indicateurs de carrousel */}
          <div className="flex gap-2 mt-4 sm:mt-5 md:mt-6">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Section Explorer le campus */}
      <section className="space-y-4 sm:space-y-5 md:space-y-6">
        <h2
          className="text-lg sm:text-xl md:text-2xl font-bold uppercase text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          EXPLORER LE CAMPUS
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Forum Card - Grande carte à gauche */}
          <article
            className="relative h-60 sm:h-72 md:h-80 lg:h-[420px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[0].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-4 sm:left-5 md:left-6">
              <h3
                className="text-lg sm:text-xl md:text-2xl font-bold uppercase"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                {campusCards[0].title}
              </h3>
            </div>
          </article>

          {/* Colonne droite avec deux cartes empilées */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Événements Card */}
            <article
              className="relative flex-1 min-h-[180px] sm:min-h-[200px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[1].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-4 sm:left-5 md:left-6">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-bold uppercase"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {campusCards[1].title}
                </h3>
              </div>
            </article>

            {/* Actualité Card */}
            <article
              className="relative flex-1 min-h-[180px] sm:min-h-[200px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[2].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-4 sm:left-5 md:left-6">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-bold uppercase"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {campusCards[2].title}
                </h3>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Section À venir cette semaine */}
      <section className="space-y-3 sm:space-y-4">
        <h2
          className="text-base sm:text-lg md:text-xl font-bold uppercase text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          À VENIR CETTE SEMAINE
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {weeklyHighlights.map((item) => (
            <div key={item.id} className="border border-[#032622] bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <div className="h-24 sm:h-28 md:h-32 bg-[#032622]"></div>
              <div className="p-3 sm:p-4 bg-gray-100">
                <h3 className="text-xs sm:text-sm font-semibold text-[#032622]">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-[#032622]/70">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section TOUS LES ÉVÉNEMENTS */}
      <section className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h2
            className="text-lg sm:text-xl md:text-2xl font-bold uppercase text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            TOUS LES ÉVÉNEMENTS
          </h2>
          <button className="bg-[#032622] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 border border-[#032622] hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors w-full sm:w-auto whitespace-nowrap">
            + CRÉER UN ÉVÉNEMENT
          </button>
        </div>

        {/* Barre de filtres */}
        <div className="bg-[#F8F5E4] border border-[#032622] p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
            {/* Recherche */}
            <div className="sm:col-span-2 lg:col-span-2 relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-[#032622]/50" />
              <input
                type="text"
                placeholder="RECHERCHER UN ÉVÉNEMENT"
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 border border-[#032622] bg-white text-[10px] sm:text-xs placeholder-[#032622]/50 font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#032622]"
              />
            </div>

            {/* Type d'événement */}
            <select className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-[#032622] bg-white text-[10px] sm:text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:ring-2 focus:ring-[#032622] cursor-pointer">
              <option>TYPE D&apos;ÉVÉNEMENT ▾</option>
              <option>Masterclass</option>
              <option>Atelier</option>
              <option>Conférence</option>
            </select>

            {/* École */}
            <select className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-[#032622] bg-white text-[10px] sm:text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:ring-2 focus:ring-[#032622] cursor-pointer">
              <option>ÉCOLE ▾</option>
              <option>Leader Society</option>
              <option>KEOS Business School</option>
              <option>Finance Society</option>
            </select>

            {/* Période */}
            <select className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-[#032622] bg-white text-[10px] sm:text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:ring-2 focus:ring-[#032622] cursor-pointer">
              <option>PÉRIODE ▾</option>
              <option>Aujourd&apos;hui</option>
              <option>Cette semaine</option>
              <option>Ce mois-ci</option>
            </select>

            {/* Statut */}
            <select className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-[#032622] bg-white text-[10px] sm:text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:ring-2 focus:ring-[#032622] cursor-pointer">
              <option>STATUT ▾</option>
              <option>À venir</option>
              <option>En cours</option>
              <option>Terminé</option>
            </select>
          </div>

          {/* Bouton Filtres avancés */}
          <div className="mt-3 sm:mt-4 flex justify-end">
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#032622] text-white text-[10px] sm:text-xs font-semibold uppercase tracking-widest hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              FILTRES AVANCÉS
            </button>
        </div>
      </div>
      </section>

      {/* Bouton flottant messagerie */}
      <button
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-[#032622] text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors"
        aria-label="Ouvrir la messagerie"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}