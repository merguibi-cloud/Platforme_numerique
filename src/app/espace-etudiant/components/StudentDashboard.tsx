"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface StudentProfile {
  nom: string;
  prenom: string;
  photo_profil_url?: string | null;
}

interface DashboardData {
  formation: {
    id: number;
    titre: string;
    ecole: string;
  } | null;
  progression: {
    pourcentage: number;
    chapitresLus: number;
    chapitresTotal: number;
    quizCompletes: number;
    quizTotal: number;
    etudeCasSoumises: number;
    etudeCasTotal: number;
  };
  statistiques: {
    chapitresLus: number;
    quizCompletes: number;
    etudeCasSoumises: number;
    chapitresRestants: number;
    quizRestants: number;
    etudeCasRestantes: number;
    pourcentageChapitres: number;
    pourcentageQuiz: number;
    pourcentageEtudeCas: number;
  };
  activite: {
    tempsTotalHeures: number;
    tempsTotalSessionsHeures: number;
    activiteHebdomadaire: Array<{
      jour: string;
      heures: number;
      minutes: number;
    }>;
  };
  aCommence: boolean;
  dernieresNotes: Array<{
    id: string;
    note: number;
    noteMax: number;
    type: string;
    date: string;
    titre: string;
    bloc: string;
    cours: string | null;
  }>;
  competences: {
    current: number;
    total: number;
  };
}

export const StudentDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger le profil et les données du dashboard
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger le profil
        const profileResponse = await fetch('/api/espace-etudiant/profile', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.profile) {
            setProfile(profileData.profile);
          }
        }

        // Charger les données du dashboard
        const dashboardResponse = await fetch('/api/espace-etudiant/dashboard', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (dashboardResponse.ok) {
          const dashboardResult = await dashboardResponse.json();
          if (dashboardResult.success && dashboardResult.dashboard) {
            setDashboardData(dashboardResult.dashboard);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculer les valeurs pour le diagramme circulaire
  // Les cercles doivent être empilés : cours (extérieur), quiz (milieu), vidéos (intérieur)
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  
  const coursPercentage = dashboardData?.statistiques.pourcentageChapitres || 0;
  const quizPercentage = dashboardData?.statistiques.pourcentageQuiz || 0;
  const etudeCasPercentage = dashboardData?.statistiques.pourcentageEtudeCas || 0;
  
  // Cours : cercle complet (extérieur)
  const coursDashArray = circumference;
  const coursDashOffset = circumference - (coursPercentage / 100) * circumference;
  
  // Quiz : commence après le cours
  const quizDashArray = circumference;
  const quizDashOffset = circumference - (quizPercentage / 100) * circumference;
  
  // Vidéos : commence après le quiz
  const etudeCasDashArray = circumference;
  const etudeCasDashOffset = circumference - (etudeCasPercentage / 100) * circumference;

  // Préparer les données pour le graphique d'activité
  const activiteData = dashboardData?.activite.activiteHebdomadaire || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#F8F5E4] min-h-screen p-6">
      {/* En-tête avec notifications */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 
            className="text-4xl font-bold text-[#032622] mb-2"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {profile ? (
              `BONJOUR, ${profile.prenom.toUpperCase()} ${profile.nom.toUpperCase()}`
            ) : (
              'BONJOUR'
            )}
          </h1>
          {dashboardData?.formation && (
            <p className="text-lg text-[#032622] font-medium">
              {dashboardData.formation.titre}
            </p>
          )}
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
          
          {profile && (
            <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.photo_profil_url && (profile.photo_profil_url.startsWith('http://') || profile.photo_profil_url.startsWith('https://')) ? (
                    <Image
                      src={profile.photo_profil_url}
                      alt="Photo de profil"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <span className="text-[#032622] font-medium" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  {profile.prenom} {profile.nom}
                </span>
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
                    <Link
                      href="/espace-etudiant/mes-documents"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Mes documents</span>
                    </Link>
                    <Link
                      href="/espace-etudiant/parametres"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Paramètres</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Carte de progression principale */}
      <div className="bg-[#032622] text-white p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#032622]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 
                className="text-xl font-bold mb-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                EXCELLENT PROGRÈS!
              </h2>
              <p className="text-sm opacity-90">
                Vous avez terminé {dashboardData?.progression.pourcentage || 0}% de votre formation
              </p>
            </div>
          </div>
          <button 
            className="bg-white text-[#032622] px-6 py-3 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CONTINUER
          </button>
        </div>
        {/* Indicateurs de progression */}
        <div className="flex space-x-1 mt-4">
          <div className="w-8 h-1 bg-white rounded"></div>
          <div className={`w-8 h-1 rounded ${(dashboardData?.progression.pourcentage || 0) > 33 ? 'bg-white' : 'bg-white/30'}`}></div>
          <div className={`w-8 h-1 rounded ${(dashboardData?.progression.pourcentage || 0) > 66 ? 'bg-white' : 'bg-white/30'}`}></div>
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
              <div>
                {dashboardData?.formation && (
                <h3 
                  className="text-lg font-bold text-[#032622] mb-1"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {dashboardData.formation.titre}
                </h3>
                )}
              </div>
              <span className="text-2xl font-bold text-[#032622]">{dashboardData?.progression.pourcentage || 0}%</span>
            </div>
            
            {/* Barre de progression */}
            <div className="px-6 pb-4">
              <div className="w-full bg-gray-300 h-2">
                <div 
                  className="bg-[#032622] h-2 transition-all duration-300"
                  style={{ width: `${dashboardData?.progression.pourcentage || 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Section avec informations */}
            <div className="px-6 py-4 border-b border-black">
              {/* Informations en ligne */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-12">
                  <div>
                    <div className="text-4xl font-bold text-[#032622] mb-1">
                      {dashboardData?.activite.tempsTotalHeures || 0}H
                    </div>
                    <div className="text-sm text-[#032622]">Temps total</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-[#032622] mb-1">
                      {dashboardData?.competences.current || 0}/{dashboardData?.competences.total || 0}
                    </div>
                    <div className="text-sm text-[#032622]">Blocs de compétences</div>
                  </div>
                </div>
                <button 
                  className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {dashboardData?.aCommence ? 'REPRENDRE' : 'COMMENCER'}
                </button>
              </div>
            </div>
            
            {/* Contenu principal - Graphiques côte à côte */}
            <div className="grid grid-cols-2 gap-0">
              {/* Section gauche - Légende et diagramme circulaire */}
              <div className="p-6 border-r border-black flex flex-col justify-between">
                {/* Légende avec nombres */}
                <div className="flex justify-start mb-4">
                  <div className="flex flex-col space-y-2 text-xs">
                    <div 
                      className="flex items-center space-x-1 group cursor-pointer"
                      title={`${dashboardData?.statistiques.chapitresLus || 0} chapitres lus sur ${dashboardData?.progression.chapitresTotal || 0}`}
                    >
                      <div className="w-3 h-3 bg-[#032622]"></div>
                      <span className="text-[#032622]">
                        Chapitres lus <span className="font-bold">({dashboardData?.statistiques.chapitresLus || 0})</span>
                      </span>
                    </div>
                    <div 
                      className="flex items-center space-x-1 group cursor-pointer"
                      title={`${dashboardData?.statistiques.quizCompletes || 0} quiz complétés sur ${dashboardData?.progression.quizTotal || 0}`}
                    >
                      <div className="w-3 h-3 bg-[#6b7280]"></div>
                      <span className="text-[#032622]">
                        Quiz complétés <span className="font-bold">({dashboardData?.statistiques.quizCompletes || 0})</span>
                      </span>
                    </div>
                    <div 
                      className="flex items-center space-x-1 group cursor-pointer"
                      title={`${dashboardData?.statistiques.etudeCasSoumises || 0} études de cas soumises sur ${dashboardData?.progression.etudeCasTotal || 0}`}
                    >
                      <div className="w-3 h-3 bg-[#5AA469]"></div>
                      <span className="text-[#032622]">
                        Études de cas <span className="font-bold">({dashboardData?.statistiques.etudeCasSoumises || 0})</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Diagramme circulaire avec tooltips */}
                <div className="flex justify-center relative">
                  <div className="relative w-32 h-32 group">
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
                      {/* Cercle chapitres (vert foncé) - extérieur, le plus épais */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#032622"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={coursDashArray}
                        strokeDashoffset={coursDashOffset}
                        strokeLinecap="round"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      {/* Cercle quiz (gris moyen) - milieu */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#6b7280"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={quizDashArray}
                        strokeDashoffset={quizDashOffset}
                        strokeLinecap="round"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      {/* Cercle études de cas (vert clair) - intérieur */}
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        stroke="#5AA469"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={etudeCasDashArray}
                        strokeDashoffset={etudeCasDashOffset}
                        strokeLinecap="round"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </svg>
                    {/* Tooltip au survol */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#032622] text-white px-3 py-1 rounded text-xs font-bold whitespace-nowrap">
                        {dashboardData?.statistiques.chapitresLus || 0} chapitres | {dashboardData?.statistiques.quizCompletes || 0} quiz | {dashboardData?.statistiques.etudeCasSoumises || 0} études de cas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section droite - Graphique en barres */}
              <div className="p-6 flex flex-col justify-between">
                <div className="text-sm text-[#032622] mb-4">Activité hebdomadaire</div>
                {activiteData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={activiteData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <XAxis 
                        dataKey="jour" 
                        tick={{ fontSize: 11, fill: '#032622', fontWeight: 'bold' }}
                        axisLine={{ stroke: '#032622', strokeWidth: 1 }}
                        tickLine={{ stroke: '#032622' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#032622' }}
                        axisLine={{ stroke: '#032622', strokeWidth: 1 }}
                        tickLine={{ stroke: '#032622' }}
                        width={35}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#F8F5E4', 
                          border: '1px solid #032622',
                          borderRadius: '4px',
                          padding: '8px 12px'
                        }}
                        labelStyle={{ color: '#032622', fontWeight: 'bold', marginBottom: '4px' }}
                        formatter={(value: number, name: string, props: any) => {
                          const minutes = props.payload.minutes || 0;
                          if (minutes === 0) {
                            return ['0 min', 'Temps'];
                          }
                          const heures = Math.floor(minutes / 60);
                          const mins = minutes % 60;
                          if (heures > 0 && mins > 0) {
                            return [`${heures}h ${mins}min`, 'Temps'];
                          } else if (heures > 0) {
                            return [`${heures}h`, 'Temps'];
                          } else {
                            return [`${mins}min`, 'Temps'];
                          }
                        }}
                      />
                      <Bar 
                        dataKey="heures" 
                        fill="#032622"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-end justify-center h-16 space-x-2">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="bg-[#032622] w-6 h-0"></div>
                        <span className="text-xs text-[#032622] mt-2 font-medium">{day}</span>
                      </div>
                    ))}
                  </div>
                )}
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
          {/* Carte de profil */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="p-8 text-center">
              <div className="w-40 h-40 border border-black mx-auto mb-6 flex items-center justify-center overflow-hidden bg-[#F8F5E4]">
                {profile?.photo_profil_url && (profile.photo_profil_url.startsWith('http://') || profile.photo_profil_url.startsWith('https://')) ? (
                  <Image
                    src={profile.photo_profil_url}
                    alt="Photo de profil"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-24 h-24 text-[#032622]" />
                )}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 bg-[#032622] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#F8F5E4]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                </div>
                <span className="text-[#032622] text-lg font-bold">Marathonien</span>
              </div>
            </div>
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
            
            {dashboardData?.dernieresNotes && dashboardData.dernieresNotes.length > 0 ? (
              dashboardData.dernieresNotes.map((note, index) => (
                <div key={note.id} className={`bg-[#032622] ${index < dashboardData.dernieresNotes.length - 1 ? 'border-b border-[#F8F5E4]' : ''}`}>
                  <div className="flex">
                    <div className="flex-1 p-4 border-r border-[#F8F5E4]">
                      <div className="text-xs text-white mb-1">{note.bloc}{note.cours ? ` - ${note.cours}` : ''}</div>
                      <div className="text-sm font-bold text-white">{note.titre}</div>
                    </div>
                    <div className="w-20 p-4 flex items-center justify-center bg-[#F8F5E4]">
                      <span className="text-2xl font-bold text-[#032622]">{note.note.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[#032622] text-sm">
                Aucune note disponible
              </div>
            )}
            
            <div className="p-4">
              <Link 
                href="/espace-etudiant/releve-notes"
                className="text-[#032622] text-sm font-bold flex items-center hover:underline"
              >
                VOIR TOUTES LES NOTES
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Carte de contact */}
          <div className="bg-[#F8F5E4] border border-black">
            <div className="flex h-32">
              <div className="w-32 border-r border-black flex items-center justify-center bg-[#F8F5E4]">
                {/* Placeholder pour photo du référent */}
                <div className="w-24 h-24 bg-gray-300 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-600" />
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
