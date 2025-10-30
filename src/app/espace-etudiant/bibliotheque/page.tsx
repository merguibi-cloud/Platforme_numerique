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
    <div className="relative space-y-8 p-6">
      {/* Section Hero */}
      <section
        className="relative overflow-hidden border border-[#032622] bg-[#032622] text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.7), rgba(3, 38, 34, 0.4)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">
              MASTERCLASS
            </span>
          </div>
          <div className="space-y-4">
            <h1
              className="text-3xl font-bold uppercase leading-tight"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DU PROJET À LA RÉUSSITE
            </h1>
            <p className="text-sm text-white/90 max-w-md">
              Découvre les clés pour évoluer plus vite dans ton parcours.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="bg-white text-[#032622] px-6 py-2 text-xs font-semibold uppercase tracking-widest border border-[#032622]">
              S&apos;INSCRIRE
            </button>
            <button className="bg-[#032622] text-white px-6 py-2 text-xs font-semibold uppercase tracking-widest border border-white">
              EN SAVOIR PLUS
            </button>
          </div>
          {/* Indicateurs de carrousel */}
          <div className="flex gap-2 mt-6">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Section Explorer le campus */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold uppercase text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          EXPLORER LE CAMPUS
        </h2>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Forum Card - Grande carte à gauche */}
          <article
            className="relative h-80 lg:h-[420px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[0].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-6 left-6">
              <h3
                className="text-2xl font-bold uppercase"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                {campusCards[0].title}
              </h3>
            </div>
          </article>

          {/* Colonne droite avec deux cartes empilées */}
          <div className="flex flex-col gap-4">
            {/* Événements Card */}
            <article
              className="relative flex-1 min-h-[200px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[1].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-6 left-6">
                <h3
                  className="text-2xl font-bold uppercase"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {campusCards[1].title}
                </h3>
              </div>
            </article>

            {/* Actualité Card */}
            <article
              className="relative flex-1 min-h-[200px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[2].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-6 left-6">
                <h3
                  className="text-2xl font-bold uppercase"
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
      <section className="space-y-4">
        <h2
          className="text-xl font-bold uppercase text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          À VENIR CETTE SEMAINE
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {weeklyHighlights.map((item) => (
            <div key={item.id} className="border border-[#032622] bg-white">
              <div className="h-32 bg-[#032622]"></div>
              <div className="p-4 bg-gray-100">
                <h3 className="text-sm font-semibold text-[#032622]">{item.title}</h3>
                <p className="text-xs text-[#032622]/70">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section TOUS LES ÉVÉNEMENTS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-bold uppercase text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            TOUS LES ÉVÉNEMENTS
          </h2>
        </div>

        {/* Barre de filtres */}
        <div className="bg-[#F8F5E4] border border-[#032622] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Recherche */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#032622]/50" />
              <input
                type="text"
                placeholder="RECHERCHER UN ÉVÉNEMENT"
                className="w-full pl-10 pr-4 py-3 border border-[#032622] bg-white text-xs placeholder-[#032622]/50 font-semibold uppercase focus:outline-none focus:border-[#032622]"
              />
            </div>

            {/* Type d'événement */}
            <select className="px-4 py-3 border border-[#032622] bg-white text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:border-[#032622] cursor-pointer">
              <option>TYPE D&apos;ÉVÉNEMENT ▾</option>
              <option>Masterclass</option>
              <option>Atelier</option>
              <option>Conférence</option>
            </select>

            {/* École */}
            <select className="px-4 py-3 border border-[#032622] bg-white text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:border-[#032622] cursor-pointer">
              <option>ÉCOLE ▾</option>
              <option>Leader Society</option>
              <option>KEOS Business School</option>
              <option>Finance Society</option>
            </select>

            {/* Période */}
            <select className="px-4 py-3 border border-[#032622] bg-white text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:border-[#032622] cursor-pointer">
              <option>PÉRIODE ▾</option>
              <option>Aujourd&apos;hui</option>
              <option>Cette semaine</option>
              <option>Ce mois-ci</option>
            </select>

            {/* Statut */}
            <select className="px-4 py-3 border border-[#032622] bg-white text-xs font-semibold uppercase text-[#032622]/70 focus:outline-none focus:border-[#032622] cursor-pointer">
              <option>STATUT ▾</option>
              <option>À venir</option>
              <option>En cours</option>
              <option>Terminé</option>
            </select>
          </div>

          {/* Bouton Filtres avancés */}
          <div className="mt-4 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#032622] text-white text-xs font-semibold uppercase tracking-widest">
              <Filter className="w-4 h-4" />
              FILTRES AVANCÉS
            </button>
        </div>
      </div>
      </section>

      {/* Bouton flottant messagerie */}
      <button
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#032622] text-white rounded shadow-lg flex items-center justify-center z-50"
        aria-label="Ouvrir la messagerie"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}