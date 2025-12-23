"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, User, Mail, Calendar, Clock, MessageSquare, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import AdminTopBar from '../../components/AdminTopBar';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Modal } from '@/app/Modal';

interface EtudiantDetails {
  id: string;
  user_id: string;
  id_etudiant: string;
  nom: string;
  prenom: string;
  name: string;
  email: string;
  photo_url: string;
  statut: string;
  formation: {
    id: number;
    titre: string;
    ecole: string;
  } | null;
  formation_titre: string;
  progression: number;
  temps_total: string;
  blocs_completes: number;
  blocs_totaux: number;
  quiz_passes: number;
  derniere_connexion: string | null;
  membre_depuis: string;
  derniere_connexion_globale: string | null;
  temps_global: string;
  dernieresNotes: Array<{
    bloc: string;
    bloc_id: number;
    note1: string;
    note2: string;
    temps: string;
  }>;
  tempsConnexionData: Array<{
    jour: string;
    temps: number;
  }>;
  joursEntreprise: number[];
  signalements: Array<{
    id: string;
    type_signalement: string;
    description: string;
    statut: string;
    created_at: string;
  }>;
}

export default function EtudiantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [etudiantData, setEtudiantData] = useState<EtudiantDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/admin/etudiants/${id}/details`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setEtudiantData(result.data);
        } else {
          console.error('Erreur lors du chargement des données:', result.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const joursSemaine = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  
  // Générer le calendrier pour le mois actuel
  const genererCalendrier = () => {
    const maintenant = new Date();
    const mois = maintenant.getMonth();
    const annee = maintenant.getFullYear();
    
    // Premier jour du mois
    const premierJour = new Date(annee, mois, 1);
    const jourSemainePremier = premierJour.getDay() === 0 ? 6 : premierJour.getDay() - 1; // L = 0
    
    // Dernier jour du mois précédent
    const dernierJourMoisPrecedent = new Date(annee, mois, 0);
    const joursMoisPrecedent = dernierJourMoisPrecedent.getDate();
    
    // Dernier jour du mois actuel
    const dernierJourMoisActuel = new Date(annee, mois + 1, 0);
    const joursMoisActuel = dernierJourMoisActuel.getDate();
    
    const calendrierDates = [];
    
    // Jours du mois précédent
    for (let i = jourSemainePremier - 1; i >= 0; i--) {
      const jour = joursMoisPrecedent - i;
      calendrierDates.push({ jour, mois: 'precedent', type: 'autre' });
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= joursMoisActuel; i++) {
      calendrierDates.push({ jour: i, mois: 'actuel', type: 'actuel' });
    }
    
    // Jours du mois suivant pour compléter la grille (jusqu'à 35 cases)
    const joursRestants = 35 - calendrierDates.length;
    for (let i = 1; i <= joursRestants; i++) {
      calendrierDates.push({ jour: i, mois: 'suivant', type: 'autre' });
    }
    
    return calendrierDates;
  };
  
  const calendrierDates = genererCalendrier();
  const aujourdhui = new Date().getDate();
  
  // Récupérer les jours en entreprise depuis les données
  const joursEntreprise = etudiantData?.joursEntreprise || [];
  
  // Dates avec points (pour l'instant, on peut les récupérer depuis l'agenda si nécessaire)
  const datesAvecPoints: Record<number, { couleur: string; position: string }> = {};

  // Utiliser les données de temps de connexion depuis l'API
  const tempsConnexionData = etudiantData?.tempsConnexionData || [];

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!etudiantData) {
    return (
      <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-sm sm:text-base text-[#032622]">Étudiant non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] min-h-screen">
      <AdminTopBar notificationCount={1} className="mb-4 sm:mb-5 md:mb-6" />

      {/* Bouton retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-1.5 sm:space-x-2 text-[#032622] hover:underline active:text-[#032622]/80 mb-4 sm:mb-5 md:mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm md:text-base font-semibold">Retour</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {/* Colonne principale (2/3) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Header du profil */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#87CEEB] text-[#032622] text-[10px] sm:text-xs font-semibold uppercase">
                  ÉTUDIANT
                </span>
                <span className="text-xs sm:text-sm text-[#032622] font-semibold">
                  #{etudiantData.id_etudiant}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Image
                  src="/flag-icon.png"
                  alt="Flag"
                  width={20}
                  height={20}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
              </div>
            </div>
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] mb-1 sm:mb-2 break-words"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              PROFIL DE {etudiantData.prenom.toUpperCase()} {etudiantData.nom.toUpperCase()}
            </h1>
            <p className="text-xs sm:text-sm text-[#032622]/70 break-words">
              DERNIÈRE CONNEXION A LA FORMATION: {etudiantData.derniere_connexion || 'Jamais'}
            </p>
          </div>

          {/* Statistiques */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6">
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-xs sm:text-sm font-semibold text-[#032622] truncate flex-1 min-w-0 pr-2">
                  {etudiantData.formation_titre}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#032622] whitespace-nowrap">
                  {etudiantData.progression}%
                </span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 sm:h-3">
                <div
                  className="bg-[#032622] h-2 sm:h-3 transition-all"
                  style={{ width: `${etudiantData.progression}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-5 md:mt-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] break-words">{etudiantData.temps_total}</div>
                <div className="text-[10px] sm:text-xs text-[#032622]/70 mt-0.5 sm:mt-1">Temps total</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622]">
                  {etudiantData.blocs_completes}/{etudiantData.blocs_totaux}
                </div>
                <div className="text-[10px] sm:text-xs text-[#032622]/70 mt-0.5 sm:mt-1">Blocs de compétences</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622]">{etudiantData.quiz_passes}</div>
                <div className="text-[10px] sm:text-xs text-[#032622]/70 mt-0.5 sm:mt-1">Quiz passés</div>
              </div>
            </div>
          </div>

          {/* Dernières notes */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6">
            <h2
              className="text-lg sm:text-xl font-bold text-[#032622] mb-3 sm:mb-4"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              DERNIÈRES NOTES
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-[#032622]">
                    <th className="px-3 sm:px-4 py-2 text-left text-[10px] sm:text-xs md:text-sm font-semibold text-[#032622] whitespace-nowrap">BLOC</th>
                    <th className="px-3 sm:px-4 py-2 text-center text-[10px] sm:text-xs md:text-sm font-semibold text-[#032622] whitespace-nowrap">NOTE 1</th>
                    <th className="px-3 sm:px-4 py-2 text-center text-[10px] sm:text-xs md:text-sm font-semibold text-[#032622] whitespace-nowrap">NOTE 2</th>
                    <th className="px-3 sm:px-4 py-2 text-center text-[10px] sm:text-xs md:text-sm font-semibold text-[#032622] whitespace-nowrap">TEMPS</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiantData.dernieresNotes.map((note, index) => (
                    <tr key={index} className="border-b border-[#032622]/20">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-[#032622] break-words">{note.bloc}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-[#032622]">{note.note1}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-[#032622]">{note.note2}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-[#032622] whitespace-nowrap">{note.temps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-[#032622] hover:underline active:text-[#032622]/80 transition-colors">
              VOIR LE RELEVÉ DE NOTE
            </button>
          </div>

          {/* Agenda optimisé */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6 overflow-x-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <h2
                className="text-lg sm:text-xl font-bold text-[#032622]"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                AGENDA
              </h2>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select className="flex-1 sm:flex-initial px-2 sm:px-3 py-1 text-xs sm:text-sm border border-[#032622] bg-[#F8F5E4] text-[#032622]">
                  <option>
                    {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </option>
                </select>
                <button className="text-xs sm:text-sm font-semibold text-[#032622] hover:underline active:text-[#032622]/80 transition-colors whitespace-nowrap">
                  TOUT VOIR
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1.5 sm:mb-2 min-w-[280px]">
              {joursSemaine.map((jour) => (
                <div key={jour} className="text-center text-[9px] sm:text-[10px] font-semibold text-[#032622] py-0.5 sm:py-1 bg-[#C9C6B4]">
                  {jour}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 min-w-[280px]">
              {calendrierDates.map((date, index) => {
                const isEntreprise = date.mois === 'actuel' && joursEntreprise.includes(date.jour);
                const isAujourdhui = date.mois === 'actuel' && date.jour === aujourdhui;
                const pointInfo = date.mois === 'actuel' ? datesAvecPoints[date.jour] : null;
                const isAutreMois = date.mois !== 'actuel';
                
                return (
                  <div
                    key={index}
                    className={`w-[24px] h-[24px] sm:w-[30px] sm:h-[30px] flex flex-col items-center justify-center text-[9px] sm:text-[10px] text-[#032622] relative ${
                      isAujourdhui
                        ? 'bg-[#032622] text-[#F8F5E4] font-semibold'
                        : isEntreprise
                        ? 'bg-[#C9C6B4]'
                        : isAutreMois
                        ? 'bg-transparent text-[#032622]/50'
                        : 'bg-transparent hover:bg-[#032622]/5'
                    }`}
                  >
                    {pointInfo && pointInfo.position === 'top' && (
                      <div className={`absolute top-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${pointInfo.couleur === 'orange' ? 'bg-orange-500' : 'bg-[#032622]'}`} />
                    )}
                    <span>{date.jour}</span>
                    {pointInfo && pointInfo.position === 'bottom' && (
                      <div className={`absolute bottom-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${pointInfo.couleur === 'orange' ? 'bg-orange-500' : 'bg-[#032622]'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 text-[9px] sm:text-[10px]">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#032622] rounded-full"></div>
                <span className="text-[#032622] whitespace-nowrap">AUJOURD'HUI</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#C9C6B4] rounded-full"></div>
                <span className="text-[#032622] whitespace-nowrap">JOUR EN ENTREPRISE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar droite (1/3) */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Section principale avec photo, infos et boutons */}
          <div className="bg-[#F8F5E4] p-4 sm:p-5 md:p-6 border border-[#032622]">
             {/* Photo de profil rectangulaire */}
             <div className="w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] max-w-xs mx-auto border border-[#032622] bg-[#C9C6B4] flex items-center justify-center mb-4 sm:mb-5 md:mb-6 overflow-hidden">
               {etudiantData.photo_url ? (
                 <Image
                   src={etudiantData.photo_url}
                   alt="Photo de profil"
                   width={192}
                   height={192}
                   className="w-full h-full object-cover"
                   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 200px, 192px"
                 />
               ) : (
                 <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[#032622]/50" />
               )}
             </div>

            {/* Informations */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 md:mb-6 text-xs sm:text-sm text-[#032622]">
              <p className="break-words">
                <span className="font-semibold">MEMBRE DEPUIS :</span> LE {etudiantData.membre_depuis}
              </p>
              <p className="break-words">
                <span className="font-semibold">DERNIÈRE CONNEXION :</span> LE {etudiantData.derniere_connexion_globale}
              </p>
              <p className="break-words">
                <span className="font-semibold">TEMPS GLOBAL SUR LA PLATEFORME :</span> {etudiantData.temps_global}
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <button 
                onClick={() => router.push(`/espace-admin/gestion-etudiants/${id}/informations`)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-[#F8F5E4] text-xs sm:text-sm md:text-base font-semibold hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors"
              >
                VOIR INFORMATIONS
              </button>
              <button className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-[#F8F5E4] text-xs sm:text-sm md:text-base font-semibold hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors">
                ENVOYEZ UN MESSAGE
              </button>
              <button className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-[#032622] text-[#F8F5E4] text-xs sm:text-sm md:text-base font-semibold hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors">
                PRÉVOIR UN RENDEZ-VOUS
              </button>
            </div>

            {/* Lien suspendre le compte */}
            <button className="w-full text-left text-xs sm:text-sm text-[#032622] font-semibold hover:underline active:text-[#032622]/80 transition-colors mb-3 sm:mb-4">
              SUSPENDRE L'ACCES AU COMPTE
            </button>

            {/* Bouton supprimer le compte */}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-red-600 text-white text-xs sm:text-sm md:text-base font-semibold hover:bg-red-700 active:bg-red-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'SUPPRESSION EN COURS...' : 'SUPPRIMER LE COMPTE'}
            </button>
          </div>

          {/* Temps de connexion avec recharts */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6">
            <h2
              className="text-lg sm:text-xl font-bold text-[#032622] mb-3 sm:mb-4"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              TEMPS DE CONNEXION
            </h2>
            {tempsConnexionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={tempsConnexionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
                    label={{ value: 'Heures', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#032622', fontSize: 11 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#F8F5E4', 
                      border: '1px solid #032622',
                      borderRadius: '4px',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ color: '#032622', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value: number) => [`${value.toFixed(1)}h`, 'Temps']}
                  />
                  <Bar 
                    dataKey="temps" 
                    fill="#032622"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="bg-white border border-[#032622]/30 p-6 sm:p-8 text-center text-[#032622]/50">
                <p className="text-xs sm:text-sm">Aucune donnée de connexion disponible</p>
              </div>
            )}
          </div>

          {/* Signalements */}
          <div className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6">
            <h2
              className="text-lg sm:text-xl font-bold text-[#032622] mb-3 sm:mb-4"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              SIGNALEMENTS
            </h2>
            {etudiantData.signalements && etudiantData.signalements.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {etudiantData.signalements.map((signalement) => (
                  <div key={signalement.id} className="bg-white border border-[#032622]/30 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-[#032622] break-words">{signalement.type_signalement}</span>
                      <span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 whitespace-nowrap ${
                        signalement.statut === 'ouvert' ? 'bg-red-100 text-red-800' :
                        signalement.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {signalement.statut.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#032622]/70 break-words">{signalement.description}</p>
                    <p className="text-[10px] sm:text-xs text-[#032622]/50 mt-1.5 sm:mt-2">
                      {new Date(signalement.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#032622]/30 p-6 sm:p-8 text-center text-[#032622]/50">
                <p className="text-xs sm:text-sm">Aucun signalement</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Confirmation de suppression"
        message="Êtes-vous sûr de vouloir supprimer définitivement ce compte étudiant ? Cette action est irréversible et supprimera toutes les données associées."
        type="warning"
        isConfirm={true}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            const response = await fetch(`/api/admin/etudiants/${id}`, {
              method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
              setShowDeleteModal(false);
              setShowSuccessModal(true);
              setTimeout(() => {
                router.push('/espace-admin/gestion-etudiants');
              }, 1500);
            } else {
              setErrorMessage(result.error || 'Erreur lors de la suppression');
              setShowDeleteModal(false);
              setShowErrorModal(true);
              setIsDeleting(false);
            }
          } catch (error) {
            setErrorMessage('Une erreur est survenue lors de la suppression.');
            setShowDeleteModal(false);
            setShowErrorModal(true);
            setIsDeleting(false);
          }
        }}
        onCancel={() => setShowDeleteModal(false)}
        confirmDisabled={isDeleting}
      />

      {/* Modal de succès */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Succès"
        message="Compte étudiant supprimé avec succès."
        type="success"
      />

      {/* Modal d'erreur */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
        title="Erreur"
        message={errorMessage}
        type="error"
      />
    </div>
  );
}
