import { MessageCircle, Bell } from "lucide-react";
import Image from "next/image";

const heroImage = "/img/BANEDIFICE.png";

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

const upcomingEvents = [
  { 
    id: "event-1", 
    title: "MASTERCLASS AVEC ALBAN CLOCHET",
    badge: "MASTERCLASS",
    description: "Alban chez Wikipédia partage son expérience terrain : des questions, des conseils, des décisions intelligibles. Réservé mais très précis, il saura te faire un profil média ad régiun.",
    image: "/img/bibliothequenum/Masterclass Alban.png",
    buttonText: "METTRE UN RAPPEL",
    buttonIcon: "bell"
  },
  { 
    id: "event-2", 
    title: "LOUP-GAROU PARTY",
    badge: "ÉVÉNEMENT",
    description: "Rejoins la promo pour une nuit immersive : bluff, alliances, mensonges, déductions. Ton but sera de découvrir le rôle de chacun et de coopérer à convenance !",
    image: "/img/bibliothequenum/Soiree Loup Garou.png",
    buttonText: "M'INSCRIRE",
    buttonIcon: "none"
  },
  { 
    id: "event-3", 
    title: "MASTERCLASS AVEC ARNAUD ROMOLI",
    badge: "MASTERCLASS",
    description: "Avec plus de 25 ans d'expérience Directeur Commercial et des Marques, Arnaud t'fera comment structurer une croissance, fidéliser des équipes et mener des projets de transformation.",
    image: "/img/bibliothequenum/Masterclass Romoli.png",
    buttonText: "METTRE UN RAPPEL",
    buttonIcon: "bell"
  },
];

export default function AdminVieEtudiante() {
  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-6 sm:space-y-7 md:space-y-8 overflow-x-hidden max-w-full">
      {/* Section Hero */}
      <section
        className="relative overflow-hidden border border-[#032622] bg-[#032622] text-white max-w-full"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top'
        }}
      >
        <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em]">
              MASTERCLASS
            </span>
          </div>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold uppercase leading-tight break-words"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              DU PROJET À LA RÉUSSITE
        </h1>
            <p className="text-xs sm:text-sm text-white/90 max-w-full sm:max-w-md break-words">
              Découvre les clés pour évoluer plus vite dans ton parcours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
            <button className="bg-white text-[#032622] px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-[#032622] hover:bg-white/90 active:bg-white/80 transition-colors whitespace-nowrap">
              S&apos;INSCRIRE
            </button>
            <button className="bg-[#032622] text-white px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-white hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors whitespace-nowrap">
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
      <section className="space-y-4 sm:space-y-5 md:space-y-6">
        <h2
          className="text-xl sm:text-2xl font-bold uppercase text-[#032622] break-words"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          EXPLORER LE CAMPUS
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Forum Card - Grande carte à gauche */}
          <article
            className="relative h-64 sm:h-72 md:h-80 lg:h-[380px] xl:h-[420px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[0].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-3 sm:left-4 md:left-5 lg:left-6">
              <h3
                className="text-lg sm:text-xl md:text-2xl font-bold uppercase break-words"
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
              className="relative flex-1 min-h-[160px] sm:min-h-[180px] md:min-h-[200px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[1].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-3 sm:left-4 md:left-5 lg:left-6">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-bold uppercase break-words"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {campusCards[1].title}
                </h3>
              </div>
            </article>
/* 
            {/* Actualité Card */}
            <article
              className="relative flex-1 min-h-[160px] sm:min-h-[180px] md:min-h-[200px] overflow-hidden border border-[#032622] bg-[#032622] text-white cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(rgba(3, 38, 34, 0.6), rgba(3, 38, 34, 0.3)), url(${campusCards[2].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-3 sm:left-4 md:left-5 lg:left-6">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-bold uppercase break-words"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {campusCards[2].title}
                </h3>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Section ÉVÉNEMENT À VENIR 
      <section className="space-y-3 sm:space-y-4">
        <h2
          className="text-lg sm:text-xl font-bold uppercase text-[#032622] break-words"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          ÉVÉNEMENT À VENIR
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((item) => (
            <div key={item.id} className="border border-[#032622] bg-white overflow-hidden max-w-full">
              {/* Image de l'événement 
              <div className="h-40 sm:h-44 md:h-48 relative">
                <Image 
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Badge 
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${
                    item.badge === 'MASTERCLASS' 
                      ? 'bg-[#032622] text-white' 
                      : 'bg-[#D96B6B] text-white'
                  }`}>
                    {item.badge}
                  </span>
                </div>
              </div>
              {/* Contenu de la carte 
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-[#F8F5E4]">
                <h3 
                  className="text-xs sm:text-sm font-bold uppercase text-[#032622] break-words"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {item.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#032622]/70 leading-relaxed break-words">
                  {item.description}
                </p>
                <button className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#032622] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-[#01302C] active:bg-[#012a26] transition-colors">
                  {item.buttonIcon === 'bell' && <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />}
                  <span className="break-words">{item.buttonText}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Section ÉVÉNEMENTS PASSÉS 
      <section className="space-y-3 sm:space-y-4">
        <h2
          className="text-lg sm:text-xl font-bold uppercase text-[#032622] break-words"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          ÉVÉNEMENTS PASSÉS
        </h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Replay Masterclass 
          <div className="border border-[#032622] bg-white overflow-hidden max-w-full">
            <div className="h-40 sm:h-44 md:h-48 relative">
              <Image 
                src="/img/eventvieetudiante/KEOS MORALD MASTERCLASS.png"
                alt="REPLAY MASTERCLASS : AVEC MORALD CHIBOUT"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-[#032622] text-white">
                  MASTERCLASS
                </span>
              </div>
            </div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-[#F8F5E4]">
              <h3 
                className="text-xs sm:text-sm font-bold uppercase text-[#032622] break-words"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                REPLAY MASTERCLASS : AVEC MORALD CHIBOUT
              </h3>
              <p className="text-[10px] sm:text-xs text-[#032622]/70 leading-relaxed break-words">
                Revivez la rencontre exclusive avec Morald Chibout, dirigeant inspirant, qui partage son parcours, ses enjeux, et sa vision entrepreneuriale.
              </p>
              <button className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#032622] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-[#01302C] active:bg-[#012a26] transition-colors">
                VOIR LE REPLAY
              </button>
            </div>
          </div>

          {/* Rentrée Edifice 
          <div className="border border-[#032622] bg-white overflow-hidden max-w-full">
            <div className="h-40 sm:h-44 md:h-48 relative">
              <Image 
                src="/img/eventvieetudiante/rentree-edifice-elite-society 3.png"
                alt="RENTRÉE EDIFICE SCHOOL : UNE NOUVELLE PROMOTION À BORD"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-[#D96B6B] text-white">
                  ACTUALITÉ
                </span>
              </div>
            </div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-[#F8F5E4]">
              <h3 
                className="text-xs sm:text-sm font-bold uppercase text-[#032622] break-words"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                RENTRÉE EDIFICE SCHOOL : UNE NOUVELLE PROMOTION À BORD
              </h3>
              <p className="text-[10px] sm:text-xs text-[#032622]/70 leading-relaxed break-words">
                Les futurs experts du BTP font leur entrée entre projets concrets, apprentissage sur le terrain et cohésion commune. Bienvenu à tous !
              </p>
              <button className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-[#032622] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:bg-[#01302C] active:bg-[#012a26] transition-colors">
                EN SAVOIR PLUS
              </button>
            </div>
      </div>
        </div>
      </section>

      {/* Section AVANTAGES ÉTUDIANTS 
      <section className="space-y-4 sm:space-y-5 md:space-y-6">
        <h2
          className="text-xl sm:text-2xl font-bold uppercase text-[#032622] break-words"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          AVANTAGES ÉTUDIANTS
        </h2>
        <div className="relative overflow-x-hidden w-full max-w-full carousel-container">
          <div className="flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-scroll" style={{ willChange: 'transform' }}>
            {/* EN VOITURE 
            <a href="https://www.envoituresimone.com/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] xl:w-[580px] max-w-[90vw]">
              <div className="relative w-full aspect-[580/310] overflow-hidden">
                <Image 
                  src="/img/avantageetudiants/EN VOITURE.png"
                  alt="PASSE TON PERMIS À TON RYTHME"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 420px, (max-width: 1280px) 500px, 580px"
                />
              </div>
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-1/3 right-0 flex flex-col items-start justify-center px-2 sm:px-3 md:px-4 lg:px-6 text-left">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase mb-0.5 sm:mb-1 break-words" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  PASSE TON PERMIS À TON RYTHME
                </h3>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] leading-relaxed max-w-[160px] sm:max-w-[200px] md:max-w-[240px] break-words">
                  Profite d'une auto-école en ligne moderne et accessible. Avec En Voiture Simone, révise, conduis et réussis ton permis sans stress.
                </p>
              </div>
            </a>

            {/* NEXITY 
            <a href="https://www.nexity.fr/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] xl:w-[580px] max-w-[90vw]">
              <div className="relative w-full aspect-[580/310] overflow-hidden">
                <Image 
                  src="/img/avantageetudiants/NEXITY.png"
                  alt="TROUVE TON LOGEMENT FACILEMENT"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 420px, (max-width: 1280px) 500px, 580px"
                />
              </div>
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-1/3 right-0 flex flex-col items-start justify-center px-2 sm:px-3 md:px-4 lg:px-6 text-left">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase mb-0.5 sm:mb-1 break-words" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  TROUVE TON LOGEMENT FACILEMENT
                </h3>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] leading-relaxed max-w-[160px] sm:max-w-[200px] md:max-w-[240px] break-words">
                  Grâce à notre partenaire Nexity, accède à des offres de logements étudiants adaptées à ton profil et à ta ville de formation.
                </p>
              </div>
            </a>

            {/* STATUT FR 
            <a href="https://statut-francais.com/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] xl:w-[580px] max-w-[90vw]">
              <div className="relative w-full aspect-[580/310] overflow-hidden">
                <Image 
                  src="/img/avantageetudiants/Statut FR.png"
                  alt="STATUT FRANÇAIS"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 420px, (max-width: 1280px) 500px, 580px"
                />
              </div>
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-1/3 right-0 flex flex-col items-start justify-center px-2 sm:px-3 md:px-4 lg:px-6 text-left">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase mb-0.5 sm:mb-1 break-words" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  TON ACCOMPAGNEMENT ADMINISTRATIF SIMPLIFIÉ
                </h3>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] leading-relaxed max-w-[160px] sm:max-w-[200px] md:max-w-[240px] break-words">
                  Besoin d'aide pour ton titre de séjour ou ta naturalisation ? Statut Français t'accompagne à chaque étape, avec clarté et bienveillance.
                </p>
              </div>
            </a>

            {/* STUDEFI 
            <a href="https://www.studefi.fr/main.php" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] xl:w-[580px] max-w-[90vw]">
              <div className="relative w-full aspect-[580/310] overflow-hidden">
                <Image 
                  src="/img/avantageetudiants/Studefi.png"
                  alt="STUDEFI"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 420px, (max-width: 1280px) 500px, 580px"
                />
              </div>
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-1/3 right-0 flex flex-col items-start justify-center px-2 sm:px-3 md:px-4 lg:px-6 text-left">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase mb-0.5 sm:mb-1 break-words" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  LOGEMENT ÉTUDIANT, SIMPLE ET PROCHE
                </h3>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] leading-relaxed max-w-[160px] sm:max-w-[200px] md:max-w-[240px] break-words">
                  Studefi propose des résidences étudiantes en Île-de-France : studios fonctionnels, loyers maîtrisés, services et régisseur sur place.
                </p>
              </div>
            </a>

            {/* Duplication pour défilement continu 
            <a href="https://www.envoituresimone.com/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] xl:w-[580px] max-w-[90vw]">
              <div className="relative w-full aspect-[580/310] overflow-hidden">
                <Image 
                  src="/img/avantageetudiants/EN VOITURE.png"
                  alt="PASSE TON PERMIS À TON RYTHME"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 420px, (max-width: 1280px) 500px, 580px"
                />
              </div>
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-1/3 right-0 flex flex-col items-start justify-center px-2 sm:px-3 md:px-4 lg:px-6 text-left">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase mb-0.5 sm:mb-1 break-words" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  PASSE TON PERMIS À TON RYTHME
                </h3>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] leading-relaxed max-w-[160px] sm:max-w-[200px] md:max-w-[240px] break-words">
                  Profite d'une auto-école en ligne moderne et accessible. Avec En Voiture Simone, révise, conduis et réussis ton permis sans stress.
                </p>
              </div>
            </a>

            <a href="https://www.nexity.fr/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block w-[280px] sm:w-[350px] md:w-[420px] lg:w-[500px] xl:w-[580px] max-w-[90vw]">
              <div className="relative w-full aspect-[580/310] overflow-hidden">
                <Image 
                  src="/img/avantageetudiants/NEXITY.png"
                  alt="TROUVE TON LOGEMENT FACILEMENT"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 420px, (max-width: 1280px) 500px, 580px"
                />
              </div>
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 left-1/3 right-0 flex flex-col items-start justify-center px-2 sm:px-3 md:px-4 lg:px-6 text-left">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase mb-0.5 sm:mb-1 break-words" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  TROUVE TON LOGEMENT FACILEMENT
                </h3>
                <p className="text-[7px] sm:text-[8px] md:text-[9px] leading-relaxed max-w-[160px] sm:max-w-[200px] md:max-w-[240px] break-words">
                  Grâce à notre partenaire Nexity, accède à des offres de logements étudiants adaptées à ton profil et à ta ville de formation.
                </p>
              </div>
            </a>
      </div>
        </div>
      </section>

      {/* Bouton flottant messagerie 
      <button
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#032622] text-white rounded shadow-lg flex items-center justify-center z-50"
        aria-label="Ouvrir la messagerie"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
       */}
    </div>
  );
}