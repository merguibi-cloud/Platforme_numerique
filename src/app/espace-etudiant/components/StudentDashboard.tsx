"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export const StudentDashboard = () => {
  const [progress] = useState(10);
  const [activitiesProgress] = useState(10);
  const [competences] = useState({ current: 2, total: 19 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-défilement du carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Données des slides
  const slides = [
    {
      title: "EXCELLENT PROGRÈS!",
      subtitle: `Vous avez terminé ${progress}% du Module 1`,
      buttonText: "CONTINUER",
      icon: "📚",
      color: "bg-[#032622]"
    },
    {
      title: "PROCHAINE ÉCHÉANCE",
      subtitle: "Devoir Bloc 2 - 18 octobre 2025",
      buttonText: "PRÉPARER",
      icon: "⏰",
      color: "bg-[#D96B6B]"
    },
    {
      title: "RENDEZ-VOUS TUTEUR",
      subtitle: "Visio tuteur - 15 octobre 2025 à 09h00",
      buttonText: "REJOINDRE",
      icon: "👨‍🏫",
      color: "bg-[#4CAF50]"
    }
  ];

  return (
    <div className="space-y-6 bg-[#F8F5E4] min-h-screen p-6">
      {/* En-tête avec notifications */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 
            className="text-4xl font-bold text-[#032622] mb-2"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            BONJOUR, CHADI EL ASSOWAD
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-[#032622] hover:bg-gray-100 rounded-full">
            <Image 
              src="/menue_etudiant/nonselectionner/Enregistrer.png" 
              alt="Enregistrer" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </button>
          
          <button className="p-2 text-[#032622] hover:bg-gray-100 rounded-full">
            <Image 
              src="/menue_etudiant/nonselectionner/Clocheverte.png" 
              alt="Notifications" 
              width={24} 
              height={24}
              className="w-6 h-6"
            />
          </button>
          
          <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-3 border-[#032622] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Image
                    src="/images/student-library/IMG_1719 2.PNG"
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Indicateur de statut en ligne */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#F8F5E4] rounded-full animate-pulse"></div>
              </div>
              <span className="text-[#032622] font-medium">Chadi El Assowad</span>
              <svg 
                className={`w-4 h-4 text-[#032622] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mes documents</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Se déconnecter</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel de progression avec 3 slides */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className={`w-full ${slide.color} text-white p-6 rounded-lg flex-shrink-0`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">{slide.icon}</span>
                  </div>
                  <div>
                    <h2 
                      className="text-xl font-bold mb-2"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {slide.title}
                    </h2>
                    <p className="text-sm opacity-90">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (index === 0) router.push('/espace-etudiant/mes-formations');
                    else if (index === 1) router.push('/espace-etudiant/mes-formations');
                    else router.push('/espace-etudiant/agenda');
                  }}
                  className="bg-white text-[#032622] px-6 py-3 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicateurs de progression */}
        <div className="flex justify-center space-x-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-8 h-1 rounded transition-all duration-300 ${
                index === currentSlide ? 'bg-[#032622]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contenu principal en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section gauche - Activités */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte d'activités */}
          <div className="bg-[#F8F5E4] border border-black">
            {/* En-tête avec titre et pourcentage */}
            <div className="flex justify-between items-center p-6">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS
              </h3>
              <span className="text-2xl font-bold text-[#032622]">{activitiesProgress}%</span>
            </div>
            
            {/* Barre de progression */}
            <div className="px-6 pb-4">
              <div className="w-full bg-gray-300 h-2">
                <div 
                  className="bg-[#032622] h-2 transition-all duration-300"
                  style={{ width: `${activitiesProgress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Section avec informations */}
            <div className="px-6 py-4 border-b border-black">
              {/* Informations en ligne */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-12">
                  <div>
                    <div className="text-4xl font-bold text-[#032622] mb-1">5H</div>
                    <div className="text-sm text-[#032622]">Temps total</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-[#032622] mb-1">{competences.current}/{competences.total}</div>
                    <div className="text-sm text-[#032622]">Blocs de compétences</div>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/espace-etudiant/mes-formations')}
                  className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  REPRENDRE
                </button>
              </div>
            </div>
            
            {/* Contenu principal - Graphiques côte à côte */}
            <div className="grid grid-cols-2 gap-0">
              {/* Section gauche - Légende et diagramme circulaire */}
              <div className="p-6 border-r border-black flex flex-col justify-between">
                {/* Légende */}
                <div className="flex justify-start mb-4">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-[#032622]"></div>
                      <span className="text-[#032622]">Cours lus</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-[#6b7280]"></div>
                      <span className="text-[#032622]">Quiz complétés</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-[#d1d5db]"></div>
                      <span className="text-[#032622]">Vidéos vues</span>
                    </div>
                  </div>
                </div>
                
                {/* Diagramme circulaire */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Cercle de fond beige */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#F8F5E4"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Cercle gris clair */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#d1d5db"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30 * 0.25}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * 0.75}`}
                      />
                      {/* Cercle gris moyen */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#6b7280"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30 * 0.35}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * 0.40}`}
                      />
                      {/* Cercle vert foncé */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#032622"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 30 * 0.40}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * 0}`}
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Section droite - Graphique en barres */}
              <div className="p-6 flex flex-col justify-between">
                <div className="text-sm text-[#032622]">Activité hebdomadaire</div>
                <div className="flex items-end justify-center h-16 space-x-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-[#032622] w-6"
                        style={{ height: `${[40, 25, 45, 60, 65, 50, 20][index]}px` }}
                      ></div>
                      <span className="text-xs text-[#032622] mt-2 font-medium">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carte Agenda */}
          <div className="bg-[#F8F5E4] p-6 border border-black">
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                AGENDA
              </h3>
              <button className="text-[#032622] text-sm font-medium">TOUT VOIR</button>
            </div>
            <div className="border-t border-black my-4"></div>
            <div className="space-y-3">
              <div className="text-[#032622] font-medium">VISIO-CONFÉRENCE AVEC LE RÉFÉRENT</div>
              <div className="text-sm text-[#032622]">Lundi 22 Janvier - 14h00</div>
              <button 
                className="bg-[#032622] text-white px-4 py-2 font-bold rounded-lg hover:bg-[#044a3a] transition-colors text-sm"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                REJOINDRE
              </button>
            </div>
          </div>

          {/* Carte Vie Étudiante */}
          <div className="bg-[#F8F5E4] p-6 border border-black">
            <div className="flex justify-between items-center mb-4">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                VIE ÉTUDIANTE
              </h3>
              <button className="text-[#032622] text-sm font-medium">TOUT VOIR</button>
            </div>
            <div className="border-t border-black my-4"></div>
            <div className="space-y-3">
              <div className="text-[#032622] font-medium">RENTRÉE D'INTÉGRATION</div>
              <div className="text-sm text-[#032622]">Mercredi 16 Février - 16h30</div>
              <button 
                className="bg-[#032622] text-white px-4 py-2 font-bold rounded-lg hover:bg-[#044a3a] transition-colors text-sm"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                S'INSCRIRE
              </button>
            </div>
          </div>
        </div>

        {/* Section droite - Profil et notes */}
        <div className="space-y-6">
          {/* Carte de profil - Design ultra moderne */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#F8F5E4] via-[#f0ebd8] to-[#eae5cf] rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 group border border-[#032622]/10">
            {/* Effet de brillance premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-[#032622]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Motif décoratif en arrière-plan */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#032622]/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#032622]/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Contenu principal */}
            <div className="relative p-8 text-center">
              {/* Photo de profil avec design premium amélioré */}
              <div className="relative mb-8">
                {/* Conteneur principal pour la photo */}
                <div className="w-48 h-48 mx-auto relative">
                  {/* Ombre portée multiple */}
                  <div className="absolute inset-0 rounded-full bg-[#032622]/15 blur-xl scale-125"></div>
                  <div className="absolute inset-0 rounded-full bg-[#032622]/10 blur-lg scale-115"></div>
                  
                  {/* Cercle principal avec bordure premium */}
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                    <Image
                      src="/images/student-library/IMG_1719 2.PNG"
                      alt="Photo de profil"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover object-center scale-110 transition-transform duration-700 group-hover:scale-100"
                      style={{ objectPosition: 'center top' }}
                    />
                  </div>
                  
                  {/* Bordures décoratives multiples */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#032622]/20 scale-105"></div>
                  <div className="absolute inset-0 rounded-full border border-white/50 scale-110"></div>
                  
                  {/* Effet de halo */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
                
                {/* Badge de statut ultra moderne */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#032622] via-[#01302C] to-[#032622] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md border border-white/30">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                      <span className="tracking-wider">ACTIF</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informations du profil avec design amélioré */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#032622] tracking-wide" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                    CHADI EL ASSOWAD
                  </h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#032622] to-transparent mx-auto"></div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-2 h-2 bg-[#032622] rounded-full animate-pulse"></div>
                  <span className="text-sm text-[#032622]/80 font-semibold tracking-wide uppercase">ÉTUDIANT</span>
                  <div className="w-2 h-2 bg-[#032622] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                
                {/* Indicateurs de statut cohérents */}
                <div className="flex items-center justify-center space-x-4 pt-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#032622]/60 font-medium">En ligne</span>
                  </div>
                  <div className="w-1 h-1 bg-[#032622]/30 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#032622]/60 font-medium">Connecté</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Effet de bordure animée premium */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-[#032622] via-transparent to-[#032622] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </div>

          {/* Carte des notes */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="p-4 border-b border-black">
              <h3 
                className="text-lg font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                MES DERNIERS RENDUS
              </h3>
            </div>
            
            <div className="bg-[#032622] border-b border-black">
              <div className="flex">
                <div className="flex-1 p-4 border-r border-[#F8F5E4]">
                  <div className="text-xs text-white mb-1">Bloc 1-Module 1</div>
                  <div className="text-sm font-bold text-white">Quizz</div>
                </div>
                <div className="w-20 p-4 flex items-center justify-center bg-[#F8F5E4]">
                  <span className="text-2xl font-bold text-[#032622]">9,5</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#032622]">
              <div className="flex">
                <div className="flex-1 p-4 border-r border-[#F8F5E4]">
                  <div className="text-xs text-white mb-1">Bloc 1</div>
                  <div className="text-sm font-bold text-white">Etude de cas</div>
                </div>
                <div className="w-20 p-4 flex items-center justify-center bg-[#F8F5E4]">
                  <span className="text-2xl font-bold text-[#032622]">13</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <button className="text-[#032622] text-sm font-bold flex items-center">
                VOIR TOUTES LES NOTES
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Carte de contact */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="flex h-32">
              <div className="w-32 border-r border-black flex items-center justify-center bg-[#F8F5E4]">
                {/* Photo du référent */}
                <div className="w-full h-full">
                  <Image
                    src="/menue_etudiant/DSC05507.JPG"
                    alt="Référent Pédagogique"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 bg-[#032622] p-4 flex flex-col justify-center">
                <div className="text-white text-xs font-bold mb-1">CONTACTER LE</div>
                <div className="text-white text-sm font-bold mb-4">RÉFÉRENT PÉDAGOGIQUE</div>
                <button 
                  className="bg-white text-[#032622] px-6 py-2 font-bold text-sm border border-black"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  CONTACTER
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


