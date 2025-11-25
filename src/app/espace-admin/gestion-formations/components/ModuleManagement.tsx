'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, FileText, ChevronDown, Trash2, Eye } from 'lucide-react';
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
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h3 
            className="text-lg font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {title}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border border-[#032622]">
            <thead>
              <tr className="bg-[#F8F5E4]">
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">COURS</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">CHAPITRES</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">DERNIÈRE MODIFICATION</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">CRÉÉ PAR</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">ÉDITER</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">ÉTUDE DE CAS</th>
                {showAssign && (
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    ATTRIBUER
                  </th>
                )}
                {showVisualize && (
                  <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">
                    VISUALISER
                  </th>
                )}
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">SUPPRIMER</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={showAssign ? (showVisualize ? 9 : 8) : (showVisualize ? 8 : 7)} className="border border-[#032622] p-8 text-center text-[#032622]">
                    <p className="text-lg font-medium">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                modules.map((module) => (
                  <tr key={module.id} className="bg-[#032622]/10">
                    <td className="border border-[#032622] p-3 text-[#032622]">
                      <p className="font-semibold uppercase" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                        {module.moduleName || 'Cours sans titre'}
                      </p>
                    </td>
                    <td className="border border-[#032622] p-3 text-[#032622]">
                      {(() => {
                        const coursList =
                          module.coursDetails && module.coursDetails.length > 0
                            ? module.coursDetails
                            : module.cours.map((titre, index) => ({
                                id: `${module.id}-${index}`,
                                titre,
                              }));

                        return coursList.length > 0 ? (
                          <div className="space-y-1">
                            {coursList.map((cours) => (
                              <p key={cours.id} className="text-sm normal-case text-[#032622]">
                                • {cours.titre}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm italic text-[#032622]/70">Aucun chapitre</span>
                        );
                      })()}
                    </td>
                    <td className="border border-[#032622] p-3 text-[#032622]">
                      {module.creationModification || '-'}
                    </td>
                    <td className="border border-[#032622] p-3 text-[#032622]">
                      {module.creePar || '-'}
                    </td>
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => handleEditCoursClick(module)}
                        className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <Edit className="w-3 h-3" />
                        {(() => {
                          const coursList = module.coursDetails && module.coursDetails.length > 0
                            ? module.coursDetails
                            : module.cours.map((titre, index) => ({
                                id: `${module.id}-${index}`,
                                titre,
                              }));
                          const hasChapitres = coursList.length > 0 || (module.cours_count && module.cours_count > 0);
                          return hasChapitres ? 'ÉDITER LE COURS' : 'AJOUTER UN CHAPITRAGE';
                        })()}
                      </button>
                    </td>
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => {
                          router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}/module/${module.id}/etude-cas`);
                        }}
                        className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <FileText className="w-3 h-3" />
                        {module.hasEtudeCas ? 'ÉDITER L\'ÉTUDE DE CAS' : 'AJOUTER UNE ÉTUDE DE CAS'}
                      </button>
                    </td>
                    {showAssign && (
                      <td className="border border-[#032622] p-0">
                        <button
                          onClick={() => onAssignModule(module.id)}
                          className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <ChevronDown className="w-3 h-3" />
                          ATTRIBUER
                        </button>
                      </td>
                    )}
                    {showVisualize && (
                      <td className="border border-[#032622] p-0">
                        <button
                          onClick={() => onVisualizeModule(module.id)}
                          className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <Eye className="w-3 h-3" />
                          VISUALISER
                        </button>
                      </td>
                    )}
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => openDeleteModal(module)}
                        className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <Trash2 className="w-3 h-3" />
                        SUPPRIMER
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 
            className="text-3xl font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {blocNumber} - {blocTitle}
          </h1>
          {formationTitle && (
            <p 
              className="text-sm text-[#032622]/70 italic"
              style={{ fontFamily: 'var(--font-termina-medium)' }}
            >
              Formation : {formationTitle}{formationEcole ? ` - ${formationEcole}` : ''}
            </p>
          )}
        </div>

        {/* Add Module Button */}
        <button
          onClick={handleAddModuleClick}
          className="bg-[#032622] text-[#F8F5E4] px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <Plus className="w-4 h-4" />
          AJOUTER UN COURS
        </button>

        {/* Modules Tables */}
        <div className="space-y-8">
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
    </>
  );
};
