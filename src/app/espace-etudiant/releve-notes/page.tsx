'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, User } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { ReleveNotesPDF } from './ReleveNotesPDF';
import { Modal } from '@/app/Modal';

interface NoteDetaillee {
  type: 'quiz' | 'etude_cas';
  titre: string;
  note: number;
  note_max: number;
  date: string;
}

interface ReleveNote {
  bloc_id: number;
  numero_bloc: number;
  titre: string;
  moyenne_etudiant: number;
  moyenne_promo: number;
  meilleure_moyenne_promo: number;
  notes_detaillees?: NoteDetaillee[];
}

interface MoyennesGenerales {
  moyenne_etudiant: number;
  moyenne_promo: number;
  meilleure_moyenne_promo: number;
}

export default function ReleveNotesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [releve, setReleve] = useState<ReleveNote[]>([]);
  const [moyennesGenerales, setMoyennesGenerales] = useState<MoyennesGenerales | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  useEffect(() => {
    // Récupérer le nom de l'utilisateur
    fetch('/api/espace-etudiant/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          setUserName(`${data.profile.prenom || ''} ${data.profile.nom || ''}`.trim() || 'Étudiant');
        }
      })
      .catch(() => {
        setUserName('Étudiant');
      });

    // Récupérer le relevé de notes
    fetch('/api/espace-etudiant/releve-notes', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReleve(data.releve || []);
          setMoyennesGenerales(data.moyennes_generales || null);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement du relevé:', error);
        setIsLoading(false);
      });
  }, []);

  const formatNote = (note: number): string => {
    if (note === 0) return '0';
    // Arrondir à 1 décimale et remplacer le point par une virgule
    return note.toFixed(1).replace('.', ',');
  };

  const formatNoteQuiz = (note: number): string => {
    if (note === 0) return '0';
    // Les quiz sont toujours des nombres entiers
    return Math.round(note).toString();
  };

  const handleExportPDF = async () => {
    try {
      // Créer le document PDF avec JSX
      const doc = (
        <ReleveNotesPDF
          releve={releve}
          moyennesGenerales={moyennesGenerales}
          userName={userName}
        />
      );
      
      // Générer le blob PDF
      const blob = await pdf(doc).toBlob();
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `releve-notes-${userName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setErrorMessage('Erreur lors de la génération du PDF. Veuillez réessayer.');
      setShowErrorModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-xs sm:text-sm md:text-base text-[#032622]">Chargement du relevé de notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Header */}
      <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-1.5 sm:space-x-2 text-[#032622] hover:opacity-70 active:opacity-50 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-semibold">Retour</span>
          </button>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-xs sm:text-sm md:text-base text-[#032622] font-semibold truncate max-w-[150px] sm:max-w-none">{userName}</span>
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-6 md:py-8">
        {/* Title */}
        <h1 
          className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] uppercase mb-4 sm:mb-6 md:mb-8 text-center"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          RELEVÉ DE NOTES
        </h1>

        {/* Table */}
        <div className="bg-[#E8F5E9] border-2 sm:border-4 border-[#032622] overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-[#032622] text-[#F8F5E4]">
                <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 text-left font-bold uppercase text-[10px] sm:text-xs md:text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  BLOCS DE COMPÉTENCES
                </th>
                <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 text-center font-bold uppercase text-[10px] sm:text-xs md:text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  MOYENNE DE L'ÉTUDIANT
                </th>
                <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 text-center font-bold uppercase text-[10px] sm:text-xs md:text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  MOYENNE DE LA PROMO
                </th>
                <th className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 md:py-4 text-center font-bold uppercase text-[10px] sm:text-xs md:text-sm" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  MEILLEURE MOYENNE DE LA PROMO
                </th>
              </tr>
            </thead>
            <tbody>
              {releve.map((bloc) => (
                <React.Fragment key={bloc.bloc_id}>
                  <tr className="border-b border-[#032622]/20">
                    <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4">
                      <div className="font-bold text-xs sm:text-sm md:text-base text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                        BLOC {bloc.numero_bloc}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm text-[#032622]/80 mt-1 break-words">
                        {bloc.titre}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 text-center">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-[#032622]">
                        {formatNote(bloc.moyenne_etudiant)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 text-center">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-[#032622]">
                        {formatNote(bloc.moyenne_promo)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 text-center">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-[#032622]">
                        {formatNote(bloc.meilleure_moyenne_promo)}
                      </span>
                    </td>
                  </tr>
                  
                  {/* Notes détaillées (quiz et études de cas) */}
                  {bloc.notes_detaillees && bloc.notes_detaillees.length > 0 && (
                    <tr className="border-b border-[#032622]/10 bg-[#F8F5E4]/50">
                      <td colSpan={4} className="px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3">
                        <div className="pl-3 sm:pl-4 md:pl-6 space-y-1">
                          {bloc.notes_detaillees.map((note, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 text-[10px] sm:text-xs">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <span className="text-[#032622]/70 font-semibold min-w-[45px] sm:min-w-[50px] flex-shrink-0">
                                  {note.type === 'quiz' ? 'Quiz:' : 'Étude:'}
                                </span>
                                <span className="text-[#032622]/80 break-words">{note.titre}</span>
                              </div>
                              <span className="text-[#032622] font-bold flex-shrink-0">
                                {note.type === 'quiz' ? formatNoteQuiz(note.note) : formatNote(note.note)}/20
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {/* Ligne des moyennes générales */}
              {moyennesGenerales && (
                <tr className="bg-[#032622]/10 border-t-2 sm:border-t-4 border-[#032622] font-bold">
                  <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4">
                    <span className="text-xs sm:text-sm md:text-base text-[#032622] uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                      MOYENNES GÉNÉRALES
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 text-center">
                    <span className="text-base sm:text-lg md:text-xl text-[#032622]">
                      {formatNote(moyennesGenerales.moyenne_etudiant)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 text-center">
                    <span className="text-base sm:text-lg md:text-xl text-[#032622]">
                      {formatNote(moyennesGenerales.moyenne_promo)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 text-center">
                    <span className="text-base sm:text-lg md:text-xl text-[#032622]">
                      {formatNote(moyennesGenerales.meilleure_moyenne_promo)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <button
            onClick={handleExportPDF}
            className="bg-[#032622] text-[#F8F5E4] px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 font-bold uppercase hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors flex items-center justify-center space-x-2 text-xs sm:text-sm md:text-base w-full sm:w-auto"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>EXPORTER EN PDF</span>
          </button>
        </div>
      </div>

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

