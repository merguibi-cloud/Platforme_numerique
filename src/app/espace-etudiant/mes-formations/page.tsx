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
  greeting: "Bonjour, Chadi El Assowad",
  headline: "Prêt à apprendre quelque chose de nouveau aujourd'hui ?",
};

const courseBlocks = [
  {
    id: "bloc-1",
    title: "Bloc 1",
    subtitle: "Contribuer à la stratégie de développement de l'organisation",
    progress: 10,
    cta: "REPRENDRE",
    locked: false,
  },
  {
    id: "bloc-2",
    title: "Bloc 2",
    subtitle: "Définir et planifier des actions marketing et de développement",
    progress: 0,
    cta: "COMMENCER",
    locked: true,
  },
  {
    id: "bloc-3",
    title: "Bloc 3",
    subtitle: "Piloter un projet de développement",
    progress: 0,
    cta: "COMMENCER",
    locked: true,
  },
  {
    id: "bloc-4",
    title: "Bloc 4",
    subtitle: "Manager durablement une équipe dans le cadre du développement",
    progress: 0,
    cta: "COMMENCER",
    locked: true,
  },
];

// Type pour les événements
type Event = {
  title: string;
  time: string;
};

// Événements par jour
const eventsByDay: Record<number, Event[]> = {
  15: [
    {
      title: "Réunion d'équipe",
      time: "En visio / 10h00 - 11h00",
    },
    {
      title: "Formation Excel",
      time: "En visio / 14h00 - 16h00",
    },
  ],
  16: [
    {
      title: "Atelier créatif",
      time: "En visio / 09h00 - 12h00",
    },
  ],
  17: [
    {
      title: "Séance de coaching",
      time: "En visio / 15h00 - 16h00",
    },
    {
      title: "Webinaire marketing",
      time: "En visio / 18h00 - 19h30",
    },
  ],
  18: [
    {
      title: "Masterclass en ligne : Stratégies digitales 2025",
      time: "En visio / 09h30 - 11h00",
    },
    {
      title: "Entretien pédagogique avec votre animatrice",
      time: "En visio / 16h00 - 16h30",
    },
    {
      title: "Conférence live : " + "\"" + "Le futur du travail" + "\"",
      time: "En visio / 18h00 - 19h00",
    },
  ],
  19: [
    {
      title: "Workshop design thinking",
      time: "En visio / 10h00 - 17h00",
    },
  ],
  20: [
    {
      title: "Présentation de projet",
      time: "En visio / 14h00 - 15h30",
    },
  ],
  21: [
    {
      title: "Évaluation finale",
      time: "En visio / 09h00 - 12h00",
    },
  ],
};

const upcomingEvents = eventsByDay[18] || [];

const latestGrades = [
  {
    title: "Bloc 1 - Module 1",
    label: "Quizz",
    grade: "9,5",
  },
  {
    title: "Bloc 1",
    label: "Étude de cas",
    grade: "13",
  },
];

const complementaryDocs = [
  {
    title: "Plan_marketing.pdf",
    size: "PDF",
  },
  {
    title: "Benchmark_concurrence.xlsx",
    size: "XLSX",
  },
  {
    title: "Rapport_tendances2025.pptx",
    size: "PPTX",
  },
];

const quizQuestions = [
  {
    id: 1,
    question: "Quelle est la finalité principale d'une analyse de marché ?",
    options: [
      "Déterminer les besoins financiers internes",
      "Comprendre la taille, les acteurs et les tendances du secteur",
      "Réduire les coûts de production",
      "Établir un business plan",
    ],
    correctIndex: 1,
    explanation:
      "Une analyse de marché fournit une photographie précise de l'environnement économique. Elle identifie la taille du marché, sa dynamique, le profil des clients et la pression concurrentielle. Ces informations guident ensuite les décisions financières ou marketing.",
    courseTip:
      "Astuce : commence toujours par segmenter ton marché (B2B/B2C) et par dresser une cartographie des acteurs clés pour repérer les opportunités.",
  },
  {
    id: 2,
    question: "Quels éléments relèvent d'une veille stratégique efficace ?",
    options: [
      "Le contrôle interne des budgets",
      "La surveillance des concurrents",
      "L'évolution de la réglementation",
      "L'analyse des performances individuelles des salariés",
    ],
    correctIndex: 1,
    explanation:
      "La veille stratégique observe les signaux externes afin d'anticiper les mouvements du marché. La surveillance des concurrents permet de détecter rapidement une innovation, un repositionnement prix ou une campagne de communication agressive.",
    courseTip:
      "Outil pratique : mets en place un tableau de veille avec des sources fiables (sites concurrents, réseaux sociaux, bases de données sectorielles) et un rythme de revue hebdomadaire.",
  },
  {
    id: 3,
    question:
      "La veille concurrentielle est uniquement utile dans les secteurs technologiques.",
    options: ["Vrai", "Faux"],
    correctIndex: 1,
    explanation:
      "Quelle que soit l'industrie, les décisions des concurrents influencent ton attractivité : évolution d'une gamme, ouverture d'un nouveau point de vente, partenariat stratégique. Ignorer ces signaux expose à une perte de parts de marché.",
    courseTip:
      "Exemple : en grande distribution, l'analyse des prospectus concurrents donne des indications immédiates sur les promotions à venir.",
  },
];

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
  const [selectedDay, setSelectedDay] = useState(18);
  const courseContentRef = useRef<HTMLDivElement | null>(null);

  // États pour les nouvelles fonctionnalités
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [smartNotes, setSmartNotes] = useState<SmartNote[]>([]);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('#fef3c7');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showSmartNotesPanel, setShowSmartNotesPanel] = useState(false);
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
  
  // États pour le lecteur vidéo
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fonction pour lancer la vidéo
  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  // Effect pour gérer les événements de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePause = () => setIsVideoPlaying(false);
    const handlePlay = () => setIsVideoPlaying(true);

    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  // Fonction pour obtenir les événements du jour sélectionné
  const getCurrentDayEvents = () => {
    return eventsByDay[selectedDay as keyof typeof eventsByDay] || [];
  };

  // Fonction pour naviguer entre les jours
  const navigateDay = (direction: 'prev' | 'next') => {
    const days = [15, 16, 17, 18, 19, 20, 21];
    const currentIndex = days.indexOf(selectedDay);
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDay(days[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < days.length - 1) {
      setSelectedDay(days[currentIndex + 1]);
    }
  };

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

    const highlightId = `highlight-${Date.now()}`;
    
    try {
      // Méthode simple pour les sélections dans un seul élément
    const span = document.createElement("span");
    span.style.backgroundColor = color;
      span.style.padding = "2px 4px";
      span.style.borderRadius = "3px";
    span.dataset.highlight = "true";
      span.dataset.highlightId = highlightId;
      
      range.surroundContents(span);
      
      // Créer l'objet highlight
      const highlight: Highlight = {
        id: highlightId,
        text: text,
        color: color,
        colorName: colorName,
        timestamp: new Date(),
        position: range.startOffset,
      };
      
      setHighlights(prev => [...prev, highlight]);
      selection.removeAllRanges();
    } catch (error) {
      console.warn("Méthode simple échouée, utilisation de la méthode avancée:", error);
      
      // Méthode avancée pour les grandes sélections multi-éléments
      try {
        const clonedRange = range.cloneRange();
        const contents = clonedRange.extractContents();
        
        // Créer un conteneur pour tous les surlignages
        const container = document.createElement("span");
        container.style.backgroundColor = color;
        container.style.padding = "2px 4px";
        container.style.borderRadius = "3px";
        container.dataset.highlight = "true";
        container.dataset.highlightId = highlightId;
        
        // Traiter chaque nœud dans le contenu extrait
        const processNode = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            // Nœud texte : créer un span pour le texte
            const textSpan = document.createElement("span");
            textSpan.style.backgroundColor = color;
            textSpan.style.padding = "2px 4px";
            textSpan.style.borderRadius = "3px";
            textSpan.dataset.highlight = "true";
            textSpan.dataset.highlightId = highlightId;
            textSpan.textContent = node.textContent;
            container.appendChild(textSpan);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Élément HTML : traiter récursivement ses enfants
            const element = node as Element;
            const clonedElement = element.cloneNode(false) as Element;
            
            // Copier les attributs importants
            if (element.tagName === 'P') {
              clonedElement.style.margin = '0';
              clonedElement.style.display = 'inline';
            }
            
            // Traiter les enfants
            Array.from(element.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
                const textSpan = document.createElement("span");
                textSpan.style.backgroundColor = color;
                textSpan.style.padding = "2px 4px";
                textSpan.style.borderRadius = "3px";
                textSpan.dataset.highlight = "true";
                textSpan.dataset.highlightId = highlightId;
                textSpan.textContent = child.textContent;
                clonedElement.appendChild(textSpan);
              } else if (child.nodeType === Node.ELEMENT_NODE) {
                const processedChild = processNode(child);
                if (processedChild) clonedElement.appendChild(processedChild);
              }
            });
            
            // Ajouter des espaces pour maintenir la structure
            if (element.tagName === 'P' || element.tagName === 'BR') {
              const br = document.createElement("br");
              container.appendChild(br);
            }
            
            return clonedElement;
          }
          return null;
        };
        
        // Traiter le contenu extrait
        Array.from(contents.childNodes).forEach(child => {
          const processed = processNode(child);
          if (processed) container.appendChild(processed);
        });
        
        // Insérer le conteneur dans le DOM
        range.insertNode(container);
        
        // Créer l'objet highlight
        const highlight: Highlight = {
          id: highlightId,
          text: text,
          color: color,
          colorName: colorName,
          timestamp: new Date(),
          position: range.startOffset,
        };
        
        setHighlights(prev => [...prev, highlight]);
        selection.removeAllRanges();
        
      } catch (advancedError) {
        console.warn("Méthode avancée échouée également:", advancedError);
        
        // Dernier recours : méthode par remplacement de texte
        try {
          const textContent = range.toString();
          const span = document.createElement("span");
          span.style.backgroundColor = color;
          span.style.padding = "2px 4px";
          span.style.borderRadius = "3px";
          span.dataset.highlight = "true";
          span.dataset.highlightId = highlightId;
          span.textContent = textContent;
          
          range.deleteContents();
          range.insertNode(span);
          
          const highlight: Highlight = {
            id: highlightId,
            text: textContent,
            color: color,
            colorName: colorName,
            timestamp: new Date(),
            position: range.startOffset,
          };
          
          setHighlights(prev => [...prev, highlight]);
          selection.removeAllRanges();
        } catch (fallbackError) {
          console.error("Toutes les méthodes de surlignage ont échoué:", fallbackError);
        }
      }
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

  const totalQuestions = quizQuestions.length;

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (quizError) {
      setQuizError(null);
    }
  };

  const score = useMemo(() => {
    let total = 0;
    Object.entries(selectedAnswers).forEach(([questionId, answerIndex]) => {
      const question = quizQuestions.find((q) => q.id === Number(questionId));
      if (question && answerIndex === question.correctIndex) {
        total += 1;
      }
    });
    return total;
  }, [selectedAnswers]);

  const computedScoreOn20 = useMemo(() => {
    return Math.round((score / totalQuestions) * 20);
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#032622]">
          Bloc 1 · Contribuer à la stratégie de développement de l'organisation
        </span>
        <span className="text-sm font-semibold text-[#032622]">
          {progressMap[step]}%
        </span>
      </div>
      <div className="h-2 bg-gray-300 border border-black">
        <div
          className="h-full bg-[#032622] transition-all duration-500"
          style={{ width: `${progressMap[step]}%` }}
        ></div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-[#032622] text-[#F8F5E4] p-8">
        <p className="text-lg opacity-80 mb-2">{heroCourse.greeting}</p>
        <h2
          className="text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          {heroCourse.headline}
        </h2>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-4">
          {courseBlocks.map((block) => (
            <div
              key={block.id}
              className={`border border-black bg-[#F8F5E4] flex flex-col lg:flex-row ${
                block.locked ? "opacity-70" : ""
              }`}
            >
        <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-[#032622] uppercase mb-1">
                      {block.title}
                    </p>
                    <h3 className="text-lg font-semibold text-[#032622]">
                      {block.subtitle}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#032622]">
                    <span>{block.progress}%</span>
                  </div>
                </div>
                <div className="h-1 bg-gray-300 border border-black">
                  <div
                    className="h-full bg-[#032622]"
                    style={{ width: `${block.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="border-t lg:border-t-0 lg:border-l border-black p-6 flex flex-col justify-center items-center min-w-[200px]">
                <button
                  onClick={() => {
                    if (block.locked) return;
                    setStep("module");
                  }}
                  className={`px-6 py-2 text-sm font-bold border border-black flex items-center space-x-2 ${
                    block.locked
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#032622] text-white hover:bg-[#044a3a]"
                  }`}
                  disabled={block.locked}
                >
                  <span>{block.cta}</span>
                  {block.locked ? <Lock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4">
              <h4 className="text-sm font-bold text-[#032622] uppercase">Événements à venir</h4>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-7 gap-1 text-xs font-bold text-[#032622] uppercase">
                {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <div>{day}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs text-[#032622]">
                {[15, 16, 17, 18, 19, 20, 21].map((day) => (
                  <div
                    key={day}
                    className={`h-8 flex items-center justify-center border border-black cursor-pointer hover:bg-gray-200 ${
                      day === selectedDay ? "bg-[#032622] text-white" : "bg-[#F8F5E4]"
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                {getCurrentDayEvents().map((event: any, index: number) => (
                  <div key={index} className="border border-black p-3 text-xs bg-white/60">
                    <div className="font-bold text-[#032622]">{event.title}</div>
                    <div className="text-[#032622] opacity-80">{event.time}</div>
                  </div>
                ))}
                {getCurrentDayEvents().length === 0 && (
                  <div className="text-center text-[#032622] opacity-60 text-xs py-4">
                    Aucun événement prévu ce jour
                  </div>
                )}
              </div>
              <Link href="/espace-etudiant/agenda">
                <button className="border border-black bg-[#F8F5E4] text-[#032622] px-4 py-2 text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
                  <CalendarDays className="w-4 h-4" />
                  <span>OUVRIR L'AGENDA</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4">
              <h4 className="text-sm font-bold text-[#032622] uppercase">Mes derniers rendus</h4>
            </div>
            <div className="p-4">
              {latestGrades.map((grade, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border border-black mb-3 last:mb-0"
                >
                  <div className="p-3">
                    <p className="text-xs text-[#032622] opacity-80">{grade.title}</p>
                    <p className="text-sm font-semibold text-[#032622]">{grade.label}</p>
                  </div>
                  <div className="p-3 bg-[#032622] text-white font-bold text-lg min-w-[70px] text-center">
                    {grade.grade}
                  </div>
                </div>
              ))}
              <button className="text-xs font-semibold text-[#032622] flex items-center space-x-1">
                <span>VOIR TOUTES LES NOTES</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="border border-black bg-[#032622] text-white p-4 space-y-3">
            <div>
              <p className="text-xs uppercase font-bold">Pense-bête</p>
              <p className="text-sm opacity-80">Ajoute ici les points clés à retenir de ton module.</p>
            </div>
            <button className="bg-[#F8F5E4] text-[#032622] px-4 py-2 text-sm font-bold border border-black flex items-center justify-center space-x-2"
              onClick={() => setIsNotebookOpen(true)}
            >
              <NotebookPen className="w-4 h-4" />
              <span>OUVRIR LE BLOC-NOTES</span>
            </button>
          </div>

          <div className="border border-black bg-[#F8F5E4] p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-[#032622]" />
              <div>
                <p className="text-xs uppercase font-bold text-[#032622]">Chat de discussion</p>
                <p className="text-xs text-[#032622] opacity-80">
                  Pose tes questions à l'animateur de la formation.
                </p>
              </div>
            </div>
            <button className="bg-[#032622] text-white px-4 py-2 text-sm font-bold border border-black">
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

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
          <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Analyse de marché et veille stratégique
            </p>
            {/* Lecteur vidéo avec overlay interactif */}
            <div className="relative mb-6 group">
              <div className="relative bg-[#032622] aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-[#032622] hover:shadow-3xl transition-all duration-300">
                {/* Lecteur vidéo principal */}
              <video
                  ref={videoRef}
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
                
                {/* Overlay vert et beige avec bouton play */}
                {!isVideoPlaying && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-[#032622] via-[#01302C] to-[#032622] flex items-center justify-center cursor-pointer transition-all duration-300 hover:from-[#01302C] hover:to-[#032622]"
                    onClick={handlePlayVideo}
                  >
                    <div className="text-center space-y-6">
                      {/* Animation de chargement */}
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-[#F8F5E4]/30 border-t-[#F8F5E4] rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-12 h-12 text-[#F8F5E4] ml-1" />
                        </div>
                      </div>
                      
                      {/* Informations du module */}
                      <div className="space-y-3">
                        <h4 className="text-[#F8F5E4] font-bold text-xl" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                          MODULE 1
                        </h4>
                        <p className="text-[#F8F5E4]/90 text-base max-w-md mx-auto">
                          Analyse de marché et veille stratégique
                        </p>
                        <p className="text-[#F8F5E4]/70 text-sm">
                          Cliquez pour commencer la lecture
                        </p>
                      </div>
                      
                      {/* Points d'animation */}
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-[#F8F5E4] rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-[#F8F5E4]/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-[#F8F5E4]/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Options utiles pour les étudiants */}
              <div className="mt-4 bg-[#F8F5E4] border border-[#032622] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-[#032622] uppercase tracking-wider">
                    Options d'étude
                  </h4>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button className="flex flex-col items-center space-y-2 p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 transition-colors group">
                    <div className="w-8 h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <Play className="w-4 h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-xs font-semibold text-[#032622] uppercase text-center">
                      Lecture rapide
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-2 p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 transition-colors group">
                    <div className="w-8 h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <Bookmark className="w-4 h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-xs font-semibold text-[#032622] uppercase text-center">
                      Marquer
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-2 p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 transition-colors group">
                    <div className="w-8 h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <Download className="w-4 h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-xs font-semibold text-[#032622] uppercase text-center">
                      Télécharger
                    </span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-2 p-3 border border-[#032622]/30 rounded-lg hover:bg-[#032622]/5 transition-colors group">
                    <div className="w-8 h-8 bg-[#032622]/10 rounded-full flex items-center justify-center group-hover:bg-[#032622] transition-colors">
                      <MessageCircle className="w-4 h-4 text-[#032622] group-hover:text-white" />
                    </div>
                    <span className="text-xs font-semibold text-[#032622] uppercase text-center">
                      Questions
                    </span>
                  </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#032622]/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-[#032622]/60 text-xs uppercase">Transcription</p>
                      <button className="text-[#032622] font-bold text-sm hover:text-[#01302C] transition-colors">
                        Voir
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#032622]/60 text-xs uppercase">Sous-titres</p>
                      <button className="text-[#032622] font-bold text-sm hover:text-[#01302C] transition-colors">
                        FR/EN
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#032622]/60 text-xs uppercase">Vitesse</p>
                      <button className="text-[#032622] font-bold text-sm hover:text-[#01302C] transition-colors">
                        1x
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Highlighter className="w-4 h-4 text-[#032622]" />
                <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                </span>
              </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowNotesPanel(!showNotesPanel)}
                    className="flex items-center space-x-1 border border-black px-3 py-1 text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white transition-colors"
                  >
                    <NotebookPen className="w-3 h-3" />
                    <span>Notes ({highlights.length})</span>
                  </button>
                  <button
                    onClick={() => setShowSmartNotesPanel(!showSmartNotesPanel)}
                    className="flex items-center space-x-1 border border-black px-3 py-1 text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white transition-colors"
                  >
                    <Star className="w-3 h-3" />
                    <span>Smart Notes</span>
                  </button>
                  <button
                    onClick={() => setShowTaskPanel(!showTaskPanel)}
                    className="flex items-center space-x-1 border border-black px-3 py-1 text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Tâches ({tasks.filter(t => t.status !== 'completed').length})</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                    onClick={() => applyHighlight(color.value, color.name)}
                    className={`w-10 h-10 border-2 rounded-lg transition-all hover:scale-110 ${
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
                  className={`w-10 h-10 border-2 rounded-lg transition-all hover:scale-110 flex items-center justify-center ${
                    showHighlightMenu ? 'border-red-500 bg-red-100' : 'border-gray-400 bg-gray-100'
                  }`}
                  title="Mode gomme - Clique sur un surlignage pour le supprimer"
                >
                  <Eraser className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {showHighlightMenu && (
                  <div className="flex items-center space-x-1 border border-red-500 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 rounded">
                <Eraser className="w-3 h-3" />
                    <span>Mode gomme actif - Clique sur un surlignage</span>
                  </div>
                )}
                <button
                  onClick={clearAllHighlights}
                  className="flex items-center space-x-1 border border-black px-3 py-1 text-xs font-semibold text-[#032622] bg-[#F8F5E4] hover:bg-red-100 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Effacer tout</span>
              </button>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center space-x-1 border border-black px-3 py-1 text-xs font-semibold transition-colors ${
                    showFavoritesOnly 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-[#F8F5E4] text-[#032622] hover:bg-yellow-100 hover:text-yellow-700'
                  }`}
                >
                  <Star className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  <span>Favoris</span>
                </button>
                <div className="flex items-center space-x-2 ml-auto">
                  <Search className="w-3 h-3 text-[#032622]" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-black px-2 py-1 text-xs bg-[#F8F5E4] text-[#032622] placeholder-[#032622]/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#032622] mb-4">
              Analyse de marché et veille stratégique
            </h3>
            <div
              ref={courseContentRef}
              className={`space-y-4 text-sm text-[#032622] leading-relaxed ${
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

            <div className="border border-black bg-[#032622]/10 mt-6 p-4 space-y-2">
              <p className="text-xs font-bold uppercase text-[#032622]">Notes rapides</p>
              <p className="text-xs text-[#032622] opacity-70">
                Note ici les insights ou citations clés à retenir du module. Elles seront automatiquement sauvegardées.
              </p>
              <textarea
                value={moduleNotes}
                onChange={(event) => handleModuleNotesChange(event.target.value)}
                className="w-full h-32 border border-black bg-[#F8F5E4] text-[#032622] p-3 text-sm"
                placeholder="Ex : données chiffrées à mettre dans l'étude de cas, idées de différenciation, KPI à suivre..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("overview")}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>MODULE PRÉCÉDENT</span>
            </button>
            <button
              onClick={() => setShowQuizModal(true)}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>QUIZ DE FIN DE MODULE</span>
            </button>
            <button
              onClick={() => setShowQuizModal(true)}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
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
                  className={`border border-black px-3 py-2 text-xs font-semibold ${
                    index === 0 ? "bg-[#032622] text-white" : "bg-[#F8F5E4] text-[#032622]"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4">
              <h4 className="text-sm font-bold text-[#032622] uppercase">Supports complémentaires</h4>
            </div>
            <div className="p-4 space-y-3">
              {complementaryDocs.map((doc, index) => (
                <div
                  key={index}
                  className="border border-black px-3 py-2 flex items-center justify-between text-xs text-[#032622]"
                >
                  <div>
                    <p className="font-semibold">{doc.title}</p>
                    <p className="opacity-70">{doc.size}</p>
                  </div>
                  <Download className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4] p-4 space-y-3">
            <h4 className="text-sm font-bold text-[#032622] uppercase">Canal manager</h4>
            <div className="border border-black bg-white/70 p-3 text-xs text-[#032622] space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center text-sm font-bold">
                  CM
                </div>
                <div>
                  <p className="font-semibold">Sophie, ta référente pédagogique</p>
                  <p>
                    « Besoin d'aide sur ce module ? Je suis disponible sur le chat pour répondre à tes questions. »
                  </p>
                </div>
              </div>
              <button className="bg-[#032622] text-white px-4 py-2 text-sm font-bold w-full">
                Lancer une discussion
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQuizModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#F8F5E4] border border-black p-10 max-w-lg text-center space-y-6">
            <p className="text-xs font-semibold text-[#032622] uppercase">
              Tu arrives au quiz de fin de module
            </p>
            <h3
              className="text-2xl font-bold text-[#032622]"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              Prêt·e à tester tes connaissances ?
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setShowQuizModal(false)}
                className="border border-black px-5 py-2 text-sm font-bold text-[#032622]"
              >
                RÉVISER ENCORE
              </button>
              <button
                onClick={handleStartQuiz}
                className="border border-black px-5 py-2 text-sm font-bold bg-[#032622] text-white"
              >
                COMMENCER LE QUIZ
              </button>
            </div>
          </div>
        </div>
      )}
      {isNotebookOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="bg-[#F8F5E4] border border-black w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                Notes du bloc 1
              </h3>
              <button
                onClick={() => setIsNotebookOpen(false)}
                className="text-sm font-bold text-[#032622]"
              >
                FERMER
              </button>
            </div>
            <textarea
              value={notebookContent}
              onChange={(event) => handleNotebookChange(event.target.value)}
              className="w-full h-64 border border-black bg-[#F8F5E4] text-[#032622] p-4 text-sm"
              placeholder="Consigne : note ici les idées clés, objectifs commerciaux, arguments qui te serviront pour l'étude de cas."
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsNotebookOpen(false)}
                className="border border-black px-4 py-2 text-sm font-bold bg-[#032622] text-white"
              >
                ENREGISTRER ET FERMER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panneau des notes et surlignages */}
      {showNotesPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#032622]">
              <h3 className="text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Mes Notes et Surlignages
              </h3>
              <button
                onClick={() => setShowNotesPanel(false)}
                className="text-[#032622] hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {highlights.length === 0 ? (
                <div className="text-center py-8">
                  <Highlighter className="w-12 h-12 text-[#032622]/30 mx-auto mb-4" />
                  <p className="text-sm text-[#032622]/60">
                    Aucun surlignage pour le moment. Sélectionne du texte et utilise les couleurs ci-dessus pour surligner.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highlights
                    .filter(highlight => 
                      !showFavoritesOnly || highlight.isFavorite
                    )
                    .filter(highlight =>
                      !searchQuery || highlight.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      highlight.note?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((highlight) => (
                      <div key={highlight.id} className="border border-[#032622] bg-[#F8F5E4] p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className="w-4 h-4 rounded border border-gray-400"
                                style={{ backgroundColor: highlight.color }}
                              />
                              <span className="text-xs font-semibold text-[#032622] uppercase">
                                {highlight.colorName}
                              </span>
                              <span className="text-xs text-[#032622]/60">
                                {highlight.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div 
                              className="p-3 bg-white/50 border border-[#032622]/20 rounded"
                              style={{ backgroundColor: `${highlight.color}40` }}
                            >
                              <p className="text-sm text-[#032622] leading-relaxed">
                                {highlight.text}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleHighlightFavorite(highlight.id)}
                              className={`p-1 transition-colors ${
                                highlight.isFavorite 
                                  ? 'text-yellow-500' 
                                  : 'text-[#032622]/40 hover:text-yellow-500'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${highlight.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => removeHighlight(highlight.id)}
                              className="p-1 text-[#032622]/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {highlight.note && (
                          <div className="bg-[#032622]/5 border border-[#032622]/20 p-3 rounded">
                            <p className="text-xs font-semibold text-[#032622] uppercase mb-1">Note</p>
                            <p className="text-sm text-[#032622]">{highlight.note}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Ajouter une note..."
                            className="flex-1 border border-[#032622] px-3 py-2 text-xs bg-[#F8F5E4] text-[#032622] placeholder-[#032622]/50 focus:outline-none"
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
                            className="border border-[#032622] bg-[#032622] text-white px-3 py-2 text-xs hover:bg-[#01302C] transition-colors"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#032622]">
              <h3 className="text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Smart Notes - Prise de Notes Intelligente
              </h3>
              <button
                onClick={() => setShowSmartNotesPanel(false)}
                className="text-[#032622] hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-[#032622] bg-[#F8F5E4] p-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#032622] uppercase">Insight Clé</h4>
                  <textarea
                    placeholder="Note ici les insights importants du module..."
                    className="w-full h-20 border border-[#032622] bg-white px-3 py-2 text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-3 py-1 text-xs hover:bg-[#01302C] transition-colors">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="border border-[#032622] bg-[#F8F5E4] p-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#032622] uppercase">Questions</h4>
                  <textarea
                    placeholder="Questions qui te viennent en tête..."
                    className="w-full h-20 border border-[#032622] bg-white px-3 py-2 text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-3 py-1 text-xs hover:bg-[#01302C] transition-colors">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="border border-[#032622] bg-[#F8F5E4] p-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#032622] uppercase">Actions</h4>
                  <textarea
                    placeholder="Actions à entreprendre après le module..."
                    className="w-full h-20 border border-[#032622] bg-white px-3 py-2 text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-3 py-1 text-xs hover:bg-[#01302C] transition-colors">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
                
                <div className="border border-[#032622] bg-[#F8F5E4] p-4 space-y-3">
                  <h4 className="text-sm font-bold text-[#032622] uppercase">Définitions</h4>
                  <textarea
                    placeholder="Définitions importantes à retenir..."
                    className="w-full h-20 border border-[#032622] bg-white px-3 py-2 text-xs text-[#032622] placeholder-[#032622]/50 focus:outline-none resize-none"
                  />
                  <button className="border border-[#032622] bg-[#032622] text-white px-3 py-1 text-xs hover:bg-[#01302C] transition-colors">
                    <Plus className="w-3 h-3 inline mr-1" />
                    Ajouter
                  </button>
                </div>
              </div>
              
              <div className="border border-[#032622] bg-[#F8F5E4] p-4">
                <h4 className="text-sm font-bold text-[#032622] uppercase mb-3">Résumé du Module</h4>
                <textarea
                  placeholder="Rédige ici un résumé personnel du module..."
                  className="w-full h-32 border border-[#032622] bg-white px-3 py-2 text-sm text-[#032622] placeholder-[#032622]/50 focus:outline-none resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <button className="border border-[#032622] bg-[#F8F5E4] text-[#032622] px-4 py-2 text-xs font-semibold hover:bg-[#032622] hover:text-white transition-colors">
                    <Save className="w-3 h-3 inline mr-1" />
                    Sauvegarder
                  </button>
                  <button className="border border-[#032622] bg-[#032622] text-white px-4 py-2 text-xs font-semibold hover:bg-[#01302C] transition-colors">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#032622]">
              <h3 className="text-lg font-bold text-[#032622]" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                Mes Tâches et Rappels
              </h3>
              <button
                onClick={() => setShowTaskPanel(false)}
                className="text-[#032622] hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Formulaire d'ajout de tâche */}
              <div className="border border-[#032622] bg-[#F8F5E4] p-4 mb-6 space-y-3">
                <h4 className="text-sm font-bold text-[#032622] uppercase">Nouvelle Tâche</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Titre de la tâche..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="border border-[#032622] px-3 py-2 text-xs bg-white text-[#032622] placeholder-[#032622]/50 focus:outline-none"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="border border-[#032622] px-3 py-2 text-xs bg-white text-[#032622] focus:outline-none"
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
                  className="w-full border border-[#032622] px-3 py-2 text-xs bg-white text-[#032622] placeholder-[#032622]/50 focus:outline-none resize-none"
                  rows={3}
                />
                <button
                  onClick={addTask}
                  className="border border-[#032622] bg-[#032622] text-white px-4 py-2 text-xs font-semibold hover:bg-[#01302C] transition-colors"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Ajouter la tâche
                </button>
              </div>

              {/* Liste des tâches */}
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-[#032622]/30 mx-auto mb-4" />
                  <p className="text-sm text-[#032622]/60">
                    Aucune tâche pour le moment. Ajoute ta première tâche ci-dessus !
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
                        className={`border border-[#032622] p-4 space-y-2 ${
                          task.isUrgent ? 'bg-red-50 border-red-300' : 'bg-[#F8F5E4]'
                        } ${task.status === 'completed' ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <button
                              onClick={() => toggleTaskStatus(task.id)}
                              className={`mt-1 w-5 h-5 border-2 rounded transition-colors ${
                                task.status === 'completed'
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-[#032622] hover:bg-[#032622] hover:text-white'
                              }`}
                            >
                              {task.status === 'completed' && <Check className="w-3 h-3" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className={`text-sm font-semibold ${
                                  task.status === 'completed' ? 'line-through text-[#032622]/60' : 'text-[#032622]'
                                }`}>
                                  {task.title}
                                </h5>
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Faible'}
                                </span>
                                {task.isUrgent && (
                                  <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded animate-pulse">
                                    URGENT
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-xs text-[#032622]/70 mb-2">{task.description}</p>
                              )}
                              <p className="text-xs text-[#032622]/50">
                                Échéance : {task.dueDate.toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => toggleTaskUrgent(task.id)}
                              className={`p-1 transition-colors ${
                                task.isUrgent 
                                  ? 'text-red-500' 
                                  : 'text-[#032622]/40 hover:text-red-500'
                              }`}
                            >
                              <AlertCircle className={`w-4 h-4 ${task.isUrgent ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-[#032622]/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("module")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR AU MODULE</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="border border-black bg-[#F8F5E4] p-6 space-y-6">
        <h2
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Tu arrives au quiz de fin de module
        </h2>
        <p className="text-sm text-[#032622] opacity-80">
          Sélectionne la réponse la plus pertinente pour chaque question. Tu peux revenir au module si tu veux revoir le contenu avant de valider.
        </p>

        {quizError && (
          <div className="flex items-center space-x-2 border border-black bg-[#F8F5E4] text-[#032622] px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{quizError}</span>
          </div>
        )}

        <div className="space-y-6">
          {quizQuestions.map((question) => (
            <div key={question.id} className="border border-black p-4 bg-white/40">
              <p className="text-xs font-semibold text-[#032622] uppercase mb-3">
                Question {question.id}
              </p>
              <h3 className="text-lg font-bold text-[#032622] mb-4">
                {question.question}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswers[question.id] === index;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectAnswer(question.id, index)}
                      className={`border border-black px-4 py-3 text-left text-sm font-semibold transition-colors ${
                        isSelected
                          ? "bg-[#032622] text-white"
                          : "bg-[#F8F5E4] text-[#032622] hover:bg-[#032622] hover:text-white"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep("module")}
            className="border border-black px-6 py-2 text-sm font-bold text-[#032622]"
          >
            PRÉCÉDENTE
          </button>
          <button
            onClick={handleSubmitQuiz}
            disabled={!canSubmitQuiz}
            className={`border border-black px-6 py-2 text-sm font-bold ${
              canSubmitQuiz
                ? "bg-[#032622] text-white"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("overview")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR À MES FORMATIONS</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="border border-black bg-[#F8F5E4] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2
            className="text-2xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            Résultat
          </h2>
          <span className="text-sm font-semibold text-[#032622]">
            {score} / {totalQuestions} bonnes réponses
          </span>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="border-4 border-[#032622] p-10 text-center bg-white/50">
            <div className="text-5xl font-bold text-[#032622]">
              {computedScoreOn20}/20
            </div>
            <p className="text-sm text-[#032622] mt-2">Score converti sur 20</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#032622] uppercase">Relecture pédagogique</h3>
          {quizQuestions.map((question) => {
            const selected = selectedAnswers[question.id];
            const isCorrect = selected === question.correctIndex;
            return (
              <div key={question.id} className="border border-black bg-white/60 p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  {isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <p className="text-xs font-semibold uppercase text-[#032622]">
                    Question {question.id}
                  </p>
                </div>
                <h4 className="text-sm font-bold text-[#032622]">{question.question}</h4>
                <div className="text-sm">
                  <p className="font-semibold text-[#032622]">
                    Ta réponse :
                    <span className={`ml-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {selected !== null ? question.options[selected] : "Non renseignée"}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="font-semibold text-[#032622]">
                      Bonne réponse :
                      <span className="ml-2 text-green-600">
                        {question.options[question.correctIndex]}
                      </span>
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-sm text-[#032622]">
                  <p>{question.explanation}</p>
                  <div className="bg-[#032622]/10 border border-[#032622] px-3 py-2">
                    <p className="text-xs font-bold uppercase text-[#032622] mb-1">
                      Note de cours
                    </p>
                    <p>{question.courseTip}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center space-x-4 justify-center pt-4">
          <button
            onClick={() => setStep("quiz")}
            className="border border-black px-6 py-2 text-sm font-bold text-[#032622]"
          >
            VOIR SES RÉPONSES
          </button>
          <button
            onClick={() => {
              setStep("module");
            }}
            className="border border-black px-6 py-2 text-sm font-bold bg-[#032622] text-white"
          >
            MODULE SUIVANT
          </button>
        </div>

        <div className="space-y-3">
          {upcomingEvents.slice(0, 2).map((event, index) => (
            <div key={index} className="border border-black p-4 bg-white/60">
              <div className="text-sm font-bold text-[#032622]">{event.title}</div>
              <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
        {step === "overview" && renderOverview()}
        {step === "module" && renderModuleView()}
        {step === "quiz" && renderQuizView()}
        {step === "results" && renderResultsView()}
    </div>
  );
}


