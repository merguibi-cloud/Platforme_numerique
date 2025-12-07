'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, FileText, ChevronDown, Trash2, Eye, EyeOff } from 'lucide-react';
import { CreateModule } from './CreateModule';
import { Modal } from '@/app/Modal';

interface ModuleWithStatus {
  id: string;
  moduleName: string;
  cours: string[];
  coursDetails?: { id: string; titre: string }[];
  creationModification?: string;
  creePar?: string;
  statut: 'en_ligne' | 'brouillon' | 'manquant';
  cours_count?: number;
  cours_actifs?: number;
  ordre_affichage?: number;
  numero_module?: number;
  hasEtudeCas?: boolean;
}

interface ModuleManagementProps {
  blocTitle: string;
  blocNumber: string;
  formationTitle?: string;
  formationEcole?: string;
  modules: ModuleWithStatus[];
  formationId: string;
  blocId: string;
  onAddModule: (moduleData: { titre?: string; cours: Array<{ id?: number; titre: string }> | string[]; moduleId?: string }) => void;
  onEditModule: (moduleId: string) => void;
  onAddQuiz: (moduleId: string) => void;
  onAssignModule: (moduleId: string) => void;
  onVisualizeModule: (moduleId: string) => void;
  onEditCours: (moduleId: string, coursId?: string) => void;
  onDeleteModule: (moduleId: string, scope: 'module' | 'cours', coursId?: string) => void;
  onRefreshModules?: () => Promise<void>;
}

export const ModuleManagement = ({
  blocTitle,
  blocNumber,
  formationTitle,
  formationEcole,
  modules,
  formationId,
  blocId,
  onAddModule,
  onEditModule,
  onAddQuiz,
  onAssignModule,
  onVisualizeModule,
  onEditCours,
  onDeleteModule,
  onRefreshModules,
}: ModuleManagementProps) => {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [preselectedCoursId, setPreselectedCoursId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    statut: ModuleWithStatus['statut'];
    cours: { id: string; titre: string }[];
  } | null>(null);
  const [selectedCoursId, setSelectedCoursId] = useState<string | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<{
    id: string;
    title: string;
    currentStatut: ModuleWithStatus['statut'];
    newStatut: 'en_ligne' | 'brouillon';
  } | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null);

  const openDeleteModal = (module: ModuleWithStatus) => {
    const coursList = module.coursDetails ?? [];
    setDeleteTarget({
      id: module.id,
      title: module.moduleName || 'ce module',
      statut: module.statut,
      cours: coursList,
    });

    // Pour "manquant" et "brouillon" (enregistré/en cours d'examen), on supprime tout le cours
    // Pas besoin de sélectionner un chapitre spécifique
    if (module.statut === 'manquant' || module.statut === 'brouillon') {
      setSelectedCoursId(null);
      return;
    }

    // Pour "en_ligne", on peut sélectionner un chapitre spécifique à supprimer
    setSelectedCoursId(coursList[0]?.id ?? null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setSelectedCoursId(null);
  };

  const handleAddModuleClick = () => {
    setPreselectedCoursId(null);
    setIsCreateModalOpen(true);
  };

  const handleEditCoursClick = (module: ModuleWithStatus) => {
    // Vérifier si le cours a des chapitres
    const coursList = module.coursDetails && module.coursDetails.length > 0
      ? module.coursDetails
      : module.cours.map((titre, index) => ({
          id: `${module.id}-${index}`,
          titre,
        }));
    const hasChapitres = coursList.length > 0 || (module.cours_count && module.cours_count > 0);
    
    if (!hasChapitres) {
      // Si le cours n'a pas de chapitres, ouvrir le modal pour créer un chapitrage
      setPreselectedCoursId(module.id);
      setIsCreateModalOpen(true);
    } else {
      // Si le cours a des chapitres, rediriger vers l'édition
      onEditCours(module.id);
    }
  };

  const handleSaveModule = (moduleData: { titre?: string; cours: Array<{ id?: number; titre: string }> | string[]; moduleId?: string }) => {
    onAddModule(moduleData);
    setIsCreateModalOpen(false);
    setPreselectedCoursId(null);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setPreselectedCoursId(null);
  };

  const handleStatusIconClick = (module: ModuleWithStatus) => {
    // Ne pas permettre le changement si le statut est 'manquant'
    if (module.statut === 'manquant') {
      return;
    }

    const newStatut = module.statut === 'en_ligne' ? 'brouillon' : 'en_ligne';
    setStatusChangeTarget({
      id: module.id,
      title: module.moduleName || 'ce cours',
      currentStatut: module.statut,
      newStatut,
    });
    setStatusChangeError(null);
  };

  const closeStatusChangeModal = () => {
    setStatusChangeTarget(null);
    setStatusChangeError(null);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeTarget) return;

    setIsChangingStatus(true);
    setStatusChangeError(null);

    try {
      const action = statusChangeTarget.newStatut === 'en_ligne' ? 'publish' : 'unpublish';
      const response = await fetch('/api/cours', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          coursId: parseInt(statusChangeTarget.id),
          action,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Recharger uniquement les modules
        if (onRefreshModules) {
          await onRefreshModules();
        } else {
          router.refresh();
        }
        closeStatusChangeModal();
      } else {
        setStatusChangeError(result.error || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      setStatusChangeError('Erreur réseau lors du changement de statut');
      console.error('Erreur lors du changement de statut:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  console.log('[ModuleManagement] Modules reçus:', modules.length, modules);

  const modulesEnLigne = modules.filter(m => m.statut === 'en_ligne');
  const modulesBrouillon = modules.filter(m => m.statut === 'brouillon');
  const modulesManquant = modules.filter(m => m.statut === 'manquant');
  
  console.log('[ModuleManagement] Répartition:', {
    enLigne: modulesEnLigne.length,
    brouillon: modulesBrouillon.length,
    manquant: modulesManquant.length
  });

  const ModuleTable = ({
    modules,
    title,
    color,
    emptyMessage,
    showAssign = false,
    showVisualize = false,
  }: {
    modules: ModuleWithStatus[];
    title: string;
    color: string;
    emptyMessage: string;
    showAssign?: boolean;
    showVisualize?: boolean;
  }) => {
    const iconRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

    // Synchroniser les hauteurs des icônes avec les lignes du tableau
    useEffect(() => {
      const syncHeights = () => {
        modules.forEach((module) => {
          const rowElement = rowRefs.current[module.id];
          const iconElement = iconRefs.current[module.id];
          
          if (rowElement && iconElement) {
            const rowHeight = rowElement.offsetHeight;
            iconElement.style.height = `${rowHeight}px`;
          }
        });
      };

      // Synchroniser après le rendu initial
      syncHeights();

      // Réécouter les changements de taille (responsive, contenu dynamique)
      const resizeObserver = new ResizeObserver(syncHeights);
      
      modules.forEach((module) => {
        const rowElement = rowRefs.current[module.id];
        if (rowElement) {
          resizeObserver.observe(rowElement);
        }
      });

      return () => {
        resizeObserver.disconnect();
      };
    }, [modules]);

    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${color} flex-shrink-0`}></div>
          <h3 
            className="text-base sm:text-lg font-bold text-[#032622] uppercase break-words"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {title}
          </h3>
        </div>
        
        <div className="relative">
          {/* Tableau avec les icônes alignées */}
          <div className="flex gap-3 sm:gap-4">
            {/* Icônes alignées à gauche */}
            <div className="flex flex-col flex-shrink-0">
              {/* Header invisible pour aligner avec le thead */}
              <div className="h-[48px] sm:h-[56px] flex items-center justify-center opacity-0 pointer-events-none mb-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              {modules.length === 0 ? (
                <div className="h-[48px] sm:h-[56px] flex items-center justify-center">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 opacity-0" />
                </div>
              ) : (
                modules.map((module) => (
                  <div
                    key={module.id}
                    ref={(el) => {
                      iconRefs.current[module.id] = el;
                    }}
                    className="flex items-start justify-center"
                    style={{
                      paddingTop: '0.5rem', // p-2 = 0.5rem
                      paddingBottom: '0.5rem', // p-2 = 0.5rem
                      minHeight: '48px', // Hauteur minimale
                    }}
                  >
                    <button
                      onClick={() => handleStatusIconClick(module)}
                      disabled={module.statut === 'manquant' || isChangingStatus}
                      className={`
                        flex items-center justify-center 
                        w-8 h-8 sm:w-10 sm:h-10
                        rounded transition-colors flex-shrink-0
                        ${module.statut === 'manquant' 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'cursor-pointer hover:bg-[#032622]/10 active:bg-[#032622]/20'
                        }
                        ${isChangingStatus ? 'opacity-50 cursor-wait' : ''}
                      `}
                      style={{
                        marginTop: '0.125rem', // Petit ajustement pour aligner avec le texte du titre
                      }}
                      title={
                        module.statut === 'manquant' 
                          ? 'Cours manquant - impossible de changer le statut'
                          : module.statut === 'en_ligne'
                          ? 'Mettre en brouillon (hors ligne)'
                          : 'Mettre en ligne'
                      }
                    >
                      {module.statut === 'en_ligne' ? (
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Tableau */}
            <div className="flex-1 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="min-w-[800px] sm:min-w-0">
                <table className="w-full border border-[#032622]">
              <thead>
                <tr className="bg-[#F8F5E4]">
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[120px]">COURS</th>
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[150px]">CHAPITRES</th>
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[120px]">DERNIÈRE MODIFICATION</th>
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[100px]">CRÉÉ PAR</th>
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[100px]">ÉDITER</th>
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[120px]">ÉTUDE DE CAS</th>
                {showAssign && (
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[100px]">
                    ATTRIBUER
                  </th>
                )}
                {showVisualize && (
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[100px]">
                    VISUALISER
                  </th>
                )}
                {title === 'EN LIGNE' && (
                  <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[100px]">
                    CORRECTION
                  </th>
                )}
                <th className="border border-[#032622] p-2 sm:p-3 text-left font-semibold uppercase text-[10px] sm:text-xs md:text-sm text-[#032622] whitespace-nowrap min-w-[100px]">SUPPRIMER</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={showAssign ? (showVisualize ? (title === 'EN LIGNE' ? 10 : 9) : (title === 'EN LIGNE' ? 9 : 8)) : (showVisualize ? (title === 'EN LIGNE' ? 9 : 8) : (title === 'EN LIGNE' ? 8 : 7))} className="border border-[#032622] p-6 sm:p-8 text-center text-[#032622]">
                    <p className="text-sm sm:text-base md:text-lg font-medium break-words">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                modules.map((module) => (
                  <tr 
                    key={module.id} 
                    id={`module-row-${module.id}`}
                    ref={(el) => {
                      rowRefs.current[module.id] = el;
                    }}
                    className="bg-[#032622]/10"
                  >
                    <td className="border border-[#032622] p-2 sm:p-3 text-[#032622]">
                      <p className="text-xs sm:text-sm font-semibold uppercase break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                        {module.moduleName || 'Cours sans titre'}
                      </p>
                    </td>
                    <td className="border border-[#032622] p-2 sm:p-3 text-[#032622]">
                      {(() => {
                        const coursList =
                          module.coursDetails && module.coursDetails.length > 0
                            ? module.coursDetails
                            : module.cours.map((titre, index) => ({
                                id: `${module.id}-${index}`,
                                titre,
                              }));

                        return coursList.length > 0 ? (
                          <div className="space-y-0.5 sm:space-y-1">
                            {coursList.map((cours) => (
                              <p key={cours.id} className="text-[10px] sm:text-xs md:text-sm normal-case text-[#032622] break-words">
                                • {cours.titre}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] sm:text-xs md:text-sm italic text-[#032622]/70">Aucun chapitre</span>
                        );
                      })()}
                    </td>
                    <td className="border border-[#032622] p-2 sm:p-3 text-[#032622] text-[10px] sm:text-xs md:text-sm break-words">
                      {module.creationModification || '-'}
                    </td>
                    <td className="border border-[#032622] p-2 sm:p-3 text-[#032622] text-[10px] sm:text-xs md:text-sm break-words">
                      {module.creePar || '-'}
                    </td>
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => handleEditCoursClick(module)}
                        className="w-full h-full text-[#032622] px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 active:bg-[#032622]/20 transition-colors flex items-center justify-center gap-0.5 sm:gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="hidden sm:inline">{(() => {
                          const coursList = module.coursDetails && module.coursDetails.length > 0
                            ? module.coursDetails
                            : module.cours.map((titre, index) => ({
                                id: `${module.id}-${index}`,
                                titre,
                              }));
                          const hasChapitres = coursList.length > 0 || (module.cours_count && module.cours_count > 0);
                          return hasChapitres ? 'ÉDITER' : 'CHAPITRAGE';
                        })()}</span>
                        <span className="sm:hidden">ÉDITER</span>
                      </button>
                    </td>
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => {
                          router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${module.id}/etude-cas`);
                        }}
                        className="w-full h-full text-[#032622] px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 active:bg-[#032622]/20 transition-colors flex items-center justify-center gap-0.5 sm:gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="hidden sm:inline">{module.hasEtudeCas ? 'ÉDITER ÉTUDE' : 'AJOUTER ÉTUDE'}</span>
                        <span className="sm:hidden">ÉTUDE</span>
                      </button>
                    </td>
                    {showAssign && (
                      <td className="border border-[#032622] p-0">
                        <button
                          onClick={() => onAssignModule(module.id)}
                          className="w-full h-full text-[#032622] px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 active:bg-[#032622]/20 transition-colors flex items-center justify-center gap-0.5 sm:gap-1 border-0"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="hidden sm:inline">ATTRIBUER</span>
                          <span className="sm:hidden">ATTRIB.</span>
                        </button>
                      </td>
                    )}
                    {showVisualize && (
                      <td className="border border-[#032622] p-0">
                        <button
                          onClick={() => onVisualizeModule(module.id)}
                          className="w-full h-full text-[#032622] px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 active:bg-[#032622]/20 transition-colors flex items-center justify-center gap-0.5 sm:gap-1 border-0"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="hidden sm:inline">VISUALISER</span>
                          <span className="sm:hidden">VOIR</span>
                        </button>
                      </td>
                    )}
                    {title === 'EN LIGNE' && (
                      <td className="border border-[#032622] p-0">
                        <button
                          onClick={() => {
                            router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/cours/${module.id}/correction`);
                          }}
                          className="w-full h-full text-[#032622] px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 active:bg-[#032622]/20 transition-colors flex items-center justify-center gap-0.5 sm:gap-1 border-0"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="hidden sm:inline">CORRECTION</span>
                          <span className="sm:hidden">CORR.</span>
                        </button>
                      </td>
                    )}
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => openDeleteModal(module)}
                        className="w-full h-full text-[#032622] px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 active:bg-[#032622]/20 transition-colors flex items-center justify-center gap-0.5 sm:gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="hidden sm:inline">SUPPRIMER</span>
                        <span className="sm:hidden">SUPPR.</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 
            className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] uppercase break-words"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {blocNumber} - {blocTitle}
          </h1>
          {formationTitle && (
            <p 
              className="text-xs sm:text-sm text-[#032622]/70 italic break-words"
              style={{ fontFamily: 'var(--font-termina-medium)' }}
            >
              Formation : {formationTitle}{formationEcole ? ` - ${formationEcole}` : ''}
            </p>
          )}
        </div>

        {/* Add Module Button */}
        <button
          onClick={handleAddModuleClick}
          className="bg-[#032622] text-[#F8F5E4] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 active:bg-[#032622]/80 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          AJOUTER UN COURS
        </button>

        {/* Modules Tables */}
        <div className="space-y-6 sm:space-y-7 md:space-y-8">
          <ModuleTable 
            modules={modulesEnLigne} 
            title="EN LIGNE" 
            color="bg-green-500"
            emptyMessage="Aucun module en ligne pour le moment"
            showVisualize={true}
          />
          <ModuleTable 
            modules={modulesBrouillon} 
            title="ENREGISTRÉ/EN COURS D'EXAMEN" 
            color="bg-orange-500"
            emptyMessage="Aucun module en cours de développement"
            showVisualize={true}
          />
          <ModuleTable 
            modules={modulesManquant} 
            title="MANQUANT" 
            color="bg-white border-2 border-gray-400"
            emptyMessage="Aucun module manquant"
            showAssign
          />
        </div>
      </div>

      {/* Create Module Modal */}
      <CreateModule
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModule}
        existingModules={modules.map((module) => ({
          id: module.id,
          titre: module.moduleName || `Module ${module.numero_module ?? ''}`.trim()
        }))}
        preselectedCoursId={preselectedCoursId}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title={
          deleteTarget?.statut === 'manquant' || deleteTarget?.statut === 'brouillon'
            ? 'Supprimer le cours'
            : 'Supprimer un cours'
        }
        message={
          deleteTarget
            ? deleteTarget.statut === 'manquant' || deleteTarget.statut === 'brouillon'
              ? `Voulez-vous vraiment supprimer ${deleteTarget.title} ainsi que tous les éléments associés ?\n\nCette action supprimera également :\n• Tous les chapitres associés\n• Tous les quiz et leurs questions/réponses\n• Toutes les études de cas et leurs questions/réponses\n\nCette action est irréversible.`
              : deleteTarget.cours.length > 0 && selectedCoursId
                ? `Voulez-vous vraiment supprimer le cours "${deleteTarget.cours.find((cours) => cours.id === selectedCoursId)?.titre ?? 'sélectionné'}" du module ${deleteTarget.title} ?\n\nCette action supprimera également :\n• Tous les chapitres associés\n• Tous les quiz et leurs questions\n• Toutes les études de cas et leurs questions\n\nCette action est irréversible.`
                : `${deleteTarget.title} ne contient aucun cours à supprimer.`
            : ''
        }
        type="warning"
        isConfirm
        confirmDisabled={false}
        onConfirm={() => {
          if (!deleteTarget) {
            return;
          }

          // Pour "manquant" et "brouillon" (enregistré/en cours d'examen), supprimer tout le cours
          if (deleteTarget.statut === 'manquant' || deleteTarget.statut === 'brouillon') {
            onDeleteModule(deleteTarget.id, 'module');
            closeDeleteModal();
            return;
          }

          // Pour "en_ligne", on peut supprimer un chapitre spécifique si nécessaire
          if (!selectedCoursId) {
            return;
          }

          onDeleteModule(deleteTarget.id, 'cours', selectedCoursId);
          closeDeleteModal();
        }}
        onCancel={closeDeleteModal}
      />

      {/* Modal de changement de statut */}
      <Modal
        isOpen={Boolean(statusChangeTarget)}
        onClose={closeStatusChangeModal}
        title={
          statusChangeTarget?.newStatut === 'en_ligne'
            ? 'Mettre le cours en ligne'
            : 'Mettre le cours hors ligne'
        }
        message={
          statusChangeTarget
            ? (statusChangeError 
                ? `Erreur : ${statusChangeError}\n\n${statusChangeTarget.newStatut === 'en_ligne'
                    ? `Voulez-vous vraiment mettre le cours "${statusChangeTarget.title}" en ligne ?\n\nLe cours sera visible pour les étudiants.`
                    : `Voulez-vous vraiment mettre le cours "${statusChangeTarget.title}" hors ligne ?\n\nLe cours ne sera plus visible pour les étudiants et passera en brouillon.`}`
                : isChangingStatus
                  ? `Changement en cours...\n\n${statusChangeTarget.newStatut === 'en_ligne'
                      ? `Mise en ligne du cours "${statusChangeTarget.title}" en cours.`
                      : `Mise hors ligne du cours "${statusChangeTarget.title}" en cours.`}`
                  : statusChangeTarget.newStatut === 'en_ligne'
                    ? `Voulez-vous vraiment mettre le cours "${statusChangeTarget.title}" en ligne ?\n\nLe cours sera visible pour les étudiants.`
                    : `Voulez-vous vraiment mettre le cours "${statusChangeTarget.title}" hors ligne ?\n\nLe cours ne sera plus visible pour les étudiants et passera en brouillon.`)
            : ''
        }
        type={statusChangeError ? 'error' : 'warning'}
        isConfirm={true}
        confirmDisabled={isChangingStatus}
        onConfirm={confirmStatusChange}
        onCancel={closeStatusChangeModal}
      />
    </>
  );
};
