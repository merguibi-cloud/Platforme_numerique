"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
  MessageCircle,
  PenSquare,
  Play,
  Bookmark,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  NotebookPen,
  Eraser,
  Highlighter,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Copy,
  Search,
  Filter,
  Star,
  Edit3,
  X,
  Check,
} from "lucide-react";

const heroCourse = {
  greeting: "Bonjour, El Assowad Chadi",
  headline: "Prêt à apprendre quelque chose de nouveau aujourd'hui ?",
};

// Les blocs sont maintenant chargés depuis la base de données


type Step = "overview" | "module" | "quiz" | "results";

// Types pour les nouvelles fonctionnalités
interface Highlight {
  id: string;
  text: string;
  color: string;
  colorName: string;
  timestamp: Date;
  position: number;
  note?: string;
  isFavorite?: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  highlights: string[]; // IDs des surlignages liés
  timestamp: Date;
  tags: string[];
  isFavorite: boolean;
}

interface SmartNote {
  id: string;
  content: string;
  source: string;
  timestamp: Date;
  category: 'insight' | 'question' | 'action' | 'definition';
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  tags: string[];
  isUrgent: boolean;
}

export default function MesFormationsPage() {
  const [step, setStep] = useState<Step>("overview");
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null,
  });
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookContent, setNotebookContent] = useState("");
  const [moduleNotes, setModuleNotes] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const courseContentRef = useRef<HTMLDivElement | null>(null);

  // États pour les nouvelles fonctionnalités
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [smartNotes, setSmartNotes] = useState<SmartNote[]>([]);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('#fef3c7');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showSmartNotesPanel, setShowSmartNotesPanel] = useState(false);
  // Les blocs sont maintenant chargés depuis la base de données
  const [courseBlocks, setCourseBlocks] = useState<any[]>([]);
  const [isLoadingBlocs, setIsLoadingBlocs] = useState(true);
  const [agendaEvents, setAgendaEvents] = useState<Record<number, any[]>>({});
  const [latestGrades, setLatestGrades] = useState<any[]>([]);
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [isEditingNote, setIsEditingNote] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Fonction pour obtenir les événements du jour sélectionné
  const getCurrentDayEvents = () => {
    // Chercher les événements pour le jour sélectionné dans le mois actuel
    const eventsForDay = agendaEvents[selectedDay] || [];
    
    // Filtrer les événements qui correspondent au mois et à l'année actuels
    return eventsForDay.filter((event: any) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    });
  };

  // Fonction pour obtenir les jours du mois actuel
  const getDaysInCurrentMonth = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }
    
    // Compléter jusqu'à 42 jours (6 semaines)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ day, isCurrentMonth: false });
    }
    
    return days;
  };


  // Charger les blocs depuis l'API
  useEffect(() => {
    const loadBlocs = async () => {
      try {
        setIsLoadingBlocs(true);
        const response = await fetch('/api/espace-etudiant/blocs', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.blocs) {
            // Formater les blocs pour l'affichage
            const formattedBlocs = data.blocs.map((bloc: any) => {
              // Déterminer le texte du bouton
              let cta = 'COMMENCER';
              if (bloc.locked) {
                cta = 'COMMENCER';
              } else if (bloc.progression === 100) {
                cta = 'REVOIR LE COURS';
              } else if (bloc.progression > 0) {
                cta = 'REPRENDRE';
              }
              
              return {
                id: bloc.id,
                title: `BLOC ${bloc.numero_bloc}`,
                subtitle: bloc.titre,
                progress: bloc.progression,
                locked: bloc.locked,
                cta: cta,
                premier_cours_id: bloc.premier_cours_id,
                formation_id: bloc.formation_id
              };
            });
            setCourseBlocks(formattedBlocs);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des blocs:', error);
      } finally {
        setIsLoadingBlocs(false);
      }
    };
    loadBlocs();
  }, []);

  // Charger l'agenda depuis l'API
  useEffect(() => {
    const loadAgenda = async () => {
      try {
        setIsLoadingAgenda(true);
        const response = await fetch('/api/espace-etudiant/agenda', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.evenements) {
            setAgendaEvents(data.evenements);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'agenda:', error);
      } finally {
        setIsLoadingAgenda(false);
      }
    };
    loadAgenda();
  }, []);

  // Charger les notes depuis l'API
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoadingNotes(true);
        const response = await fetch('/api/espace-etudiant/notes', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.notes) {
            setLatestGrades(data.notes);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    };
    loadNotes();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("formation-notebook");
      if (saved) {
        setNotebookContent(saved);
      }
      const savedModuleNotes = window.localStorage.getItem("formation-module-notes-bloc1");
      if (savedModuleNotes) {
        setModuleNotes(savedModuleNotes);
      }
      
      // Charger les surlignages sauvegardés
      const savedHighlights = window.localStorage.getItem("formation-highlights-bloc1");
      if (savedHighlights) {
        try {
          const highlightsData = JSON.parse(savedHighlights);
          setHighlights(highlightsData.map((h: any) => ({
            ...h,
            timestamp: new Date(h.timestamp)
          })));
        } catch (error) {
          console.warn("Erreur lors du chargement des surlignages:", error);
        }
      }
      
      // Charger les notes sauvegardées
      const savedNotes = window.localStorage.getItem("formation-notes-bloc1");
      if (savedNotes) {
        try {
          const notesData = JSON.parse(savedNotes);
          setNotes(notesData.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })));
        } catch (error) {
          console.warn("Erreur lors du chargement des notes:", error);
        }
      }
      
      // Charger les smart notes sauvegardées
      const savedSmartNotes = window.localStorage.getItem("formation-smart-notes-bloc1");
      if (savedSmartNotes) {
        try {
          const smartNotesData = JSON.parse(savedSmartNotes);
          setSmartNotes(smartNotesData.map((sn: any) => ({
            ...sn,
            timestamp: new Date(sn.timestamp)
          })));
        } catch (error) {
          console.warn("Erreur lors du chargement des smart notes:", error);
        }
      }
      
      // Charger les tâches sauvegardées
      const savedTasks = window.localStorage.getItem("formation-tasks-bloc1");
      if (savedTasks) {
        try {
          const tasksData = JSON.parse(savedTasks);
          setTasks(tasksData.map((t: any) => ({
            ...t,
            dueDate: new Date(t.dueDate)
          })));
        } catch (error) {
          console.warn("Erreur lors du chargement des tâches:", error);
        }
      }
    }
  }, []);

  // Sauvegarde automatique des surlignages
  useEffect(() => {
    if (typeof window !== "undefined" && highlights.length > 0) {
      window.localStorage.setItem("formation-highlights-bloc1", JSON.stringify(highlights));
    }
  }, [highlights]);

  // Sauvegarde automatique des notes
  useEffect(() => {
    if (typeof window !== "undefined" && notes.length > 0) {
      window.localStorage.setItem("formation-notes-bloc1", JSON.stringify(notes));
    }
  }, [notes]);

  // Sauvegarde automatique des smart notes
  useEffect(() => {
    if (typeof window !== "undefined" && smartNotes.length > 0) {
      window.localStorage.setItem("formation-smart-notes-bloc1", JSON.stringify(smartNotes));
    }
  }, [smartNotes]);

  // Sauvegarde automatique des tâches
  useEffect(() => {
    if (typeof window !== "undefined" && tasks.length > 0) {
      window.localStorage.setItem("formation-tasks-bloc1", JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleNotebookChange = (value: string) => {
    setNotebookContent(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("formation-notebook", value);
    }
  };

  const handleModuleNotesChange = (value: string) => {
    setModuleNotes(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("formation-module-notes-bloc1", value);
    }
  };

  const highlightColors = [
    { label: "Jaune", value: "#fef3c7", name: "jaune" },
    { label: "Vert", value: "#d9f99d", name: "vert" },
    { label: "Rose", value: "#fbcfe8", name: "rose" },
    { label: "Bleu", value: "#bae6fd", name: "bleu" },
    { label: "Orange", value: "#fed7aa", name: "orange" },
    { label: "Violet", value: "#e9d5ff", name: "violet" },
  ];

  // Fonction améliorée pour appliquer un surlignage
  const applyHighlight = useCallback((color: string, colorName: string) => {
    if (!courseContentRef.current || typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }
    
    const range = selection.getRangeAt(0);
    if (!courseContentRef.current.contains(range.commonAncestorContainer)) return;
    
    const text = selection.toString().trim();
    if (!text) return;

    const span = document.createElement("span");
    span.style.backgroundColor = color;
    span.style.padding = "2px 4px";
    span.style.borderRadius = "3px";
    span.dataset.highlight = "true";
    span.dataset.highlightId = `highlight-${Date.now()}`;
    
    try {
      range.surroundContents(span);
      
      // Créer l'objet highlight
      const highlight: Highlight = {
        id: span.dataset.highlightId!,
        text: text,
        color: color,
        colorName: colorName,
        timestamp: new Date(),
        position: range.startOffset,
      };
      
      setHighlights(prev => [...prev, highlight]);
      selection.removeAllRanges();
    } catch (error) {
      console.warn("Impossible d'appliquer le surlignage sur cette sélection.", error);
    }
  }, []);

  // Fonction pour supprimer un surlignage spécifique
  const removeHighlight = useCallback((highlightId: string) => {
    const element = courseContentRef.current?.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (element && element.parentNode) {
      const parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
      parent.normalize?.();
    }
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
  }, []);

  // Fonction pour effacer tous les surlignages
  const clearAllHighlights = useCallback(() => {
    if (!courseContentRef.current) return;
    const highlightElements = courseContentRef.current.querySelectorAll('[data-highlight="true"]');
    highlightElements.forEach((element) => {
      const parent = element.parentNode;
      if (!parent) return;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
      parent.normalize?.();
    });
    setHighlights([]);
  }, []);

  // Fonction pour basculer le statut favori d'un surlignage
  const toggleHighlightFavorite = useCallback((highlightId: string) => {
    setHighlights(prev => prev.map(h => 
      h.id === highlightId ? { ...h, isFavorite: !h.isFavorite } : h
    ));
  }, []);

  // Fonction pour ajouter une note à un surlignage
  const addNoteToHighlight = useCallback((highlightId: string, note: string) => {
    setHighlights(prev => prev.map(h => 
      h.id === highlightId ? { ...h, note } : h
    ));
  }, []);

  // Fonctions pour la gestion des tâches
  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours par défaut
      priority: newTaskPriority,
      status: 'pending',
      tags: [],
      isUrgent: false,
    };
    
    setTasks(prev => [...prev, task]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
  }, [newTaskTitle, newTaskDescription, newTaskPriority]);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const toggleTaskUrgent = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, isUrgent: !task.isUrgent } : task
    ));
  }, []);

  const totalQuestions = 0;

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (quizError) {
      setQuizError(null);
    }
  };

  const score = useMemo(() => {
    return 0;
  }, [selectedAnswers]);

  const computedScoreOn20 = useMemo(() => {
    return 0;
  }, [score, totalQuestions]);

  const resetQuiz = () => {
    setSelectedAnswers({ 1: null, 2: null, 3: null });
  };

  const handleStartQuiz = () => {
    setShowQuizModal(false);
    resetQuiz();
    setQuizError(null);
    setStep("quiz");
  };

  const canSubmitQuiz = useMemo(() => {
    return Object.values(selectedAnswers).every((value) => value !== null);
  }, [selectedAnswers]);

  const handleSubmitQuiz = () => {
    if (!canSubmitQuiz) {
      setQuizError("Merci de répondre à toutes les questions avant de valider.");
      return;
    }
    setQuizError(null);
    setStep("results");
  };

  const progressMap: Record<Step, number> = {
    overview: 25,
    module: 50,
    quiz: 75,
    results: 100,
  };

  const renderProgressBar = () => (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
        <span className="text-xs sm:text-sm font-semibold text-[#032622] break-words">
          Bloc 1 · Contribuer à la stratégie de développement de l'organisation
        </span>
        <span className="text-xs sm:text-sm font-semibold text-[#032622] flex-shrink-0">
          {progressMap[step]}%
        </span>
      </div>
      <div className="h-1.5 sm:h-2 bg-gray-300 border border-black">
        <div
          className="h-full bg-[#032622] transition-all duration-500"
          style={{ width: `${progressMap[step]}%` }}
        ></div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="bg-[#032622] text-[#F8F5E4] p-4 sm:p-5 md:p-6 lg:p-8">
        <p className="text-sm sm:text-base md:text-lg opacity-80 mb-1 sm:mb-2">{heroCourse.greeting}</p>
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          {heroCourse.headline}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-5 md:gap-6">
        <div className="space-y-4">
          {isLoadingBlocs ? (
            <div className="text-center py-12 border border-black bg-[#F8F5E4]">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
              <p className="text-[#032622] mt-4">Chargement des blocs...</p>
            </div>
          ) : courseBlocks.length === 0 ? (
            <div className="text-center py-12 border border-black bg-[#F8F5E4]">
              <p className="text-[#032622]">Aucun bloc disponible</p>
            </div>
          ) : (
            courseBlocks.map((block) => (
            <div
              key={block.id}
              className={`border border-black bg-[#F8F5E4] flex flex-col lg:flex-row ${
                block.locked ? "opacity-70" : ""
              }`}
            >
              {/* Icône cadenas à gauche si verrouillé */}
              {block.locked && (
                <div className="lg:w-24 w-full lg:h-auto h-20 sm:h-24 border-b lg:border-b-0 lg:border-r border-black flex items-center justify-center bg-[#032622]">
                  <Image
                    src="/icon/Cadenas.png"
                    alt="Bloc verrouillé"
                    width={48}
                    height={48}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
              )}
              <div className="flex-1 p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase mb-1">
                      {block.title}
                    </p>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[#032622] break-words">
                      {block.subtitle}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-[#032622] flex-shrink-0">
                    <span>{block.progress}%</span>
                  </div>
                </div>
                <div className="h-1 sm:h-1.5 bg-gray-300 border border-black">
                  <div
                    className="h-full bg-[#032622] transition-all duration-300"
                    style={{ width: `${block.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="border-t lg:border-t-0 lg:border-l border-black p-4 sm:p-5 md:p-6 flex flex-col justify-center items-center w-full lg:w-auto lg:min-w-[180px] sm:min-w-[200px]">
                <Link
                  href={block.locked ? '#' : `/espace-etudiant/bloc/${block.formation_id}/${block.id}`}
                  className={`px-4 sm:px-5 md:px-6 py-2 text-xs sm:text-sm font-bold border border-black flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto ${
                    block.locked
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : block.progress > 0
                      ? "bg-[#032622] text-white hover:bg-[#044a3a] active:bg-[#033a2f]"
                      : "bg-[#6b7280] text-white hover:bg-[#4b5563] active:bg-[#374151]"
                  }`}
                  onClick={(e) => {
                    if (block.locked) {
                      e.preventDefault();
                    }
                  }}
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  <span className="whitespace-nowrap">{block.cta}</span>
                  {block.locked ? (
                    <Image
                      src="/icon/Cadenas.png"
                      alt="Verrouillé"
                      width={16}
                      height={16}
                      className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
                    />
                  ) : (
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Link>
              </div>
            </div>
            ))
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Événements à venir</h4>
            </div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-[10px] sm:text-xs font-bold text-[#032622] uppercase">
                  {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </h5>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(currentYear - 1);
                      } else {
                        setCurrentMonth(currentMonth - 1);
                      }
                    }}
                    className="p-1 sm:p-1.5 hover:bg-gray-200 active:bg-gray-300 rounded transition-colors"
                    aria-label="Mois précédent"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-[#032622]" />
                  </button>
                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(currentYear + 1);
                      } else {
                        setCurrentMonth(currentMonth + 1);
                      }
                    }}
                    className="p-1 sm:p-1.5 hover:bg-gray-200 active:bg-gray-300 rounded transition-colors"
                    aria-label="Mois suivant"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#032622]" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold text-[#032622] uppercase">
                {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <div>{day}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-[#032622]">
                {getDaysInCurrentMonth().map((dayObj, index) => {
                  // Vérifier si ce jour a des événements dans le mois actuel
                  const dayEvents = dayObj.isCurrentMonth && agendaEvents[dayObj.day] 
                    ? agendaEvents[dayObj.day].filter((event: any) => {
                        if (!event.date) return false;
                        const eventDate = new Date(event.date);
                        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
                      })
                    : [];
                  const hasEvents = dayEvents.length > 0;
                  
                  const isToday = dayObj.isCurrentMonth && 
                    dayObj.day === new Date().getDate() && 
                    currentMonth === new Date().getMonth() && 
                    currentYear === new Date().getFullYear();
                  
                  return (
                    <div
                      key={index}
                      className={`h-6 sm:h-7 md:h-8 flex items-center justify-center border border-black relative cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition-colors ${
                        !dayObj.isCurrentMonth ? "opacity-30 bg-gray-100" :
                        dayObj.day === selectedDay && isToday ? "bg-[#032622] text-white" :
                        isToday ? "bg-yellow-200" :
                        dayObj.day === selectedDay ? "bg-[#032622] text-white" : 
                        "bg-[#F8F5E4]"
                      }`}
                      onClick={() => {
                        if (dayObj.isCurrentMonth) {
                          setSelectedDay(dayObj.day);
                        }
                      }}
                      title={hasEvents ? `${dayEvents.length} événement(s)` : ''}
                    >
                      <span className="text-[10px] sm:text-xs">{dayObj.day}</span>
                      {hasEvents && (
                        <span className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#032622] rounded-full bottom-0.5 sm:bottom-1"></span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 pt-2">
                {isLoadingAgenda ? (
                  <div className="text-center text-[#032622] opacity-60 text-xs py-4">
                    Chargement des événements...
                  </div>
                ) : getCurrentDayEvents().length > 0 ? (
                  getCurrentDayEvents().map((event, index) => (
                    <div 
                      key={event.id || index} 
                      className={`border border-black p-3 text-xs ${
                        event.type === 'important' ? 'bg-yellow-100' : 
                        event.type === 'late' ? 'bg-red-100' : 
                        'bg-white/60'
                      }`}
                    >
                      <div className="font-bold text-[#032622]">{event.title}</div>
                      <div className="text-[#032622] opacity-80">{event.time || '09h00'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#032622] opacity-60 text-xs py-4">
                    Aucun événement prévu ce jour
                  </div>
                )}
              </div>
              <Link href="/espace-etudiant/agenda" className="w-full">
                <button className="w-full border border-black bg-[#F8F5E4] text-[#032622] px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-gray-200 active:bg-gray-300 transition-colors">
                  <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>OUVRIR L'AGENDA</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Mes derniers rendus</h4>
            </div>
            <div className="p-3 sm:p-4">
              {isLoadingNotes ? (
                <div className="text-center text-[#032622] opacity-60 text-xs py-4">
                  Chargement des notes...
                </div>
              ) : latestGrades.length > 0 ? (
                <>
                  {latestGrades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between border border-black mb-2 sm:mb-3 last:mb-0"
                    >
                      <div className="p-2 sm:p-3 flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-[#032622] opacity-80 truncate">{grade.title}</p>
                        <p className="text-xs sm:text-sm font-semibold text-[#032622] truncate">{grade.label}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-[#032622] text-white font-bold text-sm sm:text-base md:text-lg min-w-[60px] sm:min-w-[70px] text-center flex-shrink-0">
                        {grade.grade}
                      </div>
                    </div>
                  ))}
                  <Link 
                    href="/espace-etudiant/releve-notes"
                    className="text-xs font-semibold text-[#032622] flex items-center space-x-1 mt-2 hover:underline"
                  >
                    <span>VOIR TOUTES LES NOTES</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <div className="text-center text-[#032622] opacity-60 text-xs py-4">
                  Aucune note disponible
                </div>
              )}
            </div>
          </div>

          <div className="border border-black bg-[#032622] text-white p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div>
              <p className="text-[10px] sm:text-xs uppercase font-bold">Pense-bête</p>
              <p className="text-xs sm:text-sm opacity-80">Ajoute ici les points clés à retenir de ton module.</p>
            </div>
            <button className="w-full bg-[#F8F5E4] text-[#032622] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold border border-black flex items-center justify-center space-x-2 hover:bg-[#F8F5E4]/90 active:bg-[#F8F5E4]/80 transition-colors"
              onClick={() => setIsNotebookOpen(true)}
            >
              <NotebookPen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>OUVRIR LE BLOC-NOTES</span>
            </button>
          </div>

          <div className="border border-black bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#032622] flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs uppercase font-bold text-[#032622]">Chat de discussion</p>
                <p className="text-[10px] sm:text-xs text-[#032622] opacity-80">
                  Pose tes questions à l'animateur de la formation.
                </p>
              </div>
            </div>
            <button className="w-full bg-[#032622] text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold border border-black hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors">
              ACCÉDER AU CHAT
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModuleView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("overview")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR AUX FORMATIONS</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.2fr] gap-4 sm:gap-5 md:gap-6">
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-4 sm:p-5 md:p-6">
            <p className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Analyse de marché et veille stratégique
            </p>
            {/* Lecteur vidéo avec design simplifié */}
            <div className="relative mb-6 group">
              <div className="relative bg-[#032622] aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-[#032622] hover:shadow-3xl transition-all duration-300">
                {/* Lecteur vidéo principal */}
              <video
                src="/menue_etudiant/nonselectionner/SSvid.net--Technique-de-vente-Les-10-qualités-pour-devenir-un_1080p.mp4"
                controls
                  className="w-full h-full object-cover rounded-lg"
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                
                {/* Overlay avec informations essentielles */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      Durée: 8:42
                    </span>
            </div>
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      HD 1080p
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Options utiles pour les étudiants */}
              <div className="mt-3 sm:mt-4 bg-[#F8F5E4] border border-[#032622] rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase tracking-wider">
                    Options d'étude
                  </h4>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 sm:p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-colors group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase text-center">
                      Lecture rapide
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 sm:p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-colors group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase text-center">
                      Marquer
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 sm:p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-colors group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase text-center">
                      Télécharger
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 sm:p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 active:bg-[#032622]/10 transition-colors group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase text-center">
                      Questions
                    </span>
                  </button>
                </div>
                
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#032622]/20">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-[#032622]/60 text-[10px] sm:text-xs uppercase">Transcription</p>
                      <button className="text-[#032622] font-bold text-xs sm:text-sm hover:text-[#01302C] active:text-[#012a26] transition-colors">
                        Voir
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#032622]/60 text-[10px] sm:text-xs uppercase">Sous-titres</p>
                      <button className="text-[#032622] font-bold text-xs sm:text-sm hover:text-[#01302C] active:text-[#012a26] transition-colors">
                        FR/EN
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#032622]/60 text-[10px] sm:text-xs uppercase">Vitesse</p>
                      <button className="text-[#032622] font-bold text-xs sm:text-sm hover:text-[#01302C] active:text-[#012a26] transition-colors">
                        1x
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
              <div className="flex items-center space-x-2">
                <Highlighter className="w-3 h-3 sm:w-4 sm:h-4 text-[#032622]" />
                <span className="text-[10px] sm:text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                </span>
              </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowNotesPanel(!showNotesPanel)}
                    className="flex items-center space-x-1 border border-black px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors"
                  >
                    <NotebookPen className="w-3 h-3" />
                    <span>Notes ({highlights.length})</span>
                  </button>
                  <button
                    onClick={() => setShowSmartNotesPanel(!showSmartNotesPanel)}
                    className="flex items-center space-x-1 border border-black px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors"
                  >
                    <Star className="w-3 h-3" />
                    <span>Smart Notes</span>
                  </button>
                  <button
                    onClick={() => setShowTaskPanel(!showTaskPanel)}
                    className="flex items-center space-x-1 border border-black px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Tâches ({tasks.filter(t => t.status !== 'completed').length})</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                    onClick={() => applyHighlight(color.value, color.name)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${
                      selectedHighlightColor === color.value ? 'border-[#032622] shadow-lg' : 'border-gray-400'
                    }`}
                  style={{ backgroundColor: color.value }}
                  title={`Surligner en ${color.label}`}
                  />
              ))}
              <button
                  onClick={() => {
                    // Mode gomme : cliquer sur un surlignage pour le supprimer
                    setShowHighlightMenu(!showHighlightMenu);
                  }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 rounded-lg transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
                    showHighlightMenu ? 'border-red-500 bg-red-100' : 'border-gray-400 bg-gray-100'
                  }`}
                  title="Mode gomme - Clique sur un surlignage pour le supprimer"
                >
                  <Eraser className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {showHighlightMenu && (
                  <div className="flex items-center space-x-1 border border-red-500 bg-red-50 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-red-700 rounded">
                <Eraser className="w-3 h-3" />
                    <span className="whitespace-nowrap">Mode gomme actif</span>
                  </div>
                )}
                <button
                  onClick={clearAllHighlights}
                  className="flex items-center space-x-1 border border-black px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-red-100 hover:text-red-700 active:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Effacer tout</span>
              </button>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center space-x-1 border border-black px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold transition-colors ${
                    showFavoritesOnly 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-[#F8F5E4] text-[#032622] hover:bg-yellow-100 hover:text-yellow-700'
                  }`}
                >
                  <Star className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  <span>Favoris</span>
                </button>
                <div className="flex items-center space-x-2 ml-auto w-full sm:w-auto">
                  <Search className="w-3 h-3 text-[#032622] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-black px-2 py-1 text-[10px] sm:text-xs bg-[#F8F5E4] text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622] flex-1 sm:flex-initial"
                  />
                </div>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#032622] mb-3 sm:mb-4">
              Analyse de marché et veille stratégique
            </h3>
            <div
              ref={courseContentRef}
              className={`space-y-3 sm:space-y-4 text-xs sm:text-sm text-[#032622] leading-relaxed ${
                showHighlightMenu ? 'cursor-crosshair' : ''
              }`}
              onClick={(e) => {
                if (showHighlightMenu) {
                  const target = e.target as HTMLElement;
                  const highlightElement = target.closest('[data-highlight="true"]');
                  if (highlightElement) {
                    const highlightId = highlightElement.getAttribute('data-highlight-id');
                    if (highlightId) {
                      removeHighlight(highlightId);
                      setShowHighlightMenu(false); // Désactiver le mode gomme après suppression
                    }
                  }
                }
              }}
            >
              <section className="space-y-2">
                <p className="font-semibold uppercase text-xs">Objectif du module</p>
                <p>
                  Comprendre comment analyser ton marché pour identifier les tendances clés, positionner ton offre et bâtir une stratégie commerciale différenciante. Ce module te donne les outils pour transformer les données en décisions opérationnelles.
                </p>
                <p>
                  L'analyse de marché est le socle de toute stratégie commerciale : elle permet d'anticiper les évolutions du secteur, de connaître ses clients et de mesurer la pression concurrentielle.
                </p>
              </section>

              <section className="space-y-2">
                <p className="font-semibold uppercase text-xs">Étapes clés</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Cartographier la demande :</strong> profils clients, motivations d'achat, freins, irritants. Utilise des personas pour visualiser clairement tes segments.
                  </li>
                  <li>
                    <strong>Étudier la concurrence directe et indirecte :</strong> analyse leurs positionnements prix, canaux de distribution, messages marketing et forces/faiblesses.
                  </li>
                  <li>
                    <strong>Évaluer l'environnement macroéconomique avec le PESTEL :</strong> facteurs politiques, économiques, socioculturels, technologiques, écologiques et légaux qui influencent ton marché.
                  </li>
                  <li>
                    <strong>Construire des indicateurs de veille :</strong> définis un tableau de bord (alertes Google, benchmark trimestriel, observation des réseaux sociaux) pour suivre les signaux faibles.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <p className="font-semibold uppercase text-xs">Zoom méthodologique : construire ta matrice de positionnement</p>
                <p>
                  Combine tes analyses de la demande et de l'offre pour établir une matrice forces/faiblesses/opportunités/menaces. Cela te permettra de visualiser les axes de différenciation possibles (prix, service, innovation) et d'identifier les niches à fort potentiel.
                </p>
                <p>
                  Exemple : un acteur du e-commerce mode peut se différencier sur l'engagement éco-responsable ou l'expérience personnalisée, en fonction des attentes prioritaires de sa cible.
                </p>
              </section>

              <section className="space-y-2">
                <p className="font-semibold uppercase text-xs">Application directe</p>
                <p>
                  À la fin du module, tu es capable de prioriser les segments à fort potentiel, d'argumenter ton positionnement commercial avec des chiffres précis et de préparer un plan d'action marketing cohérent.
                </p>
                <p>
                  Nous te conseillons de formaliser un résumé synthétique : taille du marché, segments cibles, concurrents clés, opportunités et risques. Ce document servira de base à ton étude de cas.
                </p>
              </section>

              <section className="space-y-2">
                <p className="font-semibold uppercase text-xs">Checklist pour ton étude de cas</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Définir clairement le besoin client à adresser.</li>
                  <li>Identifier au moins trois concurrents et leurs offres.</li>
                  <li>Repérer deux tendances émergentes qui impactent ton secteur.</li>
                  <li>Proposer un axe différenciant soutenu par des indicateurs.</li>
                </ol>
              </section>
            </div>

            <div className="border border-black bg-[#032622]/10 mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 space-y-2">
              <p className="text-[10px] sm:text-xs font-bold uppercase text-[#032622]">Notes rapides</p>
              <p className="text-[10px] sm:text-xs text-[#032622] opacity-70">
                Note ici les insights ou citations clés à retenir du module. Elles seront automatiquement sauvegardées.
              </p>
              <textarea
                value={moduleNotes}
                onChange={(event) => handleModuleNotesChange(event.target.value)}
                className="w-full h-24 sm:h-28 md:h-32 border border-black bg-[#F8F5E4] text-[#032622] p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#032622]"
                placeholder="Ex : données chiffrées à mettre dans l'étude de cas, idées de différenciation, KPI à suivre..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={() => setStep("overview")}
              className="border border-black bg-[#F8F5E4] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-[#032622] flex items-center justify-center space-x-2 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>MODULE PRÉCÉDENT</span>
            </button>
            <button
              onClick={() => setShowQuizModal(true)}
              className="border border-black bg-[#F8F5E4] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-[#032622] flex items-center justify-center space-x-2 hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              <PenSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">QUIZ DE FIN DE MODULE</span>
            </button>
            <button
              onClick={() => setShowQuizModal(true)}
              className="border border-black bg-[#032622] text-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4">
              <h4 className="text-sm font-bold text-[#032622] uppercase">Sommaire du bloc</h4>
            </div>
            <div className="p-4 space-y-3">
              {[
                "Analyse de marché et veille stratégique",
                "Élaboration d'un business plan",
                "Outils de planification et tableaux de bord",
                "Diagnostique stratégique (interne / externe)",
                "Indicateurs de performance (KPI) et reporting",
                "Développement durable et innovation dans l'entreprise",
                "Étude de cas du bloc",
              ].map((item, index) => (
                <div
                  key={index}
                  className={`border border-black px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold ${
                    index === 0 ? "bg-[#032622] text-white" : "bg-[#F8F5E4] text-[#032622]"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Supports complémentaires</h4>
            </div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="text-center text-[#032622] opacity-60 text-[10px] sm:text-xs py-3 sm:py-4">
                Aucun support complémentaire disponible
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Canal manager</h4>
            <div className="border border-black bg-white/70 p-2 sm:p-3 text-[10px] sm:text-xs text-[#032622] space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#032622] text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                  CM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">Sophie, ta référente pédagogique</p>
                  <p>
                    « Besoin d'aide sur ce module ? Je suis disponible sur le chat pour répondre à tes questions. »
                  </p>
                </div>
              </div>
              <button className="bg-[#032622] text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold w-full hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors">
                Lancer une discussion
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQuizModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F5E4] border border-black p-6 sm:p-8 md:p-10 max-w-lg w-full text-center space-y-4 sm:space-y-5 md:space-y-6 rounded-lg">
            <p className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase">
              Tu arrives au quiz de fin de module
            </p>
            <h3
              className="text-xl sm:text-2xl font-bold text-[#032622]"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              Prêt·e à tester tes connaissances ?
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowQuizModal(false)}
                className="border border-black px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-[#032622] hover:bg-gray-200 active:bg-gray-300 transition-colors w-full sm:w-auto"
              >
                RÉVISER ENCORE
              </button>
              <button
                onClick={handleStartQuiz}
                className="border border-black px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold bg-[#032622] text-white hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors w-full sm:w-auto"
              >
                COMMENCER LE QUIZ
              </button>
            </div>
          </div>
        </div>
      )}
      {isNotebookOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-[#F8F5E4] border border-black w-full max-w-xl p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 rounded-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                Notes du bloc 1
              </h3>
              <button
                onClick={() => setIsNotebookOpen(false)}
                className="text-xs sm:text-sm font-bold text-[#032622] hover:text-red-600 active:text-red-700 transition-colors p-1"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={notebookContent}
              onChange={(event) => handleNotebookChange(event.target.value)}
              className="w-full h-48 sm:h-56 md:h-64 border border-black bg-[#F8F5E4] text-[#032622] p-3 sm:p-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#032622] flex-1 resize-none"
              placeholder="Consigne : note ici les idées clés, objectifs commerciaux, arguments qui te serviront pour l'étude de cas."
            />
            <div className="flex justify-end flex-shrink-0">
              <button
                onClick={() => setIsNotebookOpen(false)}
                className="border border-black px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-[#032622] text-white hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors"
              >
                ENREGISTRER ET FERMER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau des notes et surlignages */}
      {showNotesPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col rounded-lg">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#032622] flex-shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Mes Notes et Surlignages
              </h3>
              <button
                onClick={() => setShowNotesPanel(false)}
                className="text-[#032622] hover:text-red-600 active:text-red-700 transition-colors p-1"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {highlights.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Highlighter className="w-10 h-10 sm:w-12 sm:h-12 text-[#032622]/30 mx-auto mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-[#032622]/60 px-4">
                    Aucun surlignage pour le moment. Sélectionne du texte et utilise les couleurs ci-dessus pour surligner.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {highlights
                    .filter(highlight => 
                      !showFavoritesOnly || highlight.isFavorite
                    )
                    .filter(highlight =>
                      !searchQuery || highlight.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      highlight.note?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((highlight) => (
                      <div key={highlight.id} className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <div
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-gray-400 flex-shrink-0"
                                style={{ backgroundColor: highlight.color }}
                              />
                              <span className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase">
                                {highlight.colorName}
                              </span>
                              <span className="text-[10px] sm:text-xs text-[#032622]/60">
                                {highlight.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div 
                              className="p-2 sm:p-3 bg-white/50 border border-[#032622]/20 rounded"
                              style={{ backgroundColor: `${highlight.color}40` }}
                            >
                              <p className="text-xs sm:text-sm text-[#032622] leading-relaxed break-words">
                                {highlight.text}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
                            <button
                              onClick={() => toggleHighlightFavorite(highlight.id)}
                              className={`p-1 transition-colors ${
                                highlight.isFavorite 
                                  ? 'text-yellow-500' 
                                  : 'text-[#032622]/40 hover:text-yellow-500 active:text-yellow-600'
                              }`}
                              aria-label={highlight.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${highlight.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => removeHighlight(highlight.id)}
                              className="p-1 text-[#032622]/40 hover:text-red-500 active:text-red-600 transition-colors"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {highlight.note && (
                          <div className="bg-[#032622]/5 border border-[#032622]/20 p-2 sm:p-3 rounded">
                            <p className="text-[10px] sm:text-xs font-semibold text-[#032622] uppercase mb-1">Note</p>
                            <p className="text-xs sm:text-sm text-[#032622] break-words">{highlight.note}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Ajouter une note..."
                            className="flex-1 border border-[#032622] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-[#F8F5E4] text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622]"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                addNoteToHighlight(highlight.id, e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input.value.trim()) {
                                addNoteToHighlight(highlight.id, input.value);
                                input.value = '';
                              }
                            }}
                            className="border border-[#032622] bg-[#032622] text-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs hover:bg-[#01302C] active:bg-[#012a26] transition-colors flex-shrink-0"
                            aria-label="Ajouter note"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panneau des Smart Notes */}
      {showSmartNotesPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col rounded-lg">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#032622] flex-shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Smart Notes - Prise de Notes Intelligente
              </h3>
              <button
                onClick={() => setShowSmartNotesPanel(false)}
                className="text-[#032622] hover:text-red-600 active:text-red-700 transition-colors p-1"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Insight Clé</h4>
                  <textarea
                    placeholder="Note ici les insights importants du module..."
                    className="w-full h-16 sm:h-20 border border-[#032622] bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs hover:bg-[#01302C] active:bg-[#012a26] transition-colors w-full sm:w-auto">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Questions</h4>
                  <textarea
                    placeholder="Questions qui te viennent en tête..."
                    className="w-full h-16 sm:h-20 border border-[#032622] bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs hover:bg-[#01302C] active:bg-[#012a26] transition-colors w-full sm:w-auto">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Actions</h4>
                  <textarea
                    placeholder="Actions à entreprendre après le module..."
                    className="w-full h-16 sm:h-20 border border-[#032622] bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs hover:bg-[#01302C] active:bg-[#012a26] transition-colors w-full sm:w-auto">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Définitions</h4>
                  <textarea
                    placeholder="Définitions importantes à retenir..."
                    className="w-full h-16 sm:h-20 border border-[#032622] bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs hover:bg-[#01302C] active:bg-[#012a26] transition-colors w-full sm:w-auto">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
              </div>
              
              <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase mb-2 sm:mb-3">Résumé du Module</h4>
                <textarea
                  placeholder="Rédige ici un résumé personnel du module..."
                  className="w-full h-24 sm:h-28 md:h-32 border border-[#032622] bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                />
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 mt-2 sm:mt-3">
                  <button className="border border-[#032622] bg-[#F8F5E4] text-[#032622] px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors w-full sm:w-auto">
                    <Save className="w-3 h-3 inline mr-1" />
                    Sauvegarder
                  </button>
                  <button className="border border-[#032622] bg-[#032622] text-white px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold hover:bg-[#01302C] active:bg-[#012a26] transition-colors w-full sm:w-auto">
                    <Copy className="w-3 h-3 inline mr-1" />
                    Exporter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panneau des tâches */}
      {showTaskPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col rounded-lg">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#032622] flex-shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Mes Tâches et Rappels
              </h3>
              <button
                onClick={() => setShowTaskPanel(false)}
                className="text-[#032622] hover:text-red-600 active:text-red-700 transition-colors p-1"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {/* Formulaire d'ajout de tâche */}
              <div className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Nouvelle Tâche</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder="Titre de la tâche..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="border border-[#032622] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-white text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="border border-[#032622] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-white text-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  >
                    <option value="low">Priorité Faible</option>
                    <option value="medium">Priorité Moyenne</option>
                    <option value="high">Priorité Haute</option>
                  </select>
                </div>
                <textarea
                  placeholder="Description de la tâche..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full border border-[#032622] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs bg-white text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                  rows={3}
                />
                <button
                  onClick={addTask}
                  className="border border-[#032622] bg-[#032622] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold hover:bg-[#01302C] active:bg-[#012a26] transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Ajouter la tâche
                </button>
              </div>

              {/* Liste des tâches */}
              {tasks.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#032622]/30 mx-auto mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-[#032622]/60 px-4">
                    Aucune tâche pour le moment. Ajoute ta première tâche ci-dessus !
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {tasks
                    .sort((a, b) => {
                      // Trier par urgence puis par priorité
                      if (a.isUrgent && !b.isUrgent) return -1;
                      if (!a.isUrgent && b.isUrgent) return 1;
                      
                      const priorityOrder = { high: 3, medium: 2, low: 1 };
                      return priorityOrder[b.priority] - priorityOrder[a.priority];
                    })
                    .map((task) => (
                      <div 
                        key={task.id} 
                        className={`border border-[#032622] p-3 sm:p-4 space-y-2 ${
                          task.isUrgent ? 'bg-red-50 border-red-300' : 'bg-[#F8F5E4]'
                        } ${task.status === 'completed' ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleTaskStatus(task.id)}
                              className={`mt-1 w-4 h-4 sm:w-5 sm:h-5 border-2 rounded transition-colors flex-shrink-0 ${
                                task.status === 'completed'
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-[#032622] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80'
                              }`}
                              aria-label={task.status === 'completed' ? "Marquer comme non complétée" : "Marquer comme complétée"}
                            >
                              {task.status === 'completed' && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                <h5 className={`text-xs sm:text-sm font-semibold break-words ${
                                  task.status === 'completed' ? 'line-through text-[#032622]/60' : 'text-[#032622]'
                                }`}>
                                  {task.title}
                                </h5>
                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded flex-shrink-0 ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                                </span>
                                {task.isUrgent && (
                                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold bg-red-500 text-white rounded animate-pulse flex-shrink-0">
                                    URGENT
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-[10px] sm:text-xs text-[#032622]/70 mb-1 sm:mb-2 break-words">{task.description}</p>
                              )}
                              <p className="text-[10px] sm:text-xs text-[#032622]/50">
                                Échéance : {task.dueDate.toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
                            <button
                              onClick={() => toggleTaskUrgent(task.id)}
                              className={`p-1 transition-colors ${
                                task.isUrgent 
                                  ? 'text-red-500' 
                                  : 'text-[#032622]/40 hover:text-red-500 active:text-red-600'
                              }`}
                              aria-label={task.isUrgent ? "Retirer l'urgence" : "Marquer comme urgent"}
                            >
                              <AlertCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${task.isUrgent ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-[#032622]/40 hover:text-red-500 active:text-red-600 transition-colors"
                              aria-label="Supprimer"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderQuizView = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setStep("module")}
          className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-bold text-[#032622] hover:text-[#044a3a] active:text-[#033a2f] transition-colors"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="whitespace-nowrap">RETOUR AU MODULE</span>
        </button>
        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] flex-shrink-0" />
      </div>

      {renderProgressBar()}

      <div className="border border-black bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
        <h2
          className="text-xl sm:text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Tu arrives au quiz de fin de module
        </h2>
        <p className="text-xs sm:text-sm text-[#032622] opacity-80">
          Sélectionne la réponse la plus pertinente pour chaque question. Tu peux revenir au module si tu veux revoir le contenu avant de valider.
        </p>

        {quizError && (
          <div className="flex items-center space-x-2 border border-black bg-[#F8F5E4] text-[#032622] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="break-words">{quizError}</span>
          </div>
        )}

        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="text-center text-[#032622] opacity-60 py-6 sm:py-8 text-xs sm:text-sm">
            Aucune question disponible pour le moment
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={() => setStep("module")}
            className="border border-black px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-[#032622] hover:bg-gray-200 active:bg-gray-300 transition-colors w-full sm:w-auto"
          >
            PRÉCÉDENTE
          </button>
          <button
            onClick={handleSubmitQuiz}
            disabled={!canSubmitQuiz}
            className={`border border-black px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold transition-colors w-full sm:w-auto ${
              canSubmitQuiz
                ? "bg-[#032622] text-white hover:bg-[#044a3a] active:bg-[#033a2f]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            VALIDER LE QUIZ
          </button>
        </div>
      </div>
    </div>
  );

  const renderResultsView = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setStep("overview")}
          className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-bold text-[#032622] hover:text-[#044a3a] active:text-[#033a2f] transition-colors"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="whitespace-nowrap">RETOUR À MES FORMATIONS</span>
        </button>
        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] flex-shrink-0" />
      </div>

      {renderProgressBar()}

      <div className="border border-black bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2
            className="text-xl sm:text-2xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            Résultat
          </h2>
          <span className="text-xs sm:text-sm font-semibold text-[#032622]">
            {score} / {totalQuestions} bonnes réponses
          </span>
        </div>

        <div className="flex flex-col items-center space-y-4 sm:space-y-5 md:space-y-6">
          <div className="border-4 border-[#032622] p-6 sm:p-8 md:p-10 text-center bg-white/50 w-full sm:w-auto">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#032622]">
              {computedScoreOn20}/20
            </div>
            <p className="text-xs sm:text-sm text-[#032622] mt-1 sm:mt-2">Score converti sur 20</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-[#032622] uppercase">Relecture pédagogique</h3>
          <div className="text-center text-[#032622] opacity-60 py-6 sm:py-8 text-xs sm:text-sm">
            Aucune question disponible pour le moment
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
          <button
            onClick={() => setStep("quiz")}
            className="border border-black px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-[#032622] hover:bg-gray-200 active:bg-gray-300 transition-colors w-full sm:w-auto"
          >
            VOIR SES RÉPONSES
          </button>
          <button
            onClick={() => {
              setStep("module");
            }}
            className="border border-black px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold bg-[#032622] text-white hover:bg-[#044a3a] active:bg-[#033a2f] transition-colors w-full sm:w-auto"
          >
            MODULE SUIVANT
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        {step === "overview" && renderOverview()}
        {step === "module" && renderModuleView()}
        {step === "quiz" && renderQuizView()}
        {step === "results" && renderResultsView()}
    </div>
  );
}


