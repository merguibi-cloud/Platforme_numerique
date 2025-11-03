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

interface ModulekItem {
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

const initialModuleks: ModulekItem[] = [
  {
    id: createId(),
    title: 'Module 1 - Stratégie organisationnelle',
    description: "Contribuer à la stratégie de développement de l'organisation",
    antiCheatEnabled: true,
    modules: [
      {
        id: createId(),
        title: 'Vidéo - Vision et mission',
        type: 'video',
        duration: '18 min'
      },
      {
        id: createId(),
        title: 'Cours interactif - SWOT avancé',
        type: 'cours',
        duration: '45 min'
      },
      {
        id: createId(),
        title: 'Quiz - Alignement stratégique',
        type: 'quiz',
        duration: '15 questions'
      },
      {
        id: createId(),
        title: 'PDF - Synthèse stratégique',
        type: 'pdf',
        duration: '24 pages',
        fileName: 'synthese-strategique.pdf',
        fileSize: '2.3 MB'
      },
      {
        id: createId(),
        title: 'Document Word - Template rapport',
        type: 'word',
        duration: '8 pages',
        fileName: 'template-rapport.docx',
        fileSize: '1.1 MB'
      }
    ],
    students: [
      {
        id: createId(),
        name: 'Chadi El Assowad',
        progress: 95,
        status: 'Terminé',
        lastActivity: "Aujourd'hui · 09:45",
        flagged: false
      },
      {
        id: createId(),
        name: 'Lina Bouchard',
        progress: 76,
        status: 'En cours',
        lastActivity: 'Hier · 14:12',
        flagged: true
      },
      {
        id: createId(),
        name: 'Youssef Karim',
        progress: 48,
        status: 'En retard',
        lastActivity: '12/10 · 18:05',
        flagged: false
      }
    ],
    flags: [
      {
        id: createId(),
        student: 'Mikasa Ackerman',
        timestamp: 'Hier · 14:12',
        reason: "Changement d'onglet détecté pendant le quiz",
        status: 'pending'
      }
    ]
  },
  {
    id: createId(),
    title: 'Module 2 - Pilotage de la performance',
    description: 'Suivre et optimiser les indicateurs clés de performance',
    antiCheatEnabled: true,
    modules: [
      {
        id: createId(),
        title: 'Cours - Tableaux de bord dynamiques',
        type: 'cours',
        duration: '35 min'
      },
      {
        id: createId(),
        title: 'PDF - Kit indicateurs clés',
        type: 'pdf',
        duration: '16 pages'
      },
      {
        id: createId(),
        title: 'Quiz - Lecture des KPIs',
        type: 'quiz',
        duration: '12 questions'
      }
    ],
    students: [
      {
        id: createId(),
        name: 'Anaïs Dubois',
        progress: 58,
        status: 'En cours',
        lastActivity: "Aujourd'hui · 11:02",
        flagged: false
      },
      {
        id: createId(),
        name: 'Marc Lefort',
        progress: 32,
        status: 'En retard',
        lastActivity: '10/10 · 17:20',
        flagged: false
      }
    ],
    flags: []
  },
  {
    id: createId(),
    title: "Module 3 - Management de l'innovation",
    description: "Impulser une culture d'innovation durable",
    antiCheatEnabled: false,
    modules: [
      {
        id: createId(),
        title: 'Vidéo - Design thinking',
        type: 'video',
        duration: '22 min'
      },
      {
        id: createId(),
        title: 'Quiz - Posture innovante',
        type: 'quiz',
        duration: '10 questions'
      },
      {
        id: createId(),
        title: 'PDF - Études de cas',
        type: 'pdf',
        duration: '20 pages'
      },
      {
        id: createId(),
        title: 'Images - Galerie exemples',
        type: 'image',
        duration: '15 images',
        fileName: 'galerie-innovation.zip',
        fileSize: '12.8 MB'
      }
    ],
    students: [
      {
        id: createId(),
        name: 'Inès Roussel',
        progress: 58,
        status: 'En cours',
        lastActivity: 'Hier · 20:10',
        flagged: false
      },
      {
        id: createId(),
        name: 'Thomas Nguyen',
        progress: 22,
        status: 'En retard',
        lastActivity: '08/10 · 08:33',
        flagged: false
      }
    ],
    flags: [
      {
        id: createId(),
        student: 'Levi Ackerman',
        timestamp: '08/09 · 08:20',
        reason: 'Fenêtre du navigateur réduite pendant la vidéo',
        status: 'resolved'
      }
    ]
  }
];

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

export default function FormateurCourseManager() {
  const [blocks, setModuleks] = useState<ModulekItem[]>(initialModuleks);
  const [selectedModulekId, setSelectedModulekId] = useState<string | null>(initialModuleks[0]?.id ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModulekTitle, setNewModulekTitle] = useState('');
  const [newModulekDescription, setNewModulekDescription] = useState('');
  const [newModulekAntiCheat, setNewModulekAntiCheat] = useState(true);
  const [newModulekModules, setNewModulekModules] = useState<Array<{ id: string; title: string; type: ModuleType; duration: string; fileName?: string; fileSize?: string }>>([
    {
      id: createId(),
      title: '',
      type: 'cours',
      duration: '',
      fileName: '',
      fileSize: ''
    }
  ]);
  const [addingModuleForModulek, setAddingModuleForModulek] = useState<string | null>(null);
  const [moduleDraft, setModuleDraft] = useState(defaultModuleDraft());

  const selectedModulek = blocks.find((block) => block.id === selectedModulekId) ?? null;

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

  const resetNewModulekForm = () => {
    setNewModulekTitle('');
    setNewModulekDescription('');
    setNewModulekAntiCheat(true);
    setNewModulekModules([
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
    resetNewModulekForm();
  };

  const handleCreateModulek = () => {
    if (!newModulekTitle.trim() || newModulekModules.some((module) => !module.title.trim())) {
      return;
    }

    const newModulekId = createId();

    const newModulek: ModulekItem = {
      id: newModulekId,
      title: newModulekTitle.trim(),
      description: newModulekDescription.trim() || 'Description à compléter',
      antiCheatEnabled: newModulekAntiCheat,
      modules: newModulekModules.map((module) => ({
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

    setModuleks((prev) => [...prev, newModulek]);
    setSelectedModulekId(newModulekId);
    closeModal();
  };

  const handleToggleAntiCheat = (blockId: string) => {
    setModuleks((prev) =>
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
    setModuleks((prev) =>
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

  const handleAddModuleToModulek = (blockId: string) => {
    if (!moduleDraft.title.trim()) {
      return;
    }

    setModuleks((prev) =>
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

    setAddingModuleForModulek(null);
    setModuleDraft(defaultModuleDraft());
  };

  const handleRemoveModule = (blockId: string, moduleId: string) => {
    setModuleks((prev) =>
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

  const handleDeleteModulek = (blockId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.')) {
      setModuleks((prev) => prev.filter((block) => block.id !== blockId));
      // Si le bloc supprimé était sélectionné, sélectionner le premier bloc restant
      if (selectedModulekId === blockId) {
        const remainingModuleks = blocks.filter((block) => block.id !== blockId);
        setSelectedModulekId(remainingModuleks.length > 0 ? remainingModuleks[0].id : null);
      }
    }
  };

  const isCreateDisabled = !newModulekTitle.trim() || newModulekModules.some((module) => !module.title.trim());

  return (
    <div className={'space-y-6'}>
      <div className={'grid gap-4 md:grid-cols-3 xl:grid-cols-4'}>
        <div className={'border border-[#032622] bg-[#F8F5E4] p-4 shadow-sm'}>
          <div className={'flex items-center justify-between'}>
            <span className={'text-xs uppercase tracking-wide text-[#032622]/70'}>Modules actifs</span>
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
            <span className={'text-xs uppercase tracking-wide text-[#032622]/70'}>Module sélectionné</span>
            <UserCheck className={'h-5 w-5 text-[#032622]'} />
          </div>
          <p className={'mt-2 text-lg font-semibold text-[#032622]'}>
            {selectedModulek ? selectedModulek.title : 'Aucun bloc'}
          </p>
          <p className={'text-sm text-[#032622]/70'}>
            {selectedModulek ? `${selectedModulek.modules.length} module(s) actifs` : 'Sélectionnez un bloc'}
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
                block.id === selectedModulekId ? 'ring-2 ring-[#032622]' : ''
              }`}
              onClick={() => setSelectedModulekId(block.id)}
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
                        handleDeleteModulek(block.id);
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
          {selectedModulek ? (
            <div className={'border border-[#032622] bg-[#F8F5E4] p-6 shadow-sm'}>
              <div className={'flex flex-col gap-4 md:flex-row md:items-start md:justify-between'}>
                <div>
                  <h2 className={'text-2xl font-semibold text-[#032622]'}>{selectedModulek.title}</h2>
                  <p className={'mt-2 text-sm leading-relaxed text-[#032622]/80'}>{selectedModulek.description}</p>
                </div>
                <div className={'flex flex-col items-start gap-2'}>
                  <div className={'flex items-center gap-2 text-sm font-semibold text-[#032622]'}>
                    <ShieldAlert className={'h-4 w-4'} />
                    {selectedModulek.antiCheatEnabled ? 'Anti-triche activée' : 'Anti-triche désactivée'}
                  </div>
                  <button
                    onClick={() => handleToggleAntiCheat(selectedModulek.id)}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full border border-[#032622] transition ${
                      selectedModulek.antiCheatEnabled ? 'bg-[#032622]' : 'bg-[#F8F5E4]'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-[#F8F5E4] transition ${
                        selectedModulek.antiCheatEnabled ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className={'mt-6 space-y-5'}>
                <section>
                  <div className={'flex items-center justify-between'}>
                    <h3 className={'text-lg font-semibold text-[#032622]'}>Modules du bloc</h3>
                    {addingModuleForModulek === selectedModulek.id ? null : (
                      <button
                        onClick={() => {
                          setAddingModuleForModulek(selectedModulek.id);
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
                    {selectedModulek.modules.map((module) => {
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
                            onClick={() => handleRemoveModule(selectedModulek.id, module.id)}
                            className={'rounded border border-[#032622]/30 p-2 text-[#032622]/70 transition hover:border-[#032622] hover:text-[#032622]'}
                            title={'Supprimer le module'}
                          >
                            <Trash2 className={'h-4 w-4'} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {addingModuleForModulek === selectedModulek.id && (
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
                            setAddingModuleForModulek(null);
                            setModuleDraft(defaultModuleDraft());
                          }}
                          className={'rounded border border-[#032622]/40 px-4 py-2 text-[#032622]/70 transition hover:border-[#032622] hover:text-[#032622]'}
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleAddModuleToModulek(selectedModulek.id)}
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
                    <span className={'text-xs text-[#032622]/70'}>{selectedModulek.students.length} inscrit(s)</span>
                  </div>

                  <div className={'mt-3 space-y-3'}>
                    {selectedModulek.students.length === 0 ? (
                      <div className={'rounded border border-dashed border-[#032622]/30 p-4 text-center text-sm text-[#032622]/70'}>
                        Aucun étudiant inscrit pour le moment.
                      </div>
                    ) : (
                      selectedModulek.students.map((student) => (
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
                    {selectedModulek.flags.filter((flag) => flag.status === 'pending').length === 0 ? (
                      <div className={'rounded border border-dashed border-[#032622]/40 p-4 text-sm text-[#032622]/70'}>
                        Aucune alerte en attente pour ce bloc.
                      </div>
                    ) : (
                      selectedModulek.flags
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
                                onClick={() => handleResolveFlag(selectedModulek.id, flag.id)}
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
                        onClick={() => setSelectedModulekId(event.blockId)}
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
                  Module de compétence
                </label>
                <input
                  value={newModulekTitle}
                  onChange={(event) => setNewModulekTitle(event.target.value)}
                  placeholder={'Libellé du bloc'}
                  className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                />
              </div>

              <div className={'space-y-2'}>
                <label className={'text-xs font-semibold uppercase tracking-wide text-[#032622]/70'}>
                  Description
                </label>
                <textarea
                  value={newModulekDescription}
                  onChange={(event) => setNewModulekDescription(event.target.value)}
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
                      setNewModulekModules((prev) => [
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
                  {newModulekModules.map((module, index) => (
                    <div
                      key={module.id}
                      className={'grid gap-3 rounded border border-[#032622]/20 bg-[#F8F5E4] px-4 py-4 md:grid-cols-6'}
                    >
                      <div className={'md:col-span-3'}>
                        <input
                          value={module.title}
                          onChange={(event) =>
                            setNewModulekModules((prev) =>
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
                            setNewModulekModules((prev) =>
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
                            setNewModulekModules((prev) =>
                              prev.map((item, i) =>
                                i === index ? { ...item, duration: event.target.value } : item
                              )
                            )
                          }
                          placeholder={'Durée'}
                          className={'w-full border border-[#032622] bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]'}
                        />
                        {newModulekModules.length > 1 && (
                          <button
                            onClick={() =>
                              setNewModulekModules((prev) => prev.filter((item) => item.id !== module.id))
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
                  onClick={() => setNewModulekAntiCheat((prev) => !prev)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full border border-[#032622] transition ${
                    newModulekAntiCheat ? 'bg-[#032622]' : 'bg-[#F8F5E4]'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-[#F8F5E4] transition ${
                      newModulekAntiCheat ? 'translate-x-8' : 'translate-x-1'
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
                  onClick={handleCreateModulek}
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
    </div>
  );
}
