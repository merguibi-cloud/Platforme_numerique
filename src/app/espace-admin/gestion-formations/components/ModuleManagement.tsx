'use client';

import { useState } from 'react';
import { Plus, Edit, FileText, ChevronDown } from 'lucide-react';
import { CreateModule } from './CreateModule';

interface ModuleWithStatus {
  id: string;
  type: string;
  matiere: string;
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
}

export const ModuleManagement = ({
  blocTitle,
  blocNumber,
  modules,
  onAddModule,
  onEditModule,
  onAddQuiz,
  onAssignModule
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

  const ModuleTable = ({ modules, title, color }: { modules: ModuleWithStatus[]; title: string; color: string }) => {
    if (modules.length === 0) return null;

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
          <table className="w-full border-2 border-[#032622]">
            <thead>
              <tr className="bg-[#032622] text-[#F8F5E4]">
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm">TYPE</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm">MATIÈRE</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm">CRÉATION/MODIFICATION</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm">CRÉÉ PAR</th>
                <th className="border border-[#032622] p-3 text-left font-semibold uppercase text-sm">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <tr key={module.id} className="bg-[#F8F5E4] hover:bg-gray-100">
                  <td className="border border-[#032622] p-3 font-semibold text-[#032622]">
                    {module.type}
                  </td>
                  <td className="border border-[#032622] p-3 text-[#032622]">
                    {module.matiere}
                  </td>
                  <td className="border border-[#032622] p-3 text-[#032622]">
                    {module.creationModification || '-'}
                  </td>
                  <td className="border border-[#032622] p-3 text-[#032622]">
                    {module.creePar || '-'}
                  </td>
                  <td className="border border-[#032622] p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditModule(module.id)}
                        className="bg-[#032622] text-[#F8F5E4] px-3 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-1"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <Edit className="w-3 h-3" />
                        MODIFIER LE MODULE
                      </button>
                      <button
                        onClick={() => onAddQuiz(module.id)}
                        className="bg-[#032622] text-[#F8F5E4] px-3 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-1"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      >
                        <FileText className="w-3 h-3" />
                        AJOUTER LE QUIZ
                      </button>
                      {module.statut === 'manquant' && (
                        <button
                          onClick={() => onAssignModule(module.id)}
                          className="bg-[#032622] text-[#F8F5E4] px-3 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-1"
                          style={{ fontFamily: 'var(--font-termina-bold)' }}
                        >
                          <ChevronDown className="w-3 h-3" />
                          ATTRIBUER
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
            COURS CRÉÉS
          </h1>
          <h2 
            className="text-2xl font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {blocNumber}
          </h2>
          <p 
            className="text-lg font-bold text-[#032622]"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            {blocTitle}
          </p>
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
          />
          <ModuleTable 
            modules={modulesBrouillon} 
            title="BROUILLON/EN COURS D'EXAMEN" 
            color="bg-orange-500" 
          />
          <ModuleTable 
            modules={modulesManquant} 
            title="MANQUANT" 
            color="bg-white border-2 border-gray-400" 
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
