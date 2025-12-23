'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  CheckCircle,
  FileQuestion,
  FileText,
  Flag,
  Image as ImageIcon,
  PlayCircle,
  Plus,
  ShieldAlert,
  Trash2,
  UserCheck,
  X
} from 'lucide-react';
import { Modal } from '../../validation/components/Modal';
import { useModal } from '../../validation/components/useModal';

type ModuleType = 'cours' | 'video' | 'pdf' | 'quiz' | 'word' | 'image';

interface ModuleItem {
  id: string;
  title: string;
  type: ModuleType;
  duration?: string;
  fileName?: string;
  fileSize?: string;
}

interface StudentProgress {
  id: string;
  name: string;
  progress: number;
  status: 'En cours' | 'Terminé' | 'En retard';
  lastActivity: string;
  flagged: boolean;
}

interface AntiCheatEvent {
  id: string;
  student: string;
  timestamp: string;
  reason: string;
  status: 'pending' | 'resolved';
}

interface BlockItem {
  id: string;
  title: string;
  description: string;
  antiCheatEnabled: boolean;
  modules: ModuleItem[];
  students: StudentProgress[];
  flags: AntiCheatEvent[];
}

const createId = () => Math.random().toString(36).slice(2, 10);

const moduleTypeLabels: Record<ModuleType, string> = {
  cours: 'Cours',
  video: 'Vidéo',
  pdf: 'PDF',
  quiz: 'Quiz',
  word: 'Document Word',
  image: 'Image'
};

const moduleTypeColors: Record<ModuleType, string> = {
  cours: 'bg-[#E7E2CE] text-[#032622]',
  video: 'bg-[#D0E1D1] text-[#032622]',
  pdf: 'bg-[#F0D6C8] text-[#032622]',
  quiz: 'bg-[#F5E3AC] text-[#032622]',
  word: 'bg-[#E3E7F0] text-[#032622]',
  image: 'bg-[#F0E3F0] text-[#032622]'
};

const moduleTypeIcon: Record<ModuleType, typeof PlayCircle> = {
  cours: BookOpen,
  video: PlayCircle,
  pdf: FileText,
  quiz: FileQuestion,
  word: FileText,
  image: ImageIcon
};

const defaultModuleDraft = () => ({
  title: '',
  type: 'cours' as ModuleType,
  duration: '',
  fileName: '',
  fileSize: ''
});

// Les blocs sont maintenant chargés depuis la base de données

const formatStatusColor = (status: StudentProgress['status']) => {
  switch (status) {
    case 'Terminé':
      return 'text-[#1d402b]';
    case 'En retard':
      return 'text-[#732f2f]';
    default:
      return 'text-[#032622]';
  }
};

export default function AdminFormationManager() {
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { modalState, showConfirm, hideModal, handleConfirm, handleCancel } = useModal();
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockDescription, setNewBlockDescription] = useState('');
  const [newBlockAntiCheat, setNewBlockAntiCheat] = useState(true);
  const [newBlockModules, setNewBlockModules] = useState<Array<{ id: string; title: string; type: ModuleType; duration: string; fileName?: string; fileSize?: string }>>([
    {
      id: createId(),
      title: '',
      type: 'cours',
      duration: '',
      fileName: '',
      fileSize: ''
    }
  ]);
  const [addingModuleForBlock, setAddingModuleForBlock] = useState<string | null>(null);
  const [moduleDraft, setModuleDraft] = useState(defaultModuleDraft());

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;

  const totalModules = useMemo(
    () => blocks.reduce((acc, block) => acc + block.modules.length, 0),
    [blocks]
  );

  const pendingFlags = useMemo(
    () =>
      blocks.reduce(
        (acc, block) => acc + block.flags.filter((flag) => flag.status === 'pending').length,
        0
      ),
    [blocks]
  );

  const flaggedEvents = useMemo(
    () =>
      blocks.flatMap((block) =>
        block.flags
          .filter((flag) => flag.status === 'pending')
          .map((flag) => ({
            ...flag,
            blockId: block.id,
            blockTitle: block.title
          }))
      ),
    [blocks]
  );

  const resetNewBlockForm = () => {
    setNewBlockTitle('');
    setNewBlockDescription('');
    setNewBlockAntiCheat(true);
    setNewBlockModules([
      {
        id: createId(),
        title: '',
        type: 'cours',
        duration: '',
        fileName: '',
        fileSize: ''
      }
    ]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetNewBlockForm();
  };

  const handleCreateBlock = () => {
    if (!newBlockTitle.trim() || newBlockModules.some((module) => !module.title.trim())) {
      return;
    }

    const newBlockId = createId();

    const newBlock: BlockItem = {
      id: newBlockId,
      title: newBlockTitle.trim(),
      description: newBlockDescription.trim() || 'Description à compléter',
      antiCheatEnabled: newBlockAntiCheat,
      modules: newBlockModules.map((module) => ({
        ...module,
        id: createId(),
        title: module.title.trim(),
        duration: module.duration.trim(),
        fileName: module.fileName?.trim() || undefined,
        fileSize: module.fileSize?.trim() || undefined
      })),
      students: [],
      flags: []
    };

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlockId);
    closeModal();
  };

  const handleToggleAntiCheat = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              antiCheatEnabled: !block.antiCheatEnabled
            }
          : block
      )
    );
  };

  const handleResolveFlag = (blockId: string, flagId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              flags: block.flags.map((flag) =>
                flag.id === flagId
                  ? {
                      ...flag,
                      status: 'resolved'
                    }
                  : flag
              )
            }
          : block
      )
    );
  };

  const handleAddModuleToBlock = (blockId: string) => {
    if (!moduleDraft.title.trim()) {
      return;
    }

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              modules: [
                ...block.modules,
                {
                  id: createId(),
                  title: moduleDraft.title.trim(),
                  type: moduleDraft.type,
                  duration: moduleDraft.duration.trim(),
                  fileName: moduleDraft.fileName.trim() || undefined,
                  fileSize: moduleDraft.fileSize.trim() || undefined
                }
              ]
            }
          : block
      )
    );

    setAddingModuleForBlock(null);
    setModuleDraft(defaultModuleDraft());
  };

  const handleRemoveModule = (blockId: string, moduleId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              modules: block.modules.filter((module) => module.id !== moduleId)
            }
          : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    showConfirm(
      'Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.',
      'Confirmation de suppression',
      () => {
        setBlocks((prev) => prev.filter((block) => block.id !== blockId));
        // Si le bloc supprimé était sélectionné, sélectionner le premier bloc restant
        if (selectedBlockId === blockId) {
          const remainingBlocks = blocks.filter((block) => block.id !== blockId);
          setSelectedBlockId(remainingBlocks.length > 0 ? remainingBlocks[0].id : null);
        }
      }
    );
  };

  const isCreateDisabled = !newBlockTitle.trim() || newBlockModules.some((module) => !module.title.trim());

  return (
    <div className={'space-y-6'}>
      <div className={'grid gap-4 md:grid-cols-3 xl:grid-cols-4'}>
        <div className={'border border-[#032622] bg-[#F8F5E4] p-4 shadow-sm'}>
          <div className={'flex items-center justify-between'}>
            <span className={'text-xs uppercase tracking-wide text-[#032622]/70'}>Blocs actifs</span>
            <BookOpen className={'h-5 w-5 text-[#032622]'} />
          </div>
          <p className={'mt-2 text-3xl font-semibold text-[#032622]'}>{blocks.length}</p>
          <p className={'text-sm text-[#032622]/70'}>blocs structurés et suivis</p>
        </div>

        <div className={'border border-[#032622] bg-[#F8F5E4] p-4 shadow-sm'}>
          <div className={'flex items-center justify-between'}>
            <span className={'text-xs uppercase tracking-wide text-[#032622]/70'}>Modules disponibles</span>
            <BarChart2 className={'h-5 w-5 text-[#032622]'} />
          </div>
          <p className={'mt-2 text-3xl font-semibold text-[#032622]'}>{totalModules}</p>
          <p className={'text-sm text-[#032622]/70'}>cours, vidéos, quiz et ressources</p>
        </div>

        <div className={'border border-[#032622] bg-[#F8F5E4] p-4 shadow-sm'}>
          <div className={'flex items-center justify-between'}>
            <span className={'text-xs uppercase tracking-wide text-[#032622]/70'}>Alertes anti-triche</span>
            <ShieldAlert className={'h-5 w-5 text-[#032622]'} />
          </div>
          <p className={'mt-2 text-3xl font-semibold text-[#032622]'}>{pendingFlags}</p>
          <p className={'text-sm text-[#032622]/70'}>signalements à traiter</p>
        </div>

        <div className={'hidden border border-[#032622] bg-[#F8F5E4] p-4 shadow-sm xl:block'}>
          <div className={'flex items-center justify-between'}>
            <span className={'text-xs uppercase tracking-wide text-[#032622]/70'}>Bloc sélectionné</span>
            <UserCheck className={'h-5 w-5 text-[#032622]'} />
          </div>
          <p className={'mt-2 text-lg font-semibold text-[#032622]'}>
            {selectedBlock ? selectedBlock.title : 'Aucun bloc'}
          </p>
          <p className={'text-sm text-[#032622]/70'}>
            {selectedBlock ? `${selectedBlock.modules.length} module(s) actifs` : 'Sélectionnez un bloc'}
          </p>
        </div>
      </div>

      <div className={'flex flex-col gap-6 lg:flex-row'}>
        <div className={'space-y-4 lg:w-1/2'}>
          <button
            onClick={() => setIsModalOpen(true)}
            className={'flex w-full items-center justify-center gap-2 border border-[#032622] bg-[#032622] px-4 py-3 text-sm font-semibold text-[#F8F5E4] transition hover:bg-[#032622]/90'}
          >
            <Plus className={'h-4 w-4'} />
            Ajouter un bloc
          </button>

          {blocks.map((block) => (
            <div
              key={block.id}
              className={`cursor-pointer border border-[#032622] bg-[#F8F5E4] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                block.id === selectedBlockId ? 'ring-2 ring-[#032622]' : ''
              }`}
              onClick={() => setSelectedBlockId(block.id)}
            >
              <div className={'flex items-start justify-between gap-4'}>
                <div className={'flex-1'}>
                  <h3 className={'text-lg font-semibold text-[#032622]'}>{block.title}</h3>
                  <p className={'mt-1 text-sm text-[#032622]/70'}>{block.description}</p>
                </div>
                <div className={'flex flex-col items-end gap-2'}>
                  <div className={'flex items-center gap-2'}>
                    <span className={'rounded-full bg-[#032622]/10 px-3 py-1 text-xs font-semibold text-[#032622]'}>
                      {block.modules.length} module{block.modules.length > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className={'rounded border border-[#732f2f]/30 p-1.5 text-[#732f2f]/70 transition hover:border-[#732f2f] hover:bg-[#732f2f]/10 hover:text-[#732f2f]'}
                      title={'Supprimer le bloc'}
                    >
                      <Trash2 className={'h-3.5 w-3.5'} />
                    </button>
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      block.antiCheatEnabled ? 'bg-[#D0E1D1] text-[#032622]' : 'bg-[#F0D6C8] text-[#032622]'
                    }`}
                  >
                    <ShieldAlert className={'h-3.5 w-3.5'} />
                    {block.antiCheatEnabled ? 'Anti-triche active' : 'Anti-triche off'}
                  </span>
                </div>
              </div>

              <div className={'mt-4 flex flex-wrap gap-2'}>
                {block.modules.slice(0, 4).map((module) => {
                  const Icon = moduleTypeIcon[module.type];
                  return (
                    <span
                      key={module.id}
                      className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${moduleTypeColors[module.type]}`}
                    >
                      <Icon className={'h-3.5 w-3.5'} />
                      {moduleTypeLabels[module.type]}
                    </span>
                  );
                })}
                {block.modules.length > 4 && (
                  <span className={'rounded-full bg-[#032622]/10 px-3 py-1 text-xs font-medium text-[#032622]'}>
                    +{block.modules.length - 4}
                  </span>
                )}
              </div>

              <div className={'mt-4 flex items-center justify-between border-t border-[#032622]/20 pt-4 text-xs text-[#032622]/70'}>
                <div className={'flex items-center gap-2'}>
                  <UserCheck className={'h-4 w-4'} />
                  {block.students.filter((student) => student.status === 'Terminé').length} terminé(s)
                </div>
                {block.flags.some((flag) => flag.status === 'pending') && (
                  <div className={'flex items-center gap-2 text-[#732f2f]'}>
                    <Flag className={'h-4 w-4'} />
                    {block.flags.filter((flag) => flag.status === 'pending').length} alerte(s)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={'flex-1 space-y-4'}>
          {selectedBlock ? (
            <div className={'border border-[#032622] bg-[#F8F5E4] p-6 shadow-sm'}>
              <div className={'flex flex-col gap-4 md:flex-row md:items-start md:justify-between'}>
                <div>
                  <h2 className={'text-2xl font-semibold text-[#032622]'}>{selectedBlock.title}</h2>
                  <p className={'mt-2 text-sm leading-relaxed text-[#032622]/80'}>{selectedBlock.description}</p>
                </div>
                <div className={'flex flex-col items-start gap-2'}>
                  <div className={'flex items-center gap-2 text-sm font-semibold text-[#032622]'}>
                    <ShieldAlert className={'h-4 w-4'} />
                    {selectedBlock.antiCheatEnabled ? 'Anti-triche activée' : 'Anti-triche désactivée'}
                  </div>
                  <button
                    onClick={() => handleToggleAntiCheat(selectedBlock.id)}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full border border-[#032622] transition ${
                      selectedBlock.antiCheatEnabled ? 'bg-[#032622]' : 'bg-[#F8F5E4]'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-[#F8F5E4] transition ${
                        selectedBlock.antiCheatEnabled ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className={'mt-6 space-y-5'}>
                <section>
                  <div className={'flex items-center justify-between'}>
                    <h3 className={'text-lg font-semibold text-[#032622]'}>Modules du bloc</h3>
                    {addingModuleForBlock === selectedBlock.id ? null : (
                      <button
                        onClick={() => {
                          setAddingModuleForBlock(selectedBlock.id);
                          setModuleDraft(defaultModuleDraft());
                        }}
                        className={'flex items-center gap-2 text-sm font-semibold text-[#032622] transition hover:underline'}
                      >
                        <Plus className={'h-4 w-4'} />
                        Ajouter un module
                      </button>
                    )}
                  </div>

                  <div className={'mt-3 space-y-3'}>
                    {selectedBlock.modules.map((module) => {
                      const Icon = moduleTypeIcon[module.type];
                      return (
                        <div
                          key={module.id}
                          className={'flex items-center justify-between gap-4 rounded border border-[#032622]/20 bg-[#F8F5E4] px-4 py-3'}
                        >
                          <div className={'flex items-center gap-3'}>
                            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${moduleTypeColors[module.type]}`}>
                              <Icon className={'h-5 w-5'} />
                            </span>
                            <div>
                              <p className={'font-semibold text-[#032622]'}>{module.title}</p>
                              <p className={'text-xs text-[#032622]/70'}>
                                {moduleTypeLabels[module.type]}
                                {module.duration ? ` • ${module.duration}` : ''}
                              </p>
                              {(module.fileName || module.fileSize) && (
                                <p className={'text-xs text-[#032622]/50 mt-1'}>
                                  {module.fileName && `📁 ${module.fileName}`}
                                  {module.fileName && module.fileSize && ' • '}
                                  {module.fileSize && `💾 ${module.fileSize}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveModule(selectedBlock.id, module.id)}
                            className={'rounded border border-[#032622]/30 p-2 text-[#032622]/70 transition hover:border-[#032622] hover:text-[#032622]'}
                            title={'Supprimer le module'}
                          >
                            <Trash2 className={'h-4 w-4'} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {addingModuleForBlock === selectedBlock.id && (
                    <div className={'mt-4 space-y-3 rounded border border-[#032622]/30 bg-[#F8F5E4] p-4'}>
                      <div className={'grid gap-3 md:grid-cols-3'}>
                        <div className={'md:col-span-2'}>
                          <input
                            value={moduleDraft.title}
                            onChange={(event) => setModuleDraft((prev) => ({ ...prev, title: event.target.value }))}
                            placeholder={'Titre du module'}
                            className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                          />
                        </div>
                        <select
                          value={moduleDraft.type}
                          onChange={(event) =>
                            setModuleDraft((prev) => ({ ...prev, type: event.target.value as ModuleType }))
                          }
                          className={'border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                        >
                          {Object.entries(moduleTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <input
                          value={moduleDraft.duration}
                          onChange={(event) => setModuleDraft((prev) => ({ ...prev, duration: event.target.value }))}
                          placeholder={'Durée / Nombre de questions'}
                          className={'border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] md:col-span-3'}
                        />
                      </div>

                      {/* Champs pour fichiers */}
                      {['pdf', 'word', 'video', 'image'].includes(moduleDraft.type) && (
                        <div className={'grid gap-3 md:grid-cols-2'}>
                          <input
                            value={moduleDraft.fileName}
                            onChange={(event) => setModuleDraft((prev) => ({ ...prev, fileName: event.target.value }))}
                            placeholder={'Nom du fichier (ex: document.pdf)'}
                            className={'border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                          />
                          <input
                            value={moduleDraft.fileSize}
                            onChange={(event) => setModuleDraft((prev) => ({ ...prev, fileSize: event.target.value }))}
                            placeholder={'Taille du fichier (ex: 2.3 MB)'}
                            className={'border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                          />
                        </div>
                      )}

                      <div className={'flex justify-end gap-2 text-sm'}>
                        <button
                          onClick={() => {
                            setAddingModuleForBlock(null);
                            setModuleDraft(defaultModuleDraft());
                          }}
                          className={'rounded border border-[#032622]/40 px-4 py-2 text-[#032622]/70 transition hover:border-[#032622] hover:text-[#032622]'}
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleAddModuleToBlock(selectedBlock.id)}
                          className={'rounded bg-[#032622] px-4 py-2 font-semibold text-[#F8F5E4] transition hover:bg-[#032622]/90'}
                          disabled={!moduleDraft.title.trim()}
                        >
                          Ajouter le module
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                <section>
                  <div className={'flex items-center justify-between'}>
                    <h3 className={'text-lg font-semibold text-[#032622]'}>Suivi des étudiants</h3>
                    <span className={'text-xs text-[#032622]/70'}>{selectedBlock.students.length} inscrit(s)</span>
                  </div>

                  <div className={'mt-3 space-y-3'}>
                    {selectedBlock.students.length === 0 ? (
                      <div className={'rounded border border-dashed border-[#032622]/30 p-4 text-center text-sm text-[#032622]/70'}>
                        Aucun étudiant inscrit pour le moment.
                      </div>
                    ) : (
                      selectedBlock.students.map((student) => (
                        <div
                          key={student.id}
                          className={`rounded border border-[#032622]/20 bg-[#F8F5E4] p-4 ${
                            student.flagged ? 'ring-1 ring-[#732f2f]' : ''
                          }`}
                        >
                          <div className={'flex flex-wrap items-center justify-between gap-3'}>
                            <div>
                              <div className={'flex items-center gap-2 text-sm font-semibold text-[#032622]'}>
                                {student.name}
                                {student.flagged && (
                                  <Flag className={'h-4 w-4 text-[#732f2f]'} />
                                )}
                              </div>
                              <p className={'text-xs text-[#032622]/60'}>Dernière activité : {student.lastActivity}</p>
                            </div>
                            <div className={`text-xs font-semibold ${formatStatusColor(student.status)}`}>
                              {student.status}
                            </div>
                          </div>
                          <div className={'mt-3 h-2 w-full rounded-full bg-[#E7E2CE]'}>
                            <div
                              className={`h-full rounded-full ${
                                student.progress === 100 ? 'bg-[#032622]' : 'bg-[#95a695]'
                              }`}
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <div className={'mt-2 text-right text-xs text-[#032622]/60'}>Progression : {student.progress}%</div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section>
                  <div className={'flex items-center gap-2'}>
                    <AlertTriangle className={'h-5 w-5 text-[#732f2f]'} />
                    <h3 className={'text-lg font-semibold text-[#032622]'}>Alertes anti-triche</h3>
                  </div>

                  <div className={'mt-3 space-y-3'}>
                    {selectedBlock.flags.filter((flag) => flag.status === 'pending').length === 0 ? (
                      <div className={'rounded border border-dashed border-[#032622]/40 p-4 text-sm text-[#032622]/70'}>
                        Aucune alerte en attente pour ce bloc.
                      </div>
                    ) : (
                      selectedBlock.flags
                        .filter((flag) => flag.status === 'pending')
                        .map((flag) => (
                          <div
                            key={flag.id}
                            className={'flex flex-col gap-2 rounded border border-[#032622]/20 bg-[#F8F5E4] p-4 text-sm text-[#032622]'}
                          >
                            <div className={'flex items-center justify-between'}>
                              <span className={'font-semibold'}>{flag.student}</span>
                              <span className={'text-xs text-[#032622]/60'}>{flag.timestamp}</span>
                            </div>
                            <p className={'text-sm text-[#032622]/80'}>{flag.reason}</p>
                            <div className={'flex justify-end'}>
                              <button
                                onClick={() => handleResolveFlag(selectedBlock.id, flag.id)}
                                className={'flex items-center gap-2 rounded border border-[#032622] px-3 py-1 text-xs font-semibold text-[#032622] transition hover:bg-[#032622] hover:text-[#F8F5E4]'}
                              >
                                <CheckCircle className={'h-4 w-4'} />
                                Marquer comme résolu
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className={'rounded border border-dashed border-[#032622]/30 p-8 text-center text-sm text-[#032622]/70'}>
              Sélectionnez un bloc pour afficher ses détails.
            </div>
          )}

          {flaggedEvents.length > 0 && (
            <div className={'border border-[#032622] bg-[#F8F5E4] p-4 shadow-sm'}>
              <div className={'flex items-center gap-2'}>
                <AlertTriangle className={'h-5 w-5 text-[#732f2f]'} />
                <h3 className={'text-lg font-semibold text-[#032622]'}>Alertes en attente</h3>
              </div>
              <div className={'mt-3 space-y-3'}>
                {flaggedEvents.map((event) => (
                  <div
                    key={event.id}
                    className={'flex flex-wrap items-center justify-between gap-3 rounded border border-[#032622]/20 bg-[#F8F5E4] px-4 py-3 text-sm text-[#032622]'}
                  >
                    <div>
                      <p className={'font-semibold'}>{event.student}</p>
                      <p className={'text-xs text-[#032622]/70'}>{event.reason}</p>
                    </div>
                    <div className={'flex items-center gap-3'}>
                      <div className={'text-right text-xs text-[#032622]/60'}>
                        <p>{event.timestamp}</p>
                        <p className={'font-semibold text-[#032622]'}>{event.blockTitle}</p>
                      </div>
                      <button
                        onClick={() => setSelectedBlockId(event.blockId)}
                        className={'rounded border border-[#032622] px-3 py-1 text-xs font-semibold text-[#032622] transition hover:bg-[#032622] hover:text-[#F8F5E4]'}
                      >
                        Voir le bloc
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className={'fixed inset-0 z-50 flex items-center justify-center bg-[#032622]/70 px-4'}>
          <div className={'w-full max-w-3xl border border-[#032622] bg-[#F8F5E4] shadow-2xl'}>
            <div className={'flex items-center justify-between border-b border-[#032622]/20 px-6 py-4'}>
              <h2 className={'text-2xl font-semibold text-[#032622]'}>Création d'un bloc</h2>
              <button
                onClick={closeModal}
                className={'rounded p-1 text-[#032622]/70 transition hover:bg-[#032622]/10 hover:text-[#032622]'}
                aria-label={'Fermer'}
              >
                <X className={'h-5 w-5'} />
              </button>
            </div>

            <div className={'space-y-6 px-6 py-6'}>
              <div className={'space-y-2'}>
                <label className={'text-xs font-semibold uppercase tracking-wide text-[#032622]/70'}>
                  Bloc de compétence
                </label>
                <input
                  value={newBlockTitle}
                  onChange={(event) => setNewBlockTitle(event.target.value)}
                  placeholder={'Libellé du bloc'}
                  className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                />
              </div>

              <div className={'space-y-2'}>
                <label className={'text-xs font-semibold uppercase tracking-wide text-[#032622]/70'}>
                  Description
                </label>
                <textarea
                  value={newBlockDescription}
                  onChange={(event) => setNewBlockDescription(event.target.value)}
                  rows={3}
                  placeholder={'Objectifs, compétences ciblées, etc.'}
                  className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                />
              </div>

              <div className={'space-y-4'}>
                <div className={'flex items-center justify-between'}>
                  <h3 className={'text-lg font-semibold text-[#032622]'}>Modules du bloc</h3>
                  <button
                    onClick={() =>
                      setNewBlockModules((prev) => [
                        ...prev,
                        { id: createId(), title: '', type: 'cours', duration: '', fileName: '', fileSize: '' }
                      ])
                    }
                    className={'flex items-center gap-2 rounded border border-[#032622] px-3 py-1 text-xs font-semibold text-[#032622] transition hover:bg-[#032622] hover:text-[#F8F5E4]'}
                  >
                    <Plus className={'h-4 w-4'} />
                    Ajouter un module
                  </button>
                </div>

                <div className={'space-y-3'}>
                  {newBlockModules.map((module, index) => (
                    <div
                      key={module.id}
                      className={'grid gap-3 rounded border border-[#032622]/20 bg-[#F8F5E4] px-4 py-4 md:grid-cols-6'}
                    >
                      <div className={'md:col-span-3'}>
                        <input
                          value={module.title}
                          onChange={(event) =>
                            setNewBlockModules((prev) =>
                              prev.map((item, i) =>
                                i === index ? { ...item, title: event.target.value } : item
                              )
                            )
                          }
                          placeholder={'Titre du module'}
                          className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                        />
                      </div>
                      <div className={'md:col-span-2'}>
                        <select
                          value={module.type}
                          onChange={(event) =>
                            setNewBlockModules((prev) =>
                              prev.map((item, i) =>
                                i === index
                                  ? { ...item, type: event.target.value as ModuleType }
                                  : item
                              )
                            )
                          }
                          className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                        >
                          {Object.entries(moduleTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={'flex items-center gap-2 md:col-span-1'}>
                        <input
                          value={module.duration}
                          onChange={(event) =>
                            setNewBlockModules((prev) =>
                              prev.map((item, i) =>
                                i === index ? { ...item, duration: event.target.value } : item
                              )
                            )
                          }
                          placeholder={'Durée'}
                          className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                        />
                        {newBlockModules.length > 1 && (
                          <button
                            onClick={() =>
                              setNewBlockModules((prev) => prev.filter((item) => item.id !== module.id))
                            }
                            className={'rounded border border-[#032622]/30 p-2 text-[#032622]/70 transition hover:border-[#032622] hover:text-[#032622]'}
                            aria-label={'Supprimer'}
                          >
                            <Trash2 className={'h-4 w-4'} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={'flex items-center justify-between rounded border border-[#032622]/30 bg-[#F8F5E4] px-4 py-3'}>
                <div className={'flex items-center gap-2 text-sm text-[#032622]'}>
                  <ShieldAlert className={'h-4 w-4'} />
                  Activer la surveillance anti-triche
                </div>
                <button
                  onClick={() => setNewBlockAntiCheat((prev) => !prev)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full border border-[#032622] transition ${
                    newBlockAntiCheat ? 'bg-[#032622]' : 'bg-[#F8F5E4]'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-[#F8F5E4] transition ${
                      newBlockAntiCheat ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className={'flex justify-end gap-3 pb-2 text-sm'}>
                <button
                  onClick={closeModal}
                  className={'rounded border border-[#032622]/40 px-5 py-2 text-[#032622]/70 transition hover:border-[#032622] hover:text-[#032622]'}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateBlock}
                  disabled={isCreateDisabled}
                  className={`rounded px-5 py-2 font-semibold transition ${
                    isCreateDisabled
                      ? 'cursor-not-allowed border border-[#032622]/20 bg-[#d9d2b6] text-[#032622]/60'
                      : 'border border-[#032622] bg-[#032622] text-[#F8F5E4] hover:bg-[#032622]/90'
                  }`}
                >
                  Créer le bloc
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        isConfirm={modalState.isConfirm}
        onConfirm={modalState.onConfirm ? handleConfirm : undefined}
        onCancel={modalState.onCancel ? handleCancel : undefined}
      />
    </div>
  );
}
