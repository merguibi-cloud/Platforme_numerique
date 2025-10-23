'use client';

import { useState } from 'react';
import { Plus, Edit, FileText, ChevronDown, Eye } from 'lucide-react';
import { CreateModule } from './CreateModule';

interface ModuleWithStatus {
  id: string;
  type: string;
  cours: string;
  creationModification?: string;
  creePar?: string;
  statut: 'en_ligne' | 'brouillon' | 'manquant';
}

interface ModuleManagementProps {
  blocTitle: string;
  blocNumber: string;
  modules: ModuleWithStatus[];
  onAddModule: (moduleData: { titre: string; cours: string[] }) => void;
  onEditModule: (moduleId: string) => void;
  onAddQuiz: (moduleId: string) => void;
  onAssignModule: (moduleId: string) => void;
  onVisualizeModule: (moduleId: string) => void;
}

export const ModuleManagement = ({
  blocTitle,
  blocNumber,
  modules,
  onAddModule,
  onEditModule,
  onAddQuiz,
  onAssignModule,
  onVisualizeModule
}: ModuleManagementProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleAddModuleClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveModule = (moduleData: { titre: string; cours: string[] }) => {
    onAddModule(moduleData);
    setIsCreateModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  // Grouper les modules par statut
  const modulesEnLigne = modules.filter(m => m.statut === 'en_ligne');
  const modulesBrouillon = modules.filter(m => m.statut === 'brouillon');
  const modulesManquant = modules.filter(m => m.statut === 'manquant');

  const ModuleTable = ({ modules, title, color, emptyMessage }: { modules: ModuleWithStatus[]; title: string; color: string; emptyMessage: string }) => {
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
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">TITRE</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">MATIÈRE</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">DERNIÈRE MODIFICATION</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]">CRÉER PAR</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]"></th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]"></th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm text-[#032622]"></th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="border border-[#032622] p-8 text-center text-[#032622]">
                    <p className="text-lg font-medium">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                modules.map((module) => (
                  <tr key={module.id} className="bg-[#032622]/10">
                    <td className="border border-[#032622] p-3 font-semibold text-[#032622] uppercase">
                      {module.type}
                    </td>
                    <td className="border border-[#032622] p-3 text-[#032622] uppercase">
                      {module.cours}
                    </td>
                    <td className="border border-[#032622] p-3 text-[#032622]">
                      {module.creationModification || '-'}
                    </td>
                    <td className="border border-[#032622] p-3 text-[#032622]">
                      {module.creePar || '-'}
                    </td>
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => onEditModule(module.id)}
                        className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <Edit className="w-3 h-3" />
                        MODIFIER LE MODULE
                      </button>
                    </td>
                    <td className="border border-[#032622] p-0">
                      <button
                        onClick={() => onAddQuiz(module.id)}
                        className="w-full h-full text-[#032622] px-3 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/10 transition-colors flex items-center justify-center gap-1 border-0"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <FileText className="w-3 h-3" />
                        {module.statut === 'en_ligne' ? 'MODIFIER LE QUIZ' : 'AJOUTER LE QUIZ'}
                      </button>
                    </td>
                    {module.statut === 'manquant' ? (
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
                    ) : (
                      <td className="border border-[#032622] p-3">
                      </td>
                    )}
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
        </div>

        {/* Add Module Button */}
        <button
          onClick={handleAddModuleClick}
          className="bg-[#032622] text-[#F8F5E4] px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          <Plus className="w-4 h-4" />
          AJOUTER UN MODULE
        </button>

        {/* Modules Tables */}
        <div className="space-y-8">
          <ModuleTable 
            modules={modulesEnLigne} 
            title="EN LIGNE" 
            color="bg-green-500"
            emptyMessage="Aucun module en ligne pour le moment"
          />
          <ModuleTable 
            modules={modulesBrouillon} 
            title="BROUILLON/EN COURS D'EXAMEN" 
            color="bg-orange-500"
            emptyMessage="Aucun module en cours de développement"
          />
          <ModuleTable 
            modules={modulesManquant} 
            title="MANQUANT" 
            color="bg-white border-2 border-gray-400"
            emptyMessage="Aucun module manquant"
          />
        </div>
      </div>

      {/* Create Module Modal */}
      <CreateModule
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModule}
      />
    </>
  );
};
