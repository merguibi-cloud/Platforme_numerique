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

export default function TuteurVieEtudiante() {
  return (
    <div className="p-6 space-y-8">
      {/* Section Hero */}
      <section
        className="relative overflow-hidden border border-[#032622] bg-[#032622] text-white"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'top'
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

      {/* Section ÉVÉNEMENT À VENIR */}
      <section className="space-y-4">
        <h2
          className="text-xl font-bold uppercase text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          ÉVÉNEMENT À VENIR
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {upcomingEvents.map((item) => (
            <div key={item.id} className="border border-[#032622] bg-white overflow-hidden">
              {/* Image de l'événement */}
              <div className="h-48 relative">
                <Image 
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    item.badge === 'MASTERCLASS' 
                      ? 'bg-[#032622] text-white' 
                      : 'bg-[#D96B6B] text-white'
                  }`}>
                    {item.badge}
                  </span>
                </div>
              </div>
              {/* Contenu de la carte */}
              <div className="p-4 space-y-3 bg-[#F8F5E4]">
                <h3 
                  className="text-sm font-bold uppercase text-[#032622]"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {item.title}
                </h3>
                <p className="text-xs text-[#032622]/70 leading-relaxed">
                  {item.description}
                </p>
                <button className="w-full flex items-center justify-center gap-2 bg-[#032622] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#01302C] transition-colors">
                  {item.buttonIcon === 'bell' && <Bell className="w-3 h-3" />}
                  {item.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Section ÉVÉNEMENTS PASSÉS */}
      <section className="space-y-4">
        <h2
          className="text-xl font-bold uppercase text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          ÉVÉNEMENTS PASSÉS
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Replay Masterclass */}
          <div className="border border-[#032622] bg-white overflow-hidden">
            <div className="h-48 relative">
              <Image 
                src="/img/eventvieetudiante/KEOS MORALD MASTERCLASS.png"
                alt="REPLAY MASTERCLASS : AVEC MORALD CHIBOUT"
                fill
                className="object-cover object-top"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#032622] text-white">
                  MASTERCLASS
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-[#F8F5E4]">
              <h3 
                className="text-sm font-bold uppercase text-[#032622]"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                REPLAY MASTERCLASS : AVEC MORALD CHIBOUT
              </h3>
              <p className="text-xs text-[#032622]/70 leading-relaxed">
                Revivez la rencontre exclusive avec Morald Chibout, dirigeant inspirant, qui partage son parcours, ses enjeux, et sa vision entrepreneuriale.
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-[#032622] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#01302C] transition-colors">
                VOIR LE REPLAY
              </button>
            </div>
          </div>

          {/* Rentrée Edifice */}
          <div className="border border-[#032622] bg-white overflow-hidden">
            <div className="h-48 relative">
              <Image 
                src="/img/eventvieetudiante/rentree-edifice-elite-society 3.png"
                alt="RENTRÉE EDIFICE SCHOOL : UNE NOUVELLE PROMOTION À BORD"
                fill
                className="object-cover object-top"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#D96B6B] text-white">
                  ACTUALITÉ
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-[#F8F5E4]">
              <h3 
                className="text-sm font-bold uppercase text-[#032622]"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                RENTRÉE EDIFICE SCHOOL : UNE NOUVELLE PROMOTION À BORD
              </h3>
              <p className="text-xs text-[#032622]/70 leading-relaxed">
                Les futurs experts du BTP font leur entrée entre projets concrets, apprentissage sur le terrain et cohésion commune. Bienvenu à tous !
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-[#032622] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-[#01302C] transition-colors">
                EN SAVOIR PLUS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section AVANTAGES ÉTUDIANTS */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold uppercase text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          AVANTAGES ÉTUDIANTS
        </h2>
        <div className="relative overflow-hidden">
          <div className="flex gap-6 animate-scroll">
            {/* EN VOITURE */}
            <a href="https://www.envoituresimone.com/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block">
              <Image 
                src="/img/avantageetudiants/EN VOITURE.png"
                alt="PASSE TON PERMIS À TON RYTHME"
                width={700}
                height={310}
                className="object-cover"
              />
              <div className="absolute bottom-6 left-1/3 right-0 flex flex-col items-start justify-center px-8 text-left">
                <h3 className="text-white text-sm font-bold uppercase mb-1" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  PASSE TON PERMIS À TON RYTHME
                </h3>
                <p className="text-white text-[10px] leading-relaxed max-w-md">
                  Profite d'une auto-école en ligne moderne et accessible. Avec En Voiture Simone, révise, conduis et réussis ton permis sans stress.
                </p>
              </div>
            </a>

            {/* NEXITY */}
            <a href="https://www.nexity.fr/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block">
              <Image 
                src="/img/avantageetudiants/NEXITY.png"
                alt="TROUVE TON LOGEMENT FACILEMENT"
                width={700}
                height={310}
                className="object-contain"
              />
              <div className="absolute bottom-6 left-1/3 right-0 flex flex-col items-start justify-center px-8 text-left">
                <h3 className="text-white text-sm font-bold uppercase mb-1" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  TROUVE TON LOGEMENT FACILEMENT
                </h3>
                <p className="text-white text-[10px] leading-relaxed max-w-md">
                  Grâce à notre partenaire Nexity, accède à des offres de logements étudiants adaptées à ton profil et à ta ville de formation.
                </p>
              </div>
            </a>

            {/* STATUT FR */}
            <a href="https://statut-francais.com/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block">
              <Image 
                src="/img/avantageetudiants/Statut FR.png"
                alt="STATUT FRANÇAIS"
                width={700}
                height={310}
                className="object-contain"
              />
              <div className="absolute bottom-6 left-1/3 right-0 flex flex-col items-start justify-center px-8 text-left">
                <h3 className="text-white text-sm font-bold uppercase mb-1" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  TON ACCOMPAGNEMENT ADMINISTRATIF SIMPLIFIÉ
                </h3>
                <p className="text-white text-[10px] leading-relaxed max-w-md">
                  Besoin d'aide pour ton titre de séjour ou ta naturalisation ? Statut Français t'accompagne à chaque étape, avec clarté et bienveillance.
                </p>
              </div>
            </a>

            {/* STUDEFI */}
            <a href="https://www.studefi.fr/main.php" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block">
              <Image 
                src="/img/avantageetudiants/Studefi.png"
                alt="STUDEFI"
                width={700}
                height={310}
                className="object-contain"
              />
              <div className="absolute bottom-6 left-1/3 right-0 flex flex-col items-start justify-center px-8 text-left">
                <h3 className="text-white text-sm font-bold uppercase mb-1" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  LOGEMENT ÉTUDIANT, SIMPLE ET PROCHE
                </h3>
                <p className="text-white text-[10px] leading-relaxed max-w-md">
                  Studefi propose des résidences étudiantes en Île-de-France : studios fonctionnels, loyers maîtrisés, services et régisseur sur place.
                </p>
              </div>
            </a>

            {/* Duplication pour défilement continu */}
            <a href="https://www.envoituresimone.com/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block">
              <Image 
                src="/img/avantageetudiants/EN VOITURE.png"
                alt="PASSE TON PERMIS À TON RYTHME"
                width={700}
                height={310}
                className="object-cover"
              />
              <div className="absolute bottom-6 left-1/3 right-0 flex flex-col items-start justify-center px-8 text-left">
                <h3 className="text-white text-sm font-bold uppercase mb-1" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  PASSE TON PERMIS À TON RYTHME
                </h3>
                <p className="text-white text-[10px] leading-relaxed max-w-md">
                  Profite d'une auto-école en ligne moderne et accessible. Avec En Voiture Simone, révise, conduis et réussis ton permis sans stress.
                </p>
              </div>
            </a>

            <a href="https://www.nexity.fr/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 relative block">
              <Image 
                src="/img/avantageetudiants/NEXITY.png"
                alt="TROUVE TON LOGEMENT FACILEMENT"
                width={700}
                height={310}
                className="object-contain"
              />
              <div className="absolute bottom-6 left-1/3 right-0 flex flex-col items-start justify-center px-8 text-left">
                <h3 className="text-white text-sm font-bold uppercase mb-1" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  TROUVE TON LOGEMENT FACILEMENT
                </h3>
                <p className="text-white text-[10px] leading-relaxed max-w-md">
                  Grâce à notre partenaire Nexity, accède à des offres de logements étudiants adaptées à ton profil et à ta ville de formation.
                </p>
              </div>
            </a>
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
