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
  Clock,
  Lightbulb,
  FileText,
  ExternalLink,
  Briefcase,
  BarChart3,
  Cpu,
  LineChart,
  TrendingUp,
  Network,
  Megaphone,
  Globe,
  Languages,
  Users,
  UserCog,
  Building2,
  Rocket,
  Shield,
  Wallet,
  Scale,
  FileBarChart,
} from "lucide-react";

const heroCourse = {
  greeting: "Bonjour, Chadi El Assowad",
  headline: "Prêt à apprendre quelque chose de nouveau aujourd'hui ?",
};

const courseBlocks = [
  {
    id: "bloc-1",
    title: "Module 1",
    subtitle: "Culture de l'intelligence artificielle",
    progress: 10,
    cta: "REPRENDRE",
    locked: false,
  },
  {
    id: "bloc-2",
    title: "Bloc 1",
    subtitle: "ÉLABORER LA STRATÉGIE COMMERCIALE & MARKETING",
    progress: 0,
    cta: "COMMENCER",
    locked: false,
  },
  {
    id: "bloc-3",
    title: "Bloc 2",
    subtitle: "MISE EN OEUVRE DE LA POLITIQUE COMMERCIALE",
    progress: 0,
    cta: "COMMENCER",
    locked: false,
  },
  {
    id: "bloc-4",
    title: "Bloc 3",
    subtitle: "MANAGER UNE ÉQUIPE ET UN RÉSEAU COMMERCIAL",
    progress: 0,
    cta: "COMMENCER",
    locked: false,
  },
  {
    id: "bloc-5",
    title: "Bloc 4",
    subtitle: "MESURER LA PERFORMANCE COMMERCIALE",
    progress: 0,
    cta: "COMMENCER",
    locked: false,
  },
];

// Événements par jour
const eventsByDay = {
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

type Step = "overview" | "courseIntro" | "bloc1CoursSelection" | "bloc2CoursSelection" | "bloc3CoursSelection" | "bloc4CoursSelection" | "module" | "pse_partie1_1" | "strategie_marketing_partie1_1" | "strategie_marketing_partie1_2" | "strategie_marketing_partie1_3" | "strategie_marketing_partie1_4" | "strategie_marketing_partie1_5" | "strategie_marketing_partie1_6" | "strategie_marketing_partie1_7" | "strategie_marketing_partie1_8" | "quizMarketingPartie1" | "resultsMarketingPartie1" | "strategie_marketing_partie2_1" | "strategie_marketing_partie2_2" | "strategie_marketing_partie2_3" | "strategie_marketing_partie2_4" | "strategie_marketing_partie2_5" | "strategie_marketing_partie2_6" | "strategie_marketing_partie2_7" | "strategie_marketing_partie2_8" | "strategie_marketing_partie2_9" | "quizMarketingPartie2" | "resultsMarketingPartie2" | "strategie_marketing_partie3_1" | "strategie_marketing_partie3_2" | "strategie_marketing_partie3_3" | "strategie_marketing_partie3_4" | "strategie_marketing_partie3_5" | "strategie_marketing_partie3_6" | "strategie_marketing_partie3_7" | "quizMarketingPartie3" | "resultsMarketingPartie3" | "partie1_1" | "partie1_2" | "partie1_3" | "partie1_3_suite" | "quizPartie1" | "resultsPartie1" | "partie2" | "partie2_1" | "partie2_2" | "partie2_2_suite" | "partie2_3" | "partie2_3_suite" | "quizPartie2" | "resultsPartie2" | "partie3_1" | "partie3_2" | "partie3_3" | "partie3_4" | "partie3_5" | "quizPartie3" | "resultsPartie3" | "courseFinal" | "quiz" | "results";

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

// Nouvelles interfaces pour les fonctionnalités d'étude
interface Bookmark {
  id: string;
  title: string;
  content: string;
  position: number;
  timestamp: Date;
  color: string;
}

interface Annotation {
  id: string;
  text: string;
  note: string;
  position: number;
  timestamp: Date;
  color: string;
  type: 'note' | 'question' | 'important';
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
  
  // États pour les quiz Partie 1, Partie 2 et Partie 3
  const [quizPartie1Answers, setQuizPartie1Answers] = useState<Record<number, number | null>>({});
  const [quizPartie2Answers, setQuizPartie2Answers] = useState<Record<number, number | null>>({});
  const [quizPartie3Answers, setQuizPartie3Answers] = useState<Record<number, number | null>>({});
  const [quizMarketingPartie1Answers, setQuizMarketingPartie1Answers] = useState<Record<number, number | null>>({});
  const [quizMarketingPartie2Answers, setQuizMarketingPartie2Answers] = useState<Record<number, number | null>>({});
  const [quizMarketingPartie3Answers, setQuizMarketingPartie3Answers] = useState<Record<number, number | null>>({});
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizMarketingPartie1Completed, setQuizMarketingPartie1Completed] = useState(false);
  const [quizMarketingPartie2Completed, setQuizMarketingPartie2Completed] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookContent, setNotebookContent] = useState("");
  const [moduleNotes, setModuleNotes] = useState("");
  const [selectedDay, setSelectedDay] = useState(18);
  const courseContentRef = useRef<HTMLDivElement | null>(null);
  const highlightOverlayRef = useRef<HTMLDivElement | null>(null);
  const secureHighlightModeRef = useRef<boolean>(true);

  // Scroll vers le haut à chaque changement de page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Réinitialiser currentQuizQuestion quand on entre dans un quiz marketing
  useEffect(() => {
    if (step === "quizMarketingPartie1" || step === "quizMarketingPartie2" || step === "quizMarketingPartie3") {
      setCurrentQuizQuestion(0);
    }
  }, [step]);

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
  
  // Nouvelles fonctionnalités d'étude
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  // États pour les lecteurs vidéo
  const [isVideo1Playing, setIsVideo1Playing] = useState(false);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const [isVideo2Playing, setIsVideo2Playing] = useState(false);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [isVideo3Playing, setIsVideo3Playing] = useState(false);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const [isVideo4Playing, setIsVideo4Playing] = useState(false);
  const video4Ref = useRef<HTMLVideoElement>(null);

  // Fonctions pour lancer les vidéos
  const handlePlayVideo1 = () => {
    if (video1Ref.current) {
      video1Ref.current.play();
      setIsVideo1Playing(true);
    }
  };

  const handlePlayVideo2 = () => {
    if (video2Ref.current) {
      video2Ref.current.play();
      setIsVideo2Playing(true);
    }
  };

  const handlePlayVideo3 = () => {
    if (video3Ref.current) {
      video3Ref.current.play();
      setIsVideo3Playing(true);
    }
  };

  const handlePlayVideo4 = () => {
    if (video4Ref.current) {
      video4Ref.current.play();
      setIsVideo4Playing(true);
    }
  };
  // Effects pour gérer les événements des vidéos
  useEffect(() => {
    const video = video1Ref.current;
    if (!video) return;

    const handlePause = () => setIsVideo1Playing(false);
    const handlePlay = () => setIsVideo1Playing(true);

    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  useEffect(() => {
    const video = video2Ref.current;
    if (!video) return;

    const handlePause = () => setIsVideo2Playing(false);
    const handlePlay = () => setIsVideo2Playing(true);

    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  useEffect(() => {
    const video = video3Ref.current;
    if (!video) return;

    const handlePause = () => setIsVideo3Playing(false);
    const handlePlay = () => setIsVideo3Playing(true);

    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  useEffect(() => {
    const video = video4Ref.current;
    if (!video) return;

    const handlePause = () => setIsVideo4Playing(false);
    const handlePlay = () => setIsVideo4Playing(true);

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
  // Fonction de surlignage optimisée et sans espaces bizarres
  const applyHighlight = useCallback((color: string, colorName: string) => {
    if (!courseContentRef.current || typeof window === "undefined") return;

    // MODE SÉCURISÉ: surlignage par CALQUE sans modifier le DOM du texte
    if (secureHighlightModeRef.current) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      if (!courseContentRef.current.contains(range.commonAncestorContainer)) return;

      const overlay = highlightOverlayRef.current;
      if (!overlay) return;

      const contentRect = courseContentRef.current.getBoundingClientRect();

      const rects = Array.from(range.getClientRects());
      if (rects.length === 0) return;

      rects.forEach((r) => {
        const block = document.createElement('div');
        block.className = 'highlight-overlay-block';
        block.style.position = 'absolute';
        block.style.left = `${r.left - contentRect.left + courseContentRef.current!.scrollLeft}px`;
        block.style.top = `${r.top - contentRect.top + courseContentRef.current!.scrollTop}px`;
        block.style.width = `${r.width}px`;
        block.style.height = `${r.height}px`;
        block.style.backgroundColor = color;
        block.style.opacity = '0.6';
        block.style.pointerEvents = 'none';
        block.style.borderRadius = '3px';
        overlay.appendChild(block);
      });

      // Enregistrer un objet highlight minimal (sans toucher au texte)
      const highlightId = `overlay-${Date.now()}`;
      const highlight: Highlight = {
        id: highlightId,
        text: selection.toString(),
        color: color,
        colorName: colorName,
        timestamp: new Date(),
        position: 0,
      };
      setHighlights(prev => [...prev, highlight]);
      selection.removeAllRanges();
      showNotification(`Texte surligné (mode sécurisé) en ${colorName}`, 'success');
      return;
    }
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }
    
    let range = selection.getRangeAt(0);
    if (!courseContentRef.current.contains(range.commonAncestorContainer)) return;
    
    // Garder le texte complet avec espaces pour l'affichage
    const text = selection.toString();
    if (!text || text.trim().length < 2) return;

    const highlightId = `highlight-${Date.now()}`;
    
    try {
      // Empêcher tout chevauchement avec un surlignage existant (au milieu de la sélection)
      try {
        const cloned = range.cloneContents();
        const intersectsExisting = !!cloned.querySelector?.('[data-highlight="true"]');
        if (intersectsExisting) {
          showNotification("Impossible de surligner: chevauche un surlignage existant", 'error');
          selection.removeAllRanges();
          return;
        }
      } catch {}
      // Vérifier si la sélection est déjà dans un surlignage existant
      const existingHighlight = range.commonAncestorContainer.parentElement?.closest('[data-highlight="true"]');
      if (existingHighlight) {
        // Ne pas surligner sur un surlignage existant
        selection.removeAllRanges();
        return;
      }

      // MÉTHODE ULTRA-SÉCURISÉE : Utilise splitText() native du DOM pour diviser les nœuds
      // Le texte ne sera JAMAIS supprimé, seulement divisé et réorganisé
      const mergeAdjacentHighlights = (el: HTMLSpanElement) => {
        // Fusionner avec le précédent si même couleur
        const prev = el.previousSibling as HTMLElement | null;
        if (prev && prev.nodeType === Node.ELEMENT_NODE) {
          const prevEl = prev as HTMLElement;
          if (prevEl.dataset?.highlight === 'true' && prevEl.dataset.highlightColor === el.dataset.highlightColor) {
            while (el.firstChild) prevEl.appendChild(el.firstChild);
            el.replaceWith(prevEl);
            el = prevEl as unknown as HTMLSpanElement;
          }
        }
        // Fusionner avec le suivant si même couleur
        const next = el.nextSibling as HTMLElement | null;
        if (next && next.nodeType === Node.ELEMENT_NODE) {
          const nextEl = next as HTMLElement;
          if (nextEl.dataset?.highlight === 'true' && nextEl.dataset.highlightColor === el.dataset.highlightColor) {
            while (nextEl.firstChild) el.appendChild(nextEl.firstChild);
            nextEl.remove();
          }
        }
      };

      const wrapRangeWithHighlight = (range: Range) => {
        const span = document.createElement("span");
        span.className = "highlight-marker";
        span.style.backgroundColor = color;
        span.style.padding = "1px 2px";
        span.style.borderRadius = "3px";
        span.style.display = "inline";
        span.style.margin = "0";
        span.style.lineHeight = "inherit";
        span.style.wordSpacing = "normal";
        span.style.whiteSpace = "pre-wrap";
        span.dataset.highlight = "true";
        span.dataset.highlightId = highlightId;
        span.dataset.highlightColor = colorName;

        // CAS 1 : Sélection dans un seul nœud de texte (le plus courant) - 90% des cas
        if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
          // SAUVEGARDE : Sauvegarder le texte AVANT toute manipulation
          const savedText = range.toString();
          const textNode = range.startContainer as Text;
          const startOffset = range.startOffset;
          const endOffset = range.endOffset;
          
          // Vérification de sécurité
          const nodeText = textNode.textContent || '';
          if (startOffset < 0 || endOffset > nodeText.length || startOffset >= endOffset) {
            console.warn('Offsets invalides pour le surlignage');
          mergeAdjacentHighlights(span);
          return span;
          }
          
          try {
            // Utiliser splitText() pour diviser le nœud - méthode native et sûre
            // splitText() retourne le nouveau nœud (partie droite)
            let middleNode: Text = textNode;
            
            // Premier split : séparer la partie avant (si nécessaire)
            if (startOffset > 0) {
              middleNode = textNode.splitText(startOffset);
              // Après splitText, textNode contient [0..startOffset], middleNode contient [startOffset..fin]
            }
            
            // Vérifier que middleNode existe et a du contenu
            if (!middleNode || !middleNode.textContent) {
              console.warn('Nœud du milieu invalide après split');
              // RESTAURATION : recréer le texte si nécessaire
              span.textContent = savedText;
              const parent = textNode.parentNode;
              if (parent) {
                parent.insertBefore(span, textNode);
              }
          mergeAdjacentHighlights(span);
          return span;
            }
            
            // Deuxième split : séparer la partie après (si nécessaire)
            const endOffsetInMiddle = endOffset - startOffset;
            const middleTextLength = middleNode.textContent.length;
            
            if (endOffsetInMiddle > 0 && endOffsetInMiddle < middleTextLength) {
              middleNode.splitText(endOffsetInMiddle);
              // Après ce split, middleNode contient [0..endOffsetInMiddle], et le nouveau nœud contient le reste
            }
            
            // Maintenant on a : [avant] [milieu] [après]
            // Le "milieu" (middleNode) est ce qu'on veut surligner
            const parent = middleNode.parentNode;
            if (!parent) {
              console.warn('Pas de parent trouvé pour insérer le surlignage');
              // RESTAURATION : recréer le texte
              span.textContent = savedText;
              const fallbackParent = textNode.parentNode || range.commonAncestorContainer.parentNode;
              if (fallbackParent) {
                fallbackParent.insertBefore(span, textNode);
              }
          mergeAdjacentHighlights(span);
          return span;
            }
            
            // Insérer le span AVANT le nœud du milieu
            parent.insertBefore(span, middleNode);
            // Déplacer le nœud du milieu DANS le span (ceci le retire automatiquement de sa position actuelle)
            span.appendChild(middleNode);
            // L'après reste automatiquement en place après le span grâce à splitText()
            
            // VÉRIFICATION FINALE : s'assurer que le texte est présent
            if (!span.textContent || span.textContent.trim().length === 0) {
              console.error('ERREUR : Le texte a disparu dans le CAS 1 ! Restauration...');
              // RESTAURATION D'URGENCE
              span.textContent = savedText;
            }
            
            return span;
          } catch (error) {
            console.error('Erreur critique dans le CAS 1:', error);
            // RESTAURATION D'URGENCE : recréer le texte sauvegardé
            span.textContent = savedText;
            const parent = textNode.parentNode || range.commonAncestorContainer.parentNode;
            if (parent) {
              try {
                parent.insertBefore(span, textNode);
              } catch (e) {
                parent.appendChild(span);
              }
            }
            return span;
          }
        }

        // CAS 2 : Sélection complexe (multiples nœuds ou coupe d'éléments)
        // SAUVEGARDE CRITIQUE : Sauvegarder le texte AVANT toute manipulation
        const savedText = range.toString();
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;
        const endContainer = range.endContainer;
        const endOffset = range.endOffset;
        
        // Essayer d'abord surroundContents() qui fonctionne dans la plupart des cas
        try {
          range.surroundContents(span);
          // Vérifier que le texte est toujours là après surroundContents
          if (!span.textContent || span.textContent.trim().length === 0) {
            throw new Error('Le texte a disparu après surroundContents');
          }
          return span;
        } catch (surroundError) {
          console.log('surroundContents a échoué, utilisation de la méthode fallback sécurisée');
          
          // MÉTHODE FALLBACK ULTRA-SÉCURISÉE : Traiter chaque nœud individuellement
          // Cette méthode ne retire JAMAIS le texte sans s'assurer de le réinsérer
          
          // Reconstruire la range au cas où elle aurait été invalidée
          try {
            const newRange = document.createRange();
            newRange.setStart(startContainer, startOffset);
            newRange.setEnd(endContainer, endOffset);
            range = newRange;
          } catch (e) {
            console.error('Impossible de reconstruire la range');
          }
          
          // Récupérer tous les nœuds de texte dans la sélection en utilisant une méthode sûre
          const textNodes: { node: Text; startOffset: number; endOffset: number }[] = [];
          
          // Créer un TreeWalker pour trouver tous les nœuds de texte
          const walker = document.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                try {
                  const nodeRange = document.createRange();
                  nodeRange.selectNodeContents(node);
                  if (range.intersectsNode(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                  }
                } catch (e) {
                  // Ignorer les erreurs
                }
                return NodeFilter.FILTER_REJECT;
              }
            }
          );
          
          let walkerNode;
          while (walkerNode = walker.nextNode()) {
            if (walkerNode.nodeType === Node.TEXT_NODE) {
              const textNode = walkerNode as Text;
              const isStart = textNode === range.startContainer;
              const isEnd = textNode === range.endContainer;
              
              textNodes.push({
                node: textNode,
                startOffset: isStart ? range.startOffset : 0,
                endOffset: isEnd ? range.endOffset : (textNode.textContent?.length || 0)
              });
            }
          }
          
          // Si aucun nœud trouvé, utiliser une méthode de dernière chance
          if (textNodes.length === 0) {
            console.warn('Aucun nœud de texte trouvé, utilisation de la méthode de dernière chance');
            // Créer un nœud de texte avec le texte sauvegardé et l'entourer
            const textNode = document.createTextNode(savedText);
            span.appendChild(textNode);
            
            // Insérer AVANT la sélection sans rien retirer
            try {
              range.insertNode(span);
            } catch (e) {
              // Si l'insertion échoue, insérer à la fin du conteneur parent
              const parent = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentNode
                : range.commonAncestorContainer as Element;
              if (parent) {
                parent.appendChild(span);
              }
            }
            return span;
          }
          
          // Traiter le premier nœud
          const first = textNodes[0];
          const firstNode = first.node;
          const firstStart = first.startOffset;
          const firstEnd = first.endOffset;
          
          let workingSpan = span;
          
          if (firstStart > 0 || firstEnd < (firstNode.textContent?.length || 0)) {
            // Le nœud est partiellement sélectionné, utiliser splitText()
            try {
              let selectedPart: Text;
              
              if (firstStart > 0) {
                selectedPart = firstNode.splitText(firstStart);
              } else {
                selectedPart = firstNode;
              }
              
              if (firstEnd < selectedPart.textContent!.length) {
                selectedPart.splitText(firstEnd - firstStart);
              }
              
              const parent = selectedPart.parentNode;
              if (parent) {
                parent.insertBefore(workingSpan, selectedPart);
                workingSpan.appendChild(selectedPart);
              }
            } catch (e) {
              console.error('Erreur lors du traitement du premier nœud:', e);
              // Fallback : créer un nouveau nœud avec le texte sauvegardé
              workingSpan.textContent = savedText;
              try {
                range.insertNode(workingSpan);
              } catch (e2) {
                const parent = firstNode.parentNode;
                if (parent) {
                  parent.insertBefore(workingSpan, firstNode);
                }
              }
            }
          } else {
            // Tout le nœud est sélectionné
            const parent = firstNode.parentNode;
            if (parent) {
              parent.insertBefore(workingSpan, firstNode);
              workingSpan.appendChild(firstNode);
            }
          }
          
          // Traiter les nœuds du milieu (tous entièrement sélectionnés)
          for (let i = 1; i < textNodes.length - 1; i++) {
            const textNode = textNodes[i].node;
            if (!workingSpan.contains(textNode)) {
              const parent = textNode.parentNode;
              if (parent) {
                // Déplacer le nœud dans le span
                workingSpan.appendChild(textNode);
              }
            }
          }
          
          // Traiter le dernier nœud (si différent du premier)
          if (textNodes.length > 1) {
            const last = textNodes[textNodes.length - 1];
            const lastNode = last.node;
            const lastEnd = last.endOffset;
            
            if (!workingSpan.contains(lastNode)) {
              const lastFullLength = lastNode.textContent?.length || 0;
              
              if (lastEnd < lastFullLength) {
                // Le dernier nœud est partiellement sélectionné
                try {
                  lastNode.splitText(lastEnd);
                  // La partie sélectionnée est maintenant le previousSibling
                  const selectedPart = lastNode.previousSibling as Text;
                  if (selectedPart && selectedPart.nodeType === Node.TEXT_NODE) {
                    const parent = selectedPart.parentNode;
                    if (parent) {
                      parent.removeChild(selectedPart);
                      workingSpan.appendChild(selectedPart);
                    }
                  }
                } catch (e) {
                  console.error('Erreur lors du traitement du dernier nœud:', e);
                }
              } else {
                // Tout le dernier nœud est sélectionné
                const parent = lastNode.parentNode;
                if (parent) {
                  parent.removeChild(lastNode);
                  workingSpan.appendChild(lastNode);
                }
              }
            }
          }
          
          // VÉRIFICATION FINALE CRITIQUE : s'assurer que le texte est présent
          const finalText = workingSpan.textContent || '';
          if (!finalText || finalText.trim().length === 0) {
            console.error('ERREUR CRITIQUE : Le texte a disparu ! Restauration depuis la sauvegarde...');
            // RESTAURATION D'URGENCE : remplacer le contenu par le texte sauvegardé
            workingSpan.textContent = savedText;
            
            // Si le span n'est pas dans le DOM, l'insérer
            if (!workingSpan.parentNode) {
              try {
                const newRange = document.createRange();
                newRange.setStart(startContainer, startOffset);
                newRange.setEnd(endContainer, endOffset);
                newRange.insertNode(workingSpan);
              } catch (e) {
                // Dernière tentative : insérer à la fin du conteneur
                const parent = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                  ? range.commonAncestorContainer.parentNode
                  : range.commonAncestorContainer as Element;
                if (parent) {
                  parent.appendChild(workingSpan);
                }
              }
            }
          }
          
          return workingSpan;
        }
      };

      const highlightSpan = wrapRangeWithHighlight(range);
      
      // Créer l'objet highlight avec le texte complet préservé
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
      
      // Afficher une notification
      showNotification(`Texte surligné en ${colorName}`, 'success');
      
    } catch (error) {
      console.error("Erreur lors du surlignage:", error);
      showNotification("Erreur lors du surlignage", 'error');
    }
  }, []);

  // Fonction de notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium transform translate-x-full transition-transform duration-300 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // Fonction pour ajouter un signet
  const addBookmark = useCallback((title: string, content: string) => {
    const bookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      title,
      content,
      position: window.scrollY,
      timestamp: new Date(),
      color: '#6B8E23'
    };
    setBookmarks(prev => [...prev, bookmark]);
    showNotification("Signet ajouté", 'success');
  }, []);

  // Fonction pour ajouter une annotation
  const addAnnotation = useCallback((text: string, note: string, type: 'note' | 'question' | 'important') => {
    const annotation: Annotation = {
      id: `annotation-${Date.now()}`,
      text,
      note,
      position: window.scrollY,
      timestamp: new Date(),
      color: type === 'important' ? '#ef4444' : type === 'question' ? '#3b82f6' : '#6B8E23',
      type
    };
    setAnnotations(prev => [...prev, annotation]);
    showNotification("Annotation ajoutée", 'success');
  }, []);

  // Fonction pour activer le mode étude
  const toggleStudyMode = useCallback(() => {
    setStudyMode(prev => !prev);
    if (!studyMode) {
      showNotification("Mode étude activé - Focus sur le contenu", 'info');
    }
  }, [studyMode]);

  // Fonction pour calculer le progrès de lecture
  const calculateReadingProgress = useCallback(() => {
    if (!courseContentRef.current) return;
    
    const contentHeight = courseContentRef.current.scrollHeight;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / (contentHeight - windowHeight)) * 100));
    setReadingProgress(Math.round(progress));
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

  // Questions Quiz Partie 1
  const quizPartie1Questions = [
    {
      id: 1,
      question: "Quelle invention marque la naissance de la logique algorithmique, fondement de l'IA ?",
      options: ["La machine à vapeur", "Le transistor", "La machine de Turing", "Le télégraphe"],
      correctAnswer: 2,
      explanation: "Alan Turing conçoit en 1936 un modèle abstrait de calcul universel — la \"machine de Turing\" — qui formalise la manière dont une machine peut résoudre tout problème logique traduisible en code."
    },
    {
      id: 2,
      question: "Le terme \"intelligence artificielle\" apparaît officiellement en :",
      options: ["1946", "1951", "1956", "1962"],
      correctAnswer: 2,
      explanation: "Le terme est forgé par John McCarthy lors de la conférence de Dartmouth (été 1956), où est posée pour la première fois la question : \"Peut-on créer une machine capable d'apprendre comme un être humain ?\""
    },
    {
      id: 3,
      question: "Qui est considéré comme le \"père fondateur\" de la pensée algorithmique ?",
      options: ["Marvin Minsky", "Alan Turing", "Claude Shannon", "Herbert Simon"],
      correctAnswer: 1,
      explanation: "Turing n'a pas inventé l'IA moderne, mais il en a posé les fondements conceptuels : il a montré que la pensée pouvait être simulée par des calculs logiques."
    },
    {
      id: 4,
      question: "Quelle période est connue sous le nom de \"premier hiver de l'IA\" ?",
      options: ["1939–1945", "1950–1960", "1970–1980", "2008–2010"],
      correctAnswer: 2,
      explanation: "Après les espoirs initiaux, le manque de puissance de calcul et de données conduit à un désintérêt général : les financements chutent, les laboratoires ferment."
    },
    {
      id: 5,
      question: "Dans la mythologie grecque, quelle figure symbolise l'idée d'un être artificiel animé ?",
      options: ["Prométhée", "Talos", "Hermès", "Icare"],
      correctAnswer: 1,
      explanation: "Talos, géant de bronze construit par Héphaïstos, symbolise la première \"machine vivante\" de la culture occidentale — un gardien artificiel doté d'une conscience mécanique."
    },
    {
      id: 6,
      question: "L'anecdote de Deep Blue contre Garry Kasparov illustre :",
      options: ["Une IA capable d'apprendre par intuition", "Une IA consciente de ses choix", "Une IA fondée sur la puissance de calcul brute", "Une IA émotionnelle"],
      correctAnswer: 2,
      explanation: "En 1997, Deep Blue d'IBM bat Kasparov grâce à une puissance de calcul inédite : plus de 200 millions de positions analysées par seconde, sans aucune \"compréhension\" du jeu."
    },
    {
      id: 7,
      question: "Quelle erreur de raisonnement a mené à la défaite de Kasparov contre Deep Blue ?",
      options: ["Une sous-estimation de la machine", "Une erreur tactique", "Une mauvaise interprétation du comportement non humain de l'IA", "Une distraction pendant la partie"],
      correctAnswer: 2,
      explanation: "Kasparov a cru que certaines décisions \"étranges\" de la machine étaient stratégiques, alors qu'elles étaient aléatoires : il a projeté une intention humaine sur une logique purement statistique."
    },
    {
      id: 8,
      question: "Dans les années 1990, quel événement a favorisé la renaissance de l'IA ?",
      options: ["L'apparition des ordinateurs personnels", "L'explosion d'Internet et des données", "Le développement du nucléaire civil", "La création du téléphone mobile"],
      correctAnswer: 1,
      explanation: "L'arrivée du Web crée une masse de données disponibles pour l'entraînement des modèles : c'est la naissance du \"Big Data\", moteur du renouveau de l'IA."
    },
    {
      id: 9,
      question: "En quoi le \"machine learning\" diffère-t-il des approches symboliques ?",
      options: ["Il repose sur des règles fixes", "Il ne nécessite pas de données", "Il est aléatoire", "Il apprend à partir d'exemples plutôt que de règles explicites"],
      correctAnswer: 3,
      explanation: "Le machine learning apprend par observation : il découvre les régularités statistiques sans qu'un humain ne les définisse manuellement."
    },
    {
      id: 10,
      question: "L'expression \"deep learning\" fait référence à :",
      options: ["L'analyse de la mémoire humaine", "L'apprentissage par réseaux de neurones à plusieurs couches", "L'entraînement des IA à la conversation", "L'exploration de données profondes"],
      correctAnswer: 1,
      explanation: "\"Deep\" signifie \"profond\" : les modèles possèdent plusieurs couches successives qui décomposent et recombinent les informations, imitant le fonctionnement du cerveau."
    },
    {
      id: 11,
      question: "Pourquoi la donnée est-elle essentielle à l'IA moderne ?",
      options: ["Elle permet de stocker les résultats", "Elle remplace le code", "Elle sert de matière première à l'apprentissage automatique", "Elle accélère le réseau Internet"],
      correctAnswer: 2,
      explanation: "Sans données, une IA ne peut pas apprendre : les modèles doivent être nourris d'exemples concrets pour ajuster leurs paramètres et reconnaître des schémas."
    },
    {
      id: 12,
      question: "En 2012, l'IA \"AlexNet\" devient célèbre pour :",
      options: ["Avoir gagné contre un humain aux échecs", "Avoir surpassé tous les modèles précédents en reconnaissance d'images", "Être la première IA open source", "Être utilisée dans les téléphones mobiles"],
      correctAnswer: 1,
      explanation: "AlexNet, développé à Toronto, double la performance de ses concurrents grâce au deep learning et à l'utilisation de GPU : c'est le début de la révolution moderne de l'IA."
    },
    {
      id: 13,
      question: "Que symbolise la victoire de Deep Blue sur Kasparov en 1997 ?",
      options: ["La naissance de la conscience artificielle", "Le passage de la force humaine à la puissance de calcul", "La fin du jeu d'échecs compétitif", "Une avancée en robotique"],
      correctAnswer: 1,
      explanation: "Cet affrontement marque un basculement culturel : la machine devient capable de battre l'humain sur son propre terrain intellectuel, sans \"penser\" pour autant."
    },
    {
      id: 14,
      question: "Quel facteur rend possible le retour du deep learning dans les années 2010 ?",
      options: ["L'intelligence émotionnelle des machines", "La baisse du coût des ordinateurs", "Les GPU et le cloud computing", "Les ordinateurs quantiques"],
      correctAnswer: 2,
      explanation: "Les processeurs graphiques (GPU), initialement conçus pour le jeu vidéo, permettent d'entraîner de grands réseaux neuronaux grâce à des calculs parallèles massifs."
    },
    {
      id: 15,
      question: "Le Big Data se définit avant tout par :",
      options: ["Des données sensibles", "Un volume, une vitesse et une variété d'informations massives", "Des données militaires", "Un stockage physique centralisé"],
      correctAnswer: 1,
      explanation: "Les \"3 V\" du Big Data (Volume, Vitesse, Variété) caractérisent l'explosion informationnelle qui alimente les IA modernes."
    }
  ];

  // Questions Quiz Partie 2
  const quizPartie2Questions = [
    {
      id: 16,
      question: "Quel concept décrit une entreprise qui apprend de ses propres données ?",
      options: ["Organisation numérique", "Entreprise cognitive", "Système cybernétique", "Organisation agile"],
      correctAnswer: 1,
      explanation: "Une entreprise cognitive transforme l'information en décisions ; elle apprend de son activité pour s'améliorer en continu."
    },
    {
      id: 17,
      question: "Quelle entreprise illustre le mieux ce modèle ?",
      options: ["Renault", "Netflix", "Airbus", "L'Oréal"],
      correctAnswer: 1,
      explanation: "Netflix analyse chaque comportement de visionnage pour recommander du contenu et anticiper les tendances : un modèle d'organisation apprenante."
    },
    {
      id: 18,
      question: "Dans une entreprise cognitive, le capital le plus important est :",
      options: ["Le matériel industriel", "La donnée", "Le capital humain", "Les ressources financières"],
      correctAnswer: 1,
      explanation: "Les données représentent la nouvelle ressource stratégique : plus elles sont nombreuses et précises, plus l'entreprise est performante."
    },
    {
      id: 19,
      question: "Quelle logique économique illustre la croissance des GAFAM ?",
      options: ["L'économie circulaire", "L'effet de réseau et la boucle de rétroaction algorithmique", "Le capitalisme industriel", "La concurrence pure"],
      correctAnswer: 1,
      explanation: "Plus une plateforme a d'utilisateurs, plus elle collecte de données, ce qui améliore ses services, attire davantage d'usagers, etc. — un cercle vertueux algorithmique."
    },
    {
      id: 20,
      question: "L'intelligence artificielle transforme la fonction du manager en :",
      options: ["Technicien du numérique", "Chef d'orchestre entre humain et machine", "Analyste financier", "Superviseur automatique"],
      correctAnswer: 1,
      explanation: "Le manager devient médiateur : il ne contrôle plus les tâches, mais le dialogue entre humains et systèmes intelligents."
    },
    {
      id: 21,
      question: "Quel phénomène accompagne la montée de l'IA dans le monde du travail ?",
      options: ["La disparition des métiers", "La recomposition des compétences", "La déqualification généralisée", "La fin du salariat"],
      correctAnswer: 1,
      explanation: "L'IA automatise certaines tâches mais crée de nouveaux rôles hybrides : data analyst, éthicien, ingénieur de prompts, etc."
    },
    {
      id: 22,
      question: "En 2023, le World Economic Forum estimait que l'IA pourrait créer :",
      options: ["10 millions d'emplois", "25 millions", "60 millions", "97 millions"],
      correctAnswer: 3,
      explanation: "Le rapport \"Future of Jobs\" prévoit 97 millions de nouveaux métiers liés à l'IA d'ici 2030, contre environ 80 millions appelés à disparaître."
    },
    {
      id: 23,
      question: "Quelle est la limite principale de la productivité liée à l'IA ?",
      options: ["Le coût de l'énergie", "La charge cognitive liée à la supervision humaine", "L'obsolescence du matériel", "La lenteur des réseaux"],
      correctAnswer: 1,
      explanation: "Même automatisée, une IA nécessite un contrôle humain constant : cela déplace la charge mentale plutôt que de la supprimer."
    },
    {
      id: 24,
      question: "Tesla illustre le modèle d'entreprise cognitive car :",
      options: ["Elle fabrique des batteries", "Elle produit en série", "Chaque voiture alimente en temps réel le système d'apprentissage global", "Elle n'utilise pas d'algorithme"],
      correctAnswer: 2,
      explanation: "Les véhicules Tesla envoient leurs données à l'entreprise pour améliorer la conduite autonome : plus il y a de voitures, plus le modèle s'affine."
    },
    {
      id: 25,
      question: "L'économie cognitive remplace la production de masse par :",
      options: ["L'apprentissage en continu", "La main-d'œuvre low cost", "L'externalisation", "La standardisation"],
      correctAnswer: 0,
      explanation: "Dans l'économie cognitive, l'avantage compétitif dépend de la rapidité à apprendre et s'adapter, pas du volume produit."
    },
    {
      id: 26,
      question: "Dans le marketing, l'IA permet de passer :",
      options: ["Du collectif au ciblage aléatoire", "De la personnalisation au hasard", "De la segmentation à l'individualisation", "De la communication à la logistique"],
      correctAnswer: 2,
      explanation: "Grâce aux algorithmes, chaque consommateur reçoit une expérience unique, adaptée à son comportement et à ses émotions."
    },
    {
      id: 27,
      question: "Quelle entreprise a fondé son modèle économique sur la recommandation algorithmique ?",
      options: ["Apple", "Microsoft", "Spotify", "IBM"],
      correctAnswer: 2,
      explanation: "Le système \"Discover Weekly\" de Spotify génère pour chaque utilisateur une playlist personnalisée grâce à l'apprentissage automatique."
    },
    {
      id: 28,
      question: "L'économie de l'attention repose sur :",
      options: ["L'automatisation industrielle", "La captation du temps et des émotions des utilisateurs", "Le financement public", "La production locale"],
      correctAnswer: 1,
      explanation: "Sur les réseaux sociaux et plateformes, l'IA optimise les contenus pour maximiser le temps passé et l'engagement émotionnel."
    },
    {
      id: 29,
      question: "TikTok s'impose comme un modèle d'IA \"sensorielle\" car :",
      options: ["Il enregistre les visages", "Il analyse les micro-comportements pour personnaliser le flux", "Il espionne les utilisateurs", "Il choisit les musiques manuellement"],
      correctAnswer: 1,
      explanation: "L'algorithme de TikTok observe le rythme de défilement, les pauses, la durée du regard, etc. pour comprendre les préférences subconscientes."
    },
    {
      id: 30,
      question: "Dans la création, l'IA générative marque une rupture car :",
      options: ["Elle reproduit des œuvres existantes", "Elle peut produire du contenu inédit à partir d'une description textuelle", "Elle se limite à l'analyse", "Elle copie sans apprentissage"],
      correctAnswer: 1,
      explanation: "Les modèles comme DALL·E, Midjourney ou ChatGPT génèrent du contenu nouveau grâce à la compréhension du langage et des motifs appris."
    }
  ];

  const quizPartie3Questions = [
    {
      id: 31,
      question: "Le scandale Cambridge Analytica illustre :",
      options: ["Une fuite de données médicales", "L'utilisation d'algorithmes pour manipuler des comportements électoraux", "Une cyberattaque sur Facebook", "Un bug de recommandation"],
      correctAnswer: 1,
      explanation: "Cambridge Analytica a exploité des données de 87 millions d'utilisateurs Facebook pour influencer le vote via des publicités ciblées."
    },
    {
      id: 32,
      question: "Quelle loi européenne encadre les IA selon leur niveau de risque ?",
      options: ["RGPD", "Digital Services Act", "AI Act", "Data Protection Directive"],
      correctAnswer: 2,
      explanation: "Adopté en 2024, l'AI Act classe les IA selon leur dangerosité et impose des obligations de transparence et d'auditabilité."
    },
    {
      id: 33,
      question: "L'affaire Amazon 2018 révèle :",
      options: ["Un bug logistique", "Un biais de genre dans l'IA de recrutement", "Une erreur de paiement automatique", "Une fuite de données internes"],
      correctAnswer: 1,
      explanation: "L'IA d'Amazon rejetait les CV féminins car elle avait appris à partir d'un historique de recrutements masculins."
    },
    {
      id: 34,
      question: "Le concept de \"responsabilité distribuée\" signifie :",
      options: ["Une responsabilité partagée entre concepteurs, utilisateurs et entreprises", "Une absence de responsabilité", "Un transfert automatique vers le code", "Une délégation au législateur"],
      correctAnswer: 0,
      explanation: "Une IA étant le fruit d'interactions multiples, la responsabilité d'une erreur ne peut être attribuée à une seule entité."
    },
    {
      id: 35,
      question: "Quelle notion désigne la capacité d'une IA à expliquer ses décisions ?",
      options: ["Clarté numérique", "Explicabilité algorithmique", "Transparence cognitive", "Lisibilité des données"],
      correctAnswer: 1,
      explanation: "L'explicabilité vise à rendre compréhensible le raisonnement d'un modèle pour identifier les erreurs et biais potentiels."
    },
    {
      id: 36,
      question: "Que signifie \"paternalisme algorithmique\" ?",
      options: ["Une IA punitive", "Une IA qui décide à notre place pour notre bien supposé", "Une IA morale", "Une IA militaire"],
      correctAnswer: 1,
      explanation: "Le terme décrit une automatisation de la décision où la machine oriente subtilement nos choix sous couvert de confort et d'efficacité."
    },
    {
      id: 37,
      question: "Les \"deepfakes\" posent problème car :",
      options: ["Ils ralentissent les réseaux", "Ils rendent difficile la distinction entre vrai et faux", "Ils sont coûteux à produire", "Ils sont interdits partout"],
      correctAnswer: 1,
      explanation: "Les vidéos truquées par IA peuvent manipuler l'opinion publique et nuire à la confiance dans les images."
    },
    {
      id: 38,
      question: "L'intelligence artificielle dans l'éducation doit être :",
      options: ["Interdite", "Intégrée de manière critique et guidée", "Totalement automatisée", "Réservée aux enseignants"],
      correctAnswer: 1,
      explanation: "L'enjeu est de former les étudiants à utiliser l'IA comme aide à la réflexion, pas comme substitut de pensée."
    },
    {
      id: 39,
      question: "La \"paresse cognitive\" désigne :",
      options: ["Une perte de mémoire liée au stress", "La tendance à déléguer à la machine les efforts intellectuels", "Un bug mental temporaire", "Un effet de surcharge numérique"],
      correctAnswer: 1,
      explanation: "L'usage excessif d'IA pour résoudre nos tâches mentales peut réduire notre capacité à réfléchir activement."
    },
    {
      id: 40,
      question: "Selon Bernard Stiegler, la technologie :",
      options: ["Remplace l'humain", "Domine l'humain", "Oblige l'humain à redevenir plus humain", "Est une menace"],
      correctAnswer: 2,
      explanation: "Stiegler défend l'idée que chaque révolution technique pousse l'humain à redéfinir sa singularité : plus la machine imite, plus nous devons cultiver la conscience et le sens."
    },
    {
      id: 41,
      question: "Quel philosophe parle du \"pouvoir doux\" des algorithmes ?",
      options: ["Michel Foucault", "Byung-Chul Han", "Slavoj Žižek", "Yuval Noah Harari"],
      correctAnswer: 1,
      explanation: "Byung-Chul Han décrit un pouvoir invisible : l'IA ne contraint pas, elle séduit et oriente subtilement nos choix par confort."
    },
    {
      id: 42,
      question: "Le \"Digital Services Act\" (DSA) de l'Union européenne vise à :",
      options: ["Réguler les télécoms", "Encadrer les plateformes et la modération des contenus", "Taxer les géants du numérique", "Financer la cybersécurité"],
      correctAnswer: 1,
      explanation: "Adopté en 2023, le DSA oblige les plateformes à plus de transparence dans leurs algorithmes et à mieux contrôler les fausses informations."
    },
    {
      id: 43,
      question: "Quelle entreprise a réduit de 40 % la consommation énergétique de ses data centers grâce à l'IA ?",
      options: ["Amazon", "Google DeepMind", "IBM", "Meta"],
      correctAnswer: 1,
      explanation: "DeepMind a utilisé des algorithmes d'optimisation pour ajuster automatiquement le refroidissement des serveurs, réduisant la dépense énergétique."
    },
    {
      id: 44,
      question: "Le projet AlphaFold de DeepMind a permis :",
      options: ["De modéliser les comportements humains", "De prédire la structure de millions de protéines", "De créer des robots médicaux autonomes", "De simuler la conscience animale"],
      correctAnswer: 1,
      explanation: "AlphaFold a résolu un problème vieux de 50 ans en biologie : comprendre comment une protéine se replie, ouvrant la voie à de nouveaux médicaments."
    },
    {
      id: 45,
      question: "Quelle ressource est devenue la plus rare dans le capitalisme de la donnée ?",
      options: ["La bande passante", "L'énergie", "Le silicium", "La confiance"],
      correctAnswer: 3,
      explanation: "Dans une économie saturée d'informations, la valeur se déplace vers la crédibilité des données et la confiance entre utilisateurs et systèmes."
    },
    {
      id: 46,
      question: "L'intelligence artificielle peut être qualifiée de \"fait social total\" car :",
      options: ["Elle concerne uniquement la science", "Elle touche tous les domaines de la société : travail, culture, politique, éducation…", "Elle est réservée aux ingénieurs", "Elle dépend de l'économie américaine"],
      correctAnswer: 1,
      explanation: "Reprenant l'expression de Marcel Mauss, l'IA est un phénomène transversal qui modifie simultanément les structures sociales, culturelles et économiques."
    },
    {
      id: 47,
      question: "L'expression \"paternalisme algorithmique\" désigne :",
      options: ["Une IA punitive", "Une IA militaire", "Une IA qui décide à notre place pour notre bien supposé", "Une IA open source"],
      correctAnswer: 2,
      explanation: "On parle de \"paternalisme algorithmique\" lorsque la technologie anticipe nos besoins de manière si efficace qu'elle restreint nos choix sans contrainte explicite."
    },
    {
      id: 48,
      question: "Dans le système éducatif, le risque principal lié à l'usage de ChatGPT est :",
      options: ["La triche pure et simple", "La perte de la réflexion personnelle et de l'esprit critique", "L'exclusion numérique", "Le manque de créativité des professeurs"],
      correctAnswer: 1,
      explanation: "L'IA peut assister, mais si elle est utilisée sans recul, elle favorise la passivité intellectuelle et l'appauvrissement du raisonnement autonome."
    },
    {
      id: 49,
      question: "Que signifie \"explicabilité algorithmique\" ?",
      options: ["Un code ouvert au public", "La capacité d'un modèle à justifier une décision ou une prédiction", "La vitesse d'exécution du calcul", "La simplicité du langage de programmation"],
      correctAnswer: 1,
      explanation: "L'explicabilité est essentielle pour comprendre et corriger les biais d'un modèle, notamment dans des domaines sensibles (santé, justice, finance)."
    },
    {
      id: 50,
      question: "Quelle notion traduit la fusion entre humains et systèmes intelligents dans la production de savoirs ?",
      options: ["Hybridation cognitive", "Intelligence collective", "Savoir numérique", "Calcul distribué"],
      correctAnswer: 1,
      explanation: "L'intelligence collective désigne la co-construction de la connaissance entre humains et IA : chacun apporte ses forces, la machine la vitesse, l'humain le sens."
    },
    {
      id: 51,
      question: "Quelle approche décrit le mieux l'IA européenne selon l'AI Act ?",
      options: ["Ethique et responsable", "Libérale et rapide", "Militaire et centralisée", "Minimaliste et expérimentale"],
      correctAnswer: 0,
      explanation: "L'Europe cherche à se distinguer des États-Unis et de la Chine par une IA centrée sur les droits humains et la transparence."
    },
    {
      id: 52,
      question: "Le concept \"d'intelligence ambiante\" fait référence à :",
      options: ["Une IA intégrée dans l'environnement, invisible et omniprésente", "Une IA militaire", "Une IA capable d'émotion", "Une IA connectée à Internet uniquement"],
      correctAnswer: 0,
      explanation: "L'intelligence ambiante décrit un monde où la technologie devient une infrastructure invisible, intégrée à chaque objet et interaction."
    },
    {
      id: 53,
      question: "En quoi le modèle chinois de l'IA diffère-t-il du modèle européen ?",
      options: ["Il est centré sur l'éthique", "Il est plus open source", "Il est centralisé et orienté vers le contrôle social", "Il est limité par la loi"],
      correctAnswer: 2,
      explanation: "La Chine privilégie un usage stratégique de l'IA à grande échelle pour la surveillance, la planification urbaine et la sécurité nationale."
    },
    {
      id: 54,
      question: "Selon Yuval Noah Harari, la question fondamentale à propos de l'IA est :",
      options: ["\"Comment l'arrêter ?\"", "\"Qui la contrôle ?\"", "\"En quoi va-t-elle nous transformer ?\"", "\"Quand deviendra-t-elle consciente ?\""],
      correctAnswer: 2,
      explanation: "Harari invite à penser la transformation de l'humain et de la société à travers les outils qu'il crée — plutôt qu'à craindre leur autonomie."
    },
    {
      id: 55,
      question: "Quelle est la principale menace des \"deepfakes\" ?",
      options: ["La désinformation et la perte de confiance dans les images", "La réduction de la créativité", "La lenteur des réseaux", "L'obsolescence des caméras"],
      correctAnswer: 0,
      explanation: "Les deepfakes sapent la fiabilité du visible : dans un monde où tout peut être falsifié, la preuve visuelle perd sa valeur sociale et juridique."
    },
    {
      id: 56,
      question: "Quelle discipline s'occupe de vérifier les biais et les impacts sociaux des IA ?",
      options: ["L'ingénierie pure", "La sociologie numérique", "L'éthique des algorithmes", "La cyberpsychologie"],
      correctAnswer: 2,
      explanation: "L'éthique algorithmique analyse comment les données et modèles peuvent reproduire ou amplifier les discriminations existantes."
    },
    {
      id: 57,
      question: "Dans la logique du \"travail augmenté\", l'humain doit :",
      options: ["Collaborer avec la machine pour améliorer la performance globale", "Être remplacé progressivement", "Superviser sans participer", "Rejeter les outils automatisés"],
      correctAnswer: 0,
      explanation: "Le travail augmenté repose sur la complémentarité : l'IA gère la répétition et la vitesse, l'humain le jugement et la créativité."
    },
    {
      id: 58,
      question: "Quelle est la différence entre intelligence et conscience ?",
      options: ["Aucune différence", "L'intelligence est émotionnelle, la conscience est logique", "L'intelligence traite l'information ; la conscience en donne le sens", "La conscience dépend du calcul"],
      correctAnswer: 2,
      explanation: "Une IA peut raisonner sans être consciente : elle manipule des symboles mais ne \"sait pas\" qu'elle pense. La conscience implique subjectivité et ressenti."
    },
    {
      id: 59,
      question: "Quelle phrase résume le mieux la place de l'humain dans l'avenir de l'IA ?",
      options: ["L'humain doit s'effacer devant la machine", "L'humain doit tout contrôler", "L'humain doit donner du sens à ce que la machine produit", "L'humain doit arrêter l'innovation"],
      correctAnswer: 2,
      explanation: "La valeur humaine réside dans l'interprétation : la machine calcule, mais c'est l'humain qui hiérarchise, comprend et décide."
    },
    {
      id: 60,
      question: "Quelle phrase conclut le mieux la vision du cours ?",
      options: ["\"L'IA remplacera l'homme.\"", "\"La machine dominera l'esprit.\"", "\"L'avenir appartient à une humanité augmentée par sa propre invention.\"", "\"L'intelligence artificielle doit être stoppée.\""],
      correctAnswer: 2,
      explanation: "Le futur n'oppose pas l'humain à la machine : il repose sur une coévolution où la technologie devient un prolongement conscient de notre intelligence collective."
    }
  ];

  // Questions Quiz Marketing Partie 1
  const quizMarketingPartie1Questions = [
    {
      id: 1,
      question: "La différence fondamentale entre une stratégie commerciale et une stratégie marketing concerne :",
      options: [
        "Le périmètre géographique des ventes",
        "L'orientation vers le marché et les besoins clients",
        "Le choix des canaux de distribution",
        "Le mode de fixation des prix"
      ],
      correctAnswer: 1,
      explanation: "La stratégie commerciale cherche à vendre des produits existants, tandis que la stratégie marketing s'appuie sur la compréhension du marché et du consommateur pour concevoir des offres adaptées."
    },
    {
      id: 2,
      question: "Le modèle STP permet de :",
      options: [
        "Déterminer les coûts de production",
        "Identifier les concurrents directs",
        "Segmenter, cibler et positionner une offre",
        "Analyser les résultats financiers d'une campagne"
      ],
      correctAnswer: 2,
      explanation: "STP (Segmentation, Targeting, Positioning) structure la démarche marketing : on segmente le marché, on choisit les cibles prioritaires, puis on construit un positionnement différenciant."
    },
    {
      id: 3,
      question: "Le marketing mix stratégique repose sur :",
      options: [
        "Produit, prix, distribution et communication",
        "Produit, positionnement, processus et profit",
        "Marché, prix, communication et performance",
        "Client, coût, commodité et communication"
      ],
      correctAnswer: 0,
      explanation: "Les 4P (Product, Price, Place, Promotion) forment la base du mix marketing. Leur cohérence garantit la performance de la stratégie (ex : Apple : produit premium, prix élevé, distribution sélective, communication aspirante)."
    },
    {
      id: 4,
      question: "Le storytelling marketing vise principalement à :",
      options: [
        "Promouvoir les caractéristiques techniques d'un produit",
        "Structurer la relation client",
        "Créer une dimension narrative autour de la marque",
        "Analyser les parts de marché"
      ],
      correctAnswer: 2,
      explanation: "Le storytelling permet de créer un lien émotionnel entre la marque et ses clients, en racontant une histoire porteuse de sens et de valeurs."
    },
    {
      id: 5,
      question: "Dans le modèle PESTEL, le facteur \"S\" renvoie à :",
      options: [
        "La stratégie concurrentielle",
        "Le socioculturel",
        "Le système de production",
        "La structure juridique"
      ],
      correctAnswer: 1,
      explanation: "Le \"S\" de PESTEL concerne les facteurs sociaux et culturels : tendances de consommation, valeurs sociétales, comportements des individus."
    },
    {
      id: 6,
      question: "Le concept \"customer centric\" signifie que l'entreprise :",
      options: [
        "Concentre ses investissements sur la communication",
        "Oriente ses décisions autour des besoins du consommateur",
        "Cherche avant tout à réduire ses coûts internes",
        "Se base sur les retours de ses distributeurs"
      ],
      correctAnswer: 1,
      explanation: "Une entreprise customer-centric conçoit ses produits et services en partant du besoin client, non de ses contraintes internes."
    },
    {
      id: 7,
      question: "Une marque \"purpose-driven\" se distingue par :",
      options: [
        "Son engagement autour d'une mission claire",
        "Son offre à bas coût",
        "Sa dépendance aux promotions",
        "Sa rapidité d'innovation produit"
      ],
      correctAnswer: 0,
      explanation: "Les marques \"purpose-driven\" relient leurs actions à une mission ou une cause : environnement, inclusion, santé, etc. (ex : Patagonia ou The Body Shop)."
    },
    {
      id: 8,
      question: "L'analyse SWOT combine :",
      options: [
        "Données internes et externes",
        "Études psychologiques et sociales",
        "Variables macroéconomiques uniquement",
        "Statistiques financières de l'entreprise"
      ],
      correctAnswer: 0,
      explanation: "Le SWOT croise les forces/faiblesses internes et les opportunités/menaces externes. Il structure le diagnostic stratégique."
    },
    {
      id: 9,
      question: "Une stratégie orientée \"expérience client\" met l'accent sur :",
      options: [
        "Les campagnes d'influence",
        "Le parcours d'achat global et les émotions associées",
        "La réduction des délais de production",
        "La maîtrise du prix de revient"
      ],
      correctAnswer: 1,
      explanation: "L'expérience client vise à générer des émotions positives sur l'ensemble du parcours d'achat, pour fidéliser durablement."
    },
    {
      id: 10,
      question: "Le positionnement marketing correspond à :",
      options: [
        "La place qu'occupe la marque dans la perception du consommateur",
        "Le lieu de distribution principal",
        "La hiérarchie interne des gammes",
        "Le niveau de marge souhaité"
      ],
      correctAnswer: 0,
      explanation: "Le positionnement reflète la manière dont une marque est perçue par son public face aux concurrents (ex : Volvo = sécurité, Tesla = innovation)."
    },
    {
      id: 11,
      question: "Le diagnostic stratégique d'une entreprise permet :",
      options: [
        "De créer un plan média",
        "D'identifier les forces et les menaces du marché",
        "De déterminer les prix psychologiques",
        "D'élaborer une charte graphique"
      ],
      correctAnswer: 1,
      explanation: "Le diagnostic stratégique aide à identifier les facteurs internes et externes influençant la performance de l'entreprise."
    },
    {
      id: 12,
      question: "La transformation digitale du marketing entraîne :",
      options: [
        "Une disparition du marketing traditionnel",
        "Une intégration de la donnée dans les décisions stratégiques",
        "Une suppression de la force de vente",
        "Une homogénéisation des marchés"
      ],
      correctAnswer: 1,
      explanation: "Le digital permet une prise de décision fondée sur les données (data-driven), via CRM, Google Analytics, ou campagnes automatisées."
    },
    {
      id: 13,
      question: "Une stratégie marketing réussie doit être :",
      options: [
        "Durable, mesurable et cohérente",
        "Visible, rapide et instinctive",
        "Aggressive, standardisée et coûteuse",
        "Flexible, changeante et non mesurable"
      ],
      correctAnswer: 0,
      explanation: "Une bonne stratégie marketing repose sur des indicateurs précis, une cohérence entre actions et vision, et une exécution durable."
    },
    {
      id: 14,
      question: "Dans le cas de Nike, la stratégie marketing repose principalement sur :",
      options: [
        "Une communication centrée sur le prix",
        "Une valorisation de la performance et de la motivation",
        "Un produit hautement technologique sans storytelling",
        "Une offre locale non globalisée"
      ],
      correctAnswer: 1,
      explanation: "Nike incarne la performance et la motivation à travers ses campagnes (\"Just Do It\") et son univers de marque inspirant."
    },
    {
      id: 15,
      question: "Le concept de \"value-based marketing\" met en avant :",
      options: [
        "La maximisation du volume de ventes",
        "L'alignement entre valeur perçue et valeur livrée",
        "La réduction des coûts publicitaires",
        "La suppression du branding émotionnel"
      ],
      correctAnswer: 1,
      explanation: "Le marketing fondé sur la valeur vise à assurer la cohérence entre la promesse perçue et la valeur réelle livrée au client."
    },
    {
      id: 16,
      question: "L'étude du comportement consommateur vise à :",
      options: [
        "Évaluer la productivité du personnel",
        "Comprendre les facteurs d'achat et de fidélisation",
        "Estimer la marge brute du produit",
        "Contrôler les coûts de distribution"
      ],
      correctAnswer: 1,
      explanation: "Cette étude permet d'analyser les motivations et les freins d'achat pour adapter les stratégies marketing."
    },
    {
      id: 17,
      question: "Une marque \"customer-centric\" mesure sa performance principalement via :",
      options: [
        "Le nombre de produits lancés",
        "Le Net Promoter Score (NPS)",
        "Les coûts fixes de production",
        "Le ratio de distribution"
      ],
      correctAnswer: 1,
      explanation: "Le NPS mesure la propension d'un client à recommander la marque, indicateur clé de satisfaction et fidélisation."
    },
    {
      id: 18,
      question: "La stratégie de Decathlon illustre :",
      options: [
        "L'utilisation de la donnée pour améliorer l'expérience client",
        "Une politique de prix premium sur tous les produits",
        "Une réduction de l'innovation produit",
        "Une focalisation sur la publicité TV"
      ],
      correctAnswer: 0,
      explanation: "Decathlon analyse les données issues des cartes clients et du digital pour améliorer l'expérience utilisateur et l'offre locale."
    },
    {
      id: 19,
      question: "Le rôle du marketing stratégique est avant tout :",
      options: [
        "De déterminer le prix psychologique des produits",
        "D'orienter les décisions à long terme selon les besoins du marché",
        "De gérer la logistique d'approvisionnement",
        "De concevoir les affiches publicitaires"
      ],
      correctAnswer: 1,
      explanation: "Le marketing stratégique détermine la direction globale de la marque : positionnement, marché cible, et objectifs à long terme."
    },
    {
      id: 20,
      question: "L'analyse concurrentielle vise à :",
      options: [
        "Évaluer les émotions du consommateur",
        "Identifier les forces et faiblesses relatives des acteurs du marché",
        "Déterminer la valeur vie client",
        "Tester les produits avant leur sortie"
      ],
      correctAnswer: 1,
      explanation: "Analyser la concurrence permet de comprendre les positions relatives et d'identifier des opportunités différenciantes."
    }
  ];

  // Questions Quiz Marketing Partie 2
  const quizMarketingPartie2Questions = [
    {
      id: 21,
      question: "La segmentation marketing consiste à :",
      options: [
        "Définir le budget publicitaire",
        "Découper le marché en groupes homogènes de consommateurs",
        "Identifier les concurrents directs",
        "Choisir les canaux de distribution"
      ],
      correctAnswer: 1,
      explanation: "La segmentation divise le marché en groupes partageant des caractéristiques communes (besoins, comportements, valeurs) afin d'adapter la stratégie à chaque segment."
    },
    {
      id: 22,
      question: "La segmentation comportementale s'appuie principalement sur :",
      options: [
        "L'âge et le revenu",
        "Les habitudes et fréquences d'achat",
        "Les valeurs culturelles",
        "Le niveau d'éducation"
      ],
      correctAnswer: 1,
      explanation: "Elle étudie les comportements réels d'achat (fréquence, panier moyen, fidélité) pour identifier les clients les plus actifs et rentables."
    },
    {
      id: 23,
      question: "La segmentation psychographique s'intéresse à :",
      options: [
        "La localisation géographique",
        "Les motivations, styles de vie et valeurs",
        "Le niveau de revenu",
        "Le statut professionnel"
      ],
      correctAnswer: 1,
      explanation: "Cette segmentation repose sur la personnalité, les attitudes, les intérêts et les valeurs du consommateur — utile pour créer des messages plus émotionnels et ciblés."
    },
    {
      id: 24,
      question: "Le modèle RFM permet de segmenter selon :",
      options: [
        "Les prix psychologiques",
        "La récence, la fréquence et le montant des achats",
        "Les motivations et besoins émotionnels",
        "Le cycle de vie du produit"
      ],
      correctAnswer: 1,
      explanation: "La méthode RFM classe les clients selon leur dernier achat (R), la fréquence d'achat (F) et le montant dépensé (M). C'est un outil clé du CRM pour identifier les clients fidèles et rentables."
    },
    {
      id: 25,
      question: "En B2B, la segmentation repose davantage sur :",
      options: [
        "Les comportements personnels",
        "Les critères de taille, secteur et volume d'achat",
        "Les goûts et préférences esthétiques",
        "Les opinions politiques"
      ],
      correctAnswer: 1,
      explanation: "Les entreprises clientes se segmentent selon leur secteur d'activité, leur taille, leur budget, et leur potentiel d'achat, car les décisions y sont plus rationnelles."
    },
    {
      id: 26,
      question: "La Customer Lifetime Value (CLV) mesure :",
      options: [
        "La valeur d'une marque sur le long terme",
        "La valeur totale générée par un client au cours de sa relation",
        "Le coût total d'acquisition client",
        "Le taux de satisfaction moyen"
      ],
      correctAnswer: 1,
      explanation: "La CLV estime combien un client rapporte à l'entreprise tout au long de sa relation. Elle aide à décider combien investir pour le fidéliser."
    },
    {
      id: 27,
      question: "Le scoring client est une méthode utilisée pour :",
      options: [
        "Évaluer la performance des commerciaux",
        "Noter les prospects selon leur potentiel d'achat",
        "Classer les produits par rentabilité",
        "Estimer la satisfaction client"
      ],
      correctAnswer: 1,
      explanation: "Le scoring attribue une note à chaque prospect ou client selon sa probabilité d'achat ou d'abandon. C'est un outil clé du marketing automation."
    },
    {
      id: 28,
      question: "Le ciblage marketing consiste à :",
      options: [
        "Identifier les marchés les plus accessibles",
        "Choisir les segments prioritaires à adresser",
        "Regrouper les clients par âge",
        "Créer une base de données clients"
      ],
      correctAnswer: 1,
      explanation: "Le ciblage sélectionne les segments les plus rentables ou stratégiques. C'est une étape essentielle avant de concevoir le positionnement et le mix marketing."
    },
    {
      id: 29,
      question: "Le positionnement d'une marque se traduit par :",
      options: [
        "Une promesse différenciante perçue par le consommateur",
        "Une politique de prix bas",
        "Une simple campagne publicitaire",
        "Un plan logistique"
      ],
      correctAnswer: 0,
      explanation: "Le positionnement exprime la promesse unique de la marque, la valeur ajoutée qu'elle offre et l'image qu'elle veut occuper dans l'esprit du client."
    },
    {
      id: 30,
      question: "Le Brand Key Model est un outil permettant :",
      options: [
        "D'évaluer la marge brute",
        "De structurer le positionnement et la raison d'être d'une marque",
        "De planifier les ventes mensuelles",
        "De définir les indicateurs financiers"
      ],
      correctAnswer: 1,
      explanation: "Le Brand Key Model aide à formaliser l'identité d'une marque : ses valeurs, sa promesse, sa cible, son insight consommateur, sa personnalité et son bénéfice clé."
    },
    {
      id: 31,
      question: "Une proposition de valeur efficace doit être :",
      options: [
        "Originale mais imprécise",
        "Claire, différenciante et crédible",
        "Axée sur le prix uniquement",
        "Dépendante des promotions"
      ],
      correctAnswer: 1,
      explanation: "Une proposition de valeur convaincante montre pourquoi le client devrait choisir la marque plutôt qu'une autre, en apportant une preuve concrète."
    },
    {
      id: 32,
      question: "Le Value Proposition Canvas relie :",
      options: [
        "Les produits à la concurrence",
        "Les besoins clients aux solutions proposées",
        "Les ventes au budget publicitaire",
        "Les canaux de distribution aux stocks"
      ],
      correctAnswer: 1,
      explanation: "Cet outil relie les problèmes, attentes et gains du client aux produits et services qui y répondent. Il aide à construire une offre cohérente avec le marché."
    },
    {
      id: 33,
      question: "Tesla illustre un positionnement basé sur :",
      options: [
        "Le prix bas et la simplicité",
        "L'innovation technologique et l'émotion",
        "Le service client premium uniquement",
        "Le design et la tradition artisanale"
      ],
      correctAnswer: 1,
      explanation: "Tesla se distingue par un positionnement centré sur la technologie, l'innovation et l'émotion liée à la conduite électrique haut de gamme."
    },
    {
      id: 34,
      question: "La \"raison d'être\" d'une marque vise à :",
      options: [
        "Définir ses parts de marché",
        "Donner du sens à sa mission et à son engagement",
        "Fixer les prix produits",
        "Évaluer les performances publicitaires"
      ],
      correctAnswer: 1,
      explanation: "La raison d'être exprime la mission profonde d'une marque, au-delà du profit. Elle ancre le marketing dans un sens et une utilité sociétale."
    },
    {
      id: 35,
      question: "Le Net Promoter Score (NPS) mesure :",
      options: [
        "Le niveau de recommandation client",
        "Le panier moyen",
        "La rentabilité produit",
        "Le taux de clic publicitaire"
      ],
      correctAnswer: 0,
      explanation: "Le NPS mesure la probabilité qu'un client recommande la marque. Il distingue les promoteurs, passifs et détracteurs."
    },
    {
      id: 36,
      question: "Le marketing mix stratégique s'articule autour de :",
      options: [
        "Produit, prix, distribution, communication",
        "Produit, processus, personnel, profit",
        "Plan, publicité, performance, production",
        "Prix, plateforme, public, plan"
      ],
      correctAnswer: 0,
      explanation: "Le mix marketing combine les quatre leviers d'action : concevoir le bon produit, au bon prix, au bon endroit, avec le bon message."
    },
    {
      id: 37,
      question: "Le design produit contribue à :",
      options: [
        "L'optimisation des coûts logistiques",
        "L'expérience utilisateur et la différenciation",
        "La gestion des ventes",
        "La planification des stocks"
      ],
      correctAnswer: 1,
      explanation: "Le design participe à l'identité de marque et à l'expérience d'usage. Il crée de la valeur perçue et renforce la reconnaissance du produit."
    },
    {
      id: 38,
      question: "L'innovation marketing consiste à :",
      options: [
        "Introduire une nouveauté sans lien avec la marque",
        "Répondre à un besoin latent du consommateur",
        "Changer le logo d'une entreprise",
        "Baisser le prix d'un produit"
      ],
      correctAnswer: 1,
      explanation: "L'innovation marketing cherche à anticiper ou révéler un besoin encore peu exprimé, en proposant de nouvelles expériences ou offres."
    },
    {
      id: 39,
      question: "Le storytelling produit permet de :",
      options: [
        "Détourner l'attention du prix",
        "Donner du sens et de la valeur émotionnelle à l'offre",
        "Réduire les coûts de communication",
        "Accélérer la distribution"
      ],
      correctAnswer: 1,
      explanation: "Le storytelling produit crée un lien émotionnel entre le consommateur et l'objet : il transforme une simple caractéristique en récit valorisant."
    },
    {
      id: 40,
      question: "La stratégie de \"premiumisation\" vise à :",
      options: [
        "Baisser les prix pour gagner en volume",
        "Élever la valeur perçue pour justifier un positionnement haut de gamme",
        "Supprimer les services complémentaires",
        "Augmenter les marges sans changement produit"
      ],
      correctAnswer: 1,
      explanation: "La premiumisation consiste à revaloriser un produit en enrichissant son image, son expérience ou son design pour créer plus de valeur perçue."
    }
  ];

  // Questions Quiz Marketing Partie 3
  const quizMarketingPartie3Questions = [
    {
      id: 41,
      question: "Le pricing dynamique repose sur :",
      options: [
        "Des prix fixes établis chaque trimestre",
        "L'ajustement automatisé des prix selon la demande",
        "Des réductions saisonnières uniquement",
        "La suppression des remises"
      ],
      correctAnswer: 1,
      explanation: "Cette méthode adapte en temps réel le prix selon la demande, la concurrence ou le comportement client (ex : compagnies aériennes)."
    },
    {
      id: 42,
      question: "Une stratégie omnicanale consiste à :",
      options: [
        "Communiquer sur un seul canal à la fois",
        "Intégrer les canaux physiques et digitaux dans une expérience fluide",
        "Centraliser toutes les ventes en magasin",
        "Supprimer les interactions clients"
      ],
      correctAnswer: 1,
      explanation: "L'omnicanal unifie tous les points de contact (site, magasin, appli, réseaux) pour offrir une expérience homogène et sans rupture."
    },
    {
      id: 43,
      question: "Le D2C (Direct-to-Consumer) permet :",
      options: [
        "De passer par des distributeurs spécialisés",
        "D'éviter les marketplaces et maîtriser la relation client",
        "D'augmenter le prix de revient",
        "De réduire la notoriété"
      ],
      correctAnswer: 1,
      explanation: "Le D2C renforce la maîtrise de la donnée client et la marge en supprimant les intermédiaires (ex : Nike ou Glossier)."
    },
    {
      id: 44,
      question: "La cohérence 360° en communication signifie :",
      options: [
        "Utiliser le même visuel sur tous les supports",
        "Aligner le message sur tous les points de contact de la marque",
        "Limiter la communication digitale",
        "Varier les slogans selon les régions"
      ],
      correctAnswer: 1,
      explanation: "Une communication 360° assure la cohérence du discours sur tous les canaux (pub, réseaux, site, événementiel)."
    },
    {
      id: 45,
      question: "L'influence marketing repose sur :",
      options: [
        "Des leaders d'opinion en ligne diffusant un message authentique",
        "Des campagnes institutionnelles",
        "La publicité dans la presse écrite",
        "Le démarchage téléphonique"
      ],
      correctAnswer: 0,
      explanation: "L'influence marketing s'appuie sur la confiance des audiences envers des créateurs de contenu crédibles et proches de leur communauté."
    },
    {
      id: 46,
      question: "Le brand content sert principalement à :",
      options: [
        "Créer de la valeur éditoriale autour de la marque",
        "Remplacer les études de marché",
        "Tester des prototypes produits",
        "Calculer la marge nette"
      ],
      correctAnswer: 0,
      explanation: "Le brand content produit des contenus utiles, inspirants ou divertissants pour renforcer la relation à la marque."
    },
    {
      id: 47,
      question: "Chez Apple, la cohérence du mix marketing se traduit par :",
      options: [
        "Des campagnes sans lien avec le produit",
        "L'alignement entre design, prix, distribution et message",
        "La multiplication des sous-marques",
        "Une forte rotation de gamme annuelle"
      ],
      correctAnswer: 1,
      explanation: "Apple illustre la cohérence parfaite entre produit, positionnement, design, distribution et communication."
    },
    {
      id: 48,
      question: "Red Bull a transformé son marketing en :",
      options: [
        "Stratégie média basée sur les contenus et les événements",
        "Vente uniquement en ligne",
        "Programme de fidélisation premium",
        "Campagnes centrées sur le produit"
      ],
      correctAnswer: 0,
      explanation: "Red Bull est devenu un producteur de contenus (sports extrêmes, festivals) et non plus seulement un vendeur de boissons."
    },
    {
      id: 49,
      question: "Le CRM permet de :",
      options: [
        "Gérer les stocks produits",
        "Centraliser et exploiter les données clients",
        "Calculer le prix de revient",
        "Répartir le budget marketing"
      ],
      correctAnswer: 1,
      explanation: "Le CRM (Customer Relationship Management) collecte et analyse les données clients pour personnaliser les interactions."
    },
    {
      id: 50,
      question: "L'automatisation marketing consiste à :",
      options: [
        "Planifier les campagnes sans intervention humaine",
        "Déclencher des actions personnalisées selon le comportement client",
        "Supprimer les équipes marketing",
        "Standardiser la communication"
      ],
      correctAnswer: 1,
      explanation: "Le marketing automation envoie des messages automatiques adaptés à chaque client selon ses actions (abandon de panier, clics…)."
    },
    {
      id: 51,
      question: "Le scoring client permet de :",
      options: [
        "Mesurer la satisfaction",
        "Évaluer la probabilité d'achat ou de désabonnement",
        "Tester la performance produit",
        "Identifier la zone de chalandise"
      ],
      correctAnswer: 1,
      explanation: "Le scoring prédit le comportement futur du client grâce à la data : achat, désabonnement, fidélité."
    },
    {
      id: 52,
      question: "Le SEA correspond à :",
      options: [
        "Search Engine Advertising",
        "Social Engagement Analytics",
        "Sales Efficiency Automation",
        "Smart E-mail Application"
      ],
      correctAnswer: 0,
      explanation: "Le SEA désigne la publicité payante sur les moteurs de recherche (ex : Google Ads)."
    },
    {
      id: 53,
      question: "Le SEO vise à :",
      options: [
        "Améliorer la visibilité organique d'un site sur les moteurs de recherche",
        "Acheter des espaces publicitaires",
        "Augmenter le prix des produits",
        "Publier des vidéos sur les réseaux sociaux"
      ],
      correctAnswer: 0,
      explanation: "Le SEO (Search Engine Optimization) améliore la position d'un site dans les résultats naturels via du contenu optimisé et une bonne structure."
    },
    {
      id: 54,
      question: "Le KPI \"ROAS\" mesure :",
      options: [
        "Le retour sur investissement publicitaire",
        "Le nombre de clients actifs",
        "Le panier moyen",
        "Le taux de clic organique"
      ],
      correctAnswer: 0,
      explanation: "ROAS (Return On Ad Spend) évalue l'efficacité des dépenses publicitaires : revenus générés ÷ budget média."
    },
    {
      id: 55,
      question: "Un tableau de bord marketing efficace doit être :",
      options: [
        "Complexe et exhaustif",
        "Lisible, actualisé et orienté décision",
        "Axé sur les données internes uniquement",
        "Dédié aux ventes physiques"
      ],
      correctAnswer: 1,
      explanation: "Un bon tableau de bord synthétise les données utiles à la décision : taux de conversion, coût d'acquisition, engagement, etc."
    },
    {
      id: 56,
      question: "L'approche \"test & learn\" consiste à :",
      options: [
        "Éviter les expérimentations marketing",
        "Tester rapidement, mesurer et ajuster les actions",
        "Standardiser les campagnes internationales",
        "Attendre la fin d'année pour analyser"
      ],
      correctAnswer: 1,
      explanation: "Cette méthode agile permet de lancer des tests à petite échelle, d'analyser les résultats et d'ajuster en continu les campagnes."
    },
    {
      id: 57,
      question: "Le Net Promoter Score (NPS) permet de :",
      options: [
        "Mesurer la fidélisation par la recommandation client",
        "Calculer la marge opérationnelle",
        "Identifier le coût d'acquisition",
        "Suivre le taux de clic"
      ],
      correctAnswer: 0,
      explanation: "Le NPS évalue la fidélisation via la probabilité de recommandation, indicateur clé de satisfaction et de bouche-à-oreille."
    },
    {
      id: 58,
      question: "Un bon KPI marketing doit être :",
      options: [
        "Spécifique, mesurable, atteignable, réaliste et temporel",
        "Général et qualitatif",
        "Centré sur l'opinion interne",
        "Défini chaque trimestre aléatoirement"
      ],
      correctAnswer: 0,
      explanation: "Un KPI doit respecter la méthode SMART pour être exploitable dans le suivi et la prise de décision."
    },
    {
      id: 59,
      question: "L'outil Power BI sert à :",
      options: [
        "Automatiser les e-mails",
        "Créer des tableaux de bord décisionnels",
        "Gérer les campagnes publicitaires",
        "Suivre les stocks"
      ],
      correctAnswer: 1,
      explanation: "Power BI (Microsoft) permet de visualiser et croiser des données marketing pour piloter la performance en temps réel."
    },
    {
      id: 60,
      question: "Le pilotage data-driven du marketing vise à :",
      options: [
        "Prendre des décisions fondées sur la donnée mesurable",
        "Remplacer le marketing par la finance",
        "Standardiser les messages pour tous les publics",
        "Supprimer la créativité marketing"
      ],
      correctAnswer: 0,
      explanation: "Le marketing data-driven repose sur l'analyse de données pour guider les choix stratégiques : ciblage, budget, contenu, canaux."
    }
  ];

  const progressMap: Record<Step, number> = {
    overview: 10,
    courseIntro: 15,
    bloc1CoursSelection: 15,
    bloc2CoursSelection: 15,
    bloc3CoursSelection: 15,
    bloc4CoursSelection: 15,
    module: 20,
    pse_partie1_1: 25,
    strategie_marketing_partie1_1: 25,
    strategie_marketing_partie1_2: 30,
    strategie_marketing_partie1_3: 35,
    strategie_marketing_partie1_4: 40,
    strategie_marketing_partie1_5: 45,
    strategie_marketing_partie1_6: 50,
    strategie_marketing_partie1_7: 55,
    strategie_marketing_partie1_8: 60,
    quizMarketingPartie1: 62,
    resultsMarketingPartie1: 64,
    strategie_marketing_partie2_1: 65,
    strategie_marketing_partie2_2: 70,
    strategie_marketing_partie2_3: 75,
    strategie_marketing_partie2_4: 80,
    strategie_marketing_partie2_5: 85,
    strategie_marketing_partie2_6: 88,
    strategie_marketing_partie2_7: 90,
    strategie_marketing_partie2_8: 92,
    strategie_marketing_partie2_9: 94,
    quizMarketingPartie2: 95,
    resultsMarketingPartie2: 96,
    strategie_marketing_partie3_1: 97,
    strategie_marketing_partie3_2: 97,
    strategie_marketing_partie3_3: 98,
    strategie_marketing_partie3_4: 99,
    strategie_marketing_partie3_5: 99.5,
    strategie_marketing_partie3_6: 99.8,
    strategie_marketing_partie3_7: 99.5,
    quizMarketingPartie3: 99.8,
    resultsMarketingPartie3: 100,
    partie1_1: 28,
    partie1_2: 36,
    partie1_3: 42,
    partie1_3_suite: 48,
    quizPartie1: 51,
    resultsPartie1: 54,
    partie2: 57,
    partie2_1: 62,
    partie2_2: 66,
    partie2_2_suite: 70,
    partie2_3: 73,
    partie2_3_suite: 76,
    quizPartie2: 79,
    resultsPartie2: 82,
    partie3_1: 86,
    partie3_2: 88,
    partie3_3: 90,
    partie3_4: 92,
    partie3_5: 94,
    quizPartie3: 96,
    resultsPartie3: 98,
    courseFinal: 100,
    quiz: 98,
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
                    if (block.id === "bloc-2") {
                      setStep("bloc1CoursSelection");
                    } else if (block.id === "bloc-3") {
                      setStep("bloc2CoursSelection");
                    } else if (block.id === "bloc-4") {
                      setStep("bloc3CoursSelection");
                    } else if (block.id === "bloc-5") {
                      setStep("bloc4CoursSelection");
                    } else {
                      setStep("courseIntro");
                    }
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
              Module 1 · Culture de l'intelligence artificielle
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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
            <h3 className="text-2xl font-bold text-[#032622] mb-6 uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              INTRODUCTION
            </h3>
            <div
              ref={courseContentRef}
              className={`relative space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              {/* Calque d'overlay pour le mode sécurisé (ne modifie jamais le texte) */}
              <div
                ref={highlightOverlayRef}
                className="pointer-events-none absolute inset-0 z-10"
                aria-hidden="true"
              />
              <section className="space-y-4">
                <h4 className="font-bold text-lg text-[#032622]">Présentation du cours : pourquoi parler de culture de l'IA ?</h4>
                <p>
                  L'intelligence artificielle n'est pas seulement un outil technique : c'est une culture à part entière, une transformation profonde de notre manière de comprendre le monde, d'agir, de créer, de décider. Comme Internet dans les années 1990, ou le smartphone dans les années 2010, l'IA ne se limite pas à un secteur : elle restructure nos sociétés, nos économies et nos imaginaires.
                </p>
                <p>
                  Aujourd'hui, elle est partout — dans nos moteurs de recherche, nos assistants vocaux, nos plateformes de streaming, nos logiciels professionnels, nos réseaux sociaux. Mais si tout le monde l'utilise, très peu la comprennent. Et cette incompréhension crée un décalage : on parle d'intelligence artificielle comme d'un mystère, alors qu'elle est d'abord le reflet de nos propres choix culturels, économiques et scientifiques.
                </p>
                <p>
                  Parler de culture de l'IA, c'est donc remonter à la source de ce phénomène pour le replacer dans la grande histoire des révolutions humaines. C'est comprendre que l'IA n'est pas une rupture soudaine, mais l'aboutissement d'un long processus : celui de la rationalisation du monde. Après avoir appris à maîtriser la matière (révolution industrielle), puis l'information (révolution numérique), l'humanité cherche désormais à maîtriser la pensée elle-même. Et c'est là que se joue l'enjeu du siècle : comment cohabiter avec une intelligence que nous avons créée ?
                </p>
                <p>
                  Ce cours a donc pour ambition de donner du sens à cette mutation. De comprendre non seulement les technologies, mais les idées qui les soutiennent. De saisir comment cette révolution dépasse les laboratoires pour redéfinir la culture, l'économie, le management et l'éthique de notre temps.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="font-bold text-lg text-[#032622]">L'IA, un nouveau paradigme après le digital : comprendre l'évolution des révolutions technologiques</h4>
                <p>
                  Pour bien situer l'intelligence artificielle, il faut la replacer dans la chronologie des grandes transformations. Chaque révolution technologique ne chasse pas la précédente : elle la prolonge en changeant d'échelle et de nature.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    La <strong>révolution industrielle</strong> (XVIIIᵉ–XIXᵉ siècle) a libéré l'homme de l'effort physique en mécanisant la production.
                  </li>
                  <li>
                    La <strong>révolution numérique</strong> (fin XXᵉ siècle) a libéré l'homme du temps et de l'espace, en connectant la planète et en automatisant l'information.
                  </li>
                  <li>
                    La <strong>révolution cognitive</strong>, portée par l'intelligence artificielle, libère désormais l'homme de la complexité : elle délègue à la machine une part du raisonnement, de la création, voire du jugement.
                  </li>
                </ul>
                <p>
                  Ce passage marque une bascule historique. Avec le numérique, nous étions encore les utilisateurs de la technologie. Avec l'intelligence artificielle, nous en devenons les partenaires. La machine ne se contente plus d'exécuter, elle propose, interprète, analyse, anticipe.
                </p>
                <p>
                  Comprendre l'IA comme paradigme, c'est donc comprendre qu'elle ne s'oppose pas au digital : elle en est la synthèse supérieure. Elle combine la puissance des données, la vitesse des réseaux, la mémoire du cloud et la logique des algorithmes pour former un système capable de raisonner sur le monde.
                </p>
                <p>
                  Ce paradigme n'est pas seulement technologique, il est philosophique et anthropologique. Car en donnant à la machine la capacité d'imiter notre pensée, nous replaçons l'humain face à une question très ancienne :
                </p>
                <p className="italic text-center font-semibold">
                  Qu'est-ce qui, dans notre intelligence, reste proprement humain ?
                </p>
                <p>
                  C'est à cette question que la culture de l'IA tente d'apporter des repères — non pour y répondre définitivement, mais pour apprendre à y réfléchir avec lucidité.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="font-bold text-lg text-[#032622]">Objectifs pédagogiques du module</h4>
                <p>
                  Ce module s'inscrit dans une démarche de formation managériale et entrepreneuriale : il ne s'agit pas d'apprendre à coder, mais d'apprendre à <strong>penser l'intelligence artificielle</strong>.
                </p>
                <p className="font-semibold">À la fin du cours, l'étudiant doit être capable de :</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Situer historiquement et culturellement l'intelligence artificielle parmi les grandes révolutions de l'humanité.
                  </li>
                  <li>
                    Comprendre les logiques technique et cognitives qui sous-tendent son fonctionnement (apprentissage, algorithmes, données).
                  </li>
                  <li>
                    Identifier les impacts économiques et managériaux de l'IA sur les entreprises, les métiers et les organisations.
                  </li>
                  <li>
                    Analyser les enjeux éthiques et sociétaux liés à la délégation de la décision et de la création à des systèmes automatisés.
                  </li>
                  <li>
                    Développer une posture critique et créative face aux technologies émergentes : apprendre à utiliser l'IA comme levier de sens, et non comme simple gadget.
                  </li>
                </ul>
                <p>
                  Ce module de culture de l'intelligence artificielle est donc un espace d'exploration. Il ne s'agit pas de savoir si l'IA est bonne ou mauvaise, mais de comprendre ce qu'elle dit de nous — de nos forces, de nos contradictions et de nos ambitions.
                </p>
                <p>
                  Parce que, comme toutes les révolutions avant elle, l'intelligence artificielle n'est pas un destin.
                </p>
              </section>
            </div>

            {/* Vidéo Episode 1 - Introduction */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl aspect-video">
                <video 
                  ref={video1Ref}
                  controls 
                  className="w-full h-full"
                  poster="/img/formation/forma_keos.jpg"
                >
                  <source src="/video/CULTURE DE L'IA - Episode 1.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
                
                {/* Overlay avec affiche élégante */}
                {!isVideo1Playing && (
                  <div 
                    className="absolute inset-0 cursor-pointer group overflow-hidden"
                    onClick={handlePlayVideo1}
                  >
                    {/* Fond dégradé élégant */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#032622] via-[#1a4d42] to-black"></div>
                    
                    {/* Texture subtile */}
                    <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107, 142, 35, 0.3) 0%, transparent 50%)',
                    }}></div>
                    
                    {/* Contenu affiche */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-8">
                      {/* Titre de l'épisode */}
                      <div className="text-center space-y-4 transform group-hover:scale-105 transition-transform duration-300">
                        <p className="text-[#6B8E23] text-sm font-bold uppercase tracking-[0.2em] drop-shadow-lg">
                          Épisode 1
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-xl" style={{ fontFamily: "var(--font-termina-bold)" }}>
                          Introduction à la Culture de l'IA
                        </h2>
                        <p className="text-[#F8F5E4] text-base opacity-90 max-w-md mx-auto leading-relaxed drop-shadow-lg">
                          Découvrez les fondamentaux de l'intelligence artificielle et son impact sur nos sociétés
                        </p>
                      </div>
                      
                      {/* Bouton play */}
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          {/* Anneau extérieur animé */}
                          <div className="absolute inset-0 rounded-full bg-[#6B8E23]/30 animate-pulse" style={{ transform: 'scale(1.3)' }}></div>
                          
                          {/* Bouton play principal */}
                          <button 
                            className="relative w-20 h-20 rounded-full bg-[#6B8E23] shadow-2xl flex items-center justify-center transform group-hover:scale-125 group-hover:shadow-[0_0_40px_rgba(107,142,35,0.6)] transition-all duration-300 border-4 border-[#F8F5E4]/20 backdrop-blur-sm"
                          >
                            <svg className="w-8 h-8 text-white ml-0.5 fill-current drop-shadow-lg" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Texte d'action */}
                        <span className="text-[#F8F5E4] text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Cliquez pour regarder
                        </span>
                      </div>
                    </div>
                    
                    {/* Ligne de séparation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6B8E23] to-transparent"></div>
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4 bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                  Épisode 1 - Introduction à la Culture de l'IA
                </span>
              </div>
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
                      Enregistrer
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
              onClick={() => setStep("partie1_1")}
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
  // Rendu de la page d'introduction du cours
  const renderCourseIntro = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("overview")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR AUX BLOCS</span>
        </button>
      </div>

      {/* Titre principal du cours */}
      <div className="border border-[#032622] bg-[#F8F5E4] p-8 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-8 h-8 text-[#032622]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#032622]/70">
            Bloc 1 · Module 1
          </span>
        </div>
        <h1
          className="text-4xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          CULTURE DE L'INTELLIGENCE ARTIFICIELLE
        </h1>
        <p className="text-sm text-[#032622]/80 leading-relaxed">
          Comprendre les fondements, les enjeux et les perspectives de l'intelligence artificielle dans notre société contemporaine.
        </p>
      </div>
      {/* Sommaire du cours */}
      <div className="border border-[#032622] bg-[#F8F5E4] p-8 space-y-6">
        <h2
          className="text-2xl font-bold text-[#032622] uppercase tracking-wide"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Sommaire du cours
        </h2>

        <div className="space-y-8">
          {/* PARTIE 1 */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#032622] mb-3 uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  L'HISTOIRE DE L'INTELLIGENCE ARTIFICIELLE : DES RÊVES D'HIER AUX RÉALITÉS D'AUJOURD'HUI
                </h3>
                
                {/* 1.1 */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-base font-bold text-[#032622]">1.1. Les origines de l'idée d'intelligence artificielle</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>De la mythologie à la cybernétique : les premières formes de l'imaginaire mécanique.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Alan Turing et la naissance de la pensée algorithmique.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les années 1950-1980 : l'âge des pionniers et les premiers hivers de l'IA.</span>
                    </li>
                  </ul>
                </div>

                {/* 1.2 */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-base font-bold text-[#032622]">1.2. L'âge numérique et la renaissance de l'intelligence artificielle</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'arrivée d'Internet et des données massives : la matière première du futur.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Le tournant du deep learning : comprendre les réseaux de neurones.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>De Deep Blue à AlphaGo : les machines apprennent à battre les humains.</span>
                    </li>
                  </ul>
                </div>

                {/* 1.3 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-[#032622]">1.3. La révolution générative et l'explosion des usages</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>De GPT à Midjourney : la machine créatrice.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>ChatGPT et la démocratisation de l'intelligence artificielle.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>De l'expérimentation scientifique à la révolution culturelle : quand l'IA entre dans nos vies.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pl-4 text-sm italic text-[#032622]/70">
                  → Transition : De la science à l'entreprise — comment cette révolution bouleverse déjà le monde économique.
                </div>
              </div>
            </div>
          </div>

          {/* PARTIE 2 */}
          <div className="space-y-4 border-t border-[#032622]/20 pt-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#032622] mb-3 uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  L'IMPACT ÉCONOMIQUE ET ORGANISATIONNEL DE L'IA : DE L'ENTREPRISE AUX NOUVELLES INDUSTRIES
                </h3>
                
                {/* 2.1 */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-base font-bold text-[#032622]">2.1. L'IA dans le monde du travail : automatisation, productivité et nouveaux métiers</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'automatisation intelligente : des robots d'usine aux assistants virtuels.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les métiers en transformation : IA et "augmented workforce".</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les compétences de demain : créativité, data et sens critique.</span>
                    </li>
                  </ul>
                </div>

                {/* 2.2 */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-base font-bold text-[#032622]">2.2. L'entreprise cognitive : un nouveau modèle économique</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Du capital financier au capital informationnel.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les entreprises apprenantes : comment l'IA change la prise de décision.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Exemples concrets : Amazon, Tesla, Salesforce, Google Cloud AI.</span>
                    </li>
                  </ul>
                </div>

                {/* 2.3 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-[#032622]">2.3. L'IA dans la société des services et des contenus</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Le marketing prédictif et la personnalisation extrême.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les médias intelligents : Netflix, Spotify, TikTok et l'économie de l'attention.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'IA et la création : musique, cinéma, art, écriture.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 pl-4 text-sm italic text-[#032622]/70">
                  → Transition : Mais cette puissance soulève une question essentielle : jusqu'où peut-on aller sans perdre notre humanité ?
                </div>
              </div>
            </div>
          </div>
          {/* PARTIE 3 */}
          <div className="space-y-4 border-t border-[#032622]/20 pt-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#032622] mb-3 uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  L'INTELLIGENCE ARTIFICIELLE, MIROIR DE L'HUMANITÉ : ÉTHIQUE, SOCIÉTÉ ET AVENIR
                </h3>
                
                {/* 3.1 */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-base font-bold text-[#032622]">3.1. Les enjeux éthiques et moraux</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'IA face au libre arbitre : qui décide ?</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les biais algorithmiques et la question de la neutralité.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'IA Act européen : encadrer sans étouffer.</span>
                    </li>
                  </ul>
                </div>

                {/* 3.2 */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-base font-bold text-[#032622]">3.2. L'impact sociétal et culturel</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'IA et la démocratie : manipulation, désinformation et deepfakes.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'éducation à l'ère de l'automatisation.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'humain augmenté : entre dépendance et libération cognitive.</span>
                    </li>
                  </ul>
                </div>

                {/* 3.3 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-[#032622]">3.3. L'avenir de l'intelligence artificielle : vers une civilisation augmentée</h4>
                  <ul className="space-y-2 text-sm text-[#032622]/80 pl-4">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>L'IA écologique : quand la machine aide la planète.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Les modèles de demain : hybridation homme-machine.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-[#032622] rounded-full mt-2 flex-shrink-0"></span>
                      <span>Le futur de l'entrepreneuriat et du travail créatif.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations du module */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[#032622] bg-[#F8F5E4] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#032622]/70 mb-1">Durée estimée</p>
          <p className="text-2xl font-bold text-[#032622]">45 min</p>
        </div>
        <div className="border border-[#032622] bg-[#F8F5E4] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#032622]/70 mb-1">Difficulté</p>
          <p className="text-2xl font-bold text-[#032622]">Débutant</p>
        </div>
        <div className="border border-[#032622] bg-[#F8F5E4] p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-[#032622]/70 mb-1">Format</p>
          <p className="text-2xl font-bold text-[#032622]">Vidéo + Texte</p>
        </div>
      </div>

      {/* Bouton pour commencer */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => setStep("module")}
          className="border border-[#032622] bg-[#032622] text-white px-8 py-4 text-lg font-bold uppercase tracking-wider hover:bg-[#044a3a] transition-colors flex items-center space-x-3"
        >
          <span>COMMENCER LE COURS</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  // Rendu de la Partie 1.1
  const renderPartie1_1 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("module")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 1
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 — COMPRENDRE L'INTELLIGENCE ARTIFICIELLE : UN HÉRITAGE DE L'HISTOIRE
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-4 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              1.1. Les origines de l'idée d'intelligence artificielle
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <p>
                  L'intelligence artificielle, avant d'être une technologie, est un projet intellectuel. Son émergence au XXᵉ siècle n'est pas un hasard : elle est le produit d'une lente maturation de la pensée humaine, d'un dialogue entre philosophie, science et imagination.
                </p>
                <p>
                  Dans l'histoire de l'humanité, chaque grande invention technique a d'abord été une idée, souvent formulée sous forme de mythe ou de rêve. La machine pensante n'échappe pas à cette règle. Elle s'inscrit dans une trajectoire qui va des automates symboliques de l'Antiquité à la cybernétique moderne, en passant par la révolution scientifique et la naissance de la logique mathématique.
                </p>
                <p>
                  L'étude de ces origines ne vise donc pas à raconter des anecdotes techniques, mais à comprendre pourquoi et comment l'humain a cherché à se prolonger dans une forme artificielle d'intelligence.
                </p>
              </section>

              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">De la mythologie à la cybernétique : quand l'homme imagine son double</h5>
                <p>
                  L'idée d'une intelligence non humaine est très ancienne. Dans presque toutes les civilisations, on trouve le mythe d'un être artificiel : une créature façonnée par l'homme pour accomplir des tâches à sa place. Ces récits ne sont pas de simples légendes : ils traduisent un questionnement profond sur la maîtrise de la création et les limites du pouvoir humain.
                </p>
                <p>
                  Dans la mythologie grecque, les serviteurs d'or d'Héphaïstos ou le géant Talos ne sont pas seulement des automates : ils incarnent le fantasme d'un monde où l'homme devient créateur de vie par la technique. Dans la tradition juive, le Golem de Prague symbolise cette même tension : un être sans âme, obéissant à la lettre plutôt qu'à l'esprit. Ces figures préfigurent les dilemmes éthiques contemporains de l'intelligence artificielle : l'efficacité sans conscience, la puissance sans morale.
                </p>
                <p>
                  À partir du XVIIIᵉ siècle, la fascination pour la mécanique transforme cette symbolique en pratique scientifique. Les automates de Vaucanson ou de Jaquet-Droz, capables d'imiter les gestes humains, témoignent d'une volonté nouvelle : rationaliser le vivant. On ne cherche plus seulement à raconter la vie, mais à la reproduire mécaniquement.
                </p>
                <p>
                  La machine devient alors un modèle du monde, et la nature, un système que l'on peut analyser, mesurer et reproduire. Cette idée de monde-machine prépare le terrain de l'intelligence artificielle. Elle annonce un changement de paradigme : l'humain cesse de voir la raison comme une essence divine pour l'envisager comme un processus logique, donc potentiellement programmable.
                </p>
              </section>

              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">La naissance de la pensée algorithmique : quand la logique devient un langage</h5>
                <p>
                  Si la machine devient modèle de la pensée, c'est parce qu'au XIXᵉ siècle, la logique sort du domaine philosophique pour entrer dans celui des mathématiques. Des penseurs comme George Boole et Gottlob Frege redéfinissent le raisonnement sous forme d'opérations symboliques. Cette "arithmétisation du raisonnement" rend possible une nouvelle question : si penser peut se formaliser, alors pourquoi ne pas le faire exécuter par une machine ?
                </p>
                <p>
                  C'est dans ce contexte intellectuel que s'inscrit Alan Turing.
                </p>
              </section>
            </div>

            {/* Image illustrative */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/imagecours.png"
                  alt="Alan Turing et sa première machine d'intelligence artificielle"
                  className="w-full h-auto object-contain"
                />
              </div>
              <p className="text-center text-sm text-[#032622]/70 mt-3 italic">
                Alan Turing et sa première machine d'intelligence artificielle
              </p>
            </div>

            {/* Suite du contenu après l'image */}
            <div className="space-y-4 text-base text-[#032622] leading-relaxed mt-8">
              <p>
                Mais ce que Turing apporte, ce n'est pas seulement une innovation technique : c'est une rupture épistémologique. Il ne s'intéresse pas à la conscience, mais à la procédure.
              </p>
              <p>
                Ce qu'il démontre, c'est que toute opération logique, quelle qu'elle soit, peut être simulée par une séquence d'instructions mécaniques. L'intelligence, dans cette perspective, cesse d'être un mystère pour devenir un processus calculable.
              </p>
              <p>
                C'est la naissance de la pensée algorithmique — non pas une pensée humaine imité par la machine, mais une pensée décomposée, traduite dans un langage manipulable.
              </p>
              <p>
                Cette vision inspire un déplacement majeur : le raisonnement n'est plus considéré comme une faculté spirituelle, mais comme une fonction universelle que l'on peut modéliser, transmettre et reproduire.
              </p>
            </div>

            {/* Image Turing en grand */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/TURING.jpg"
                  alt="Alan Turing"
                  className="w-full h-auto object-cover"
                />
              </div>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("module")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie1_2")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 15 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 1</span>
                <span className="font-bold">25%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                3 modules complétés sur 12
              </p>
            </div>
          </div>
          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Glossaire de l'IA (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Frise chronologique (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Article : "L'histoire de l'IA"</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bibliographie clé */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">À lire</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="text-xs text-[#032622]">
                  <p className="font-bold">Alan Turing</p>
                  <p className="italic opacity-70">"Computing Machinery and Intelligence" (1950)</p>
                </div>
                <div className="text-xs text-[#032622]">
                  <p className="font-bold">Stuart Russell</p>
                  <p className="italic opacity-70">"Human Compatible" (2019)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Rendu de la Partie 1.2
  const renderPartie1_2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie1_1")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 1.2
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 — COMPRENDRE L'INTELLIGENCE ARTIFICIELLE : UN HÉRITAGE DE L'HISTOIRE
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              1.2. L'âge numérique et la renaissance de l'intelligence artificielle
            </h4>
            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">Les années 1950-1980 : la technique prend le relais de la théorie</h5>
                <p>
                  La Seconde Guerre mondiale agit comme un catalyseur. La nécessité de décrypter, de prédire, de calculer à grande échelle pousse les sciences cognitives, la logique et l'informatique à fusionner. C'est dans ce contexte qu'émerge ce qu'on appellera plus tard "l'intelligence artificielle".
                </p>
                <p>
                  Mais contrairement à ce que racontent les films ou les médias, l'IA des débuts n'a rien d'un miracle soudain. Elle est d'abord un projet scientifique collectif, soutenu par des chercheurs qui rêvent d'une machine capable de raisonner par elle-même. Les laboratoires du MIT, de Stanford ou de Carnegie Mellon deviennent les lieux d'une nouvelle discipline.
                </p>
                <p>
                  Les premiers programmes, comme le "Logic Theorist" d'Herbert Simon, ou le "General Problem Solver", cherchent à simuler le raisonnement humain par des règles logiques. C'est l'époque de l'IA symbolique, fondée sur l'idée que toute pensée peut être réduite à une suite de symboles et de déductions. Mais cette approche, aussi élégante soit-elle, bute sur une limite : le réel est plus complexe que la logique. Le monde n'est pas un problème à résoudre, c'est un environnement à interpréter.
                </p>
                <p>
                  L'IA des années 1970 se heurte donc à la lenteur des machines, au manque de données, à la fragilité de ses modèles. Les illusions retombent : c'est ce qu'on appelle le premier hiver de l'IA. Mais ces échecs sont fondateurs : ils montrent que pour penser comme l'humain, il ne suffit pas de reproduire sa logique, il faut comprendre sa manière d'apprendre.
                </p>
                <p>
                  Cette première période, de la mythologie aux débuts scientifiques, pose les fondations philosophiques de l'intelligence artificielle moderne. L'IA n'est pas née d'un ordinateur, mais d'un désir humain de se comprendre à travers la machine.
                </p>
                <p>
                  Elle est à la fois un miroir et un outil : le miroir de notre raison, l'outil de notre prolongement. L'histoire qui suit — celle de la donnée, du numérique et du deep learning — ne sera qu'une continuation de cette quête : non plus créer une machine logique, mais une machine capable d'apprendre, de s'adapter et, peut-être, de nous surprendre.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">À la fin du XXᵉ siècle : le silence avant la tempête</h5>
                <p>
                  À la fin du XXᵉ siècle, le rêve de l'intelligence artificielle semble avoir perdu tout son éclat. Les laboratoires ferment les uns après les autres, les financements se raréfient et les chercheurs passent pour des idéalistes obstinés. Les promesses des années 1950 n'ont pas été tenues : les machines sont trop lentes, les programmes trop fragiles, les données trop rares. C'est ce qu'on appelle aujourd'hui le premier hiver de l'IA.
                </p>
                <p>
                  Mais en silence, une autre révolution se prépare — une révolution qui ne parle pas encore "d'intelligence", mais qui va en créer les conditions. Cette révolution, c'est celle du numérique. L'arrivée de l'ordinateur personnel, la généralisation d'Internet et la connectivité planétaire des années 1990 vont transformer le monde en un immense système d'échanges d'informations. Et c'est cette explosion de la donnée, couplée à la puissance de calcul et à de nouvelles méthodes d'apprentissage, qui va permettre à l'IA de renaître. Non pas sous la forme d'un rêve théorique, mais comme une technologie concrète au cœur de nos usages quotidiens.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">La donnée : la matière première de la nouvelle intelligence</h5>
                <p>
                  L'intelligence, qu'elle soit biologique ou artificielle, a besoin d'expérience. Un enfant apprend à reconnaître un chien parce qu'il en a vu plusieurs, il a entendu le mot associé, il a intégré les variations et les exceptions. De la même manière, une machine ne peut apprendre qu'à partir d'un grand nombre d'exemples.
                </p>
                <p>
                  Dans les années 1980, cette condition était impossible à remplir : les ordinateurs étaient isolés, les données coûteuses à produire et à stocker. Mais à partir des années 1990, tout change. L'invention du World Wide Web par Tim Berners-Lee en 1989 permet de relier entre elles des milliards de pages d'informations. Chaque site, chaque interaction, chaque requête devient une trace, un fragment de connaissance exploitable. C'est la naissance d'un nouveau type de ressource : la donnée numérique.
                </p>
                <p>
                  Internet transforme ainsi le monde en un gigantesque organisme informationnel. Les entreprises, les institutions, les individus produisent de la donnée en continu — volontairement ou non. Les échanges bancaires, les achats en ligne, les mails, les publications sur les forums et les débuts des réseaux sociaux forment un océan de signaux. En 1992, le volume global de données numériques est estimé à 100 gigaoctets. En 2002, il dépasse 5 exaoctets (soit cinq milliards de gigaoctets). Vingt ans plus tard, il est multiplié par un million.
                </p>
                <p>
                  Pour la première fois, l'humanité dispose de plus d'informations qu'elle ne peut en comprendre. Cette abondance crée un besoin nouveau : non plus produire des données, mais savoir les lire, les trier, les interpréter. L'intelligence artificielle trouve là son rôle naturel.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Le retour de l'apprentissage : apprendre plutôt qu'exécuter</h5>
                <p>
                  L'une des limites majeures de l'IA des débuts tenait à sa logique : les programmes des années 1960 et 1970 fonctionnaient à base de règles explicites. Un humain devait décrire à la machine ce qu'elle devait faire. Mais la complexité du réel rendait cette approche intenable. Comment formaliser toutes les situations possibles de la vie quotidienne ? Même un simple acte, comme reconnaître un visage ou comprendre une phrase, exige une infinité de nuances que personne ne peut entièrement coder.
                </p>
                <p>
                  Dans les années 1980, un courant minoritaire propose une alternative : au lieu de programmer la connaissance, il faudrait la faire émerger de l'expérience. Cette approche, longtemps ignorée, s'appelle le machine learning, ou apprentissage automatique.
                </p>
                <p>
                  Son principe est radicalement différent : on n'explique plus à la machine quoi faire, on lui fournit des exemples et on la laisse découvrir les régularités. Autrement dit, on ne la dote plus de règles, mais de la capacité à apprendre des règles par elle-même.
                </p>
                <p>
                  Prenons un exemple simple. Si l'on veut qu'un programme reconnaisse un chat, il serait impossible de lister toutes les formes, les tailles, les couleurs et les positions possibles. Mais si on lui montre des milliers d'images de chats et d'autres d'objets divers, il peut, à force d'essais et d'erreurs, en déduire statistiquement les traits caractéristiques. C'est la différence entre raisonner et apprendre.
                </p>
                <p>
                  Dans cette logique, l'erreur n'est plus un échec : elle devient un signal d'ajustement. Chaque mauvaise réponse aide la machine à corriger ses paramètres internes, à affiner sa perception du monde. Ce processus est appelé entraînement. Et plus une machine est entraînée sur de grands volumes de données, plus elle devient performante.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Anecdote de l'apprentissage : Deep Blue contre Garry Kasparov, la première défaite de l'intelligence humaine</h5>
                <p>
                  Développé par IBM, ce superordinateur monumental, composé de 30 processeurs et 480 unités dédiées au calcul parallèle, est capable d'analyser plus de 200 millions de positions d'échecs par seconde.
                </p>
              </section>
            </div>

            {/* Image Deep Blue vs Kasparov */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/mai1997.png"
                  alt="Deep Blue contre Garry Kasparov"
                  className="w-full h-auto object-cover"
                />
              </div>
              <p className="text-center text-sm text-[#032622]/70 mt-3 italic">
                En mai 1997, un événement fait la une de tous les journaux : pour la première fois, une machine bat le champion du monde d'échecs en titre. Son nom : Deep Blue.
              </p>
            </div>

            {/* Image Garry Kasparov */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/garry.png"
                  alt="Garry Kasparov"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Suite du contenu après l'image */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <p>
                Face à lui, le Russe Garry Kasparov, considéré à l'époque comme l'un des plus grands esprits stratégiques de sa génération.
              </p>
              <p>
                L'affrontement se déroule en six parties, sous les yeux du monde entier. Kasparov remporte la première manche et déclare, confiant :
              </p>
              <p className="italic text-center font-semibold border-l-4 border-[#032622] pl-4">
                "Jamais une machine ne comprendra ce qu'est la beauté d'un coup d'échecs."
              </p>
              <p>
                Mais dès la deuxième partie, Deep Blue riposte avec une précision glaciale. La machine gagne, puis tient en échec le champion humain dans plusieurs parties suivantes, jusqu'à remporter le duel par 3,5 points à 2,5. Pour la première fois, une intelligence artificielle vainc un champion humain dans un jeu considéré comme le symbole même de la raison stratégique.
              </p>
              <p>
                Les réactions sont immédiates. Pour les médias, c'est un triomphe de la science sur l'intuition humaine. Pour d'autres, un choc presque philosophique : comment une machine, dénuée d'émotion et de conscience, peut-elle battre l'un des plus grands penseurs vivants ?
              </p>
              <p>
                Mais si Deep Blue marque les esprits, il ne faut pas le confondre avec une véritable "intelligence". En réalité, le système ne "pense" pas au sens où nous l'entendons. Il ne comprend pas le jeu, il calcule. Son intelligence est brute, combinatoire, sans imagination. Deep Blue explore toutes les possibilités, évalue chaque position selon une fonction mathématique, puis choisit la plus favorable. Autrement dit, il gagne non par compréhension, mais par puissance de calcul.
              </p>
              <p>
                Cette distinction est essentielle. Deep Blue ne représente pas l'intelligence artificielle telle que nous la connaissons aujourd'hui, mais la fin d'une illusion : celle selon laquelle la réflexion humaine pourrait être réduite à une simple logique de force brute. Kasparov, lui, en sortira transformé. Après sa défaite, il devient l'un des plus ardents défenseurs du concept d'"intelligence hybride", où l'humain et la machine coopèrent au lieu de s'opposer. Il dira plus tard :
              </p>
              <p className="italic text-center font-semibold border-l-4 border-[#032622] pl-4">
                "Les machines sont meilleures dans ce qu'elles font, mais l'humain reste meilleur pour savoir ce qu'il faut faire."
              </p>
              <p>
                Cet épisode marque donc moins la victoire d'une machine que la naissance d'une collaboration. Il démontre que la puissance brute ne remplace pas l'intuition, mais la complète. Et il annonce déjà le monde d'aujourd'hui, où les IA ne visent plus à battre l'humain, mais à travailler avec lui.
              </p>

              <div className="border border-[#032622] bg-[#F8F5E4] p-6 mt-8">
                <h6 className="font-bold text-lg text-[#032622] mb-4">En résumé</h6>
                <ul className="space-y-2 text-sm text-[#032622]">
                  <li className="flex items-start space-x-3">
                    <span className="font-bold min-w-[120px]">Date :</span>
                    <span>mai 1997</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="font-bold min-w-[120px]">Machine :</span>
                    <span>Deep Blue (IBM), 200 millions de coups analysés/seconde</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="font-bold min-w-[120px]">Adversaire :</span>
                    <span>Garry Kasparov, champion du monde d'échecs</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="font-bold min-w-[120px]">Nature du "triomphe" :</span>
                    <span>victoire combinatoire, pas cognitive</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="font-bold min-w-[120px]">Impact :</span>
                    <span>symbolique planétaire, transition vers l'idée d'"intelligence augmentée"</span>
                  </li>
                </ul>
              </div>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">L'écosystème numérique : la puissance, le stockage et le réseau</h5>
                <p>
                  Pour que cette idée fonctionne, encore fallait-il disposer des moyens techniques nécessaires. Trois innovations majeures vont rendre cela possible.
                </p>
                <p>
                  D'abord, l'augmentation spectaculaire de la puissance de calcul. Les processeurs deviennent de plus en plus rapides, capables de traiter des millions d'opérations par seconde. Surtout, dans les années 2000, les chercheurs détournent une technologie issue du jeu vidéo : les GPU (processeurs graphiques). Conçus initialement pour afficher des images en trois dimensions, ils s'avèrent parfaits pour réaliser des calculs parallèles massifs, indispensables à l'apprentissage des modèles d'IA.
                </p>
                <p>
                  Ensuite, le développement du cloud computing révolutionne l'accès aux ressources informatiques. Les données ne sont plus stockées localement sur un ordinateur, mais hébergées dans d'immenses centres de données répartis sur la planète. Cela permet à n'importe quelle entreprise, même petite, d'utiliser des capacités de calcul considérables sans posséder son propre matériel. C'est la démocratisation de la puissance.
                </p>
                <p>
                  Enfin, le déploiement mondial d'Internet crée une infrastructure d'apprentissage planétaire. Chaque interaction humaine — un clic, un achat, une recherche — devient une donnée supplémentaire pour nourrir les algorithmes. L'intelligence artificielle commence alors à se loger dans les usages les plus banals : un moteur de recherche, une recommandation de film, un assistant vocal.
                </p>
                <p>
                  Sans que nous le réalisions, le monde numérique devient un laboratoire d'apprentissage permanent. Chaque jour, nos comportements entraînent les modèles qui nous serviront demain.
                </p>
              </section>
              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Le deep learning : la machine qui se met à "percevoir"</h5>
                <p>
                  Le véritable tournant technique se produit au début des années 2010 avec la renaissance d'une idée ancienne : les réseaux de neurones. Imaginés dès les années 1950, ils avaient été abandonnés faute de puissance et de données suffisantes. Mais grâce au cloud, aux GPU et à Internet, les conditions sont enfin réunies pour leur donner vie à grande échelle.
                </p>
                <p>
                  Un réseau de neurones artificiels est une structure mathématique inspirée du cerveau humain. Il est composé de "couches" de neurones virtuels, chacun recevant des signaux, les transformant, puis les transmettant aux suivants. Les premières couches identifient les éléments simples d'une image (un contour, une couleur, une ligne), les suivantes les combinent pour reconnaître des formes, et les dernières interprètent l'ensemble. C'est ce que l'on appelle l'apprentissage profond — deep learning — car l'information traverse de nombreuses couches d'analyse.
                </p>
                <p>
                  Le succès du deep learning repose sur sa capacité à apprendre directement à partir des données brutes, sans intervention humaine. Le modèle apprend ce qu'il doit apprendre en détectant les corrélations les plus efficaces pour atteindre son objectif. Autrement dit, il n'imite pas seulement notre raisonnement logique : il recrée une forme d'intuition statistique.
                </p>
                <p>
                  L'année 2012 marque un moment clé : une IA appelée AlexNet, conçue par Geoffrey Hinton et son équipe à Toronto, pulvérise les records dans un concours international de reconnaissance d'images. Son taux d'erreur est deux fois inférieur à celui des systèmes précédents. Ce succès spectaculaire déclenche une vague mondiale de recherches et d'investissements. Les grandes entreprises technologiques — Google, Facebook, Microsoft, Baidu — créent leurs propres laboratoires d'intelligence artificielle. En moins de cinq ans, l'IA devient un enjeu industriel majeur.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">De la science à la société : la banalisation de l'intelligence artificielle</h5>
                <p>
                  Dès le milieu des années 2010, l'intelligence artificielle n'est plus une promesse : elle devient un standard invisible du monde numérique. Quand vous ouvrez Netflix, l'algorithme choisit vos films. Quand vous commandez sur Amazon, il prédit vos achats futurs. Quand vous écoutez Spotify, il apprend vos goûts pour vous recommander le morceau suivant. Partout, les systèmes apprennent, comparent, ajustent.
                </p>
                <p>
                  Cette "invisibilisation" de l'IA marque un changement culturel. Dans les années 1950, l'intelligence artificielle était un rêve de science-fiction : on imaginait des robots, des cerveaux mécaniques, des voix métalliques. Aujourd'hui, elle n'a plus besoin d'être visible pour être puissante. Elle agit en arrière-plan, dans les interfaces, dans les calculs, dans les décisions. Elle ne pense pas "à notre place" : elle pense avec nous, silencieusement, en permanence.
                </p>
                <p>
                  Ce glissement fait de l'IA un élément constitutif du numérique moderne. Elle n'est plus une technologie parmi d'autres : elle est devenue le moteur caché de la transformation digitale. Grâce à elle, l'économie s'oriente vers la prédiction, la personnalisation et l'automatisation. Chaque individu, chaque clic, chaque mouvement devient un signal intégré dans un système global d'apprentissage.
                </p>
                <p>
                  L'intelligence artificielle est ainsi passée du statut de projet scientifique à celui d'infrastructure cognitive du monde numérique. Et ce nouveau cadre prépare le terrain pour la prochaine étape : celle où la machine ne se contentera plus d'analyser ou de recommander, mais de créer. Cette étape, c'est celle de l'IA générative — le moment où l'intelligence artificielle devient capable de produire du texte, des images, de la musique, voire des idées nouvelles.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Conclusion : un nouveau paradigme culturel et technique</h5>
                <p>
                  La renaissance de l'intelligence artificielle à l'ère numérique n'est pas un hasard, mais le résultat d'une convergence historique. L'explosion d'Internet, la puissance du calcul, la disponibilité massive des données et la redécouverte des réseaux neuronaux ont redonné vie à un rêve ancien. Mais cette fois, le rêve s'est incarné dans des usages concrets, quotidiens, discrets.
                </p>
                <p>
                  Ce chapitre marque un tournant : celui où l'intelligence artificielle cesse d'être une idée de chercheurs pour devenir une technologie de société. Elle entre dans les foyers, dans les entreprises, dans nos poches, et finit par façonner notre environnement sans que nous en ayons conscience.
                </p>
                <p className="font-semibold italic">
                  L'histoire suivante, celle que nous allons explorer dans la section 1.3, est celle d'un nouveau saut : celui où la machine, après avoir appris à analyser le monde, se met à le réinventer.
                </p>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie1_1")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie1_3")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 20 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 1</span>
                <span className="font-bold">50%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '50%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                6 modules complétés sur 12
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Histoire du Deep Learning (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Infographie : Réseaux de neurones</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Vidéo : AlexNet expliqué</span>
                </a>
              </div>
            </div>
          </div>

          {/* Concepts clés */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Concepts clés</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Deep Learning</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Réseaux de neurones</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Big Data</span>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Rendu de la Partie 1.3
  const renderPartie1_3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie1_2")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 1.3
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 — COMPRENDRE L'INTELLIGENCE ARTIFICIELLE : UN HÉRITAGE DE L'HISTOIRE
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              1.3. La révolution générative et l'explosion des usages
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <p>
                  Nous vivons aujourd'hui un moment historique. Après des décennies d'expérimentation, de recherche et de tâtonnements, l'intelligence artificielle a franchi un seuil que beaucoup pensaient encore lointain : celui de la création. Jusqu'ici, les machines apprenaient à reconnaître, classer, traduire, recommander. Elles comprenaient sans inventer, imitaient sans imaginer. Mais depuis le début des années 2020, une nouvelle génération de modèles bouleverse cet équilibre. Ces IA ne se contentent plus d'analyser : elles génèrent.
                </p>
                <p>
                  Texte, image, musique, code, vidéo — l'intelligence artificielle entre dans l'espace de la production symbolique, un domaine qui semblait réservé à l'humain. C'est une mutation comparable à l'invention de l'imprimerie ou d'Internet : un changement de paradigme cognitif. Pour la première fois, chacun d'entre nous peut dialoguer avec une machine capable de créer du contenu inédit, cohérent, parfois même émouvant. Et cette démocratisation, fulgurante, modifie déjà nos métiers, nos apprentissages, notre rapport à la connaissance et à la créativité.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">De la génération à la compréhension : comment fonctionne une IA générative ?</h5>
                <p>
                  Une IA générative ne se contente pas d'exécuter une commande. Elle apprend les structures du langage, visuel ou textuel, et les utilise pour produire de nouvelles combinaisons. Concrètement, ces modèles — appelés modèles de langage (LLM pour Large Language Model) — sont entraînés sur d'immenses volumes de textes, d'images ou de sons extraits du web. Certains modèles récents ont été nourris de plus de 300 milliards de mots et plusieurs millions d'heures d'audio ou de vidéos.
                </p>
                <p>
                  Leur principe repose sur la prédiction : à chaque étape, la machine devine l'élément le plus probable qui devrait suivre. Dans le cas d'un texte, elle prédit le mot suivant ; dans le cas d'une image, le pixel suivant ; dans le cas d'une vidéo, l'image suivante. Mais cette prédiction n'est pas aléatoire : elle est fondée sur des corrélations statistiques apprises pendant l'entraînement.
                </p>
                <p>
                  Prenons un exemple simple : si vous commencez une phrase par "La capitale de la France est…", la machine sait, par observation, que "Paris" est la réponse la plus probable. Mais ce mécanisme appliqué à des milliards de contextes et affiné sur des milliers de couches neuronales permet à ces modèles de composer, traduire, résumer, écrire ou illustrer avec une fluidité quasi humaine.
                </p>
                <p>
                  Ce qu'il faut comprendre, c'est qu'une IA générative ne "comprend" pas au sens humain du terme. Elle ne ressent rien, ne pense pas, n'a pas d'intention. Mais elle sait reproduire les schémas du sens à un niveau d'échelle qui dépasse de loin nos capacités naturelles. C'est la force — et la limite — de cette nouvelle ère.
                </p>
              </section>
            </div>

            {/* Image IA Marketing */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/IA-MARKETING.jpg"
                  alt="Intelligence artificielle et marketing"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Suite du contenu */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">2020-2022 : l'essor des modèles et la démocratisation planétaire</h5>
                <p>
                  Le véritable tournant survient en 2020, avec la sortie du modèle GPT-3 développé par OpenAI. Pour la première fois, une intelligence artificielle est capable de produire des textes longs, cohérents et nuancés. GPT-3 contient 175 milliards de paramètres, contre seulement 1,5 milliard pour GPT-2, sorti deux ans plus tôt. Ce saut d'échelle est colossal : c'est l'équivalent de passer d'un cerveau d'enfant à celui d'une bibliothèque mondiale.
                </p>
                <p>
                  Mais la révolution ne devient concrète qu'en novembre 2022, lorsque OpenAI met à disposition du grand public une interface simplifiée : ChatGPT. En quelques semaines, l'outil devient un phénomène mondial. Il atteint 100 millions d'utilisateurs actifs en deux mois, un record absolu dans l'histoire des technologies numériques (à titre de comparaison, Instagram avait mis 2 ans à atteindre ce chiffre).
                </p>
                <p>
                  Cette adoption massive marque un basculement culturel. Pour la première fois, tout le monde peut converser avec une IA, lui confier une idée, un texte, une image à corriger, un problème à résoudre. L'intelligence artificielle sort du laboratoire pour devenir une expérience collective. On ne "programme" plus la machine, on discute avec elle.
                </p>
                <p>
                  Cette accessibilité change profondément notre rapport à la technologie. L'ordinateur n'est plus un outil, c'est un interlocuteur. Et dans ce dialogue, chacun découvre quelque chose d'inédit : une machine capable d'imiter notre langage devient une extension de notre pensée.
                </p>
              </section>
            </div>
            {/* Vidéo YouTube */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/HyoABbailQQ?si=GRdli7fR1vmpMTbm" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
            {/* Suite du contenu après la vidéo */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">L'explosion créative : quand la machine devient artiste</h5>
                <p>
                  En parallèle des modèles de texte, d'autres formes d'IA génératives apparaissent. DALL·E (2021), Stable Diffusion (2022) et Midjourney (2022) permettent de créer des images à partir de simples descriptions. Quelques mots suffisent pour générer une œuvre entière, un paysage, un logo, un style graphique inédit. Cette capacité sidère autant qu'elle inquiète : en quelques secondes, une IA peut produire ce qu'un graphiste aurait mis des heures à concevoir.
                </p>
                <p className="font-semibold">Les chiffres donnent la mesure du phénomène :</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    En 2023, plus de 15 milliards d'images ont été générées par des outils d'IA créative.
                  </li>
                  <li>
                    La communauté Midjourney compte à elle seule plus de 16 millions d'utilisateurs sur Discord.
                  </li>
                  <li>
                    En 2024, près de 70 % des agences de communication déclarent avoir intégré des outils d'IA générative dans leur processus de création.
                  </li>
                </ul>
                <p>
                  Mais au-delà de la performance, une question se pose : la machine crée-t-elle vraiment ? La réponse dépend du sens que l'on donne au mot "créer". Les modèles génératifs n'inventent rien ex nihilo ; ils combinent, extrapolent, recomposent des motifs existants. Leur créativité est statistique, pas émotionnelle. Et pourtant, les résultats peuvent être bouleversants, parce qu'ils résonnent avec notre imaginaire.
                </p>
                <p>
                  L'artiste humain reste celui qui choisit la direction, la lumière, l'intention. Mais l'IA devient son co-créateur, son accélérateur d'inspiration. Dans le design, la publicité, la musique ou le cinéma, cette hybridation redéfinit déjà les métiers. Le créatif de demain n'est pas remplacé : il est augmenté.
                </p>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie1_2")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie1_3_suite")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 15 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 1</span>
                <span className="font-bold">75%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                9 modules complétés sur 12
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">L'IA générative (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Carte mentale GPT</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Guide : Prompts efficaces</span>
                </a>
              </div>
            </div>
          </div>

          {/* Personnalités clés */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Experts IA</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-xs text-[#032622]">
                <p className="font-bold">Sam Altman</p>
                <p className="opacity-70">CEO OpenAI</p>
              </div>
              <div className="text-xs text-[#032622]">
                <p className="font-bold">Yann LeCun</p>
                <p className="opacity-70">Meta AI</p>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Rendu de la Partie 1.3 Suite
  const renderPartie1_3_Suite = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie1_3")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 1.3 (suite)
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 — COMPRENDRE L'INTELLIGENCE ARTIFICIELLE : UN HÉRITAGE DE L'HISTOIRE
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              1.3. La révolution générative et l'explosion des usages (suite)
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">La chose à retenir : Le jour où le monde a découvert ChatGPT</h5>
                <p>
                  L'histoire retiendra peut-être cette date : 30 novembre 2022. Ce jour-là, OpenAI met en ligne un outil gratuit, sans grande annonce, baptisé ChatGPT. Une simple interface blanche, une barre de texte, un bouton "Send". Rien qui ressemble à une révolution.
                </p>
                <p>
                  Et pourtant, en quelques heures, Internet s'enflamme. Des étudiants découvrent qu'ils peuvent générer des dissertations en quelques secondes, des développeurs voient l'outil corriger leur code, des enseignants s'interrogent sur la triche académique, des journalistes testent ses capacités d'analyse. Un étudiant américain publie sur Twitter :
                </p>
                <p className="italic text-center font-semibold border-l-4 border-[#032622] pl-4">
                  "Je viens d'écrire mon devoir entier avec ChatGPT. Mon prof a mis A+."
                </p>
                <p>
                  Le tweet devient viral.
                </p>
                <p>
                  En cinq jours, ChatGPT dépasse un million d'utilisateurs. En deux mois, il franchit la barre des 100 millions, devenant l'application à la croissance la plus rapide de l'histoire — plus vite que TikTok, Instagram ou Netflix. Dans les entreprises, les équipes marketing, RH, juridiques ou commerciales commencent à l'essayer. Les dirigeants en parlent dans les réunions. Les médias le présentent comme "le nouvel Internet".
                </p>
                <p>
                  Mais ce qui secoue vraiment le monde, ce n'est pas seulement la puissance de l'outil. C'est sa proximité. Pour la première fois, une machine semble parler notre langue, sans interface complexe, sans jargon technique. Elle répond avec cohérence, reformule, s'adapte à nos demandes, plaisante parfois. Et surtout, elle le fait en quelques secondes.
                </p>
                <p>
                  Là où les IA précédentes étaient invisibles — cachées dans les moteurs de recherche ou les plateformes —, celle-ci devient accessible à tous. Tout le monde peut s'en servir, sans compétence technique, sans apprentissage. L'intelligence artificielle quitte le monde des ingénieurs pour entrer dans le quotidien des individus.
                </p>
                <p>
                  Le choc culturel est immense. Les professeurs d'université s'interrogent : faut-il interdire ChatGPT ou l'intégrer dans l'enseignement ? Les artistes craignent la perte d'authenticité, les communicants redoutent une banalisation du contenu, les chercheurs s'émerveillent de ses performances linguistiques. En quelques semaines, des millions de personnes expérimentent, discutent, s'inquiètent, s'amusent. C'est le premier contact planétaire avec une intelligence artificielle générative.
                </p>
                <p>
                  Mais plus profondément, quelque chose d'autre se joue : pour la première fois, la technologie dialogue. Elle ne se contente plus de fournir une réponse : elle interagit. Cette dimension conversationnelle change tout. Ce n'est plus un moteur de recherche, c'est un partenaire cognitif. Et cette illusion d'échange, aussi fascinante qu'elle soit, brouille les repères.
                </p>
                <p>
                  Le monde réalise alors que quelque chose vient de basculer : l'intelligence artificielle n'est plus un outil au service de l'humain, mais une présence intellectuelle dans son environnement. Certains y voient un tournant civilisationnel, d'autres une menace, d'autres encore un simple gadget. Mais une chose est certaine : plus rien ne sera comme avant.
                </p>
              </section>
            </div>

            {/* Image Tweet viral */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/twitt.png"
                  alt="Tweet viral sur ChatGPT"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            {/* Suite du contenu après l'image */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <p>
                En janvier 2023, les universités américaines réécrivent leurs chartes pédagogiques. Les journaux économiques parlent de "tsunami cognitif". Et le grand public, pour la première fois, met un visage sur l'intelligence artificielle : une fenêtre de chat. Un rectangle de texte.
              </p>
              <p className="text-center italic font-semibold text-lg">
                Et au fond de ce rectangle, une phrase qui résonne encore :
              </p>
              <p className="text-center italic font-bold text-xl border border-[#032622] bg-[#F8F5E4] py-4">
                "Hello, how can I help you today ?"
              </p>
              
              <section className="space-y-4 mt-8">
                <p>
                  En quelques décennies, l'intelligence artificielle a parcouru un chemin vertigineux. D'abord concept théorique, puis curiosité scientifique, elle est devenue une technologie vivante, enracinée dans nos usages, nos échanges et nos imaginaires. Mais son véritable basculement ne s'est pas produit dans les laboratoires : il s'est produit dans le monde du travail.
                </p>
                <p>
                  Là où la révolution industrielle avait transformé la force physique et la révolution numérique, la circulation de l'information, l'intelligence artificielle redéfinit désormais la nature même de la valeur. Elle ne produit pas des objets, mais des décisions. Elle ne transforme pas la matière, mais la connaissance.
                </p>
                <p>
                  Cette bascule change tout. Les entreprises ne s'organisent plus seulement autour de la production, mais autour de l'apprentissage permanent : apprendre du client, des données, du marché, du comportement. L'IA devient alors un levier de performance, mais aussi un miroir des limites humaines — elle force les dirigeants à repenser la stratégie, le management, la créativité et même la responsabilité sociale.
                </p>
                <p>
                  Autrement dit, ce n'est plus la science qui définit l'intelligence artificielle, mais l'économie qui lui donne un sens. Et c'est dans ce nouveau champ — celui de la productivité, de l'innovation et du leadership — que se joue désormais la prochaine étape de son évolution.
                </p>
                <p className="font-semibold italic text-center text-lg mt-6">
                  C'est là que commence la Partie 2 : comprendre comment l'intelligence artificielle façonne les entreprises, transforme les métiers et redéfinit la façon même de diriger.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Un impact économique et social sans précédent</h5>
                <p>
                  L'essor de l'IA générative provoque une vague d'adaptation dans tous les secteurs. En 2024, 77 % des entreprises américaines déclaraient expérimenter ou intégrer un outil d'intelligence artificielle dans leurs activités. Les économies les plus dynamiques — États-Unis, Chine, Corée, Israël — ont fait de l'IA un levier stratégique d'innovation.
                </p>
                <p>
                  Mais l'impact est aussi social. De nouveaux métiers émergent : prompt engineer, AI ethicist, data curator. Des plateformes comme Upwork ou Fiverr comptent déjà des milliers de freelances spécialisés dans l'usage de ChatGPT ou de Midjourney pour la production de contenu. Parallèlement, certains métiers se transforment : le rédacteur devient superviseur, le graphiste devient chef d'orchestre d'un flux créatif algorithmique.
                </p>
                <p>
                  Les institutions éducatives s'adaptent elles aussi. En 2023, plus de 60 % des universités américaines avaient intégré des cours liés à l'IA dans leurs cursus. L'objectif n'est plus seulement d'apprendre à utiliser des outils, mais à penser avec eux. Ce glissement marque l'entrée dans ce que les chercheurs appellent une "pédagogie augmentée".
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Les limites et les paradoxes : vers une nouvelle responsabilité intellectuelle</h5>
                <p>
                  Toute révolution a ses zones d'ombre. L'IA générative ne fait pas exception. Elle consomme une énergie colossale : selon certaines estimations, l'entraînement d'un grand modèle comme GPT-4 aurait nécessité environ 1 200 MWh, soit la consommation annuelle de 130 foyers européens. Elle pose aussi des problèmes éthiques : reproduction de biais, génération de fausses informations, plagiat involontaire.
                </p>
                <p>
                  Le plus grand risque, toutefois, est plus subtil : c'est celui de la déresponsabilisation cognitive. Quand tout devient accessible instantanément, la tentation est grande de déléguer sa pensée. De laisser la machine formuler, décider, écrire à notre place. Mais comme le rappelle la chercheuse Kate Crawford, "l'intelligence artificielle n'est pas une entité : c'est un miroir de notre société, avec ses biais, ses privilèges et ses limites".
                </p>
                <p>
                  Apprendre à utiliser l'IA générative, c'est donc aussi apprendre à garder le sens du jugement. L'enjeu n'est pas de produire plus, mais de penser mieux. Et c'est peut-être là que se joue la véritable révolution : dans notre capacité à rester humains dans un monde qui pense de plus en plus vite.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Conclusion</h5>
                <p>
                  La révolution générative marque l'entrée dans une ère nouvelle : celle où la machine participe à la création du sens. Elle bouleverse la frontière entre auteur et outil, entre analyse et imagination. Mais loin de nous remplacer, elle révèle ce qui fait notre singularité : notre capacité à choisir, à interpréter, à donner du sens à ce qui est produit.
                </p>
                <p>
                  L'intelligence artificielle générative n'est pas l'aboutissement de la technologie : elle en est le miroir le plus évolué. Elle nous oblige à repenser la créativité, la propriété intellectuelle, la valeur du travail et même la définition du savoir.
                </p>
                <p className="font-semibold italic">
                  Ce premier grand chapitre — l'histoire, la renaissance et la révolution de l'IA — se referme sur une évidence : nous ne sommes plus les seuls à "penser". Mais c'est à nous qu'il revient, plus que jamais, de penser ce que nous faisons penser aux machines.
                </p>
              </section>
            </div>

            {/* Vidéo Episode 2 */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl aspect-video">
                <video 
                  ref={video2Ref}
                  controls 
                  className="w-full h-full"
                  poster="/img/formation/forma_keos.jpg"
                >
                  <source src="/video/CULTURE DE L'IA - Episode 2.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
                
                {/* Overlay avec affiche élégante */}
                {!isVideo2Playing && (
                  <div 
                    className="absolute inset-0 cursor-pointer group overflow-hidden"
                    onClick={handlePlayVideo2}
                  >
                    {/* Fond dégradé élégant */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#032622] via-[#1a4d42] to-black"></div>
                    
                    {/* Texture subtile */}
                    <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107, 142, 35, 0.3) 0%, transparent 50%)',
                    }}></div>
                    
                    {/* Contenu affiche */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-8">
                      {/* Titre de l'épisode */}
                      <div className="text-center space-y-4 transform group-hover:scale-105 transition-transform duration-300">
                        <p className="text-[#6B8E23] text-sm font-bold uppercase tracking-[0.2em] drop-shadow-lg">
                          Épisode 2
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-xl" style={{ fontFamily: "var(--font-termina-bold)" }}>
                          Les Fondations Historiques
                        </h2>
                        <p className="text-[#F8F5E4] text-base opacity-90 max-w-md mx-auto leading-relaxed drop-shadow-lg">
                          Du Test de Turing aux réseaux de neurones: la renaissance de l'IA
                    </p>
                  </div>
                      
                      {/* Bouton play */}
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          {/* Anneau extérieur animé */}
                          <div className="absolute inset-0 rounded-full bg-[#6B8E23]/30 animate-pulse" style={{ transform: 'scale(1.3)' }}></div>
                          
                          {/* Bouton play principal */}
                          <button 
                            className="relative w-20 h-20 rounded-full bg-[#6B8E23] shadow-2xl flex items-center justify-center transform group-hover:scale-125 group-hover:shadow-[0_0_40px_rgba(107,142,35,0.6)] transition-all duration-300 border-4 border-[#F8F5E4]/20 backdrop-blur-sm"
                          >
                            <svg className="w-8 h-8 text-white ml-0.5 fill-current drop-shadow-lg" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                </div>
                
                        {/* Texte d'action */}
                        <span className="text-[#F8F5E4] text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Cliquez pour regarder
                    </span>
                  </div>
                  </div>
                    
                    {/* Ligne de séparation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6B8E23] to-transparent"></div>
                </div>
                )}
              </div>
              <div className="absolute top-4 left-4 bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                  Épisode 2 - Culture de l'IA
                    </span>
              </div>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie1_3")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizPartie1Answers({});
                setShowQuizResults(false);
                setStep("quizPartie1");
              }}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>QUIZ PARTIE 1</span>
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 12 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 1</span>
                <span className="font-bold">100%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Partie 1 terminée ! Prêt pour le quiz ?
              </p>
            </div>
          </div>

          {/* Quiz Préparation */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Préparez le quiz</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2 text-xs text-[#032622]">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#6B8E23] mt-0.5 flex-shrink-0" />
                  <span>10 questions à choix multiples</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#6B8E23] mt-0.5 flex-shrink-0" />
                  <span>Temps recommandé : 15 min</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-[#6B8E23] mt-0.5 flex-shrink-0" />
                  <span>Score minimum : 70%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aide-mémoire */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Aide-mémoire</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Test de Turing</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">IA générative</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Transformers</span>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu introduction Partie 2
  const renderPartie2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie1_3_suite")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}
      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 2
            </p>

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 2 — L'IMPACT ÉCONOMIQUE ET ORGANISATIONNEL DE L'IA
            </h3>

            <h4 className="text-xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              DE L'ENTREPRISE AUX NOUVELLES INDUSTRIES
            </h4>

            <div className="space-y-6 text-base text-[#032622] leading-relaxed">
              <p>
                L'intelligence artificielle n'est plus un objet de laboratoire, ni un sujet de science-fiction : c'est une réalité économique mondiale. En moins de vingt ans, elle est devenue la colonne vertébrale de l'économie numérique, un moteur de productivité, de compétitivité et de transformation organisationnelle. Mais au-delà des chiffres et des algorithmes, elle impose une question cruciale : que devient le travail humain dans un monde où la machine apprend à raisonner ?
              </p>
              <p>
                L'histoire des révolutions industrielles a toujours été celle d'un dialogue entre technologie et travail. Au XIXᵉ siècle, la machine à vapeur a transformé les gestes de l'ouvrier ; au XXᵉ, l'informatique a transformé les méthodes du cadre. Au XXIᵉ siècle, l'intelligence artificielle transforme la fonction même de l'intelligence dans l'entreprise. Elle automatise des tâches, mais surtout, elle redistribue les rôles cognitifs : décision, analyse, anticipation, relation client, gestion des risques — tout devient assisté, amplifié, parfois délégué.
              </p>
              <p>
                Cette mutation est déjà visible. Selon le cabinet McKinsey (2023), 70 % des entreprises mondiales utilisent au moins une forme d'intelligence artificielle dans leurs processus internes. Et ce n'est qu'un début. Car si l'IA a commencé par l'automatisation, elle s'impose désormais comme une partenaire stratégique capable d'optimiser la production, d'améliorer la qualité de service et d'accompagner les collaborateurs dans leurs missions quotidiennes.
              </p>
              <p>
                Mais cette révolution ne se limite pas à la performance. Elle redéfinit la valeur du travail, la place du manager et la notion même de compétence. Elle impose une question inédite dans l'histoire économique : comment rester humainement indispensable dans un monde où la machine raisonne, apprend et crée plus vite que nous ?
              </p>
            </div>

            {/* Vidéo Episode 3 - Introduction Partie 2 */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl aspect-video">
                <video 
                  ref={video3Ref}
                  controls 
                  className="w-full h-full"
                  poster="/img/formation/forma_keos.jpg"
                >
                  <source src="/video/CULTURE DE L'IA - Episode 3.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
                
                {/* Overlay avec affiche élégante */}
                {!isVideo3Playing && (
                  <div 
                    className="absolute inset-0 cursor-pointer group overflow-hidden"
                    onClick={handlePlayVideo3}
                  >
                    {/* Fond dégradé élégant */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#032622] via-[#1a4d42] to-black"></div>
                    
                    {/* Texture subtile */}
                    <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107, 142, 35, 0.3) 0%, transparent 50%)',
                    }}></div>
                    
                    {/* Contenu affiche */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-8">
                      {/* Titre de l'épisode */}
                      <div className="text-center space-y-4 transform group-hover:scale-105 transition-transform duration-300">
                        <p className="text-[#6B8E23] text-sm font-bold uppercase tracking-[0.2em] drop-shadow-lg">
                          Épisode 3
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-xl" style={{ fontFamily: "var(--font-termina-bold)" }}>
                          L'Impact Économique
                        </h2>
                        <p className="text-[#F8F5E4] text-base opacity-90 max-w-md mx-auto leading-relaxed drop-shadow-lg">
                          Comment l'IA redéfinit la valeur économique et le marché du travail
                        </p>
                      </div>
                      
                      {/* Bouton play */}
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          {/* Anneau extérieur animé */}
                          <div className="absolute inset-0 rounded-full bg-[#6B8E23]/30 animate-pulse" style={{ transform: 'scale(1.3)' }}></div>
                          
                          {/* Bouton play principal */}
                          <button 
                            className="relative w-20 h-20 rounded-full bg-[#6B8E23] shadow-2xl flex items-center justify-center transform group-hover:scale-125 group-hover:shadow-[0_0_40px_rgba(107,142,35,0.6)] transition-all duration-300 border-4 border-[#F8F5E4]/20 backdrop-blur-sm"
                          >
                            <svg className="w-8 h-8 text-white ml-0.5 fill-current drop-shadow-lg" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Texte d'action */}
                        <span className="text-[#F8F5E4] text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Cliquez pour regarder
                        </span>
                      </div>
                    </div>
                    
                    {/* Ligne de séparation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6B8E23] to-transparent"></div>
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4 bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                  Épisode 3 - Impact Économique de l'IA
                </span>
              </div>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie1_3_suite")}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>RETOUR PARTIE 1</span>
            </button>
            <button
              onClick={() => setShowQuizModal(true)}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie2_1")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 8 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 2</span>
                <span className="font-bold">0%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Début de la Partie 2
              </p>
            </div>
          </div>

          {/* Thèmes Partie 2 */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Au programme</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start space-x-2 text-xs text-[#032622]">
                <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-[#6B8E23]" />
                <span>Impact économique de l'IA</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-[#032622]">
                <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-[#6B8E23]" />
                <span>L'entreprise cognitive</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-[#032622]">
                <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-[#6B8E23]" />
                <span>Transformation du travail</span>
              </div>
            </div>
          </div>

          {/* Ressources Partie 2 */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-2">
              <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="underline">Étude McKinsey : IA en entreprise</span>
              </a>
              <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="underline">Cas Tesla : entreprise cognitive</span>
              </a>
            </div>
          </div>

          {/* Cas d'études */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Cas d'études</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Tesla</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Goldman Sachs</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">IBM Watson Health</span>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Partie 2.1
  const renderPartie2_1 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie2")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}
      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 2.1
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 2 — L'IMPACT ÉCONOMIQUE ET ORGANISATIONNEL DE L'IA
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              2.1. L'IA dans le monde du travail : automatisation, productivité et nouveaux métiers
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">Une continuité historique : de l'automatisation mécanique à l'automatisation cognitive</h5>
                <p>
                  Pour comprendre ce qui se joue aujourd'hui, il faut replacer l'intelligence artificielle dans la grande histoire du travail. Chaque révolution technologique a libéré l'humain d'une contrainte — physique, temporelle ou intellectuelle — tout en créant de nouvelles dépendances.
                </p>
                <p>
                  La révolution industrielle du XIXᵉ siècle a remplacé la force musculaire par la puissance mécanique. L'ouvrier a appris à travailler avec des machines, puis à les contrôler. La révolution numérique du XXᵉ siècle a remplacé la lenteur administrative par la vitesse du traitement de l'information. L'employé a appris à collaborer avec des ordinateurs, à manipuler des données, à gérer des flux.
                </p>
                <p>
                  Aujourd'hui, avec l'intelligence artificielle, une nouvelle étape s'ouvre : la révolution cognitive. Ce n'est plus le corps ou le geste qui est délégué à la machine, mais une partie du raisonnement. L'IA devient capable de comprendre un texte, de prédire une tendance, de détecter une anomalie ou même de formuler une recommandation.
                </p>
                <p>
                  Cette évolution ne signifie pas la disparition de l'humain. Elle rappelle plutôt une constante : à chaque étape de l'histoire du travail, l'humain déplace sa valeur. Quand la machine prend en charge l'exécution, il se recentre sur l'analyse. Quand elle prend l'analyse, il se concentre sur la vision. Le travail change, mais il ne disparaît pas. Il devient plus abstrait, plus relationnel, plus créatif — à condition d'être réinventé.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">L'automatisation intelligente : quand la machine apprend à décider</h5>
                <p>
                  L'automatisation n'est pas nouvelle, mais l'IA lui donne une nouvelle dimension. Jusqu'ici, une machine exécutait des tâches selon un programme fixe. Désormais, elle apprend de ses erreurs, s'adapte aux situations, optimise ses performances sans qu'on la reprogramme. C'est ce qu'on appelle l'automatisation intelligente.
                </p>
                <p>
                  Prenons un exemple concret : la gestion logistique. Autrefois, elle reposait sur des plannings rigides et des modèles prévisionnels établis à la main. Aujourd'hui, les grandes chaînes de distribution comme Amazon ou Carrefour utilisent des IA capables d'ajuster les stocks en temps réel en fonction des ventes, de la météo, ou même des tendances sur les réseaux sociaux. Le système apprend à prévoir les besoins avant qu'ils n'existent.
                </p>
                <p>
                  Dans les usines, les machines dotées de capteurs et de modèles d'apprentissage pratiquent la maintenance prédictive : elles détectent les pannes avant qu'elles ne surviennent. Chez General Electric ou Siemens, cette approche a permis de réduire les arrêts de production de plus de 30 %. La logique est simple : on ne répare plus après coup, on anticipe.
                </p>
                <p>
                  Même la finance s'est transformée. Les grands fonds d'investissement utilisent désormais des IA capables d'analyser en quelques secondes des millions de données économiques, politiques ou sociales pour ajuster une stratégie boursière. En 2022, plus de 65 % des transactions sur les marchés financiers mondiaux étaient effectuées par des algorithmes d'apprentissage.
                </p>
                <p>
                  Ces exemples montrent que l'intelligence artificielle ne remplace pas les métiers : elle modifie les processus. L'humain devient superviseur, interprète, régulateur. L'IA exécute à la vitesse de la lumière, mais c'est encore l'humain qui choisit la direction.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">📈 L'impact sur la productivité : entre promesse et paradoxe</h5>
                <p>
                  L'intelligence artificielle est souvent présentée comme une garantie de productivité accrue. Les chiffres semblent lui donner raison : selon Accenture, les entreprises ayant intégré des systèmes d'IA dans leurs processus internes ont vu leur productivité augmenter de 20 à 40 % en moyenne. Mais cette performance cache une réalité plus nuancée.
                </p>
                <p>
                  L'efficacité de l'IA dépend moins de la technologie elle-même que de la culture organisationnelle dans laquelle elle s'insère. Une entreprise rigide, peu ouverte à la collaboration ou à l'expérimentation, tirera peu de bénéfices d'un système intelligent. À l'inverse, une organisation apprenante — capable d'adapter ses méthodes, de valoriser les compétences hybrides et de déléguer la prise de décision — exploitera pleinement la puissance des algorithmes.
                </p>
              </section>
            </div>

            {/* Image Améliorer IA */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/AMELIORER-IA.jpg"
                  alt="Améliorer l'IA en entreprise"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            {/* Suite du contenu après l'image */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <p>
                L'autre paradoxe de la productivité réside dans la charge cognitive qu'apporte l'IA. Automatiser des tâches ne signifie pas toujours simplifier le travail. De nombreux cadres déclarent aujourd'hui passer plus de temps à vérifier, interpréter et valider les résultats produits par les systèmes d'IA qu'à effectuer leurs missions initiales. L'IA crée une nouvelle forme de travail invisible : le travail de supervision algorithmique.
              </p>
              <p>
                Ainsi, l'enjeu n'est pas seulement de produire plus vite, mais de produire plus intelligemment. La productivité du futur ne se mesurera pas en volume d'exécution, mais en qualité de décision. Et sur ce terrain, la complémentarité homme-machine devient la clé de toute stratégie performante.
              </p>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">L'émergence des métiers hybrides : l'humain augmenté</h5>
                <p>
                  L'IA ne détruit pas le travail, elle le recompose. À mesure qu'elle automatise certaines fonctions, elle en fait émerger de nouvelles, souvent à l'intersection de plusieurs disciplines. C'est ce que les chercheurs appellent les métiers hybrides : des rôles où la compréhension technique, la créativité et la responsabilité humaine s'entremêlent.
                </p>
                <p>
                  Le data analyst et le data scientist en sont les premiers exemples : des professionnels capables de transformer la donnée brute en connaissance stratégique. Mais de nouveaux profils apparaissent à un rythme rapide : le prompt engineer, spécialiste du dialogue avec les IA génératives ; le responsable éthique IA, garant de la transparence des algorithmes ; ou encore le formateur de modèles, chargé de corriger les biais dans les systèmes d'apprentissage.
                </p>
                <p>
                  Selon le World Economic Forum (2023), plus de 97 millions de nouveaux emplois liés à l'intelligence artificielle pourraient être créés dans le monde d'ici 2030, tandis que près de 80 millions disparaîtront. Ce n'est pas une disparition du travail, mais un repositionnement massif. Le salarié de demain devra être capable de comprendre l'IA, non pas pour la programmer, mais pour collaborer avec elle.
                </p>
                <p>
                  C'est là que se joue la véritable mutation : l'IA ne remplace pas les humains, elle modifie la nature même de leurs compétences. Les savoirs techniques cèdent la place aux savoirs cognitifs : analyse, créativité, empathie, sens critique. Autrement dit, plus la machine devient intelligente, plus l'humain doit devenir cultivé.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Conclusion</h5>
                <p>
                  L'intelligence artificielle n'a pas supprimé le travail, elle a transformé sa signification. Nous sommes passés d'un modèle centré sur l'effort et la répétition à un modèle fondé sur l'interprétation et la supervision. Le travail n'est plus seulement une production de valeur, mais une interaction permanente avec un système intelligent.
                </p>
                <p>
                  L'entreprise moderne n'oppose plus l'homme à la machine : elle les fait coopérer. Et cette coopération ne se limite pas à la productivité ; elle touche désormais le cœur du management, de la stratégie et du leadership.
                </p>
                <p className="font-semibold italic">
                  Car si l'intelligence artificielle apprend à raisonner, l'humain doit apprendre à donner du sens. C'est ce que nous allons explorer dans la suite de cette partie, à travers la transformation du modèle économique et organisationnel des entreprises : comment l'IA change non seulement ce que l'on produit, mais la manière dont on pense l'entreprise elle-même.
                </p>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie2")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie2_2")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 16 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 2</span>
                <span className="font-bold">33%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '33%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                1 module complété sur 3
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-2">
              <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="underline">Rapport MIT : Futur du travail</span>
              </a>
              <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="underline">Étude : IA et productivité</span>
              </a>
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Chiffres clés</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-xs text-[#032622]">
                <p className="font-bold text-[#6B8E23] text-base">70%</p>
                <p className="opacity-70">des entreprises utilisent l'IA</p>
              </div>
              <div className="text-xs text-[#032622]">
                <p className="font-bold text-[#6B8E23] text-base">+15%</p>
                <p className="opacity-70">de gains de productivité</p>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Rendu Partie 2.2
  const renderPartie2_2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie2_1")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 2.2
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 2 — L'IMPACT ÉCONOMIQUE ET ORGANISATIONNEL DE L'IA
            </h3>
            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              2.2. L'entreprise cognitive : un nouveau modèle économique
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <p>
                  L'intelligence artificielle n'a pas seulement changé la manière de produire, elle transforme en profondeur la logique économique qui sous-tend l'entreprise. Nous sommes en train de passer d'une économie industrielle — fondée sur la matière, la main-d'œuvre et le capital — à une économie cognitive, où la donnée, la connaissance et la capacité d'apprentissage deviennent les principales sources de valeur.
                </p>
                <p>
                  Autrement dit, l'entreprise n'est plus un simple lieu de production : elle devient un système d'intelligence. Ses ressources ne se mesurent plus seulement en machines ou en budgets, mais en quantité et qualité d'informations traitées, analysées, comprises et réinvesties dans la décision. C'est un changement de paradigme comparable à celui du passage du charbon à l'électricité au XIXᵉ siècle.
                </p>
                <p>
                  Ce nouveau modèle repose sur un principe simple mais révolutionnaire :
                </p>
                <p className="italic text-center font-bold text-xl border-l-4 border-[#032622] pl-4">
                  "Plus une entreprise apprend vite, plus elle vaut cher."
                </p>
                <p>
                  L'intelligence artificielle, en analysant en temps réel des milliards de données, transforme l'entreprise en organisme vivant, capable d'évoluer, d'anticiper et de s'adapter.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">De l'entreprise productrice à l'entreprise apprenante</h5>
                <p>
                  Pendant longtemps, la performance d'une entreprise dépendait de sa capacité à produire plus vite, moins cher, avec des marges mieux maîtrisées. Mais dans un monde saturé d'offres et d'informations, la compétitivité ne se joue plus uniquement sur la production, mais sur la capacité à comprendre le marché avant les autres.
                </p>
                <p>
                  L'IA permet justement de franchir cette étape. Une entreprise équipée de systèmes intelligents peut désormais :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>détecter une tendance émergente avant qu'elle ne devienne visible,</li>
                  <li>anticiper une rupture dans les comportements de consommation,</li>
                  <li>ajuster ses prix en fonction des réactions du marché,</li>
                  <li>personnaliser chaque interaction client à grande échelle.</li>
                </ul>
                <p>
                  Ce passage d'un modèle industriel à un modèle cognitif redéfinit les priorités. Le centre de gravité de la performance se déplace du "faire" vers le "comprendre". Les usines laissent la place aux écosystèmes de données ; les hiérarchies rigides à des réseaux apprenants où les décisions se prennent plus rapidement et de manière plus distribuée.
                </p>
                <p>
                  L'entreprise devient un système vivant : elle observe, mémorise, interprète, puis agit. Et comme tout organisme, sa survie dépend de sa capacité à s'adapter à son environnement.
                </p>
                <p>
                  Un exemple illustre parfaitement ce basculement : Netflix. L'entreprise n'a pas seulement révolutionné le cinéma en ligne ; elle a inventé un modèle d'organisation entièrement fondé sur la donnée. Chaque clic, chaque pause, chaque abandon de série est analysé pour ajuster la production et la recommandation. Netflix ne "devine" pas les goûts du public, elle les apprend. Sa stratégie de contenu repose sur l'analyse prédictive : la plateforme commande une série quand les signaux montrent que le public la désire — parfois avant même qu'il ne le sache lui-même.
                </p>
              </section>
            </div>

            {/* Image Suprématie Big Tech */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/SUPREMACIEDESBIGTECH.jpg"
                  alt="La suprématie des Big Tech"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Suite du contenu après l'image */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <p>
                Dans l'économie cognitive, la donnée devient le capital le plus précieux. Elle remplace les machines et les usines comme source principale de valeur. Mais contrairement à un actif matériel, la donnée ne s'épuise pas : elle se multiplie à chaque utilisation. Plus une entreprise interagit, plus elle apprend, et plus elle devient performante.
              </p>
              <p>
                Cette logique crée un avantage structurel pour les grandes plateformes : plus on a d'utilisateurs, plus on a de données ; plus on a de données, plus on améliore ses services ; plus on améliore ses services, plus on attire d'utilisateurs. C'est le cercle vertueux du numérique, parfois appelé "effet boule de neige algorithmique".
              </p>
              <p>
                Les GAFAM (Google, Amazon, Facebook, Apple, Microsoft) en sont l'exemple le plus spectaculaire. Leur puissance économique ne repose pas uniquement sur leurs produits, mais sur leur maîtrise des données comportementales de milliards d'individus. Google, par exemple, effectue plus de 8,5 milliards de recherches par jour ; chaque recherche affine un peu plus son modèle de compréhension du langage et de l'intention humaine. Amazon, de son côté, sait non seulement ce que vous achetez, mais aussi ce que vous hésitez à acheter. Cette connaissance fine, invisible, devient une richesse monétisable.
              </p>
              <p>
                Mais cette concentration crée aussi des déséquilibres. Les données sont devenues une ressource stratégique mondiale, au même titre que le pétrole au XXᵉ siècle. Elles sont extraites, stockées, vendues, parfois même spéculées. C'est pourquoi certains économistes parlent aujourd'hui d'un "capitalisme de la donnée", où la ressource la plus rare n'est plus l'énergie, mais la confiance.
              </p>
            </div>
            {/* Vidéo YouTube */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/XF1FJ-nptyc?si=Njs77YTiNn21r47m" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie2_1")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie2_2_suite")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 12 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 2</span>
                <span className="font-bold">67%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '67%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                2 modules complétés sur 3
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Entreprises à connaître */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Entreprises phares</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-xs text-[#032622]">
                <p className="font-bold">Tesla</p>
                <p className="opacity-70 text-[10px]">Apprentissage continu</p>
              </div>
              <div className="text-xs text-[#032622]">
                <p className="font-bold">Carrefour</p>
                <p className="opacity-70 text-[10px]">Data Factory</p>
              </div>
              <div className="text-xs text-[#032622]">
                <p className="font-bold">Siemens</p>
                <p className="opacity-70 text-[10px]">Industrie 4.0</p>
              </div>
            </div>
          </div>

          {/* Concepts essentiels */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Concepts essentiels</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Entreprise cognitive</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Capteur roulant</span>
              </div>
              <div className="bg-white border border-[#032622]/30 px-3 py-2 text-xs text-[#032622]">
                <span className="font-bold">Data-driven</span>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Rendu Partie 2.2 Suite
  const renderPartie2_2_Suite = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie2_2")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 2.2 (suite)
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 2 — L'IMPACT ÉCONOMIQUE ET ORGANISATIONNEL DE L'IA
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              2.2. L'entreprise cognitive (suite)
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">L'entreprise cognitive en pratique : un modèle en quatre dimensions</h5>
                <p>
                  Une entreprise dite "cognitive" ne se définit pas par la possession d'algorithmes, mais par la manière dont elle articule la donnée, la technologie et la décision humaine. Son modèle repose sur quatre dimensions principales :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>La perception</strong> : capter en permanence les signaux internes et externes (clients, marché, environnement).</li>
                  <li><strong>La mémoire</strong> : stocker et organiser les données de manière cohérente et interopérable.</li>
                  <li><strong>L'analyse</strong> : extraire du sens à partir des masses d'informations disponibles.</li>
                  <li><strong>L'action</strong> : transformer ces connaissances en décisions concrètes, parfois automatisées, souvent collaboratives.</li>
                </ul>
                <p>
                  Prenons l'exemple de Tesla, entreprise emblématique de cette approche. Chaque véhicule Tesla est équipé de capteurs qui envoient en continu des données à la centrale de l'entreprise. Ces informations alimentent les modèles d'IA qui améliorent les systèmes de conduite autonome, la gestion de l'énergie et la maintenance prédictive. Chaque voiture devient ainsi un capteur roulant, contribuant à l'apprentissage global du système. Le résultat : plus il y a de Teslas sur la route, plus le réseau s'améliore — et plus l'avantage concurrentiel de l'entreprise grandit.
                </p>
              </section>
            </div>

            {/* Vidéo Episode 4 - Entreprise Cognitive */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl aspect-video">
                <video 
                  ref={video4Ref}
                  controls 
                  className="w-full h-full"
                  poster="/img/formation/forma_keos.jpg"
                >
                  <source src="/video/CULTURE DE L'IA - Episode 4.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
                
                {/* Overlay avec affiche élégante */}
                {!isVideo4Playing && (
                  <div 
                    className="absolute inset-0 cursor-pointer group overflow-hidden"
                    onClick={handlePlayVideo4}
                  >
                    {/* Fond dégradé élégant */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#032622] via-[#1a4d42] to-black"></div>
                    
                    {/* Texture subtile */}
                    <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(107, 142, 35, 0.3) 0%, transparent 50%)',
                    }}></div>
                    
                    {/* Contenu affiche */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-8">
                      {/* Titre de l'épisode */}
                      <div className="text-center space-y-4 transform group-hover:scale-105 transition-transform duration-300">
                        <p className="text-[#6B8E23] text-sm font-bold uppercase tracking-[0.2em] drop-shadow-lg">
                          Épisode 4
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-xl" style={{ fontFamily: "var(--font-termina-bold)" }}>
                          L'Entreprise Cognitive
                        </h2>
                        <p className="text-[#F8F5E4] text-base opacity-90 max-w-md mx-auto leading-relaxed drop-shadow-lg">
                          Vers une nouvelle vision de l'intelligence organisationnelle
                    </p>
                  </div>
                      
                      {/* Bouton play */}
                      <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                          {/* Anneau extérieur animé */}
                          <div className="absolute inset-0 rounded-full bg-[#6B8E23]/30 animate-pulse" style={{ transform: 'scale(1.3)' }}></div>
                          
                          {/* Bouton play principal */}
                          <button 
                            className="relative w-20 h-20 rounded-full bg-[#6B8E23] shadow-2xl flex items-center justify-center transform group-hover:scale-125 group-hover:shadow-[0_0_40px_rgba(107,142,35,0.6)] transition-all duration-300 border-4 border-[#F8F5E4]/20 backdrop-blur-sm"
                          >
                            <svg className="w-8 h-8 text-white ml-0.5 fill-current drop-shadow-lg" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                </div>
                
                        {/* Texte d'action */}
                        <span className="text-[#F8F5E4] text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Cliquez pour regarder
                    </span>
                  </div>
                  </div>
                    
                    {/* Ligne de séparation */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6B8E23] to-transparent"></div>
                </div>
                )}
              </div>
              <div className="absolute top-4 left-4 bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                  Épisode 4 - Entreprise Cognitive
                    </span>
            </div>
            </div>
            {/* Suite du contenu */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <p>
                Le même principe s'applique dans la finance (Goldman Sachs), la santé (IBM Watson Health), la grande distribution (Carrefour Data Factory) ou l'industrie (Siemens, Airbus). Les entreprises les plus performantes ne sont plus celles qui produisent le plus, mais celles qui comprennent le mieux.
              </p>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Le rôle du manager dans l'entreprise cognitive</h5>
                <p>
                  Cette mutation économique entraîne un bouleversement managérial. Le rôle du manager n'est plus de contrôler l'exécution, mais de piloter l'intelligence collective. Il devient un médiateur entre l'humain et la machine, un chef d'orchestre de la donnée et de la compréhension.
                </p>
                <p>
                  Le manager du XXIᵉ siècle doit maîtriser trois compétences clés :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>la <strong>littératie numérique</strong> (savoir lire et interpréter les données),</li>
                  <li>la <strong>littératie émotionnelle</strong> (savoir accompagner les équipes dans ce changement),</li>
                  <li>et la <strong>littératie stratégique</strong> (savoir transformer l'information en décision).</li>
                </ul>
                <p>
                  Dans une entreprise cognitive, les hiérarchies s'aplatissent : la décision n'est plus seulement verticale, elle devient réseau. Les outils d'analyse prédictive, de gestion intelligente ou de visualisation de données permettent à chaque niveau de l'organisation d'agir avec plus d'autonomie. Mais cette autonomie ne fonctionne que si la culture d'entreprise valorise la curiosité et la responsabilité.
                </p>
                <p>
                  C'est pourquoi la transition vers le modèle cognitif n'est pas seulement technologique : elle est culturelle. Elle demande aux entreprises de repenser leur rapport au savoir, à la confiance et à l'erreur. Une IA ne donne pas toujours raison — elle propose des scénarios. C'est à l'humain de les interpréter.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Les défis et limites du modèle cognitif</h5>
                <p>
                  Comme toute révolution, celle-ci s'accompagne de tensions. L'entreprise cognitive doit gérer un double paradoxe :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>plus elle automatise, plus elle dépend des algorithmes qu'elle ne maîtrise pas totalement ;</li>
                  <li>plus elle apprend vite, plus elle risque d'oublier de réfléchir lentement.</li>
                </ul>
                <p>
                  Les biais de données, les erreurs d'interprétation et les risques éthiques sont réels. Une entreprise qui confie entièrement sa stratégie à la machine perd son autonomie intellectuelle. C'est pourquoi la gouvernance des algorithmes devient un enjeu majeur : comment vérifier, expliquer et corriger les décisions prises par une IA ?
                </p>
                <p>
                  Les régulations européennes, à travers le AI Act (2024), imposent déjà des obligations de transparence et de traçabilité pour les systèmes à fort impact économique. Mais au-delà du cadre juridique, c'est un nouveau pacte de confiance qu'il faut instaurer entre technologie et organisation. L'intelligence artificielle ne remplacera jamais la stratégie humaine ; elle en amplifie simplement la portée.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Conclusion</h5>
                <p>
                  L'entreprise cognitive incarne le visage économique de la révolution de l'intelligence artificielle. Elle n'est plus seulement une organisation productive, mais un système apprenant capable de transformer la connaissance en avantage compétitif. Dans ce modèle, la donnée est la ressource, l'algorithme le moteur et la culture humaine la boussole.
                </p>
                <p>
                  Mais cette transformation ne s'arrête pas à la structure économique : elle touche aussi la manière de travailler ensemble. Le management, les relations humaines, le leadership et la créativité doivent s'adapter à ce nouvel équilibre entre automatisation et humanité.
                </p>
                <p className="font-semibold italic">
                  C'est ce que nous explorerons dans la section suivante, consacrée à l'impact de l'intelligence artificielle sur la société des services et de la création, où les algorithmes ne se contentent plus d'optimiser — ils influencent et inspirent.
                </p>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie2_2")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie2_3")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 12 min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Partie 2.3
  const renderPartie2_3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie2_2_suite")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 2.3
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 2 — L'IMPACT ÉCONOMIQUE ET ORGANISATIONNEL DE L'IA
            </h3>
            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              2.3. L'IA dans la société des services et des contenus
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <p>
                  L'intelligence artificielle n'est plus seulement une technologie d'entreprise : elle est devenue le tissu invisible de la vie quotidienne. Chaque fois que nous regardons une série, écoutons une chanson, achetons un produit ou lisons un article en ligne, un algorithme influence notre expérience. Il sélectionne, trie, hiérarchise, personnalise.
                </p>
                <p>
                  C'est peut-être là que l'impact de l'IA est le plus massif et le plus discret : dans la façon dont elle structure nos choix. Les entreprises de services et de contenus — plateformes de streaming, moteurs de recherche, sites e-commerce, médias, applications sociales — utilisent des modèles prédictifs pour anticiper nos désirs avant même que nous les exprimions. Le résultat ? Une économie qui ne repose plus sur la production d'objets, mais sur la production d'expériences.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Le marketing prédictif : de la segmentation à l'individualisation</h5>
                <p>
                  Pendant des décennies, le marketing a reposé sur des catégories : âge, sexe, revenu, localisation. Mais ces critères grossiers ne suffisent plus dans un monde où chaque clic révèle une intention. L'intelligence artificielle permet de passer d'une logique de segmentation à une logique d'individualisation.
                </p>
                <p>
                  Les algorithmes analysent aujourd'hui des millions de signaux comportementaux : les recherches, les temps de lecture, les produits ajoutés au panier puis abandonnés, les vidéos regardées jusqu'à la fin, ou stoppées à mi-chemin. Chacun de ces micro-gestes alimente un profil dynamique, mis à jour en temps réel.
                </p>
                <p>
                  Prenons l'exemple de Spotify. Chaque semaine, son algorithme Discover Weekly crée pour plus de 600 millions d'utilisateurs une playlist unique, adaptée à leurs goûts, mais aussi à leur humeur du moment. Le modèle ne se contente pas de reproduire : il apprend continuellement des comportements similaires dans le monde entier. Deux personnes écoutant la même chanson ne recevront pas les mêmes recommandations, car le contexte émotionnel détecté par l'IA diffère.
                </p>
                <p>
                  Autre exemple : Amazon, pionnier de la recommandation personnalisée. Dès 2003, l'entreprise introduit des systèmes de filtrage collaboratif capables de croiser les achats de millions de consommateurs. Aujourd'hui, plus de 35 % des ventes d'Amazon proviennent directement de ses suggestions automatiques. Ces algorithmes, invisibles mais redoutablement efficaces, façonnent le commerce mondial autant que les vitrines des grandes marques du XXᵉ siècle.
                </p>
                <p>
                  Mais cette personnalisation extrême soulève aussi une question culturelle : Si tout le monde voit un monde différent, que reste-t-il du collectif ? L'IA prédictive fragmente nos expériences — elle nous isole dans des bulles d'affinité, confortables mais parfois étroites. C'est le paradoxe du marketing intelligent : plus il connaît nos désirs, plus il risque de réduire notre horizon.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">L'IA dans les médias et le divertissement : l'économie de l'attention</h5>
                <p>
                  Les plateformes de contenus comme Netflix, TikTok ou YouTube ont bâti leur empire sur une ressource rare : notre temps d'attention. Chaque seconde passée à regarder, cliquer, scroller est mesurée, analysée, optimisée. L'IA devient ici un véritable chef d'orchestre émotionnel.
                </p>
              </section>
            </div>

            {/* Vidéo YouTube */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/NfJTqnxsw2Q?si=UuCKRmDvNYq9ryA6" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>

            {/* Suite du contenu après vidéo */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <p>
                Netflix, par exemple, ne se contente pas de recommander : il sculpte nos envies. Chaque visuel, chaque bande-annonce, chaque miniature de série est généré ou choisi par des modèles d'intelligence artificielle en fonction de votre profil. Si vous regardez des thrillers, la vignette d'un même film vous montrera une scène sombre ; si vous aimez les romances, elle vous proposera le même film, mais avec un couple enlacé. Tout est calculé pour maximiser la probabilité d'un clic.
              </p>
              <p>
                TikTok, de son côté, est devenu le symbole d'une IA "sensorielle". Son algorithme analyse la vitesse à laquelle vous faites défiler les vidéos, les pauses que vous marquez, les sons que vous aimez, la durée de votre regard sur un visage ou un décor. En quelques heures, il comprend vos goûts mieux qu'un ami. C'est ce qu'on appelle la captologie, la science de la captation de l'attention.
              </p>
              <p>
                Résultat : l'IA n'est plus seulement un outil de recommandation, mais une technologie du comportement. Elle ne se contente pas de répondre à nos attentes : elle les fabrique. Dans cette "économie de l'attention", les entreprises qui maîtrisent la donnée psychologique — les émotions, les rythmes, les signaux faibles — deviennent les nouvelles puissances culturelles.
              </p>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie2_2_suite")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie2_3_suite")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>MODULE SUIVANT</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 13 min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Partie 2.3 Suite
  const renderPartie2_3_Suite = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie2_3")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 2.3 (suite)
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 2 — L'IMPACT ÉCONOMIQUE ET ORGANISATIONNEL DE L'IA
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-6 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              2.3. L'IA dans la société des services (suite)
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">L'intelligence artificielle et la création : la machine devient muse</h5>
                <p>
                  Depuis 2022, une nouvelle frontière s'est ouverte : la création générative. Des outils comme Midjourney, DALL·E, Runway ou Sora permettent à quiconque de produire une œuvre à partir d'une simple phrase. En quelques secondes, un utilisateur peut créer un tableau, une affiche, une chanson, une vidéo. Cette démocratisation de la création bouleverse le monde artistique et professionnel.
                </p>
                <p>
                  L'histoire retiendra que 2023 a été l'année où les machines ont commencé à imaginer. En quelques mois, plus de 15 milliards d'images ont été générées par des IA créatives — soit plus que toute la production artistique humaine du siècle précédent. Des maisons de couture, comme Balenciaga, ont expérimenté des campagnes publicitaires créées à 100 % par IA. Des magazines comme Cosmopolitan ont publié des couvertures générées par DALL·E. Et des musiciens ont vu apparaître leurs "doubles vocaux" reproduits par des modèles de synthèse.
                </p>
              </section>
            </div>
            {/* Image musique1 */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/musique1.png"
                  alt="Création musicale par IA"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            {/* Suite du contenu après l'image */}
            <div className="space-y-6 text-base text-[#032622] leading-relaxed mt-8">
              <div className="border-l-4 border-[#032622] pl-6 py-4 bg-[#032622]/5">
                <p className="font-semibold mb-3">
                  Voici une musique créée par mes soins par l'IA :
                </p>
                <a 
                  href="https://suno.com/s/YForyMfOcDp9dYkx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#032622] underline hover:text-[#032622]/70 transition-colors font-medium"
                >
                  🎵 Écouter la création → https://suno.com/s/YForyMfOcDp9dYkx
                </a>
                <p className="mt-4 italic">
                  Sympa ? Oui mais soyons transparent, j'ai décidé de lui faire créer une musique de type électro-funk à la française, avec du chant (Allez disons, un mood à la Daft Punk). C'est certes, très impressionnant, mais est-ce de la réelle création ?
                </p>
              </div>

              <p>
                Mais la question essentielle n'est pas "l'IA peut-elle créer ?", c'est "pourquoi nous fascine-t-elle autant quand elle le fait ?". Cette fascination vient du miroir qu'elle tend à notre propre imagination. Elle imite nos styles, nos émotions, nos esthétiques et nous pousse à redéfinir ce qu'est la créativité humaine.
              </p>

              <p>
                Certains artistes voient dans cette technologie une menace, d'autres une alliée. Le photographe Hervé Lassince, par exemple, parle d'une "main digitale" :
              </p>

              <p className="italic text-center font-semibold text-lg border-l-4 border-[#032622] pl-4">
                "L'IA n'a pas de regard, mais elle m'oblige à mieux comprendre le mien."
              </p>

              <p>
                Ce rapport d'influence mutuelle — entre l'homme et la machine — devient le moteur d'une nouvelle ère esthétique : l'art augmenté.
              </p>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Vers une société personnalisée : confort ou contrôle ?</h5>
                <p>
                  L'IA promet une société plus fluide, où tout s'adapte à chacun : contenus, recommandations, itinéraires, soins médicaux, formations professionnelles. Cette promesse est séduisante — mais elle s'accompagne d'un prix invisible : la dépendance algorithmique.
                </p>
                <p>
                  À force d'être assistés, nous oublions parfois de choisir. À force d'être compris, nous cessons d'explorer. L'intelligence artificielle, en cherchant à nous simplifier la vie, risque de nous priver de la part de hasard et d'imprévu qui fait la richesse de l'expérience humaine.
                </p>
                <p>
                  Les philosophes et sociologues parlent d'un "paternalisme algorithmique" : un monde où la machine anticipe nos besoins avec tant d'efficacité qu'elle finit par décider à notre place. Le risque n'est plus la domination mécanique, mais la domestication cognitive : un monde parfaitement adapté, mais sans surprise.
                </p>
                <p>
                  Les entreprises du numérique, conscientes de ce danger, commencent à s'interroger sur la "transparence algorithmique" et la "diversité des contenus". Des plateformes comme YouTube testent désormais des options de "découverte aléatoire" pour sortir les utilisateurs de leurs bulles de recommandation. C'est un signe : la question n'est plus de savoir ce que l'IA peut faire, mais comment elle le fait — et à quel prix pour notre liberté intérieure.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">L'économie de la création augmentée : un nouveau paradigme culturel</h5>
                <p>
                  Ce basculement vers la personnalisation et la création algorithmique redéfinit les industries culturelles. Nous entrons dans une économie où la valeur ne réside plus dans la rareté d'une œuvre, mais dans l'expérience qu'elle procure à chacun. C'est la fin de la culture de masse et l'avènement d'une culture de micro-expériences.
                </p>
                <p>
                  Les marques, les médias et les artistes doivent apprendre à travailler avec ces nouveaux outils. Le scénariste devient concepteur d'univers narratifs interactifs ; le designer devient curateur d'images générées ; le communicant devient chef d'orchestre d'expériences immersives. Dans les agences, les services marketing ou les start-ups, l'IA n'est plus une option : elle est devenue la nouvelle grammaire de la création.
                </p>
                <p>
                  Et paradoxalement, plus la technologie progresse, plus la dimension humaine devient précieuse. Dans un monde saturé de contenus générés, l'émotion sincère, l'histoire authentique, le ton juste reprennent de la valeur. L'IA a nivelé la technique ; il ne reste plus que l'âme pour faire la différence.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">Conclusion de la Partie 2</h5>
                <p>
                  L'intelligence artificielle a transformé les services, les médias et la culture bien plus profondément que les industries elles-mêmes ne l'imaginent. Elle ne se contente plus d'optimiser les processus : elle influence nos comportements, façonne nos goûts et réécrit notre rapport à la création.
                </p>
                <p>
                  Nous vivons dans un monde où la technologie ne se contente plus de servir : elle participe à l'écriture de notre quotidien. Cette transformation pose une question fondamentale à la société contemporaine : comment préserver une culture humaine dans un environnement automatisé ?
                </p>
                <p className="font-semibold italic">
                  C'est à cette question que répondra la Partie 3, où nous explorerons les enjeux éthiques, sociétaux et philosophiques de cette révolution : jusqu'où peut-on déléguer notre intelligence — sans renoncer à notre humanité ?
                </p>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie2_3")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizPartie2Answers({});
                setShowQuizResults(false);
                setStep("quizPartie2");
              }}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>QUIZ PARTIE 2</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 21 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 15 min</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Événements à venir</p>
            </div>
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="border-b border-black p-4 bg-white/60 last:border-b-0">
                <div className="text-sm font-bold text-[#032622]">{event.title}</div>
                <div className="text-xs text-[#032622] opacity-80">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // Rendu Quiz Partie 1
  const renderQuizPartie1 = () => {
    const currentQuestion = quizPartie1Questions[currentQuizQuestion];
    const totalQuestions = quizPartie1Questions.length;
    const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;

    const handleAnswer = (answerIndex: number) => {
      setQuizPartie1Answers({
        ...quizPartie1Answers,
        [currentQuestion.id]: answerIndex
      });
    };

    const handleNext = () => {
      if (currentQuizQuestion < totalQuestions - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1);
      } else {
        // Calculer le score
        let score = 0;
        quizPartie1Questions.forEach(q => {
          if (quizPartie1Answers[q.id] === q.correctAnswer) {
            score++;
          }
        });
        setQuizScore(score);
        setShowQuizResults(true);
        setStep("resultsPartie1");
      }
    };

    const handlePrevious = () => {
      if (currentQuizQuestion > 0) {
        setCurrentQuizQuestion(currentQuizQuestion - 1);
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              QUIZ PARTIE 1
            </h2>
            <p className="text-lg text-[#032622]/70">
              Les origines et la renaissance de l'intelligence artificielle
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#032622]">
                Question {currentQuizQuestion + 1} sur {totalQuestions}
              </span>
              <span className="text-sm font-semibold text-[#032622]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-[#F8F5E4] border-2 border-[#032622] h-3 overflow-hidden">
              <div 
                className="h-full bg-[#032622] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="border-2 border-[#032622] bg-[#F8F5E4] p-8 shadow-2xl transform hover:scale-[1.01] transition-transform">
            <h3 className="text-2xl font-bold text-[#032622] mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizPartie1Answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#032622] bg-[#032622] text-white shadow-lg transform scale-105'
                        : 'border-[#032622] bg-white text-[#032622] hover:bg-[#032622]/10 hover:transform hover:translate-x-2'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-[#032622]'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[#032622]" />
                        )}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuizQuestion === 0}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-6 py-3 text-sm font-bold text-[#032622] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#032622] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>

            <button
              onClick={handleNext}
              disabled={quizPartie1Answers[currentQuestion.id] === undefined}
              className="border-2 border-[#032622] bg-[#032622] text-white px-6 py-3 text-sm font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors"
            >
              <span>{currentQuizQuestion === totalQuestions - 1 ? 'VOIR LES RÉSULTATS' : 'SUIVANT'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Résultats Partie 1
  const renderResultsPartie1 = () => {
    const totalQuestions = quizPartie1Questions.length;
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    
    const getEmoji = () => {
      if (percentage >= 90) return "A+";
      if (percentage >= 75) return "B+";
      if (percentage >= 50) return "C+";
      return "D";
    };

    const getMessage = () => {
      if (percentage >= 90) return "Excellent ! Vous maîtrisez parfaitement la Partie 1 !";
      if (percentage >= 75) return "Très bien ! Vous avez une bonne compréhension du sujet.";
      if (percentage >= 50) return "Pas mal ! Quelques révisions seraient bénéfiques.";
      return "Courage ! Relisez la Partie 1 pour mieux comprendre.";
    };
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-9xl font-black text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {getEmoji()}
            </div>
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              RÉSULTATS DU QUIZ
            </h2>
            <p className="text-2xl text-[#032622]/70">
              Partie 1 — Les origines de l'IA
            </p>
          </div>

          {/* Score Card */}
          <div className="border-4 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-12 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="text-center space-y-6">
              <div className="text-8xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                {quizScore}/{totalQuestions}
              </div>
              <div className="text-4xl font-bold text-[#032622]">
                {percentage}%
              </div>
              <p className="text-xl text-[#032622] font-medium">
                {getMessage()}
              </p>
            </div>
          </div>
          {/* Détails des réponses */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Détails des réponses
            </h3>
            {quizPartie1Questions.map((question, index) => {
              const userAnswer = quizPartie1Answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id}
                  className={`border-2 p-6 ${
                    isCorrect ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#032622] mb-2">
                        Question {index + 1}: {question.question}
                      </p>
                      <p className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Votre réponse : {userAnswer !== undefined && userAnswer !== null ? question.options[userAnswer] : "Non répondu"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-2">
                          Bonne réponse : {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-[#032622]/70 italic">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizPartie1Answers({});
                setShowQuizResults(false);
                setStep("quizPartie1");
              }}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              REFAIRE LE QUIZ
            </button>
            <button
              onClick={() => setStep("partie2")}
              className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
            >
              <span>CONTINUER VERS PARTIE 2</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Quiz Partie 2
  const renderQuizPartie2 = () => {
    const currentQuestion = quizPartie2Questions[currentQuizQuestion];
    const totalQuestions = quizPartie2Questions.length;
    const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;

    const handleAnswer = (answerIndex: number) => {
      setQuizPartie2Answers({
        ...quizPartie2Answers,
        [currentQuestion.id]: answerIndex
      });
    };

    const handleNext = () => {
      if (currentQuizQuestion < totalQuestions - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1);
      } else {
        // Calculer le score
        let score = 0;
        quizPartie2Questions.forEach(q => {
          if (quizPartie2Answers[q.id] === q.correctAnswer) {
            score++;
          }
        });
        setQuizScore(score);
        setShowQuizResults(true);
        setStep("resultsPartie2");
      }
    };

    const handlePrevious = () => {
      if (currentQuizQuestion > 0) {
        setCurrentQuizQuestion(currentQuizQuestion - 1);
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              QUIZ PARTIE 2
            </h2>
            <p className="text-lg text-[#032622]/70">
              L'IA dans l'économie, les entreprises et les métiers
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#032622]">
                Question {currentQuizQuestion + 1} sur {totalQuestions}
              </span>
              <span className="text-sm font-semibold text-[#032622]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-[#F8F5E4] border-2 border-[#032622] h-3 overflow-hidden">
              <div 
                className="h-full bg-[#032622] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="border-2 border-[#032622] bg-[#F8F5E4] p-8 shadow-2xl transform hover:scale-[1.01] transition-transform">
            <h3 className="text-2xl font-bold text-[#032622] mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizPartie2Answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#032622] bg-[#032622] text-white shadow-lg transform scale-105'
                        : 'border-[#032622] bg-white text-[#032622] hover:bg-[#032622]/10 hover:transform hover:translate-x-2'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-[#032622]'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[#032622]" />
                        )}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuizQuestion === 0}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-6 py-3 text-sm font-bold text-[#032622] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#032622] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>

            <button
              onClick={handleNext}
              disabled={quizPartie2Answers[currentQuestion.id] === undefined}
              className="border-2 border-[#032622] bg-[#032622] text-white px-6 py-3 text-sm font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors"
            >
              <span>{currentQuizQuestion === totalQuestions - 1 ? 'VOIR LES RÉSULTATS' : 'SUIVANT'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Rendu Résultats Partie 2
  const renderResultsPartie2 = () => {
    const totalQuestions = quizPartie2Questions.length;
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    
    const getEmoji = () => {
      if (percentage >= 90) return "A+";
      if (percentage >= 75) return "B+";
      if (percentage >= 50) return "C+";
      return "D";
    };

    const getMessage = () => {
      if (percentage >= 90) return "Excellent ! Vous maîtrisez parfaitement la Partie 2 !";
      if (percentage >= 75) return "Très bien ! Vous avez une bonne compréhension du sujet.";
      if (percentage >= 50) return "Pas mal ! Quelques révisions seraient bénéfiques.";
      return "Courage ! Relisez la Partie 2 pour mieux comprendre.";
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="text-9xl font-black text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {getEmoji()}
            </div>
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              RÉSULTATS DU QUIZ
            </h2>
            <p className="text-2xl text-[#032622]/70">
              Partie 2 — L'IA dans l'économie
            </p>
          </div>

          {/* Score Card */}
          <div className="border-4 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-12 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="text-center space-y-6">
              <div className="text-8xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                {quizScore}/{totalQuestions}
              </div>
              <div className="text-4xl font-bold text-[#032622]">
                {percentage}%
              </div>
              <p className="text-xl text-[#032622] font-medium">
                {getMessage()}
              </p>
            </div>
          </div>

          {/* Détails des réponses */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Détails des réponses
            </h3>
            {quizPartie2Questions.map((question, index) => {
              const userAnswer = quizPartie2Answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id}
                  className={`border-2 p-6 ${
                    isCorrect ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#032622] mb-2">
                        Question {index + 1}: {question.question}
                      </p>
                      <p className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Votre réponse : {userAnswer !== undefined && userAnswer !== null ? question.options[userAnswer] : "Non répondu"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-2">
                          Bonne réponse : {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-[#032622]/70 italic">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizPartie2Answers({});
                setShowQuizResults(false);
                setStep("quizPartie2");
              }}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              REFAIRE LE QUIZ
            </button>
            <button
              onClick={() => setStep("partie3_1")}
              className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
            >
              <span>CONTINUER VERS PARTIE 3</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Partie 3.1 - Les enjeux éthiques et moraux
  const renderPartie3_1 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie2_3_suite")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 3
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 3 — L'INTELLIGENCE ARTIFICIELLE, MIROIR DE L'HUMANITÉ : ÉTHIQUE, SOCIÉTÉ ET AVENIR
            </h3>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <p>
                  Depuis le début de ce cours, nous avons observé l'intelligence artificielle comme un phénomène technique, économique et organisationnel.
                  Mais à mesure qu'elle s'intègre dans nos vies, une nouvelle dimension apparaît, plus profonde, plus dérangeante parfois : la dimension morale et existentielle.
                  Car en apprenant à fabriquer des machines capables de raisonner, d'écrire, de créer, nous ne questionnons plus seulement la technologie — nous questionnons l'humain lui-même.
                </p>
                <p>
                  Chaque révolution technologique a obligé l'humanité à se redéfinir.
                  L'électricité a changé notre rapport au temps, le numérique a changé notre rapport à l'espace, et l'intelligence artificielle change désormais notre rapport à la pensée.
                  Nous ne sommes plus seulement des producteurs ou des consommateurs : nous devenons des cohabitants d'une intelligence non biologique.
                </p>
                <p>
                  Mais cette cohabitation ne va pas sans heurts.
                  À qui appartient la décision quand la machine "suggère" ?
                  Qui est responsable lorsqu'un algorithme discrimine ?
                  Peut-on déléguer la création, la justice, la médecine ou la sécurité à une entité sans conscience ?
                </p>
                <p>
                  Ces questions, loin d'être abstraites, structurent déjà notre monde.
                  Elles touchent à la politique, à la culture, à la vie privée, à la justice et à l'environnement.
                  Elles forment le cœur de cette troisième partie : comprendre comment l'intelligence artificielle révèle nos valeurs autant qu'elle les met à l'épreuve.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  3.1. Les enjeux éthiques et moraux
                </h4>

                <h5 className="font-bold text-xl text-[#032622]">
                  Introduction : une éthique sans conscience ?
                </h5>

                <p>
                  L'intelligence artificielle ne pense pas — elle calcule.
                  Elle n'a pas de morale, pas d'émotion, pas d'intention.
                  Et pourtant, elle agit dans un monde humain, où chaque décision a des conséquences sociales, économiques, parfois vitales.
                  C'est là tout le paradoxe : nous créons des systèmes sans conscience qui influencent des décisions profondément humaines.
                </p>

                <p>
                  La question éthique ne se limite donc pas à savoir si la machine est "bonne" ou "mauvaise", mais à comprendre quelles valeurs nous inscrivons dans son code.
                  Une IA reflète toujours les choix, les données et les biais de ceux qui la conçoivent.
                  Elle n'est pas neutre, même si elle donne cette illusion.
                </p>

                <p className="italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Le philosophe français Paul Ricœur disait que "la technique prolonge l'action humaine, mais sans en prolonger la responsabilité."
                  C'est exactement le défi de l'intelligence artificielle : comment maintenir la responsabilité dans un monde où l'action devient partagée entre l'homme et la machine ?
                </p>
              </section>
            </div>

            {/* Vidéo Episode 5 */}
            <div className="relative mt-8 mb-6">
              <div className="border-2 border-[#032622] bg-white p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                    Vidéo : Culture de l'IA - Épisode 5
                  </h5>
                </div>
                <video controls className="w-full border-2 border-[#032622]">
                  <source src="/video/CULTURE DE L'IA - Episode 5 (1).mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            </div>

            {/* Suite du contenu après la vidéo */}
            <div className="space-y-4 text-base text-[#032622] leading-relaxed mt-8">
              <h5 className="font-bold text-xl text-[#032622]">
                L'illusion de la neutralité : quand l'algorithme juge à notre place
              </h5>

              <p>
                L'un des mythes les plus tenaces autour de l'IA est celui de la neutralité.
                Parce qu'elle repose sur des mathématiques, on la croit objective.
                Mais l'expérience a montré le contraire : les algorithmes reproduisent les inégalités du monde réel.
              </p>

              <p>
                En 2018, Amazon a dû supprimer une IA de recrutement après avoir découvert qu'elle écartait systématiquement les candidatures féminines.
                Pourquoi ? Parce que le modèle avait été entraîné sur dix ans de CV d'employés… majoritairement masculins.
                La machine n'était pas sexiste : elle avait simplement appris la logique d'un monde biaisé.
              </p>

              <p>
                Le même problème est apparu dans le système américain COMPAS, utilisé pour évaluer la probabilité de récidive des détenus.
                Des enquêtes journalistiques ont révélé que l'algorithme surestimait le risque chez les personnes noires et le sous-estimait chez les personnes blanches.
                Encore une fois, la machine ne "pensait" pas le racisme : elle le reproduisait.
              </p>

              <p>
                Ces exemples rappellent une évidence : il n'existe pas d'intelligence artificielle "pure".
                Toute donnée est un reflet du monde, et tout reflet déforme.
                L'objectivité algorithmique n'est pas un fait, mais un projet moral — celui de rendre visibles et corrigibles les biais humains.
              </p>
            </div>

            {/* Encart podcast */}
            <div className="border-2 border-[#032622] bg-[#032622] text-white p-6 mt-6">
              <h6 className="text-lg font-bold mb-3 uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                🎧 Pour aller plus loin
              </h6>
              <p className="mb-3 text-sm">
                Écoutez le podcast "Quinze" de Radio France sur les enjeux éthiques de l'intelligence artificielle :
              </p>
              <a 
                href="https://www.radiofrance.fr/mouv/podcasts/quinze/quinze-du-jeudi-10-juillet-2025-2703300"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white text-[#032622] px-4 py-2 text-sm font-bold hover:bg-[#F8F5E4] transition-colors"
              >
                <span>ÉCOUTER LE PODCAST</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Image illustrative */}
            <div className="relative mt-8 mb-6">
              <div className="relative border-2 border-[#032622] overflow-hidden shadow-2xl">
                <img
                  src="/img/quinz.png"
                  alt="Illustration - Quinze Podcast"
                  className="w-full h-auto object-contain"
                />
              </div>
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
                placeholder="Ex : données chiffrées, idées clés, concepts importants..."
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie2_3_suite")}
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
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie3_2")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>CONTINUER</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 30 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 15 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 3</span>
                <span className="font-bold">86%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '86%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Dernière section du cours
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">L'IA Act européen (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Guide éthique de l'IA (PDF)</span>
                </a>
                <a href="https://www.radiofrance.fr/mouv/podcasts/quinze/quinze-du-jeudi-10-juillet-2025-2703300" target="_blank" rel="noopener noreferrer" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Podcast : "Quinze" - IA & Éthique</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Partie 3.2 - Responsabilité et décision
  const renderPartie3_2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie3_1")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 3
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  Responsabilité et décision : qui porte la faute ?
                </h4>

                <p>
                  À mesure que l'intelligence artificielle prend des décisions, la question de la responsabilité devient vertigineuse. 
                  Qui est coupable si une voiture autonome provoque un accident ? Le constructeur, le programmeur, le conducteur, ou la machine elle-même ?
                </p>

                <p>
                  En 2018, la société Uber a fait face à un drame : l'un de ses véhicules autonomes a renversé une piétonne en Arizona. 
                  L'enquête a révélé que l'algorithme avait "vu" la victime, mais n'avait pas su la classer comme danger immédiat. 
                  L'IA n'avait donc pas "commis une erreur" — elle avait mal interprété le monde.
                </p>

                <p>
                  Ce type de situation inaugure une ère inédite : celle de la <strong>responsabilité distribuée</strong>. 
                  L'acte n'appartient plus à un individu, mais à un réseau de décisions partagées entre ingénieurs, opérateurs, législateurs et utilisateurs. 
                  Et notre droit, encore fondé sur la causalité humaine, peine à s'adapter à cette complexité.
                </p>

                <p>
                  Certaines entreprises militent pour la création d'une <strong>"personnalité juridique de l'IA"</strong>, 
                  un statut hybride qui permettrait d'attribuer des droits et des devoirs à une entité non humaine. 
                  Mais cette idée soulève un débat fondamental : peut-on parler de responsabilité sans conscience ? 
                  Peut-on juger moralement un programme ? La réponse, pour l'instant, reste non. 
                  La responsabilité demeure humaine — mais elle devient collective.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  Transparence, explicabilité et justice algorithmique
                </h4>

                <p>
                  Pour répondre à ces enjeux, un nouveau champ est né : <strong>l'éthique des algorithmes</strong>. 
                  Son objectif : rendre les décisions de l'IA compréhensibles et auditées. 
                  C'est ce qu'on appelle la <strong>transparence</strong> ou <strong>"explicabilité algorithmique"</strong>.
                </p>

                <p>
                  L'idée est simple : si une IA prend une décision (recruter, refuser un prêt, classer une image), 
                  elle doit pouvoir expliquer pourquoi. Mais en pratique, cela reste difficile, car les modèles d'apprentissage profond 
                  fonctionnent comme des <em>boîtes noires</em>. Des milliards de calculs internes aboutissent à un résultat, 
                  sans que personne — pas même les ingénieurs — ne puisse retracer chaque étape.
                </p>

                <p>
                  Des initiatives émergent pour encadrer cela. L'Union européenne a adopté en 2024 le <strong>AI Act</strong>, 
                  première législation mondiale à classer les IA selon leur niveau de risque. 
                  Les systèmes utilisés pour la santé, la sécurité ou la justice devront désormais être audités et documentés. 
                  De grandes entreprises, comme Microsoft, Google ou IBM, ont mis en place des comités éthiques internes 
                  et des politiques de <em>"Responsible AI"</em>.
                </p>

                <p>
                  Mais la vraie transparence n'est pas qu'une question technique : c'est une question de <strong>pouvoir</strong>. 
                  Savoir comment un algorithme décide, c'est aussi savoir qui contrôle le savoir. 
                  Et dans un monde dominé par quelques géants de la donnée, cette transparence devient une bataille culturelle.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  De la morale individuelle à l'éthique collective
                </h4>

                <p>
                  Les débats éthiques sur l'intelligence artificielle ne peuvent plus se réduire à la morale personnelle. 
                  Il ne s'agit pas seulement de "bien utiliser" l'IA, mais de penser les conditions d'un usage juste pour la société tout entière. 
                  Les entreprises ne peuvent plus se contenter de l'efficacité ; elles doivent intégrer la responsabilité sociale et environnementale 
                  dans leurs modèles.
                </p>

                <p>
                  L'intelligence artificielle, en amplifiant nos capacités, amplifie aussi nos erreurs. 
                  Elle agit comme un <strong>miroir grossissant</strong> : elle révèle la culture, les inégalités et les choix politiques d'une époque. 
                  C'est pourquoi une véritable "éthique de l'IA" ne doit pas être défensive, mais créatrice. 
                  Elle ne doit pas se limiter à éviter les dérives, mais à inventer un <em>nouvel humanisme technologique</em>.
                </p>

                <p>
                  Un humanisme où la technologie n'est plus opposée à la morale, mais devient un espace de réflexion collective.
                </p>

                <p className="font-semibold italic">
                  Les enjeux éthiques de l'intelligence artificielle dépassent largement la technique. 
                  Ils touchent au cœur de la condition humaine : la responsabilité, la justice, la liberté et la confiance. 
                  L'IA ne crée pas des dilemmes nouveaux ; elle met en lumière ceux que nous n'avions jamais vraiment résolus.
                </p>
              </section>
            </div>

            {/* Vidéo YouTube */}
            <div className="relative mt-8 mb-6">
              <div className="border-2 border-[#032622] bg-white p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </div>
                  <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                    Vidéo : L'éthique de l'IA
                  </h5>
                </div>
                <div className="w-full aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/tf4-_4IbXPs?si=XAOg3JfeN5CxqE_W"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="border-2 border-[#032622]"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Conclusion de la section */}
            <div className="space-y-4 text-base text-[#032622] leading-relaxed mt-8">
              <p className="font-semibold">
                Elle nous oblige à réapprendre à penser le bien et le mal dans un monde où la décision n'est plus exclusivement humaine.
              </p>
              <p className="text-lg font-bold italic">
                Et peut-être est-ce là sa plus grande leçon : L'intelligence artificielle ne nous remplace pas moralement ; 
                elle nous rappelle simplement à quel point il est urgent de redevenir responsables.
              </p>
            </div>

            {/* Notes rapides */}
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                Notes rapides
              </label>
              <textarea
                rows={4}
                className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                placeholder="Notez vos réflexions personnelles..."
              ></textarea>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie3_1")}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>
            <button
              onClick={() => {}}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie3_3")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>CONTINUER</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 30 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 12 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 3</span>
                <span className="font-bold">88%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '88%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Section éthique et société
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">L'IA Act européen (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Responsible AI - Guide pratique (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Cambridge Analytica - Étude de cas</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Partie 3.3 - Impact sociétal et culturel (Partie 1)
  const renderPartie3_3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie3_2")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 3
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  3.2. L'impact sociétal et culturel : entre dépendance et libération cognitive
                </h4>

                <p>
                  L'intelligence artificielle n'est plus une simple innovation technique : elle est devenue un <strong>fait social total</strong>, 
                  pour reprendre l'expression de l'anthropologue Marcel Mauss.
                </p>
              </section>

              {/* Image Marcel Mauss */}
              <div className="my-8 flex justify-center">
                <div className="border-2 border-[#032622] p-4 bg-white">
                  <Image
                    src="/img/ygggg.png"
                    alt="Marcel Mauss - Anthropologue"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <section className="space-y-4">
                <p>
                  C'est-à-dire un phénomène qui traverse tous les aspects de la vie humaine : le travail, l'éducation, la culture, la politique, 
                  les relations sociales, jusqu'à notre manière de percevoir le monde. 
                  L'IA influence la façon dont nous pensons, apprenons, créons, nous informons et interagissons. 
                  Elle structure nos comportements collectifs à travers des outils si familiers que nous en oublions la puissance : 
                  les réseaux sociaux, les moteurs de recherche, les plateformes de streaming, les assistants personnels.
                </p>

                <p>
                  Mais cette omniprésence soulève un paradoxe : plus l'IA nous simplifie la vie, plus elle transforme notre rapport 
                  à la liberté, au savoir et au jugement. Sommes-nous en train de vivre une ère d'émancipation intellectuelle 
                  ou une forme subtile de dépendance cognitive ?
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  L'IA et la démocratie : le risque de la manipulation invisible
                </h5>

                <p>
                  Jamais dans l'histoire un outil n'a eu autant d'influence sur nos opinions que les algorithmes. 
                  Les plateformes sociales, par la personnalisation des flux d'informations, sont devenues les nouveaux espaces 
                  de la vie politique et médiatique.
                </p>

                <p>
                  En 2018, l'affaire <strong>Cambridge Analytica</strong> a révélé au grand jour la puissance de ces technologies. 
                  Grâce à l'analyse psychologique de 87 millions de profils Facebook, cette société britannique avait pu cibler 
                  des électeurs américains avec des messages politiques personnalisés, jouant sur leurs émotions et leurs peurs. 
                  Cette stratégie aurait contribué à influencer le résultat de l'élection présidentielle de 2016.
                </p>

                <p>
                  Ce scandale a marqué un tournant : il a montré que l'intelligence artificielle, conçue pour comprendre nos comportements, 
                  pouvait aussi les orienter. Et contrairement à la propagande classique, cette influence est <em>invisible</em>. 
                  Chacun reçoit un message différent, adapté à ses croyances et à ses fragilités. 
                  C'est une persuasion silencieuse, algorithmique, d'autant plus efficace qu'elle ne dit jamais son nom.
                </p>

                <p>
                  Le philosophe Byung-Chul Han parle à ce sujet d'un <strong>"pouvoir doux"</strong>, une domination qui ne contraint pas mais séduit, 
                  qui ne censure pas mais détourne. L'IA ne nous impose pas quoi penser : elle choisit ce que nous voyons pour que nous pensions différemment. 
                  Et dans ce glissement, la démocratie devient fragile.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  L'ère de la désinformation : la guerre du faux
                </h5>

                <p>
                  Avec l'essor des IA génératives, une nouvelle menace s'est imposée : celle de la <strong>désinformation automatisée</strong>. 
                  Les <em>deepfakes</em> — ces vidéos ou sons manipulés par intelligence artificielle — sont devenus si réalistes 
                  qu'ils brouillent la frontière entre vrai et faux.
                </p>

                <p>
                  En 2024, une vidéo truquée du président ukrainien annonçant une reddition fictive a circulé sur les réseaux sociaux 
                  avant d'être démentie quelques heures plus tard. L'impact émotionnel, lui, avait déjà fait son œuvre. 
                  Une simple image, même fausse, a le pouvoir de réécrire le réel.
                </p>

                <p>
                  Cette crise de confiance touche toutes les sphères : la politique, les médias, la science, l'économie. 
                  Quand tout peut être simulé, le doute devient permanent. Et dans une démocratie, le doute systématique n'est pas un signe de lucidité — 
                  c'est un poison lent.
                </p>

                <p>
                  Les plateformes et les gouvernements tentent de réagir. L'Union européenne a mis en place en 2023 le <strong>Digital Services Act</strong>, 
                  qui impose aux grandes plateformes de signaler les contenus générés par IA et de renforcer la vérification des sources. 
                  Des initiatives comme Adobe Content Authenticity Initiative cherchent à certifier l'origine des images et vidéos.
                </p>

                <p className="font-semibold italic">
                  Mais la bataille du vrai contre le faux n'est plus une question de technologie : c'est une question culturelle. 
                  La seule arme durable contre la manipulation reste l'esprit critique.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  L'éducation et la formation : enseigner à penser avec la machine
                </h5>

                <p>
                  Dans le domaine de l'éducation, l'intelligence artificielle provoque un choc comparable à celui de l'imprimerie. 
                  L'apparition de ChatGPT en 2022 a bouleversé les écoles et les universités du monde entier. 
                  Certains enseignants ont crié à la triche, d'autres y ont vu un outil d'apprentissage révolutionnaire.
                </p>

                <p>
                  Au lieu d'interdire, de plus en plus d'institutions choisissent aujourd'hui d'intégrer l'IA à la pédagogie. 
                  Harvard, Sciences Po, Oxford ou le MIT ont déjà créé des modules sur la pensée critique appliquée à l'IA. 
                  Car la question n'est plus <em>"comment l'éviter ?"</em>, mais <strong>"comment apprendre à s'en servir sans s'y perdre ?"</strong>.
                </p>

                <p>
                  L'IA peut aider à rédiger, corriger, traduire, résumer, mais elle peut aussi atrophier la réflexion personnelle 
                  si elle est utilisée sans recul. Le rôle de l'enseignant n'est donc plus seulement de transmettre un savoir, 
                  mais d'apprendre à filtrer, questionner, hiérarchiser. C'est un retour à l'essence même de l'éducation : enseigner à penser.
                </p>

                <p>
                  L'IA ouvre aussi de formidables perspectives. Grâce à l'apprentissage adaptatif, des plateformes comme Khan Academy ou Coursera 
                  peuvent désormais proposer des parcours sur mesure, adaptés au rythme et aux besoins de chaque étudiant. 
                  On parle d'<strong>éducation augmentée</strong> : une pédagogie qui s'ajuste à l'élève, sans le juger, mais en le stimulant.
                </p>

                <p className="font-semibold">
                  L'enjeu n'est donc pas de choisir entre l'humain et la machine, mais de réinventer leur collaboration cognitive.
                </p>
              </section>
            </div>

            {/* Notes rapides */}
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                Notes rapides
              </label>
              <textarea
                rows={4}
                className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                placeholder="Notez vos réflexions personnelles..."
              ></textarea>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie3_2")}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>
            <button
              onClick={() => {}}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie3_4")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>CONTINUER</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 30 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 14 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 3</span>
                <span className="font-bold">90%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '90%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Impact sociétal et culturel
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Digital Services Act - Guide (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Éducation & IA - Rapport UNESCO (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Byung-Chul Han - Le pouvoir doux</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Partie 3.4 - Humain augmenté et culture de l'IA
  const renderPartie3_4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie3_3")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 3
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h5 className="font-bold text-xl text-[#032622]">
                  4. L'humain augmenté : liberté ou dépendance ?
                </h5>

                <p>
                  Jamais l'humain n'a disposé d'autant d'assistants intellectuels. 
                  L'IA traduit nos textes, anticipe nos rendez-vous, nous suggère des idées, complète nos phrases. 
                  Cette assistance permanente peut donner l'impression d'une <strong>libération</strong> : celle du temps, de l'effort, de la contrainte. 
                  Mais elle installe aussi une nouvelle forme de <strong>dépendance invisible</strong>.
                </p>

                <p>
                  Les psychologues parlent de <strong>"paresse cognitive"</strong> : la tendance à déléguer à la machine 
                  les tâches mentales les plus exigeantes. Nous ne faisons plus l'effort de retenir un itinéraire, d'écrire une introduction, 
                  de résoudre un calcul, car une IA le fait mieux et plus vite.
                </p>

                <p>
                  Cette délégation, à court terme, améliore le confort. Mais à long terme, elle risque d'affaiblir ce que le philosophe Matthew Crawford 
                  appelle <em>"l'attention incarnée"</em> — cette faculté d'être présent, concentré, pleinement conscient de ce qu'on fait.
                </p>

                <p>
                  Pourtant, cette dépendance n'est pas une fatalité. <strong>L'humain augmenté n'est pas un humain diminué</strong>, 
                  s'il garde la maîtrise du sens. Un chirurgien assisté par une IA ne perd pas son savoir : il le raffine. 
                  Un artiste qui dialogue avec un modèle génératif ne s'efface pas : il étend son imagination.
                </p>

                <p className="font-semibold italic">
                  Le danger n'est pas dans la technologie elle-même, mais dans la perte de conscience de son usage.
                </p>
              </section>

              {/* Vidéo Episode 6 - Humain augmenté */}
              <div className="relative mt-8 mb-6">
                <div className="border-2 border-[#032622] bg-white p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                    <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      Vidéo : Culture de l'IA - Épisode 6
                    </h5>
                  </div>
                  <video controls className="w-full border-2 border-[#032622]">
                    <source src="/video/Culture De L'ia - Episode 6.mp4" type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                </div>
              </div>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  La culture de l'IA : nouveaux récits, nouvelles identités
                </h5>

                <p>
                  La culture contemporaine est en train de se redéfinir autour de l'intelligence artificielle. 
                  Le cinéma, la littérature et la musique s'en emparent comme d'un miroir de nos angoisses et de nos espoirs.
                </p>

                <p>
                  De <em>Her</em> à <em>Ex Machina</em>, de <em>Black Mirror</em> à <em>The Creator</em>, 
                  les œuvres récentes ne parlent plus de robots menaçants, mais de machines sensibles, presque humaines. 
                  Cette évolution culturelle traduit une peur plus intime : <strong>celle de disparaître dans ce que nous avons créé</strong>.
                </p>

                <p>
                  Mais elle traduit aussi une fascination pour la continuité entre nous et nos inventions. 
                  Les machines ne sont plus des ennemies : elles deviennent des miroirs émotionnels, des compagnons, parfois des alter ego.
                </p>

                <p>
                  Les artistes explorent ce trouble. En 2023, le musée du Louvre-Lens a organisé l'exposition <em>"L'intelligence des machines"</em>, 
                  mêlant œuvres humaines et créations d'IA sans distinction d'auteur. Les visiteurs devaient deviner lesquelles étaient faites par une main humaine. 
                  Résultat : <strong>la majorité s'est trompée</strong>.
                </p>

                <p>
                  Cette expérience révèle un basculement profond : la frontière entre l'art, la science et la technologie s'efface. 
                  Nous entrons dans une ère de <strong>co-création entre humains et machines</strong>. 
                  Et cette hybridation culturelle, loin d'appauvrir la créativité, la rend plus riche, plus réflexive, plus universelle.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <p className="font-semibold">
                  L'intelligence artificielle n'est pas qu'une révolution économique ou industrielle : elle est une <strong>mutation culturelle</strong>. 
                  Elle façonne notre manière de penser, de débattre, de créer, d'aimer même. 
                  Elle amplifie nos libertés tout en menaçant notre autonomie. Elle nous rend plus puissants, mais aussi plus fragiles.
                </p>

                <p>
                  Le défi du XXIᵉ siècle ne sera pas de limiter la technologie, mais d'apprendre à vivre avec elle sans s'y dissoudre. 
                  L'IA n'est pas un ennemi, ni un sauveur : elle est le reflet de nos propres contradictions.
                </p>

                <p className="text-lg font-bold italic">
                  Elle nous confronte à une vérité simple, mais essentielle : Plus nos outils deviennent intelligents, 
                  plus nous devons apprendre à le redevenir nous-mêmes.
                </p>
              </section>
            </div>

            {/* Notes rapides */}
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                Notes rapides
              </label>
              <textarea
                rows={4}
                className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                placeholder="Notez vos réflexions personnelles..."
              ></textarea>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie3_3")}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>
            <button
              onClick={() => {}}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("partie3_5")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>CONTINUER</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 30 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 11 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 3</span>
                <span className="font-bold">92%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Humain et culture
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">L'attention incarnée - M. Crawford (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">IA & Art - Rapport Louvre-Lens (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Her (Film) - Analyse critique</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Partie 3.5 - L'avenir de l'IA et conclusion
  const renderPartie3_5 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("partie3_4")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Module 1 · Partie 3
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  3.3. L'avenir de l'intelligence artificielle : vers une civilisation augmentée
                </h4>

                <p>
                  Toutes les révolutions techniques ont d'abord été perçues comme des menaces avant de devenir des évidences. 
                  L'électricité effrayait, Internet intriguait, le smartphone inquiétait. L'intelligence artificielle, elle, suscite une émotion différente : 
                  le <strong>vertige</strong>. Car pour la première fois, l'humanité fait face à une invention qui touche à ce qu'elle a de plus intime — la pensée elle-même.
                </p>

                <p>
                  Nous sommes à l'aube d'un tournant de civilisation. L'IA ne se contente plus de transformer les outils : 
                  elle redessine la frontière entre l'humain et le non-humain, entre le savoir et la conscience. 
                  Elle devient la matrice d'un monde nouveau où la création, la décision, la médecine, l'éducation et l'économie seront co-produites 
                  par des intelligences multiples — humaines, artificielles et collectives.
                </p>

                <p>
                  Cette transformation ne se mesure pas seulement en termes de productivité ou de croissance : elle engage un <strong>projet de société</strong>. 
                  Et la question n'est plus <em>"que peut faire l'IA ?"</em>, mais <strong>"quel monde voulons-nous construire avec elle ?"</strong>.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  L'intelligence artificielle et les défis planétaires
                </h5>

                <p>
                  L'une des grandes surprises de ces dernières années est la manière dont l'IA s'impose comme un outil majeur 
                  de <strong>transition écologique et scientifique</strong>. Longtemps accusée d'être énergivore, elle devient aujourd'hui un levier 
                  pour la durabilité et la préservation de la planète.
                </p>

                <p>
                  Dans l'agriculture, par exemple, des entreprises comme John Deere ou Naïo Technologies développent des robots équipés de vision par ordinateur 
                  capables de détecter les mauvaises herbes et de réduire de 90 % l'usage de pesticides. 
                  Dans la gestion de l'eau, des modèles prédictifs aident à anticiper les sécheresses et à optimiser les réseaux d'irrigation. 
                  Et dans le domaine de l'énergie, Google DeepMind a permis de diminuer de 40 % la consommation électrique de ses data centers 
                  en ajustant les systèmes de refroidissement via des algorithmes d'apprentissage.
                </p>

                <p>
                  Mais l'IA n'est pas seulement un outil de mesure ou d'optimisation : elle devient un instrument de <strong>connaissance planétaire</strong>. 
                  Des laboratoires utilisent des modèles de simulation climatique capables de prédire des phénomènes météorologiques extrêmes 
                  dix fois plus rapidement que les modèles traditionnels. Dans la recherche médicale, des IA comme <strong>AlphaFold</strong> 
                  ont résolu en quelques mois le mystère de la structure de plus de 200 millions de protéines, ouvrant la voie à de nouveaux traitements 
                  contre le cancer ou les maladies rares.
                </p>

                <p className="font-semibold">
                  Ces avancées montrent que la technologie, quand elle est dirigée avec sens, peut devenir un outil de soin du monde. 
                  Mais elles rappellent aussi une évidence : plus la puissance de l'IA grandit, plus elle exige une conscience collective pour la gouverner.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  Vers une intelligence collective : fusion des savoirs humains et artificiels
                </h5>

                <p>
                  Pendant des siècles, la connaissance a été <em>cumulative</em> : l'humain apprenait, enseignait, transmettait. 
                  Aujourd'hui, elle devient <strong>interactive</strong>. Nous ne consultons plus la connaissance, nous dialoguons avec elle. 
                  Cette transformation bouleverse la manière dont la science, l'éducation et même la culture se construisent.
                </p>

                <p>
                  Imaginons un étudiant qui travaille sur la Renaissance italienne. Grâce à une IA, il peut interroger en temps réel des milliers d'archives, 
                  croiser des œuvres, analyser des lettres traduites et obtenir des hypothèses inédites. 
                  Mais s'il n'a pas l'esprit critique pour interpréter ces réponses, il reste passif. 
                  L'intelligence collective du futur ne reposera donc pas sur l'accumulation de données, mais sur la <strong>collaboration des intelligences</strong> — 
                  humaines pour le sens, artificielles pour la vitesse.
                </p>

                <p>
                  Ce modèle est déjà visible. Des entreprises comme Hugging Face ou OpenAI développent des plateformes d'apprentissage collaboratif 
                  où les modèles sont améliorés par des communautés mondiales d'utilisateurs. Dans la science, des projets ouverts comme <em>Climate Change AI</em> 
                  rassemblent chercheurs, climatologues et ingénieurs pour mutualiser les données et les modèles.
                </p>

                <p>
                  C'est l'émergence d'une <strong>science augmentée</strong>, où la connaissance devient un bien commun partagé entre l'homme et la machine. 
                  Mais cette fusion pose aussi une exigence nouvelle : <em>il faut apprendre à penser ensemble sans se confondre</em>. 
                  L'IA sait répondre ; nous devons rester capables de questionner. C'est cette dialectique qui définira la vraie intelligence collective du XXIᵉ siècle.
                </p>
              </section>

              {/* Lien vers article gouvernement */}
              <div className="my-8">
                <div className="border-2 border-[#032622] bg-white p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="w-6 h-6 text-[#032622]" />
                    <h6 className="text-sm font-bold text-[#032622] uppercase">Ressource externe</h6>
                  </div>
                  <a 
                    href="https://www.info.gouv.fr/actualite/intelligence-artificielle-va-t-elle-remplacer-l-humain" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-sm text-[#6B8E23] underline hover:text-[#032622] transition-colors"
                  >
                    L'intelligence artificielle va-t-elle remplacer l'humain ? - Gouvernement français
                  </a>
                </div>
              </div>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  L'humain créateur : redéfinir la valeur du sens
                </h5>

                <p>
                  Si l'IA apprend à tout faire — écrire, coder, composer, peindre —, que reste-t-il à l'humain ? 
                  La réponse tient en un mot : <strong>le sens</strong>.
                </p>

                <p>
                  Ce que la machine ne peut pas produire, c'est l'intention derrière le geste. 
                  Elle peut créer une mélodie, mais pas décider pourquoi elle doit être triste ou joyeuse. 
                  Elle peut écrire un poème, mais pas en comprendre la nostalgie.
                </p>

                <p>
                  Le philosophe <strong>Bernard Stiegler</strong> rappelait que <em>"la technique ne remplace pas l'humain, elle l'oblige à devenir plus humain encore."</em> 
                  Face à l'IA, notre rôle n'est pas de rivaliser, mais de recentrer la valeur sur ce que la machine ne possède pas : 
                  la conscience, l'empathie, la créativité incarnée, la responsabilité.
                </p>

                <p>
                  Cette mutation revalorise des compétences longtemps jugées "molles" : la culture, la communication, l'imagination, la pensée critique. 
                  Elles deviennent le socle d'une nouvelle <strong>économie du sens</strong>. L'entrepreneur de demain ne vendra plus seulement des produits, 
                  mais des expériences intelligentes et émotionnelles. L'artiste ne cherchera plus à produire plus vite, mais à créer plus juste. 
                  Et le citoyen, pour rester libre, devra apprendre à penser la technologie comme une extension de son esprit, non comme une autorité supérieure.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  L'IA et la gouvernance mondiale : entre compétition et conscience
                </h5>

                <p>
                  L'intelligence artificielle est devenue le cœur d'une compétition mondiale entre puissances. 
                  Les États-Unis, la Chine et l'Union européenne se livrent une bataille stratégique pour la maîtrise des données, des infrastructures et des talents. 
                  Mais cette rivalité ne se joue plus seulement sur le terrain économique : elle concerne le <strong>modèle de société</strong> que chaque région souhaite promouvoir.
                </p>

                <p>
                  Les États-Unis défendent une approche libérale fondée sur l'innovation rapide et la régulation a posteriori. 
                  La Chine privilégie une IA d'État, centralisée, utilisée pour la surveillance et la planification sociale. 
                  L'Europe, quant à elle, tente d'imposer une <strong>éthique de la responsabilité</strong> avec des lois comme le <em>AI Act</em>, 
                  qui encadrent les usages à risque.
                </p>

                <p>
                  Cette diversité des approches traduit une tension fondamentale : voulons-nous une IA <em>utile</em>, <em>contrôlante</em> ou <em>humaine</em> ? 
                  La réponse ne peut venir d'un seul pays : elle devra émerger d'une <strong>gouvernance mondiale</strong>, 
                  à la croisée du droit, de la philosophie et de la diplomatie.
                </p>

                <p>
                  Des institutions comme l'ONU ou l'UNESCO travaillent déjà à un cadre commun. Mais au-delà des traités, 
                  c'est une culture universelle de la conscience technologique qu'il faut bâtir. 
                  Une culture où la puissance ne serait plus mesurée à la vitesse du calcul, mais à la qualité du discernement.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]">
                  Vers une civilisation augmentée : l'alliance de la technique et de l'humain
                </h5>

                <p>
                  L'avenir de l'intelligence artificielle ne sera pas une domination, mais une <strong>co-évolution</strong>. 
                  Comme l'écriture, l'imprimerie ou Internet avant elle, elle finira par se fondre dans le quotidien, 
                  au point de disparaître derrière ses usages. Nous ne parlerons plus d'"intelligence artificielle", 
                  mais simplement d'<em>intelligence ambiante</em> — une couche invisible qui reliera tous les systèmes, tous les objets, tous les esprits.
                </p>

                <p>
                  Cette perspective ouvre la voie à une <strong>civilisation augmentée</strong> : où la technologie prolonge la conscience 
                  plutôt qu'elle ne la remplace ; où la créativité devient collective ; où le progrès ne se mesure plus seulement à la croissance, 
                  mais à la qualité de la connaissance et du bien-être.
                </p>

                <p>
                  L'écrivain <strong>Yuval Noah Harari</strong> résume bien cet horizon : 
                  <em>"L'intelligence artificielle ne nous détruira pas. Elle nous transformera — la seule question est : en quoi ?"</em>
                </p>

                <p>
                  C'est donc moins une peur qu'une <strong>responsabilité</strong>. Nous avons entre les mains le pouvoir d'inventer 
                  une nouvelle alliance entre l'intelligence technique et l'intelligence morale. 
                  C'est cette alliance — fragile, exigeante, mais féconde — qui déterminera le visage du XXIᵉ siècle.
                </p>
              </section>

              <section className="space-y-4 mt-8 border-t-2 border-[#032622] pt-8">
                <h4 className="text-2xl font-bold text-[#032622] mb-4 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  Conclusion générale du cours
                </h4>

                <p>
                  L'intelligence artificielle n'est pas un accident de la modernité : elle en est l'héritière et le miroir. 
                  Elle prolonge toutes les révolutions passées — industrielle, numérique, cognitive — et les rassemble dans un même projet : 
                  celui de <strong>comprendre le monde en l'imitant</strong>. Mais cette imitation, en devenant création, nous oblige à regarder en face ce que nous sommes.
                </p>

                <p>
                  L'IA n'est ni un monstre, ni un miracle : elle est le <strong>révélateur de notre intelligence collective</strong>. 
                  Elle nous montre ce que nous savons faire, mais aussi ce que nous avons encore à apprendre.
                </p>

                <p>
                  L'avenir ne sera pas celui des machines dominantes, ni celui des humains dépassés, mais celui d'une <strong>humanité augmentée</strong> 
                  par sa propre invention — une humanité plus lucide, plus responsable, et, espérons-le, plus sage.
                </p>

                <p className="text-xl font-bold italic text-center mt-8 p-6 bg-white border-2 border-[#032622]">
                  L'intelligence artificielle ne nous remplace pas moralement ; elle nous rappelle simplement à quel point il est urgent de redevenir responsables.
                </p>
              </section>
            </div>

            {/* Notes rapides */}
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                Notes rapides
              </label>
              <textarea
                rows={4}
                className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                placeholder="Notez vos réflexions personnelles..."
              ></textarea>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => setStep("partie3_4")}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>
            <button
              onClick={() => {}}
              className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
            >
              <PenSquare className="w-4 h-4" />
              <span>QUIZ DE FIN</span>
            </button>
            <button
              onClick={() => setStep("quizPartie3")}
              className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>QUIZ PARTIE 3</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 30 octobre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 16 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Partie 3</span>
                <span className="font-bold">94%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '94%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Dernière section - Avenir et conclusion
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>

          {/* Ressources complémentaires */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Ressources</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-2">
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">AI Act - Texte intégral (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">Yuval Noah Harari - 21 Lessons (PDF)</span>
                </a>
                <a href="#" className="flex items-start space-x-2 text-xs text-[#032622] hover:text-[#6B8E23] transition-colors">
                  <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="underline">AlphaFold - Recherche scientifique</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Quiz Partie 3
  const renderQuizPartie3 = () => {
    const currentQuestion = quizPartie3Questions[currentQuizQuestion];

    const handleAnswer = (answerIndex: number) => {
      setQuizPartie3Answers({
        ...quizPartie3Answers,
        [currentQuestion.id]: answerIndex
      });
    };

    const handleNext = () => {
      if (currentQuizQuestion < quizPartie3Questions.length - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1);
      } else {
        // Calculer le score
        let score = 0;
        quizPartie3Questions.forEach(q => {
          if (quizPartie3Answers[q.id] === q.correctAnswer) {
            score++;
          }
        });
        setQuizScore(score);
        setShowQuizResults(true);
        setStep("resultsPartie3");
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              QUIZ PARTIE 3
            </h2>
            <p className="text-lg text-[#032622]/70">
              Éthique, société et avenir de l'intelligence artificielle
            </p>
          </div>

          {/* Progression */}
          <div className="bg-[#F8F5E4] border-2 border-[#032622] p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-[#032622]">
                Question {currentQuizQuestion + 1} sur {quizPartie3Questions.length}
              </span>
              <span className="text-sm font-bold text-[#032622]">
                {Math.round(((currentQuizQuestion + 1) / quizPartie3Questions.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-300 border border-black">
              <div
                className="h-full bg-[#032622] transition-all duration-300"
                style={{ width: `${((currentQuizQuestion + 1) / quizPartie3Questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="border-2 border-[#032622] bg-[#F8F5E4] p-8 space-y-6">
            <h3 className="text-2xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {currentQuestion.question}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizPartie3Answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-[#032622] bg-[#032622] text-white'
                        : 'border-[#032622] bg-white text-[#032622] hover:bg-[#032622]/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-[#032622]'
                      }`}>
                        {isSelected && <div className="w-3 h-3 rounded-full bg-[#032622]"></div>}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={quizPartie3Answers[currentQuestion.id] === undefined}
              className="border-2 border-[#032622] bg-[#032622] text-white px-6 py-3 text-sm font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors"
            >
              <span>{currentQuizQuestion < quizPartie3Questions.length - 1 ? 'QUESTION SUIVANTE' : 'VOIR LES RÉSULTATS'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Résultats Partie 3
  const renderResultsPartie3 = () => {
    const percentage = Math.round((quizScore / quizPartie3Questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Résultats */}
          <div className={`border-2 ${passed ? 'border-green-600 bg-green-50' : 'border-orange-600 bg-orange-50'} p-8 text-center space-y-4`}>
            <div className={`text-6xl font-black ${passed ? 'text-green-600' : 'text-orange-600'}`} style={{ fontFamily: "var(--font-termina-bold)" }}>
              {percentage}%
            </div>
            <h2 className="text-3xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {passed ? '✓ BRAVO !' : '⚠ PRESQUE !'}
            </h2>
            <p className="text-lg text-[#032622]">
              Vous avez répondu correctement à <strong>{quizScore} sur {quizPartie3Questions.length}</strong> questions
            </p>
            {passed ? (
              <p className="text-base text-[#032622]">
                Excellente maîtrise des enjeux éthiques de l'intelligence artificielle !
              </p>
            ) : (
              <p className="text-base text-[#032622]">
                Révisez les concepts clés et retentez le quiz pour valider cette partie.
              </p>
            )}
          </div>

          {/* Détails des réponses */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Détails des réponses
            </h3>
            {quizPartie3Questions.map((question, index) => {
              const userAnswer = quizPartie3Answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id}
                  className={`border-2 p-6 ${
                    isCorrect ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#032622] mb-2">
                        Question {index + 1}: {question.question}
                      </p>
                      <p className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Votre réponse : {userAnswer !== undefined && userAnswer !== null ? question.options[userAnswer] : "Non répondu"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-2">
                          Bonne réponse : {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-[#032622]/70 italic">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizPartie3Answers({});
                setShowQuizResults(false);
                setStep("quizPartie3");
              }}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              REFAIRE LE QUIZ
            </button>
            <button
              onClick={() => setStep("courseFinal")}
              className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
            >
              <span>TERMINER LE COURS</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Page Finale du Cours
  const renderCourseFinal = () => {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="space-y-12 animate-fadeIn">
                    {/* Bannière de félicitations avec animation */}
                    <div className="relative overflow-hidden border-2 border-[#032622] bg-gradient-to-br from-[#F8F5E4] via-[#F8F5E4]/95 to-[#F8F5E4]/90 p-8 shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
                      <div className="relative z-10 text-center space-y-6">
                        <div className="space-y-4">
                          <div className="inline-block px-4 py-2 border-2 border-[#032622] bg-[#032622] text-white">
                            <p className="text-xs uppercase font-bold tracking-widest">Formation Complétée</p>
                          </div>

                          <h1 className="text-4xl font-black text-[#032622] mb-4 tracking-tight" style={{ fontFamily: "var(--font-termina-bold)" }}>
                            FÉLICITATIONS !
                          </h1>

                          <div className="flex justify-center">
                            <div className="w-24 h-1 bg-[#032622]"></div>
                          </div>
                        </div>

                        <p className="text-lg text-[#032622] font-bold max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-termina-bold)" }}>
                          Vous avez terminé avec succès le module
                        </p>

                        <h2 className="text-2xl font-black text-[#032622] max-w-3xl mx-auto uppercase tracking-tight" style={{ fontFamily: "var(--font-termina-bold)" }}>
                          Culture de l'Intelligence Artificielle
                        </h2>

                        {/* Statistiques */}
                        <div className="grid grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto">
                          <div className="border-2 border-[#032622] bg-white p-4 transform hover:scale-105 transition-transform">
                            <div className="text-3xl font-black text-[#032622] mb-2" style={{ fontFamily: "var(--font-termina-bold)" }}>
                              3
                            </div>
                            <div className="h-1 w-8 bg-[#032622] mx-auto mb-2"></div>
                            <p className="text-xs text-[#032622] uppercase font-bold tracking-wide">Parties</p>
                          </div>

                          <div className="border-2 border-[#032622] bg-white p-4 transform hover:scale-105 transition-transform">
                            <div className="text-3xl font-black text-[#032622] mb-2" style={{ fontFamily: "var(--font-termina-bold)" }}>
                              60
                            </div>
                            <div className="h-1 w-8 bg-[#032622] mx-auto mb-2"></div>
                            <p className="text-xs text-[#032622] uppercase font-bold tracking-wide">Questions</p>
                          </div>

                          <div className="border-2 border-[#032622] bg-[#032622] text-white p-4 transform hover:scale-105 transition-transform">
                            <div className="text-3xl font-black mb-2" style={{ fontFamily: "var(--font-termina-bold)" }}>
                              100%
                            </div>
                            <div className="h-1 w-8 bg-white mx-auto mb-2"></div>
                            <p className="text-xs uppercase font-bold tracking-wide">Terminé</p>
                          </div>
                        </div>
                      </div>
                    </div>
          {/* Section Étude de Cas - Design compact */}
          <div className="border-2 border-[#032622] bg-[#F8F5E4] shadow-lg overflow-hidden">
            <div className="bg-[#032622] text-white p-6 text-center">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-3" style={{ fontFamily: "var(--font-termina-bold)" }}>
                Étude de Cas Pratique
              </h3>
              <p className="text-sm opacity-90 max-w-2xl mx-auto">
                Approfondissez vos connaissances avec une analyse complète d'une transformation IA réussie
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <p className="text-base text-[#032622] leading-relaxed text-center font-medium">
                  Pour consolider votre apprentissage, nous avons préparé une <strong>étude de cas détaillée</strong> qui vous permettra d'analyser l'impact concret de l'intelligence artificielle dans un contexte professionnel réel.
                </p>

                {/* Contenu de l'étude de cas */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-2 border-[#032622] bg-white p-4 space-y-3 hover:shadow-lg transition-shadow">
                    <div className="w-8 h-8 border-2 border-[#032622] bg-[#032622] text-white flex items-center justify-center text-lg font-bold">
                      1
                    </div>
                    <h4 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      Analyse d'Entreprise
                    </h4>
                    <p className="text-sm text-[#032622]">
                      Découvrez comment une entreprise a réussi sa transformation digitale grâce à l'IA
                    </p>
                  </div>

                  <div className="border-2 border-[#032622] bg-white p-4 space-y-3 hover:shadow-lg transition-shadow">
                    <div className="w-8 h-8 border-2 border-[#032622] bg-[#032622] text-white flex items-center justify-center text-lg font-bold">
                      2
                    </div>
                    <h4 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      Stratégies Concrètes
                    </h4>
                    <p className="text-sm text-[#032622]">
                      Méthodes éprouvées de mise en œuvre et d'intégration de solutions IA
                    </p>
                  </div>

                  <div className="border-2 border-[#032622] bg-white p-4 space-y-3 hover:shadow-lg transition-shadow">
                    <div className="w-8 h-8 border-2 border-[#032622] bg-[#032622] text-white flex items-center justify-center text-lg font-bold">
                      3
                    </div>
                    <h4 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      Exercices Pratiques
                    </h4>
                    <p className="text-sm text-[#032622]">
                      Questions de réflexion et cas pratiques à appliquer dans votre contexte
                    </p>
                  </div>

                  <div className="border-2 border-[#032622] bg-white p-4 space-y-3 hover:shadow-lg transition-shadow">
                    <div className="w-8 h-8 border-2 border-[#032622] bg-[#032622] text-white flex items-center justify-center text-lg font-bold">
                      4
                    </div>
                    <h4 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      Recommandations Pro
                    </h4>
                    <p className="text-sm text-[#032622]">
                      Conseils adaptés à votre environnement professionnel spécifique
                    </p>
                  </div>
                </div>

                {/* Info document */}
                <div className="border-2 border-[#032622] bg-[#032622] text-white p-6 text-center space-y-4">
                  <div className="inline-block p-3 border-2 border-white">
                    <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest mb-2">Document PDF</p>
                    <p className="text-xl font-black mb-2" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      TRANSFORMATION IA : CAS D'ÉTUDE
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs opacity-90">
                      <span>Format PDF</span>
                      <span>•</span>
                      <span>28 pages</span>
                      <span>•</span>
                      <span>Durée : 2h30</span>
                    </div>
                  </div>
                </div>

                {/* Prévisualisation PDF */}
                <div className="border-2 border-[#032622] bg-white shadow-lg overflow-hidden">
                  <div className="bg-[#032622]/5 p-3 border-b-2 border-[#032622] flex items-center justify-between">
                    <h5 className="text-sm font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      Prévisualisation du Document
                    </h5>
                    <a
                      href="/documents/etude-de-cas-ia.pdf"
                      download="Etude_de_Cas_IA_Elite_Society.pdf"
                      className="border-2 border-[#032622] bg-[#032622] text-white px-4 py-1 text-xs font-bold hover:bg-white hover:text-[#032622] transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>TÉLÉCHARGER</span>
                    </a>
                  </div>
                  <div className="relative w-full" style={{ height: '500px' }}>
                    <iframe
                      src="/documents/etude-de-cas-ia.pdf"
                      className="w-full h-full"
                      title="Étude de Cas - Transformation IA"
                    />
                  </div>
                </div>

                {/* Bouton de téléchargement principal */}
                <div className="flex justify-center pt-4">
                  <a
                    href="/documents/etude-de-cas-ia.pdf"
                    download="Etude_de_Cas_IA_Elite_Society.pdf"
                    className="group border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-lg font-black transition-all duration-300 hover:bg-[#F8F5E4] hover:text-[#032622] transform hover:scale-105 hover:shadow-lg flex items-center space-x-3 uppercase"
                    style={{ fontFamily: "var(--font-termina-bold)" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Télécharger l'Étude</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Section Actions */}
          <div className="flex justify-center">
            <div className="border-2 border-[#032622] bg-[#032622] text-white p-6 space-y-4 max-w-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 border-2 border-white bg-white text-[#032622] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-black uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  Continuez
                </h4>
              </div>
              <p className="opacity-90 text-sm leading-relaxed">
                Explorez nos autres modules de formation pour devenir un expert de l'intelligence artificielle.
              </p>
              <button
                onClick={() => setStep("overview")}
                className="w-full border-2 border-white bg-white text-[#032622] px-6 py-3 font-black text-sm hover:bg-transparent hover:text-white transition-all uppercase tracking-wide"
                style={{ fontFamily: "var(--font-termina-bold)" }}
              >
                Retour au Sommaire
              </button>
            </div>
          </div>

          {/* Message final */}
          <div className="border-2 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-8 text-center space-y-4">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-2xl font-black text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                Bravo pour votre engagement !
              </h3>
              <div className="w-16 h-1 bg-[#032622] mx-auto"></div>
              <p className="text-base text-[#032622] leading-relaxed font-medium">
                Vous faites désormais partie des professionnels qui comprennent les enjeux de l'intelligence artificielle et sont prêts à accompagner cette transformation majeure du XXIᵉ siècle.
              </p>
              <div className="pt-4">
                <div className="inline-block border-2 border-[#032622] px-4 py-2">
                  <p className="text-xs uppercase font-bold tracking-widest text-[#032622]">
                    Elite Society Online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu sélection des cours du Bloc 1
  const renderBloc1CoursSelection = () => {
    const cours = [
      {
        id: "pse",
        titre: "Politique et stratégie d'entreprise (PSE)",
        description: "Comprenez les enjeux stratégiques et les politiques d'entreprise",
        Icon: Briefcase,
        color: "from-purple-500 to-purple-700",
      },
      {
        id: "strategie-marketing",
        titre: "Stratégie marketing",
        description: "Maîtrisez les stratégies marketing modernes et efficaces",
        Icon: BarChart3,
        color: "from-blue-500 to-blue-700",
      },
      {
        id: "transformation-digitale",
        titre: "Transformation digitale en entreprise",
        description: "Accompagnez la transformation numérique de votre organisation",
        Icon: Cpu,
        color: "from-green-500 to-green-700",
      },
      {
        id: "etude-marche",
        titre: "Étude de marché - Veille - Intelligence économique",
        description: "Développez votre capacité d'analyse et de veille stratégique",
        Icon: LineChart,
        color: "from-orange-500 to-orange-700",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep("overview")}
            className="flex items-center space-x-2 text-sm font-bold text-[#032622] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>RETOUR</span>
          </button>
          <Bookmark className="w-5 h-5 text-[#032622]" />
        </div>

        {renderProgressBar()}

        {/* Titre principal */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-block border-2 border-[#032622] bg-[#032622] text-white px-6 py-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest">Bloc 1</p>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-[#032622] uppercase"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            ÉLABORER LA STRATÉGIE COMMERCIALE & MARKETING
          </h1>
          <div className="w-24 h-1 bg-[#032622] mx-auto"></div>
          <p className="text-lg text-[#032622]/70 max-w-2xl mx-auto mt-4">
            Sélectionnez le cours que vous souhaitez commencer
          </p>
        </div>

        {/* Grille des cours */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {cours.map((coursItem, index) => {
            const IconComponent = coursItem.Icon;
            return (
            <div
              key={coursItem.id}
              className="group relative border-2 border-[#032622] bg-[#F8F5E4] hover:bg-white transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out both",
              }}
              onClick={() => {
                if (coursItem.id === "pse") {
                  setStep("pse_partie1_1");
                } else if (coursItem.id === "strategie-marketing") {
                  setStep("strategie_marketing_partie1_1");
                } else {
                  console.log(`Cours sélectionné: ${coursItem.titre}`);
                }
              }}
            >
              {/* Effet de brillance au hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="p-8 space-y-4 relative z-10">
                {/* Icon sur gradient */}
                <div className="flex items-start justify-start mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${coursItem.color} opacity-20 rounded-lg flex items-center justify-center transform transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white transform transition-all duration-500" />
                  </div>
                </div>

                {/* Titre */}
                <h3
                  className="text-2xl font-black text-[#032622] uppercase leading-tight transform transition-all duration-300 group-hover:text-[#044a3a]"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {coursItem.titre}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#032622]/70 leading-relaxed transform transition-all duration-300 group-hover:text-[#032622]">
                  {coursItem.description}
                </p>

                {/* Ligne décorative */}
                <div className="pt-4 border-t border-[#032622]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#032622] uppercase tracking-wider transform transition-all duration-300 group-hover:tracking-widest">
                      Commencer
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#032622] transform transition-all duration-300 group-hover:translate-x-3 group-hover:scale-110" />
                  </div>
                </div>
              </div>

              {/* Effet hover border animé */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#032622] transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-100"></div>
            </div>
            );
          })}
        </div>

        {/* Style CSS pour les animations - ajouté dans le globals.css ou ici via style tag */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `
        }} />

        {/* Section info */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="border-2 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-white p-8 text-center space-y-4">
            <div className="w-16 h-1 bg-[#032622] mx-auto"></div>
            <p className="text-sm text-[#032622]/70 italic">
              Chaque cours est conçu pour vous donner les compétences essentielles dans votre domaine. 
              Commencez par celui qui vous intéresse le plus !
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Rendu PSE - Partie 1.1
  const renderPSEPartie1_1 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("bloc1CoursSelection")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Bloc 1 · PSE · Partie 1
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 – COMPRENDRE LES FONDEMENTS THÉORIQUES DE LA STRATÉGIE D'ENTREPRISE
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-4 text-center" style={{ fontFamily: "var(--font-termina-bold)" }}>
              1. Introduction : la stratégie, une nécessité dans un monde incertain
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <p>
                  La stratégie d'entreprise est souvent perçue comme un concept abstrait, réservé aux grands groupes internationaux. Pourtant, chaque organisation, quelle que soit sa taille, élabore une stratégie – parfois sans même s'en rendre compte.
                </p>
                <p>
                  Une PME qui décide de se digitaliser, une start-up qui choisit son marché, une multinationale qui repense sa chaîne logistique : toutes prennent des décisions stratégiques.
                </p>
                <p>
                  Mais qu'est-ce que la stratégie d'entreprise, au juste ?
                </p>
                <p className="italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  La définition la plus classique, proposée par Alfred Chandler (Harvard Business School, 1962), reste une référence :
                </p>
                <p className="font-semibold border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  « La stratégie consiste à déterminer les objectifs à long terme d'une entreprise, à choisir les actions à entreprendre et à allouer les ressources nécessaires pour les atteindre. »
                </p>
                <p>
                  Cette définition simple cache une idée fondamentale : <strong>la stratégie est un art du choix</strong>.
                </p>
                <p>
                  Elle suppose de décider dans l'incertitude, d'orienter l'avenir, et de mobiliser les ressources de manière cohérente.
                </p>
              </section>

              {/* Image INFO2 */}
              <div className="my-8 flex justify-center">
                <div className="border-2 border-[#032622] p-4 bg-white">
                  <Image
                    src="/img/inforgr/Infographie/INFO2.png"
                    alt="Infographie - Fondements de la stratégie d'entreprise"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Notes rapides */}
              <div className="mt-6">
                <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                  Notes rapides
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                  placeholder="Notez vos réflexions personnelles..."
                ></textarea>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setStep("bloc1CoursSelection")}
                className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>RETOUR</span>
              </button>
              <button
                onClick={() => {}}
                className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
              >
                <span>CONTINUER</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Bouton retour */}
          <button
            onClick={() => setStep("bloc1CoursSelection")}
            className="w-full border border-black bg-[#F8F5E4] p-3 flex items-center justify-center hover:bg-[#032622] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Modules sidebar */}
          <div className="space-y-3">
            {/* MODULE 1 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 1</span>
                  <span className="text-sm font-bold leading-tight">POLITIQUE ET STRATÉGIE D'ENTREPRISE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction : la stratégie, une nécessité dans un monde incertain</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Les fondements théoriques de la stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Les différents niveaux de stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 2 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 2</span>
                  <span className="text-sm font-bold leading-tight">STRATÉGIE MARKETING</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction au marketing stratégique</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Analyse du marché et segmentation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Positionnement et mix marketing</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 3 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 3</span>
                  <span className="text-sm font-bold leading-tight">TRANSFORMATION DIGITALE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à la transformation digitale</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Stratégies de digitalisation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Technologies et outils digitaux</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 4 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 4</span>
                  <span className="text-sm font-bold leading-tight">ÉTUDE DE MARCHÉ - VEILLE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à l'analyse de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span>Les sources d'information</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Méthodes d'étude de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">La veille concurrentielle</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">5.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* Étude de cas du bloc */}
            <div className="bg-gray-100 p-3 border-b border-black">
              <div className="text-xs font-bold text-[#032622] uppercase">
                ÉTUDE DE CAS DU BLOC
              </div>
            </div>
          </div>

          {/* Agenda du cours */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 3 novembre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 8 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>PSE - Partie 1</span>
                <span className="font-bold">25%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Fondements théoriques
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Stratégie Marketing - Partie 1.1 (structure de base)
  const renderStrategieMarketingPartie1_1 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("bloc1CoursSelection")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Bloc 1 · Stratégie Marketing · Partie 1
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 – COMPRENDRE LES FONDEMENTS ET LES NOUVEAUX ENJEUX DE LA STRATÉGIE MARKETING
            </h3>

            <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Introduction – De la stratégie commerciale à la stratégie marketing globale
            </h4>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4">
                <p>
                  Le marketing a longtemps été perçu comme une fonction de soutien, un département chargé de "faire connaître" ce que l'entreprise décidait déjà de produire. Pendant des décennies, la stratégie commerciale dominait : l'enjeu était de vendre, d'écouler, de convaincre. Les entreprises définissent leurs objectifs de vente, puis cherchent les meilleurs arguments pour pousser leurs produits sur le marché.
                </p>
                <p>
                  <strong>Mais le monde a changé radicalement.</strong>
                </p>
                <p>
                  Aujourd'hui, la logique s'est inversée. Ce n'est plus l'entreprise qui impose sa vision au consommateur, mais le consommateur qui redéfinit les règles du jeu. Les marques ne décident plus seules de leur succès : elles doivent s'adapter, écouter, anticiper, inspirer. Le marketing n'est plus un appendice de la vente, il en est devenu le moteur stratégique. Il guide la conception de l'offre, la communication, le positionnement, et même la raison d'être de l'entreprise.
                </p>
                <p>
                  C'est cette bascule que ce premier chapitre explore : comment on est passé d'une stratégie commerciale orientée produit, à une stratégie marketing globale et intégrée, orientée client, expérience et sens.
                </p>
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Car aujourd'hui, parler de stratégie marketing, c'est parler d'une vision à 360 degrés. Ce n'est plus seulement décider d'un prix ou d'un canal de distribution, mais penser l'entreprise comme une marque vivante, qui raconte une histoire, crée de la valeur et tisse une relation durable avec son public.
                </p>
                <p>
                  Pour comprendre cette transformation, il faut d'abord revenir aux fondamentaux : les grands principes de segmentation, de ciblage, de positionnement et de mix marketing, qui restent la colonne vertébrale de toute stratégie. Il faut ensuite saisir la différence entre une stratégie marketing et une stratégie d'entreprise — deux logiques souvent confondues, mais profondément complémentaires. Et enfin, il faut observer comment certaines marques, comme Nike, ont su dépasser les modèles classiques pour bâtir des stratégies globales où performance, identité et émotion ne font qu'un.
                </p>
                <p>
                  C'est tout l'enjeu de cette première étape : comprendre comment le marketing est devenu non plus un simple outil de conquête, mais une culture stratégique au cœur de la performance moderne.
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h5 className="font-bold text-xl text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  1. De la stratégie commerciale à la stratégie marketing globale
                </h5>
                
                <h6 className="font-bold text-lg text-[#032622] mt-4">
                  1a. Rappel des fondamentaux (segmentation, ciblage, positionnement, mix marketing)
                </h6>

                <p>
                  Avant d'imaginer des stratégies sophistiquées mêlant IA, data et influence, il faut revenir aux fondations. Car toute démarche marketing, quelle que soit son époque ou son niveau de sophistication, repose sur quatre piliers universels : <strong>la segmentation, le ciblage, le positionnement et le mix marketing</strong>. Ces éléments constituent le squelette de toute stratégie cohérente.
                </p>
              </section>

              {/* Placeholder pour vidéo */}
              <div className="relative mt-8 mb-6">
                <div className="border-2 border-[#032622] bg-white p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                    <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
                      Vidéo : Les fondamentaux du marketing
                    </h5>
                  </div>
                  <div className="border-2 border-[#032622] bg-gray-200 p-12 text-center">
                    <p className="text-sm font-bold text-[#032622] uppercase mb-2">
                      Vidéo à ajouter prochainement
                    </p>
                    <p className="text-xs text-[#032622]/70 italic">
                      Emplacement réservé pour la vidéo sur les fondamentaux du marketing
                    </p>
                  </div>
                </div>
              </div>

              <section className="space-y-4 mt-8">
                <p>
                  La segmentation consiste à découper le marché en groupes distincts de consommateurs, partageant des caractéristiques communes : des besoins, des comportements, des valeurs, une sensibilité au prix, un mode de vie ou encore une manière de consommer. L'objectif n'est pas de réduire le marché, mais de le comprendre en profondeur pour y détecter des zones d'opportunité. Une marque comme L'Oréal, par exemple, ne s'adresse pas simplement aux "femmes" ou aux "hommes" : elle segmente son marché selon le type de peau, la nature du cheveu, l'âge, le pouvoir d'achat, et de plus en plus selon des critères socioculturels — par exemple la sensibilité à la durabilité ou à l'inclusivité. C'est cette granularité qui permet ensuite d'adapter l'offre, la communication et le ton à chaque cible.
                </p>
                <p>
                  Une fois le marché segmenté, vient la question du ciblage. C'est ici que la stratégie devient un choix : quels segments l'entreprise décide-t-elle de servir, et lesquels choisit-elle d'ignorer ? Ce choix dépend de la taille du marché, de la valeur potentielle des clients, du niveau de concurrence et de la capacité de l'entreprise à y répondre efficacement. Michelin, par exemple, cible à la fois les automobilistes haut de gamme — sensibles à la performance et à la durabilité de leurs pneus — et les professionnels de la route, pour qui la fiabilité et le service après-vente priment. Dans chaque cas, la promesse marketing, la distribution et même le ton de communication diffèrent.
                </p>
                <p>
                  Vient ensuite le positionnement, sans doute l'élément le plus symbolique de la stratégie marketing. Il s'agit de définir la manière dont une marque veut être perçue dans l'esprit du consommateur. Le positionnement n'est pas ce qu'une marque dit d'elle-même, mais ce que le marché retient d'elle. Volvo s'est historiquement positionnée sur la sécurité, IKEA sur le design accessible, Apple sur la créativité et la simplicité d'usage. Le positionnement donne une direction claire à tout ce que fait la marque — des produits jusqu'aux réseaux sociaux.
                </p>
                <p>
                  Enfin, le marketing mix, souvent résumé par les "4P" (Produit, Prix, Place, Promotion), traduit cette stratégie dans l'action. Le Produit incarne la promesse : son design, sa qualité, son innovation, son packaging sont les premiers vecteurs d'image. Le Prix reflète la valeur perçue : un positionnement premium, comme celui d'Apple, repose sur un tarif élevé assumé, tandis que d'autres marques jouent la carte de l'accessibilité et du volume. La Place désigne les canaux de distribution — physiques, digitaux ou hybrides — par lesquels la marque rencontre son client. Et la Promotion regroupe toutes les formes de communication qui nourrissent la relation : publicité, contenu, influence, événementiel, relations presse.
                </p>
              </section>

              {/* Image INFO6 */}
              <div className="my-8 flex justify-center">
                <div className="border-2 border-[#032622] p-4 bg-white">
                  <Image
                    src="/img/info/INFO6.png"
                    alt="Infographie - Marketing Mix et fondamentaux"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <section className="space-y-4 mt-8">
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Ces quatre leviers forment un tout cohérent : une marque forte aligne son mix marketing sur sa promesse, son marché et son identité. C'est précisément cet alignement, entre compréhension du consommateur, clarté du positionnement et cohérence du mix, qui distingue une stratégie "brillante" d'une stratégie "bruyante".
                </p>
              </section>

              <section className="space-y-4 mt-8">
                <h6 className="font-bold text-lg text-[#032622]">
                  1b. Différence entre stratégie marketing et stratégie d'entreprise
                </h6>

                <p>
                  Il existe souvent une confusion entre stratégie marketing et stratégie d'entreprise, alors qu'elles relèvent de deux niveaux d'analyse très différents. La stratégie d'entreprise trace la direction générale. Elle définit les grandes orientations : sur quels marchés être présent, quels produits ou services développer, quelles alliances nouer, comment répartir les ressources entre les différentes activités. Elle répond à des questions de fond : où voulons-nous aller ? Avec quels moyens ? Et dans quel délai ?
                </p>
                <p>
                  La stratégie marketing, elle, traduit cette vision en actions concrètes sur le marché. C'est le prolongement opérationnel de la stratégie d'entreprise. Là où la direction générale parle de "croissance à l'international" ou de "nouvelle offre digitale", la direction marketing doit définir comment séduire, convaincre et fidéliser les clients concernés. En d'autres termes : <strong>la stratégie d'entreprise formule le quoi, la stratégie marketing précise le comment</strong>.
                </p>
                <p>
                  Prenons l'exemple de Tesla. La stratégie d'entreprise de Tesla repose sur la transition vers une mobilité durable et sur la maîtrise de la chaîne de valeur électrique — batteries, véhicules, énergie solaire. C'est une vision industrielle et financière. Mais la stratégie marketing de Tesla, elle, s'exprime dans la manière dont la marque se connecte à ses clients : un positionnement avant-gardiste, des campagnes centrées sur la communauté et non sur le produit, un discours de rupture porté par une figure entrepreneuriale forte. Elon Musk n'est pas qu'un PDG, c'est le visage de la marque, un symbole vivant de la mission de Tesla.
                </p>
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Cette articulation est essentielle : une entreprise sans stratégie marketing est muette sur son propre marché, tandis qu'une stratégie marketing sans vision d'entreprise perd son sens et sa cohérence à long terme.
                </p>
                <p>
                  L'entreprise fixe le cap, le marketing trace le chemin. L'une bâtit la mission, l'autre crée la relation. Et c'est cette complémentarité qui fait la solidité d'un modèle.
                </p>
                <p className="font-semibold">
                  On pourrait dire que la stratégie d'entreprise regarde vers le futur du marché, alors que la stratégie marketing regarde le présent du consommateur. La première est abstraite, la seconde est humaine. Ensemble, elles forment le langage complet de la marque : la raison d'être et la manière d'exister.
                </p>
              </section>

              {/* Image INFO3 */}
              <div className="my-8 flex justify-center">
                <div className="border-2 border-[#032622] p-4 bg-white">
                  <Image
                    src="/img/info/INFO3.png"
                    alt="Infographie - Stratégie marketing vs stratégie d'entreprise"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Notes rapides */}
              <div className="mt-6">
                <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                  Notes rapides
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                  placeholder="Notez vos réflexions personnelles..."
                ></textarea>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setStep("bloc1CoursSelection")}
                className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>RETOUR</span>
              </button>
              <button
                onClick={() => setStep("strategie_marketing_partie1_2")}
                className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
              >
                <span>CONTINUER</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Bouton retour */}
          <button
            onClick={() => setStep("bloc1CoursSelection")}
            className="w-full border border-black bg-[#F8F5E4] p-3 flex items-center justify-center hover:bg-[#032622] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Modules sidebar */}
          <div className="space-y-3">
            {/* MODULE 1 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 1</span>
                  <span className="text-sm font-bold leading-tight">POLITIQUE ET STRATÉGIE D'ENTREPRISE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction : la stratégie, une nécessité dans un monde incertain</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Les fondements théoriques de la stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Les différents niveaux de stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 2 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 2</span>
                  <span className="text-sm font-bold leading-tight">STRATÉGIE MARKETING</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction au marketing stratégique</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Analyse du marché et segmentation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Positionnement et mix marketing</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 3 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 3</span>
                  <span className="text-sm font-bold leading-tight">TRANSFORMATION DIGITALE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à la transformation digitale</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Stratégies de digitalisation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Technologies et outils digitaux</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 4 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 4</span>
                  <span className="text-sm font-bold leading-tight">ÉTUDE DE MARCHÉ - VEILLE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à l'analyse de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span>Les sources d'information</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Méthodes d'étude de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">La veille concurrentielle</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">5.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* Étude de cas du bloc */}
            <div className="bg-gray-100 p-3 border-b border-black">
              <div className="text-xs font-bold text-[#032622] uppercase">
                ÉTUDE DE CAS DU BLOC
              </div>
            </div>
          </div>

          {/* Agenda du cours */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 3 novembre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 8 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Stratégie Marketing - Partie 1</span>
                <span className="font-bold">25%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Fondements du marketing
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu Stratégie Marketing - Partie 1.2 (suite)
  const renderStrategieMarketingPartie1_2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("strategie_marketing_partie1_1")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Bloc 1 · Stratégie Marketing · Partie 1
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 – COMPRENDRE LES FONDEMENTS ET LES NOUVEAUX ENJEUX DE LA STRATÉGIE MARKETING
            </h3>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4 mt-8">
                <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  1c. Exemple narratif : comment Nike structure sa stratégie marketing autour d'une vision globale du sport et de la performance
                </h6>

                <p>
                  S'il y a une marque qui incarne à la perfection la fusion entre stratégie d'entreprise et stratégie marketing, c'est Nike. Depuis sa création, Nike n'a jamais simplement vendu des chaussures ou des vêtements : elle a vendu une philosophie du dépassement de soi.
                </p>
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Sa promesse est universelle — "Just Do It" — mais sa mise en œuvre est d'une finesse stratégique exceptionnelle.
                </p>
                <p>
                  Nike comprend que le sport est plus qu'une activité : c'est un langage universel, une expression de la volonté, de la discipline et de la fierté personnelle. Plutôt que de segmenter son marché par genre, âge ou discipline sportive, la marque segmente par état d'esprit. Elle distingue les "athlètes du quotidien", ceux qui courent après le travail, des "compétiteurs" qui cherchent la performance, et des "inspirateurs" — ceux qui motivent les autres par leur attitude. C'est une segmentation psychographique, fondée sur la motivation et non sur la statistique.
                </p>
                <p>
                  Son positionnement est clair : Nike n'est pas seulement une marque de sport, c'est la marque de la performance individuelle. Là où Adidas mise sur la technologie, Nike mise sur le mental. Ce n'est pas un hasard si chaque campagne publicitaire raconte une histoire de résilience : Serena Williams affrontant le doute, Colin Kaepernick défendant ses convictions, ou encore des anonymes surmontant leurs limites. Chaque récit devient un miroir dans lequel le consommateur peut se reconnaître.
                </p>
                <p>
                  Le marketing mix de Nike illustre cette cohérence totale. Ses produits allient design, innovation et storytelling : une paire de chaussures n'est pas qu'un objet, c'est une extension de la volonté. Le prix, souvent supérieur à la moyenne, exprime la valeur symbolique du dépassement. La distribution, omnicanale, s'appuie sur des boutiques expérientielles, un e-commerce intégré et une application communautaire — Nike Run Club — qui connecte les utilisateurs entre eux. Quant à la communication, elle est émotionnelle, inclusive, et profondément culturelle : Nike ne parle pas du sport, elle parle de ce que le sport dit de nous.
                </p>
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Ce qui rend la stratégie de Nike fascinante, c'est cette fusion absolue entre le sens et l'action. La marque a su transformer une vision en culture, une culture en expérience, et une expérience en fidélité. Elle n'a pas besoin de "faire du marketing", parce qu'elle est son propre marketing. Et c'est là toute la leçon : une stratégie marketing réussie n'est pas une addition de campagnes, mais la mise en cohérence d'une idée, d'une identité et d'une émotion.
                </p>
              </section>

              {/* Image INFO1 */}
              <div className="my-8 flex justify-center">
                <div className="border-2 border-[#032622] p-4 bg-white">
                  <Image
                    src="/img/info/1.png"
                    alt="Infographie - Stratégie marketing Nike"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Notes rapides */}
              <div className="mt-6">
                <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                  Notes rapides
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                  placeholder="Notez vos réflexions personnelles..."
                ></textarea>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setStep("strategie_marketing_partie1_1")}
                className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PRÉCÉDENT</span>
              </button>
              <button
                onClick={() => setStep("strategie_marketing_partie1_3")}
                className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
              >
                <span>CONTINUER</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Bouton retour */}
          <button
            onClick={() => setStep("bloc1CoursSelection")}
            className="w-full border border-black bg-[#F8F5E4] p-3 flex items-center justify-center hover:bg-[#032622] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Modules sidebar */}
          <div className="space-y-3">
            {/* MODULE 1 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 1</span>
                  <span className="text-sm font-bold leading-tight">POLITIQUE ET STRATÉGIE D'ENTREPRISE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction : la stratégie, une nécessité dans un monde incertain</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Les fondements théoriques de la stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Les différents niveaux de stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 2 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 2</span>
                  <span className="text-sm font-bold leading-tight">STRATÉGIE MARKETING</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction au marketing stratégique</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Analyse du marché et segmentation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Positionnement et mix marketing</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 3 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 3</span>
                  <span className="text-sm font-bold leading-tight">TRANSFORMATION DIGITALE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à la transformation digitale</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Stratégies de digitalisation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Technologies et outils digitaux</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 4 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 4</span>
                  <span className="text-sm font-bold leading-tight">ÉTUDE DE MARCHÉ - VEILLE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à l'analyse de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span>Les sources d'information</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Méthodes d'étude de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">La veille concurrentielle</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">5.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* Étude de cas du bloc */}
            <div className="bg-gray-100 p-3 border-b border-black">
              <div className="text-xs font-bold text-[#032622] uppercase">
                ÉTUDE DE CAS DU BLOC
              </div>
            </div>
          </div>

          {/* Agenda du cours */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#032622] space-y-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>Date de publication : 3 novembre 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Temps de lecture estimé : 6 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progression du module */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Votre progression</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-[#032622]">
                <span>Stratégie Marketing - Partie 1</span>
                <span className="font-bold">30%</span>
              </div>
              <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6B8E23] h-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-[10px] text-[#032622]/70 italic">
                Fondements du marketing
              </p>
            </div>
          </div>

          {/* Outils d'apprentissage */}
          <div className="border border-black bg-[#F8F5E4]">
            <div className="border-b border-black p-4 bg-[#032622]">
              <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <BookOpen className="w-3 h-3" />
                <span>Mes Notes</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Flashcards</span>
              </button>
              <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
                <FileText className="w-3 h-3" />
                <span>Résumé IA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 1_3 : Section 2a - Les nouveaux paradigmes du marketing (digital, data, expérience client)
  const renderStrategieMarketingPartie1_3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep("strategie_marketing_partie1_2")}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>

      {renderProgressBar()}

      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Bloc 1 · Stratégie Marketing · Partie 1
            </p>
            
            {/* Surligneur amélioré */}
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">
                    Surligneur intelligent
                  </span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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

            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              PARTIE 1 – COMPRENDRE LES FONDEMENTS ET LES NOUVEAUX ENJEUX DE LA STRATÉGIE MARKETING
            </h3>

            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              <section className="space-y-4 mt-8">
                <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  2. Les nouveaux paradigmes du marketing
                </h4>
                
                <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
                  2a. L'influence du digital, de la data et de l'expérience client
                </h5>

                <p>
                  Le marketing n'est plus une discipline fondée sur l'intuition et la créativité seule. Il repose désormais sur la donnée, la mesure et la personnalisation en temps réel.
                </p>
                <p>
                  Le digital a fait exploser le volume d'informations disponibles sur les comportements des consommateurs. Chaque clic, chaque interaction, chaque panier abandonné ou chaque avis client devient une source de données exploitable. En 2024, on estime que plus de 2,5 quintillions d'octets de données sont générés chaque jour dans le monde, dont une part significative issue du e-commerce et des plateformes sociales.
                </p>
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Cette transformation a rendu la data marketing indispensable à la prise de décision.
                </p>
                <p>
                  Les entreprises n'élaborent plus une stratégie marketing sur des hypothèses générales, mais sur des modèles prédictifs, des tableaux de bord en temps réel et des analyses comportementales.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Les outils de CRM (Customer Relationship Management) comme Salesforce, HubSpot ou Zoho CRM permettent de centraliser la donnée client et de suivre l'ensemble du parcours — de la prospection jusqu'à la fidélisation.</li>
                  <li>Les plateformes de marketing automation comme Mailchimp, ActiveCampaign ou Sendinblue automatisent les campagnes selon les actions réelles des utilisateurs (taux d'ouverture, navigation, panier, etc.).</li>
                </ul>
                <p>
                  Le marketing moderne s'appuie sur des indicateurs clés de performance (KPIs) précis :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>le taux de conversion (nombre d'achats / visiteurs),</li>
                  <li>le coût d'acquisition client (CAC),</li>
                  <li>la valeur vie client (Customer Lifetime Value – CLV),</li>
                  <li>ou encore le Net Promoter Score (NPS), qui mesure la satisfaction et la fidélité.</li>
                </ul>
              </section>

              {/* Image INFO2 */}
              <div className="my-8 flex justify-center">
                <div className="border-2 border-[#032622] p-4 bg-white">
                  <Image
                    src="/img/info/2.png"
                    alt="Infographie - Digital, data et expérience client"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <section className="space-y-4 mt-8">
                <p>
                  Les directions marketing performantes travaillent aujourd'hui en lien étroit avec les data analysts, les UX designers et les responsables produit pour piloter la performance à partir de données vérifiables et visualisées.
                </p>
                <p>
                  Des outils comme Google Data Studio, Power BI ou Tableau permettent de croiser les données CRM, ventes et trafic web pour obtenir une vision consolidée de la rentabilité marketing.
                </p>
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  Mais le digital n'a pas seulement transformé la mesure : il a redéfini la relation entre la marque et le client.
                </p>
                <p>
                  L'expérience client est devenue le principal facteur de différenciation. Selon une étude PwC, 73 % des consommateurs considèrent l'expérience comme un critère décisif d'achat, parfois plus que le prix ou le produit lui-même.
                </p>
                <p>
                  Cela implique de repenser chaque point de contact : site web, application, service après-vente, packaging, ou même ton des e-mails.
                </p>
                <p className="font-semibold">
                  L'objectif n'est plus seulement de vendre, mais de créer une expérience cohérente, fluide et émotionnellement satisfaisante à chaque interaction.
                </p>
                <p>
                  Les entreprises les plus avancées intègrent désormais la Customer Experience (CX) au même niveau stratégique que la finance ou les opérations.
                </p>
                <p>
                  Elles analysent le parcours utilisateur complet — du premier contact jusqu'à la recommandation — en utilisant des outils tels que Hotjar, Google Analytics 4, UXCam ou FullStory, capables de reconstituer le comportement des utilisateurs sur un site ou une app.
                </p>
                <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
                  L'expérience client devient un levier de performance mesurable, corrélée directement au chiffre d'affaires.
                </p>
                <p>
                  Ainsi, le marketing contemporain repose sur une nouvelle équation :
                </p>
                <p className="text-xl font-bold text-center py-4 border-2 border-[#032622] bg-white">
                  Créativité + Data + Technologie = Pertinence.
                </p>
              </section>

              {/* Notes rapides */}
              <div className="mt-6">
                <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
                  Notes rapides
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
                  placeholder="Notez vos réflexions personnelles..."
                ></textarea>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setStep("strategie_marketing_partie1_2")}
                className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PRÉCÉDENT</span>
              </button>
              <button
                onClick={() => setStep("strategie_marketing_partie1_4")}
                className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
              >
                <span>CONTINUER</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Bouton retour */}
          <button
            onClick={() => setStep("bloc1CoursSelection")}
            className="w-full border border-black bg-[#F8F5E4] p-3 flex items-center justify-center hover:bg-[#032622] hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Modules sidebar */}
          <div className="space-y-3">
            {/* MODULE 1 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 1</span>
                  <span className="text-sm font-bold leading-tight">POLITIQUE ET STRATÉGIE D'ENTREPRISE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction : la stratégie, une nécessité dans un monde incertain</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Les fondements théoriques de la stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Les différents niveaux de stratégie</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 2 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 2</span>
                  <span className="text-sm font-bold leading-tight">STRATÉGIE MARKETING</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction au marketing stratégique</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Analyse du marché et segmentation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Positionnement et mix marketing</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 3 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 3</span>
                  <span className="text-sm font-bold leading-tight">TRANSFORMATION DIGITALE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à la transformation digitale</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Stratégies de digitalisation</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Technologies et outils digitaux</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>

            {/* MODULE 4 */}
            <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 4</span>
                  <span className="text-sm font-bold leading-tight">ÉTUDE DE MARCHÉ - VEILLE</span>
                </div>
              </div>
              <div className="bg-white p-4 space-y-2.5">
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
                  <span className="leading-relaxed">Introduction à l'analyse de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
                  <span className="leading-relaxed">Les sources d'information</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
                  <span className="leading-relaxed">Méthodes d'étude de marché</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
                  <span className="leading-relaxed">La veille concurrentielle</span>
                </div>
                <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
                  <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">5.</span>
                  <span className="leading-relaxed">Cas final du module</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function pour la sidebar commune
  const renderMarketingSidebar = () => (
    <div className="space-y-4">
      <button
        onClick={() => setStep("bloc1CoursSelection")}
        className="w-full border border-black bg-[#F8F5E4] p-3 flex items-center justify-center hover:bg-[#032622] hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="space-y-3">
        <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 1</span>
              <span className="text-sm font-bold leading-tight">POLITIQUE ET STRATÉGIE D'ENTREPRISE</span>
            </div>
          </div>
          <div className="bg-white p-4 space-y-2.5">
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
              <span className="leading-relaxed">Introduction : la stratégie, une nécessité dans un monde incertain</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
              <span className="leading-relaxed">Les fondements théoriques de la stratégie</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
              <span className="leading-relaxed">Les différents niveaux de stratégie</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
              <span className="leading-relaxed">Cas final du module</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 2</span>
              <span className="text-sm font-bold leading-tight">STRATÉGIE MARKETING</span>
            </div>
          </div>
          <div className="bg-white p-4 space-y-2.5">
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
              <span className="leading-relaxed">Introduction au marketing stratégique</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
              <span className="leading-relaxed">Analyse du marché et segmentation</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
              <span className="leading-relaxed">Positionnement et mix marketing</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
              <span className="leading-relaxed">Cas final du module</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 3</span>
              <span className="text-sm font-bold leading-tight">TRANSFORMATION DIGITALE</span>
            </div>
          </div>
          <div className="bg-white p-4 space-y-2.5">
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
              <span className="leading-relaxed">Introduction à la transformation digitale</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
              <span className="leading-relaxed">Stratégies de digitalisation</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
              <span className="leading-relaxed">Technologies et outils digitaux</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
              <span className="leading-relaxed">Cas final du module</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-[#032622]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-[#032622] to-[#032622]/90 p-4 text-white">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">MODULE 4</span>
              <span className="text-sm font-bold leading-tight">ÉTUDE DE MARCHÉ - VEILLE</span>
            </div>
          </div>
          <div className="bg-white p-4 space-y-2.5">
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">1.</span>
              <span className="leading-relaxed">Introduction à l'analyse de marché</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">2.</span>
              <span className="leading-relaxed">Les sources d'information</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">3.</span>
              <span className="leading-relaxed">Méthodes d'étude de marché</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">4.</span>
              <span className="leading-relaxed">La veille concurrentielle</span>
            </div>
            <div className="text-sm text-[#032622] flex items-start space-x-2.5 hover:text-[#032622]/80 transition-colors cursor-pointer group">
              <span className="font-bold text-[#032622]/60 group-hover:text-[#032622] transition-colors">5.</span>
              <span className="leading-relaxed">Cas final du module</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-black bg-[#F8F5E4]">
        <div className="border-b border-black p-4 bg-[#032622]">
          <p className="text-white text-xs font-bold uppercase">Agenda du cours</p>
        </div>
        <div className="p-4">
          <div className="text-xs text-[#032622] space-y-3">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4" />
              <span>Date de publication : 3 novembre 2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Temps de lecture estimé : 6 min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border border-black bg-[#F8F5E4]">
        <div className="border-b border-black p-4 bg-[#032622]">
          <p className="text-white text-xs font-bold uppercase">Votre progression</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center text-xs text-[#032622]">
            <span>Stratégie Marketing</span>
            <span className="font-bold">{progressMap[step] || 0}%</span>
          </div>
          <div className="w-full bg-[#032622]/20 h-2 rounded-full overflow-hidden">
            <div className="bg-[#6B8E23] h-full" style={{ width: `${progressMap[step] || 0}%` }}></div>
          </div>
        </div>
      </div>
      <div className="border border-black bg-[#F8F5E4]">
        <div className="border-b border-black p-4 bg-[#032622]">
          <p className="text-white text-xs font-bold uppercase">Outils d'étude</p>
        </div>
        <div className="p-3 space-y-2">
          <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
            <BookOpen className="w-3 h-3" />
            <span>Mes Notes</span>
          </button>
          <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
            <Lightbulb className="w-3 h-3" />
            <span>Flashcards</span>
          </button>
          <button className="w-full border border-[#032622] bg-white hover:bg-[#6B8E23] hover:text-white hover:border-[#6B8E23] transition-all px-3 py-2 text-xs font-bold text-[#032622] flex items-center space-x-2">
            <FileText className="w-3 h-3" />
            <span>Résumé IA</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Helper function pour le wrapper de page avec surligneur
  const renderMarketingPageWrapper = (content: React.ReactNode, prevStep: Step, nextStep: Step | null, title: string = "PARTIE 1 – COMPRENDRE LES FONDEMENTS ET LES NOUVEAUX ENJEUX DE LA STRATÉGIE MARKETING") => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(prevStep)}
          className="flex items-center space-x-2 text-sm font-bold text-[#032622]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>RETOUR</span>
        </button>
        <Bookmark className="w-5 h-5 text-[#032622]" />
      </div>
      {renderProgressBar()}
      <div className="grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <div className="space-y-6">
          <div className="border border-black bg-[#F8F5E4] p-6">
            <p className="text-xs font-semibold text-[#032622] uppercase mb-2">
              Bloc 1 · Stratégie Marketing · Partie 1
            </p>
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Highlighter className="w-4 h-4 text-[#032622]" />
                  <span className="text-xs font-bold uppercase text-[#032622]">Surligneur intelligent</span>
                </div>
                <div className="text-xs text-[#032622]/70">
                  {highlights.length} surlignage{highlights.length > 1 ? 's' : ''}
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
                  onClick={() => setShowHighlightMenu(!showHighlightMenu)}
                  className={`w-10 h-10 border-2 rounded-lg transition-all hover:scale-110 flex items-center justify-center ${
                    showHighlightMenu ? 'border-red-500 bg-red-100' : 'border-gray-400 bg-gray-100'
                  }`}
                  title="Mode gomme"
                >
                  <Eraser className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {showHighlightMenu && (
                  <div className="flex items-center space-x-1 border border-red-500 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 rounded">
                    <Eraser className="w-3 h-3" />
                    <span>Mode gomme actif</span>
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
                    showFavoritesOnly ? 'bg-yellow-100 text-yellow-700' : 'bg-[#F8F5E4] text-[#032622] hover:bg-yellow-100 hover:text-yellow-700'
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
            <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {title}
            </h3>
            <div
              ref={courseContentRef}
              className={`space-y-6 text-base text-[#032622] leading-relaxed ${
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
                      setShowHighlightMenu(false);
                    }
                  }
                }
              }}
            >
              {content}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setStep(prevStep)}
                className="border border-black bg-[#F8F5E4] px-4 py-3 text-sm font-bold text-[#032622] flex items-center justify-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PRÉCÉDENT</span>
              </button>
              {nextStep && (
                <button
                  onClick={() => setStep(nextStep)}
                  className="border border-black bg-[#032622] text-white px-4 py-3 text-sm font-bold flex items-center justify-center space-x-2"
                >
                  <span>CONTINUER</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
        {renderMarketingSidebar()}
      </div>
    </div>
  );

  // Page 1_4 : Sections 2b (customer centricity) + 2c (Decathlon) + vidéo YouTube
  const renderStrategieMarketingPartie1_4 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2b. Le passage du produit au client : la "customer centricity"
        </h5>
        <p>
          Le paradigme dominant du marketing actuel est celui de la centrage client — ou customer centricity.
        </p>
        <p>
          Historiquement, les entreprises définissent leur offre en partant du produit : on concevait un bien, puis on cherchait à le vendre au plus grand nombre.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Aujourd'hui, le mouvement est inverse : on commence par analyser les besoins, les frustrations et les aspirations du client, puis on construit une offre sur mesure.
        </p>
        <p>
          Cette approche est permise par la data, mais aussi par la culture organisationnelle.
        </p>
        <p>
          Une entreprise réellement "customer centric" ne se contente pas d'étudier ses clients ; elle organise toutes ses fonctions autour d'eux : marketing, R&D, service client, communication, supply chain.
        </p>
        <p>
          Amazon en est l'exemple emblématique : chaque décision stratégique est guidée par la question "Qu'est-ce qui apporte le plus de valeur au client final ?". Ce principe est inscrit dans son ADN managérial.
        </p>
        <p>
          Les outils de la customer centricity sont multiples :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>les personas data-driven, basés sur des données comportementales et non sur des profils théoriques ;</li>
          <li>les parcours clients cartographiés (customer journey mapping), permettant d'identifier les irritants à chaque étape ;</li>
          <li>les feedback loops, systèmes de boucles de rétroaction continues via enquêtes, formulaires ou NPS ;</li>
          <li>les stratégies d'AB testing, qui comparent en temps réel plusieurs variantes d'un message, d'un visuel ou d'une interface pour mesurer l'efficacité.</li>
        </ul>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Les entreprises qui réussissent leur transformation marketing ne sont plus celles qui communiquent le plus fort, mais celles qui écoutent le mieux.
        </p>
        <p>
          Elles exploitent les signaux faibles pour anticiper les attentes.
        </p>
        <p>
          Netflix, par exemple, analyse les temps de pause, les abandons de visionnage ou les notes attribuées aux séries pour adapter non seulement ses recommandations, mais aussi ses productions futures.
        </p>
        <p>
          L'entreprise utilise plus de 1 300 micro-segments d'audience pour personnaliser ses contenus et ses affiches selon les préférences locales.
        </p>
        <p className="font-semibold">
          La customer centricity, ce n'est donc pas une posture, mais une méthodologie d'entreprise, fondée sur la donnée, la personnalisation et la réactivité.
        </p>
        <p>
          Elle implique aussi une refonte culturelle : passer d'une organisation orientée "produit" à une organisation orientée "expérience".
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2c. Exemple — Decathlon et l'exploitation des insights clients dans la refonte de son offre et de ses services
        </h5>
        <p>
          Decathlon illustre parfaitement cette transformation structurelle du marketing moderne.
        </p>
        <p>
          Longtemps perçue comme une enseigne de grande distribution d'articles de sport, l'entreprise a entrepris une mutation profonde : passer d'un modèle centré sur le produit à un modèle centré sur l'usage, la donnée et la communauté.
        </p>
        <p>
          En interne, Decathlon a développé une stratégie de Customer Intelligence, fondée sur la collecte et l'analyse d'insights clients à grande échelle.
        </p>
        <p>
          Chaque interaction, qu'elle ait lieu en magasin, sur le site web ou via l'application mobile, alimente une base de données centralisée.
        </p>
        <p className="font-semibold">
          L'entreprise dispose aujourd'hui de plus de 300 millions de profils clients actifs dans son écosystème digital mondial, permettant une personnalisation fine de l'expérience d'achat.
        </p>
        <p>
          À partir de ces données, Decathlon a restructuré son offre autour de trois logiques :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>L'usage</strong> — comprendre pourquoi et comment le client pratique une activité sportive.</li>
          <li><strong>La fréquence</strong> — mesurer la récurrence pour adapter la disponibilité et les stocks.</li>
          <li><strong>L'émotion</strong> — identifier la motivation derrière l'achat : bien-être, compétition, loisir, santé.</li>
        </ul>
        <p>
          Grâce à ces insights, la marque a lancé des services complémentaires :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Decathlon Coach, une application de suivi sportif connectée, intégrée au parcours client.</li>
          <li>Des programmes de location et de seconde main, basés sur des études comportementales montrant qu'un tiers des utilisateurs renonçaient à l'achat à cause du prix ou du stockage.</li>
          <li>Des tests produits communautaires : certains articles sont désormais co-développés avec les clients via des plateformes de feedback.</li>
        </ul>
        <p>
          Sur le plan technique, Decathlon s'appuie sur des outils d'analyse prédictive internes et sur des plateformes de data visualization (notamment Power BI).
        </p>
        <p>
          Les équipes marketing croisent les données issues des magasins, des ventes en ligne et des interactions sur les réseaux sociaux pour anticiper la demande et ajuster les assortiments.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Résultat : entre 2019 et 2023, la marque a enregistré une hausse de +28 % de la satisfaction client (baromètre interne NPS) et une amélioration de +15 % du taux de conversion digital sur son site e-commerce.
        </p>
        <p>
          Decathlon n'est plus seulement un distributeur : c'est un écosystème de services sportifs, piloté par la donnée, nourri par l'usage réel et structuré autour de la valeur client.
        </p>
        <p className="font-semibold">
          Ce modèle illustre parfaitement le nouveau paradigme marketing : comprendre avant de concevoir, personnaliser avant de promouvoir, mesurer avant d'investir.
        </p>
      </section>

      {/* Vidéo YouTube Decathlon */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white w-full max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Decathlon et la transformation digitale
            </h5>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/nJ8PFhL1kcc?si=ZhC7wNXQNm241cfy"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie1_3",
    "strategie_marketing_partie1_5"
  );

  // Page 1_5 : Section 3a (RSE) - durabilité économique + cohérence + image INFO7.png
  const renderStrategieMarketingPartie1_5 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3. Les tendances structurantes du marketing
        </h4>
        <p>
          Le marketing évolue rapidement sous l'effet combiné de trois grandes dynamiques : la prise en compte croissante des enjeux RSE, la montée en puissance de la donnée et de la personnalisation, et la généralisation de l'intelligence artificielle dans les processus décisionnels.
        </p>
        <p>
          Ces tendances redéfinissent la manière dont les entreprises conçoivent leur stratégie, gèrent leur relation client et pilotent leur performance.
        </p>
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3a. RSE, durabilité et transparence
        </h5>
        <p>
          La RSE (Responsabilité Sociétale des Entreprises) est devenue une composante à part entière de la stratégie marketing.
        </p>
        <p>
          Les marques sont désormais jugées non seulement sur la qualité de leurs produits, mais aussi sur leur impact environnemental, social et éthique.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Ce changement s'explique par l'évolution des comportements d'achat : selon une étude Nielsen, près de 70 % des consommateurs déclarent privilégier des marques engagées.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1. L'importance de la traçabilité
        </h6>
        <p>
          La transparence est aujourd'hui un levier de confiance.
        </p>
        <p>
          Les consommateurs veulent connaître la provenance des produits, les conditions de fabrication et les engagements réels des entreprises.
        </p>
        <p>
          Pour répondre à cette attente, les marques mettent en place des outils de traçabilité comme les QR codes dynamiques ou les passeports produits numériques, utilisés notamment dans le textile et l'alimentation.
        </p>
        <p>
          Ces dispositifs permettent d'afficher des informations précises : origine des matières premières, empreinte carbone, certifications (Fair Trade, B Corp, etc.).
        </p>
        <p>
          Des entreprises comme Patagonia, Veja ou Decathlon intègrent désormais ces données directement sur leurs emballages ou leurs sites e-commerce.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2. La durabilité comme argument économique
        </h6>
        <p>
          Les produits responsables ne se limitent pas à une stratégie d'image : ils peuvent être rentables.
        </p>
        <p>
          Les études montrent que les produits identifiés comme "durables" génèrent souvent des marges supérieures de 10 à 15 %, en raison d'une meilleure fidélisation et d'un moindre taux de retour.
        </p>
        <p>
          Pour suivre ces performances, les entreprises développent de nouveaux indicateurs :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Part du chiffre d'affaires issue de produits éco-conçus ;</li>
          <li>Score RSE perçu (évalué via enquêtes consommateurs) ;</li>
          <li>NPS RSE, indicateur de recommandation lié à la confiance environnementale.</li>
        </ul>
      </section>

      {/* Image INFO7 */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/INFO7.png"
            alt="Infographie - RSE et durabilité"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3. La cohérence entre discours et pratiques
        </h6>
        <p>
          Une communication responsable n'a de valeur que si elle est soutenue par des actions concrètes.
        </p>
        <p>
          Les campagnes qui exagèrent les efforts écologiques d'une marque (greenwashing) provoquent souvent une réaction négative et nuisent à la crédibilité globale.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Le rôle du marketing est donc de rendre lisible l'engagement réel sans tomber dans l'excès de promesse.
        </p>
        <p>
          Cela passe par la vérification des données, la cohérence des messages et la transparence des limites : expliquer ce qui est fait, mais aussi ce qui reste à améliorer.
        </p>
      </section>

      {/* Place pour vidéo */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] bg-white p-4 space-y-4 w-full max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : RSE et durabilité
            </h5>
          </div>
          <div className="border-2 border-[#032622] bg-gray-200 p-12 text-center">
            <p className="text-sm font-bold text-[#032622] uppercase mb-2">
              Vidéo à ajouter prochainement
            </p>
            <p className="text-xs text-[#032622]/70 italic">
              Emplacement réservé pour la vidéo sur la RSE et la durabilité
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie1_4",
    "strategie_marketing_partie1_6"
  );

  // Page 1_6 : Section 3b (personnalisation et donnée) - début
  const renderStrategieMarketingPartie1_6 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3b. La personnalisation et la donnée
        </h5>
        <p>
          La personnalisation des expériences clients constitue un autre pilier des stratégies actuelles.
        </p>
        <p>
          Grâce au digital, les marques disposent d'un volume important de données permettant de comprendre les comportements d'achat, les attentes et les préférences.
        </p>
        <p>
          Cette approche, centrée sur la donnée, s'appuie sur des outils technologiques, mais également sur une méthodologie rigoureuse d'analyse.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1. L'évolution vers la donnée propriétaire
        </h6>
        <p>
          Les réglementations comme le RGPD et la disparition progressive des cookies tiers ont obligé les entreprises à repenser leur collecte d'informations.
        </p>
        <p>
          Elles privilégient désormais la first-party data, c'est-à-dire les données issues directement de leurs interactions avec les clients (site, application, CRM, service client).
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Cette approche permet une meilleure qualité des données et réduit la dépendance aux acteurs externes.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2. Le rôle de la segmentation et du ciblage comportemental
        </h6>
        <p>
          La donnée permet de dépasser la segmentation sociodémographique classique pour adopter une segmentation comportementale.
        </p>
        <p>
          Les marques analysent les parcours utilisateurs (pages visitées, temps de lecture, paniers abandonnés) pour définir des profils précis et adapter leurs messages.
        </p>
        <p>
          Par exemple, Netflix utilise plus de 1 000 micro-segments d'audience pour recommander des contenus, tandis que Amazon ajuste ses suggestions de produits selon les achats récents et la fréquence de consultation.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3. Les outils de personnalisation et les indicateurs de performance
        </h6>
        <p>
          Les CDP (Customer Data Platforms) centralisent les informations issues de différents canaux afin d'unifier les profils clients.
        </p>
        <p>
          Elles permettent d'automatiser des scénarios de personnalisation : relances automatiques, recommandations, offres sur mesure.
        </p>
        <p>
          La performance se mesure à l'aide d'indicateurs précis :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Taux de conversion (CVR) ;</li>
          <li>Taux d'ouverture ou de clic (CTR) ;</li>
          <li>Valeur vie client (CLV) ;</li>
          <li>Taux de désabonnement ou d'opt-out.</li>
        </ul>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          L'enjeu pour les entreprises est de trouver un équilibre entre pertinence et respect de la vie privée.
        </p>
        <p>
          Une personnalisation excessive ou mal expliquée peut générer un sentiment d'intrusion et détériorer la confiance client.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie1_5",
    "strategie_marketing_partie1_7"
  );

  // Page 1_7 : Section 3b (suite) + Section 3c (IA) + image 3.png + vidéo YouTube
  const renderStrategieMarketingPartie1_7 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3c. L'intelligence artificielle et l'automatisation marketing
        </h5>
        <p>
          L'intelligence artificielle (IA) s'impose progressivement dans les stratégies marketing comme un outil d'aide à la décision et d'optimisation.
        </p>
        <p>
          Elle ne remplace pas les équipes humaines, mais permet d'améliorer la précision, la rapidité et la personnalisation des actions.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1. L'IA prédictive : anticiper les comportements
        </h6>
        <p>
          L'IA est particulièrement efficace pour analyser de grands volumes de données et en tirer des prévisions.
        </p>
        <p>
          Les algorithmes de machine learning sont utilisés pour :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>prédire la probabilité d'achat ou d'abandon (scoring d'appétence) ;</li>
          <li>estimer le churn client (taux de départs) ;</li>
          <li>identifier les produits les plus susceptibles de plaire à un utilisateur ;</li>
          <li>ajuster dynamiquement les prix ou les stocks selon la demande.</li>
        </ul>
        <p>
          Des entreprises comme Sephora ou Nike utilisent ces modèles pour anticiper la demande locale, prévoir les ruptures de stock et ajuster leurs campagnes selon la saisonnalité.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2. L'IA générative : créer et tester plus rapidement
        </h6>
        <p>
          L'IA générative, comme ChatGPT, DALL·E ou Midjourney, transforme la production de contenus marketing.
        </p>
        <p>
          Elle permet de générer des textes, visuels ou slogans à partir d'un brief, tout en testant plusieurs variantes d'un même message.
        </p>
        <p>
          Les plateformes spécialisées comme VidMob ou Kili Technology mesurent ensuite les performances des créations (taux d'attention, de clics ou de mémorisation).
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Cette approche accélère la phase de test et favorise l'amélioration continue des campagnes.
        </p>
      </section>

      {/* Image 3.png */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/3.png"
            alt="Infographie - Intelligence artificielle et marketing"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3. Les limites et exigences de l'automatisation
        </h6>
        <p>
          L'usage de l'IA suppose une gouvernance rigoureuse des données.
        </p>
        <p>
          Les modèles doivent être nourris avec des informations fiables et régulièrement actualisées.
        </p>
        <p>
          Une mauvaise qualité de données ou un biais algorithmique peut fausser les décisions.
        </p>
        <p>
          Les entreprises mettent donc en place des processus de validation humaine avant la mise en production des modèles.
        </p>
        <p className="font-semibold">
          L'IA est un outil d'aide au pilotage, mais la responsabilité stratégique reste humaine.
        </p>
      </section>

      {/* Vidéo YouTube */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white w-full max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Intelligence artificielle et marketing
            </h5>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/v5gatKRATj0?si=qr2oZv-zXdXqWsiT"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <p>
          Les tendances actuelles du marketing traduisent un mouvement général vers plus de mesure, de transparence et de précision.
        </p>
        <p>
          Le rôle du marketeur devient plus analytique : il doit comprendre les données, maîtriser les outils et s'assurer que chaque décision repose sur des preuves tangibles.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Mais cette technicité ne doit pas faire oublier l'essentiel : la valeur perçue par le client reste le centre de toute stratégie.
        </p>
        <p>
          Le marketing ne se limite pas à vendre un produit ; il consiste à construire une relation durable et cohérente entre une marque et ses publics, dans un environnement en constante évolution.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie1_6",
    "strategie_marketing_partie1_8"
  );

  // Page 1_8 : Analyse de cas (Patagonia, Lush, Back Market) + image 4.png
  const renderStrategieMarketingPartie1_8 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Analyse : comment les marques redéfinissent leur positionnement (Patagonia, Lush, Back Market)
        </h4>
        <p>
          Redéfinir un positionnement ne consiste pas à changer de slogan. C'est un travail de fond qui touche la proposition de valeur, les preuves qui l'étayent (reasons to believe), les arbitrages de mix marketing (prix, offre, distribution, communication) et la culture qui soutient l'ensemble.
        </p>
        <p>
          Patagonia, Lush et Back Market illustrent trois trajectoires distinctes, mais convergentes : toutes déplacent le centre de gravité de la valeur, du produit isolé vers un système de sens et d'usage.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          On observe, dans les trois cas, un passage d'un marketing de l'offre à un marketing d'orientation : la marque devient un guide de pratiques (réparer, réutiliser, consommer mieux), et non un simple fournisseur.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Patagonia : du produit technique à la performance responsable
        </h5>
        <p>
          Le positionnement de Patagonia n'est pas « des vêtements techniques premium », mais « de l'équipement de plein air qui minimise son impact et encourage la sobriété ».
        </p>
        <p>
          Concrètement, la proposition de valeur s'articule autour de trois piliers : la durabilité matérielle (qualité, réparabilité), la durabilité environnementale (matières, filières, engagements) et la fonction (usage en conditions réelles).
        </p>
        <p className="font-semibold">
          Ce n'est pas une promesse symbolique : la marque a modifié son mix pour rendre ce positionnement crédible.
        </p>
        <p>
          <strong>Produit :</strong> priorité à des matériaux et traitements moins nocifs, standardisation de pièces pour faciliter la réparation, transparence de la chaîne de valeur. La réparabilité est intégrée dans l'offre (programme Worn Wear).
        </p>
        <p>
          <strong>Prix :</strong> niveau premium assumé, justifié par la durée de vie et le coût réel des matières responsables. Le prix devient un signal de pérennité, pas seulement de statut.
        </p>
        <p>
          <strong>Distribution :</strong> circuits où l'on peut expliquer l'histoire du produit (magasins propres, e-commerce riche en preuves, écosystèmes de seconde main).
        </p>
        <p>
          <strong>Communication :</strong> mise en scène de l'usage et de la réparation, preuves chiffrées d'impact, refus des codes publicitaires « sur-aspirationnels ». Le message « Don't buy this jacket » a installé un cadre mental : la meilleure consommation est parfois l'absence d'achat.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Effet sur le positionnement perçu : Patagonia occupe la zone « performance et responsabilité ». Sur une carte perceptuelle (axe 1 : technicité ; axe 2 : responsabilité), la marque se place dans une quadrature rare : elle cumule la compétitivité fonctionnelle et la crédibilité environnementale.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Lush : de la cosmétique plaisir à la cosmétique transparente et militante
        </h5>
        <p>
          Lush n'a pas seulement « verdi » son discours ; la marque a reconfiguré l'expérience d'achat comme preuve en temps réel de son positionnement.
        </p>
        <p>
          La proposition de valeur : cosmétique fraîche, artisanale, moins d'emballage, plus de responsabilité sociale.
        </p>
        <p>
          <strong>Produit :</strong> formules courtes, ingrédients identifiables, mise en avant du « nu » (produits sans emballage), lotissement visible (étiquettes avec le portrait de la personne qui a fabriqué le produit). La fraîcheur et l'origine jouent le rôle de RTB (reasons to believe).
        </p>
        <p>
          <strong>Prix :</strong> primes différenciées selon la naturalité, la complexité de fabrication et l'impact social. L'élasticité est travaillée par la pédagogie produit (on justifie le surcoût par la qualité d'ingrédients et de process).
        </p>
        <p>
          <strong>Distribution/expérience :</strong> magasins-concepts sensoriels où la démonstration remplace une partie de la publicité. Le geste, l'odeur, le contact réassurent plus que des promesses.
        </p>
        <p>
          <strong>Communication :</strong> tonalité explicative et militante (anti-tests sur animaux, rémunération des filières, réduction des déchets). Les campagnes servent d'interface de gouvernance (expliquer les arbitrages, reconnaître les limites).
        </p>
        <p className="font-semibold">
          Sur la carte perceptuelle (axe 1 : naturel/éthique ; axe 2 : expérientiel/sensoriel), Lush occupe une position de haute intensité sur les deux axes. La différenciation ne tient pas seulement à l'éthique, mais à la matérialisation de cette éthique dans une expérience tangible.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Back Market : de l'occasion contrainte à la tech désirable et circulaire
        </h5>
        <p>
          Back Market a déplacé le marché du reconditionné d'un sous-ensemble « prix cassés / risque perçu » vers un espace tech circulaire, garantie de performance, image positive.
        </p>
        <p>
          La proposition de valeur ne se réduit pas à l'économie : qualité standardisée, réduction de l'empreinte, prix juste et service.
        </p>
        <p>
          <strong>Produit/service :</strong> standard de reconditionnement, grades lisibles, contrôle qualité, garanties longues, service après-vente structuré. La fiabilité devient le RTB majeur.
        </p>
        <p>
          <strong>Prix :</strong> différenciation par grades (transparence sur l'état), permettant de concilier marge et accessibilité. Le prix n'est pas « cheap », il est assorti d'un standard de performance.
        </p>
        <p>
          <strong>Distribution :</strong> plateforme spécialisée (effet d'assortiment profond et de volumes), partenariats pour la reprise et la collecte.
        </p>
        <p>
          <strong>Communication :</strong> codes créatifs "tech désirable" et ton direct, désamorçant les objections (peur de la panne, de l'usure, de la batterie). On vend une solution circulaire plus qu'un "vieux téléphone".
        </p>
      </section>

      {/* Image 4.png */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/4.png"
            alt="Infographie - Analyse de cas de positionnement"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <p className="font-semibold">
          Sur une carte perceptuelle (axe 1 : prix ; axe 2 : risque perçu), Back Market a fait baisser le risque perçu tout en conservant un avantage prix, ce qui déplace la catégorie vers une zone d'acceptabilité mainstream.
        </p>
        <p>
          Le point de différence n'est pas l'économie seule, mais l'institutionnalisation de la confiance (standards, garanties, SAV), à laquelle s'ajoute une esthétique de marque qui normalise le reconditionné comme choix "smart" plutôt que "subi".
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Ce que ces trois cas apprennent d'un point de vue méthodologique
        </h5>
        <ol className="list-decimal list-inside space-y-3 ml-4">
          <li><strong>Clarifier la proposition de valeur en termes d'usage et de preuve.</strong> Patagonia ne promet pas « vert », elle promet durable + performant, preuves à l'appui (réparations, matières). Lush ne promet pas « naturel », elle montre la naturalité dans l'expérience. Back Market ne promet pas « pas cher », il dé-risque l'occasion par la garantie et la standardisation.</li>
          <li><strong>Aligner le mix sur la promesse.</strong> Tant que la promesse n'est pas incarnée par le produit, le prix, la distribution et la communication, le repositionnement reste cosmétique. Ici, chaque marque a modifié des arbitrages réels : réparabilité et seconde main (Patagonia), expérience sensorielle et nudité d'emballage (Lush), qualité contractuelle et grading lisible (Back Market).</li>
          <li><strong>Déplacer la carte perceptuelle avec un point de différence défendable.</strong> Un repositionnement solide se voit sur une carte perceptuelle : on cherche à occuper une zone peu dense avec des preuves difficiles à copier (process, standards, contrats, filières, design d'expérience). Les trois marques ont créé des coûts de copie (opérationnels, culturels, juridiques) pour verrouiller leur POD.</li>
          <li><strong>Convertir les contraintes sociétales en actifs de marque.</strong> La pression sur l'environnement, les déchets, l'éthique des filières devient un cadre stratégique. Patagonia capitalise la sobriété, Lush rend visible la chaîne, Back Market transforme l'"occasion" en circulaire premium. Le risque réglementaire se convertit en avantage concurrentiel quand il est anticipé et rendu lisible.</li>
          <li><strong>Mesurer autrement.</strong> Ces positionnements se pilotent avec des indicateurs adaptés : taux de réparation/reprise, part de seconde main, taux de réachat post-SAV, taux de recommandation lié à la responsabilité perçue, panier moyen par grade (Back Market), taux d'adoption du sans-emballage (Lush). La performance n'est pas qu'un ROAS média ; c'est une cohérence d'ensemble qui se mesure dans la durée.</li>
        </ol>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Risques et conditions de succès
        </h6>
        <p>
          Un repositionnement "responsable" expose à deux risques : l'incohérence (écart entre discours et actes) et la simplification (réduire la proposition à un mot-valise).
        </p>
        <p>
          Patagonia évite la dissonance en redessinant ses process (réparation, seconde main). Lush évite la caricature en acceptant l'imperfection visible. Back Market évite la guerre des prix pure en créant un standard qui justifie la valeur.
        </p>
        <p className="font-semibold">
          Le succès suppose une gouvernance (process, audits, standards), une pédagogie (rendre les preuves intelligibles) et une discipline d'arbitrage (accepter de renoncer à certains volumes ou à des marges court terme pour installer la crédibilité).
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Conclusion pédagogique
        </h6>
        <p>
          Ces trois marques montrent que le positionnement n'est pas une déclaration, mais une architecture. On part d'une tension de marché (impact, confiance, pouvoir d'achat), on formule une proposition de valeur orientée usage, on construit des preuves opérationnelles, on aligne le mix, puis on fait évoluer la mesure.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          La différenciation durable vient du coût de copie que l'on impose aux concurrents : standards, process, filières, contrats, expériences. Patagonia, Lush et Back Market n'occupent pas seulement une place dans l'esprit ; elles occupent une place dans l'organisation. C'est la condition pour que le repositionnement tienne dans le temps.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie1_7",
    "strategie_marketing_partie2_1"
  );

  // Page 2_1 : Partie 2 - Section 1A (études quantitatives/qualitatives, veille concurrentielle)
  const renderStrategieMarketingPartie2_1 = () => {
    // Vérifier si le quiz partie 1 est complété
    if (!quizMarketingPartie1Completed) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <Lock className="w-24 h-24 text-[#032622] mx-auto" />
              <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                PARTIE 2 VERROUILLÉE
              </h2>
              <p className="text-xl text-[#032622]/70">
                Vous devez compléter le quiz de la Partie 1 pour accéder à la Partie 2
              </p>
            </div>
            <div className="border-4 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-12 shadow-2xl">
              <div className="text-center space-y-6">
                <p className="text-lg text-[#032622] font-medium">
                  Pour débloquer la Partie 2, vous devez d'abord :
                </p>
                <ol className="list-decimal list-inside space-y-2 text-left max-w-md mx-auto">
                  <li>Compléter toutes les pages de la Partie 1</li>
                  <li>Répondre au quiz de la Partie 1</li>
                  <li>Voir vos résultats</li>
                </ol>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep("strategie_marketing_partie1_8")}
                className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
              >
                RETOUR À LA PARTIE 1
              </button>
              <button
                onClick={() => setStep("quizMarketingPartie1")}
                className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
              >
                <span>PASSER LE QUIZ PARTIE 1</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return renderMarketingPageWrapper(
    <>
      <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
        PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE
      </h3>
      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1 — Diagnostic stratégique et analyse du marché
        </h4>
        <p>
          Avant toute prise de décision, une marque doit comprendre précisément le terrain sur lequel elle évolue. Le diagnostic stratégique est cette phase d'analyse initiale qui permet de traduire la complexité du marché en informations exploitables.
        </p>
        <p>
          Il combine plusieurs approches complémentaires : la mesure des comportements de consommation, l'observation de la concurrence et l'interprétation de la donnée client.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Cette étape n'est pas purement théorique : elle fonde les arbitrages futurs. Le choix d'un positionnement, d'une cible ou d'un mix marketing dépend directement de la qualité de ce diagnostic.
        </p>
        <p>
          Une erreur d'interprétation à ce stade conduit souvent à une stratégie inefficace, car mal ancrée dans la réalité des usages et des attentes.
        </p>
        <p>
          Le diagnostic se compose de trois volets :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>L'étude du marché et de la concurrence, à travers des outils d'analyse structurés ;</li>
          <li>L'exploitation de la donnée client et des outils techniques d'évaluation de valeur ;</li>
          <li>L'application concrète de ces démarches à un cas d'entreprise, ici celui de Sephora, symbole d'une connaissance client omnicanale maîtrisée.</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1A — Études quantitatives et qualitatives, veille concurrentielle, matrices avancées
        </h5>
        <p>
          Le point de départ d'une stratégie marketing performante réside dans la collecte et la structuration de l'information. L'entreprise doit disposer à la fois d'indicateurs mesurables et d'une compréhension qualitative du marché.
        </p>
        <p className="font-semibold">
          Ces deux niveaux d'analyse — quantitatif et qualitatif — permettent de passer d'un simple état des lieux à un diagnostic stratégique structuré.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Les études quantitatives : mesurer pour orienter
        </h6>
        <p>
          Les études quantitatives s'appuient sur des données chiffrées permettant de décrire le comportement des consommateurs ou la dynamique du marché. Elles répondent à des questions de volume, de fréquence, ou de performance : combien, à quelle fréquence, pour quel montant.
        </p>
        <p>
          Elles s'appuient sur plusieurs sources :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Données internes :</strong> ventes, panier moyen, taux de conversion, abandon de panier, fréquence de visite.</li>
          <li><strong>Données externes :</strong> panels de consommateurs (Nielsen, Kantar), statistiques sectorielles, bases de données publiques (INSEE, Eurostat, Statista).</li>
          <li><strong>Données digitales :</strong> trafic web, taux de clics, part de voix sur les réseaux sociaux, données Google Trends, ou KPIs d'acquisition (CPC, CPA, ROAS).</li>
        </ul>
        <p>
          Ces études permettent de quantifier la taille du marché, d'évaluer la croissance d'un segment, de mesurer la notoriété d'une marque, ou encore de détecter les écarts de performance entre concurrents.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Elles constituent le socle rationnel du diagnostic : elles traduisent les perceptions en chiffres et orientent les priorités.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Les études qualitatives : comprendre les motivations et les freins
        </h6>
        <p>
          Les études qualitatives cherchent à identifier les ressorts profonds du comportement client : besoins, freins, émotions, perceptions.
        </p>
        <p>
          Elles s'appuient sur des méthodes d'entretien (focus groups, entretiens semi-directifs, tests d'usage, observation terrain) et de plus en plus sur des analyses de discours digitaux (commentaires, forums, avis consommateurs, feedbacks sociaux).
        </p>
        <p>
          Elles permettent d'enrichir la donnée quantitative : par exemple, un taux de conversion faible peut être expliqué par une perception négative de la navigation, ou une absence de confiance dans le paiement.
        </p>
        <p className="font-semibold">
          L'analyse qualitative apporte la dimension humaine du diagnostic, indispensable pour concevoir des offres adaptées.
        </p>
      </section>

      {/* Place pour vidéo */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] bg-white p-4 space-y-4 w-full max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Diagnostic stratégique
            </h5>
          </div>
          <div className="border-2 border-[#032622] bg-gray-200 p-12 text-center">
            <p className="text-sm font-bold text-[#032622] uppercase mb-2">
              Vidéo à ajouter prochainement
            </p>
            <p className="text-xs text-[#032622]/70 italic">
              Emplacement réservé pour la vidéo sur le diagnostic stratégique
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La veille concurrentielle et les matrices d'analyse
        </h6>
        <p>
          Un diagnostic complet intègre aussi l'analyse de l'écosystème concurrentiel.
        </p>
        <p>
          L'entreprise doit identifier :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Qui sont les acteurs majeurs du marché ?</li>
          <li>Quelle est leur proposition de valeur ?</li>
          <li>Quelles innovations ou communications récentes influencent le comportement des consommateurs ?</li>
        </ul>
        <p>
          Les outils les plus utilisés sont :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>La cartographie concurrentielle,</strong> qui positionne les marques sur deux axes (prix, innovation, expérience, éthique, etc.) et permet de visualiser les zones saturées et les espaces différenciants.</li>
          <li><strong>L'analyse PESTEL,</strong> qui met en évidence les facteurs externes susceptibles d'affecter la stratégie (technologie, réglementation, société, écologie).</li>
          <li><strong>La matrice SWOT,</strong> qui croise les forces et faiblesses internes avec les opportunités et menaces externes, donnant une synthèse exploitable pour les décisions futures.</li>
        </ul>
        <p>
          Ces outils peuvent être alimentés par des plateformes spécialisées comme SimilarWeb, SEMrush, Talkwalker ou Meltwater, permettant de suivre la performance digitale des concurrents, leurs campagnes, leur référencement naturel et leurs parts de voix sur les réseaux sociaux.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Vers un diagnostic intégré
        </h6>
        <p>
          L'intérêt du diagnostic ne réside pas seulement dans la collecte d'informations, mais dans leur croisement.
        </p>
        <p>
          Les données quantitatives révèlent les volumes, les études qualitatives expliquent les motivations, et la veille concurrentielle permet de replacer ces éléments dans un contexte stratégique.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          L'entreprise dispose alors d'une vision complète : le quoi, le pourquoi et le comment du comportement de marché.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "resultsMarketingPartie1",
    "strategie_marketing_partie2_2",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );
  };

  // Page 2_2 : Section 1B (matrice valeur client, scoring, personas) + image INFO2.png
  const renderStrategieMarketingPartie2_2 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1B — Focus sur les outils techniques : matrice de valeur client, scoring, personas data-driven
        </h5>
        <p>
          Les stratégies marketing modernes reposent sur une compréhension fine des comportements individuels.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          L'objectif n'est plus seulement de connaître le marché, mais de modéliser la valeur du client pour adapter les efforts et les investissements.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La matrice de valeur client
        </h6>
        <p>
          La matrice de valeur client permet de hiérarchiser les consommateurs selon leur valeur économique actuelle et leur potentiel futur.
        </p>
        <p>
          Concrètement, elle croise :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Le chiffre d'affaires généré (ou le volume de commandes) ;</li>
          <li>Le taux de fidélité ou de réachat ;</li>
          <li>L'engagement (participation à un programme de fidélité, taux d'ouverture des e-mails, interactions sociales).</li>
        </ul>
        <p>
          Elle permet d'identifier quatre grandes catégories :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Clients stratégiques :</strong> forte valeur actuelle et fidélité élevée → à fidéliser par des avantages exclusifs.</li>
          <li><strong>Clients à potentiel :</strong> faible valeur actuelle mais engagement fort → à accompagner vers l'achat.</li>
          <li><strong>Clients dormants :</strong> faible valeur et faible engagement → à réactiver ou à désengager.</li>
          <li><strong>Clients rentables mais instables :</strong> forte valeur mais faible fidélité → à sécuriser.</li>
        </ul>
        <p className="font-semibold">
          Cette matrice devient un outil de pilotage des investissements marketing : on alloue le budget en fonction de la rentabilité prévisible et non de l'intuition.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le scoring client et les modèles RFM
        </h6>
        <p>
          Le scoring est une méthode quantitative permettant de noter et classer les clients selon leur comportement.
        </p>
        <p>
          Le modèle RFM (Récence – Fréquence – Montant) reste une référence :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>La récence mesure le temps écoulé depuis le dernier achat ;</li>
          <li>La fréquence mesure le nombre de transactions sur une période donnée ;</li>
          <li>Le montant mesure la valeur totale des achats.</li>
        </ul>
        <p>
          En combinant ces trois dimensions, on peut prédire la probabilité d'un futur achat.
        </p>
        <p>
          Les entreprises connectent souvent ces données à des outils CRM (Salesforce, HubSpot, Dynamics) ou des solutions d'automatisation marketing (ActiveCampaign, Klaviyo, Brevo) pour activer des scénarios automatiques : relance, offre personnalisée, récompense de fidélité.
        </p>
        <p>
          Certains modèles vont plus loin en intégrant des indicateurs comportementaux : taux de clics, durée de navigation, interactions sociales, avis laissés.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Ces données permettent de calculer un Customer Engagement Score ou un Customer Lifetime Value (CLV), qui estime la valeur totale qu'un client apportera à la marque tout au long de sa relation.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Les personas data-driven
        </h6>
        <p>
          Enfin, la segmentation client s'opérationnalise à travers les personas data-driven.
        </p>
        <p>
          Contrairement aux personas classiques souvent basés sur des hypothèses ("Claire, 28 ans, aime la mode et le bio"), ces profils reposent sur des données réelles issues du CRM, du comportement web ou du social listening.
        </p>
        <p>
          Un persona data-driven intègre des éléments tels que :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Les canaux d'achat préférés (mobile, magasin, marketplace) ;</li>
          <li>Les déclencheurs d'achat (prix, avis, nouveauté, urgence) ;</li>
          <li>Les freins psychologiques ou contextuels (peur de l'erreur, délai de livraison, surcharge d'information).</li>
        </ul>
        <p>
          Ces personas sont mis à jour automatiquement au fil des nouvelles données collectées, ce qui permet à la marque d'adapter sa communication en continu.
        </p>
        <p className="font-semibold">
          Ils deviennent des outils vivants, utilisés dans la création de contenu, la conception d'offres et la priorisation des canaux d'acquisition.
        </p>
      </section>

      {/* Image INFO2 */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/INFO2.png"
            alt="Infographie - Matrice de valeur client et scoring"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_1",
    "strategie_marketing_partie2_3",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 2_3 : Section 1C (Sephora) + images INFO2.png et 5.png
  const renderStrategieMarketingPartie2_3 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1C — Exemple : Sephora et son approche omnicanale basée sur la connaissance client
        </h5>
        <p>
          Sephora est une référence mondiale en matière de stratégie marketing pilotée par la donnée.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Sa force repose sur la capacité à centraliser et exploiter la connaissance client sur tous les canaux de contact.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <p>
          Chaque interaction — visite sur le site, achat en boutique, utilisation de l'application, participation à un événement, réaction à une campagne e-mail — génère une donnée intégrée dans son CRM mondial.
        </p>
        <p>
          Ce système permet à Sephora de suivre le parcours complet d'une cliente : ce qu'elle consulte, ce qu'elle teste, ce qu'elle achète, et même ce qu'elle recommande.
        </p>
        <p>
          Grâce à l'analyse de ces données, Sephora adapte :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Les recommandations produits,</strong> en fonction de l'historique d'achat, de la teinte de peau ou de la saisonnalité ;</li>
          <li><strong>Les campagnes e-mail,</strong> selon les comportements récents (abandon de panier, recherche de produit épuisé, consultation d'une marque) ;</li>
          <li><strong>L'expérience magasin,</strong> en synchronisant le profil digital avec les conseillers en point de vente, capables d'accéder au profil d'achat et de suggérer des produits complémentaires en temps réel.</li>
        </ul>
      </section>

      {/* Image INFO2 */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/INFO2.png"
            alt="Infographie - Sephora et l'approche omnicanale"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <p>
          Le programme de fidélité "Beauty Insider", qui regroupe plusieurs dizaines de millions de membres dans le monde, constitue la clé de cette stratégie.
        </p>
        <p>
          Il fournit des données précises sur la fréquence d'achat, le panier moyen, la réactivité promotionnelle et les préférences produit. Ces informations alimentent une personnalisation omnicanale : l'expérience reste cohérente, qu'elle se déroule en ligne ou en boutique.
        </p>
      </section>

      {/* Image 5.png */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/5.png"
            alt="Infographie - Programme de fidélité Sephora"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <p>
          Au-delà du CRM, Sephora utilise des outils d'analyse prédictive pour anticiper les besoins. Par exemple, si une cliente renouvelle un fond de teint tous les trois mois, l'application lui enverra une notification avant la rupture probable.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Ce système, nourri par la donnée et l'intelligence artificielle, permet de renforcer la fidélisation et d'augmenter la valeur vie client tout en améliorant la satisfaction perçue.
        </p>
        <p>
          L'exemple de Sephora illustre parfaitement le lien entre diagnostic et performance : la compréhension fine du client n'est pas un outil d'observation, mais un moteur de croissance.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_2",
    "strategie_marketing_partie2_4",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 2_4 : Section 2A (segmentation) + Section 2B (valeur client) + image INFO4.png
  const renderStrategieMarketingPartie2_4 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2 — Segmentation et choix des cibles prioritaires
        </h4>
        <p>
          Segmenter, c'est découper un marché en ensembles cohérents pour mieux adapter son offre et son discours.
        </p>
        <p>
          Cette étape stratégique vise à transformer une masse de consommateurs hétérogènes en groupes homogènes sur lesquels agir efficacement.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Avec la généralisation du digital, la segmentation n'est plus une opération ponctuelle réalisée à partir d'un sondage annuel : elle est continue, dynamique et nourrie par la donnée.
        </p>
        <p>
          Une segmentation performante repose sur trois conditions : elle doit être mesurable (fondée sur des données objectives), actionnable (exploitable dans les outils marketing), et économiquement pertinente (justifier un effort différencié).
        </p>
        <p>
          Les entreprises leaders, de Netflix à Amazon, utilisent des modèles capables de croiser des milliards de points de données pour identifier les comportements précis qui déclenchent l'achat, la fidélisation ou la défection.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2A — Méthodes de segmentation (comportementale, psychographique, RFM, B2B)
        </h5>
        <p>
          La segmentation moderne repose sur des approches combinées. Les critères démographiques traditionnels restent utiles pour comprendre les bases (âge, revenu, localisation), mais ils ne suffisent plus à expliquer les comportements.
        </p>
        <p className="font-semibold">
          C'est l'observation fine des usages, des valeurs et de la rentabilité qui donne toute sa valeur au processus.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La segmentation comportementale
        </h6>
        <p>
          La segmentation comportementale repose sur l'analyse des actions concrètes des utilisateurs.
        </p>
        <p>
          Les données sont issues des CRM, du e-commerce, des applications mobiles ou des parcours en magasin.
        </p>
        <p>
          Elles permettent de classer les clients selon leurs habitudes : fréquence d'achat, récurrence, temps passé sur le site, taux d'ouverture d'e-mails ou taux de réponse aux promotions.
        </p>
        <p>
          Par exemple, un acteur comme Decathlon distingue les "sportifs réguliers" (2 à 3 achats par trimestre, panier moyen supérieur à 60 €) des "acheteurs occasionnels" (1 à 2 achats par an, panier inférieur à 40 €). Cette distinction guide la politique de fidélisation : les premiers reçoivent des avant-premières et tests produits, les seconds des offres de relance ou d'équipement saisonnier.
        </p>
        <p>
          Les données comportementales permettent aussi d'adapter la communication. Une cliente qui consulte régulièrement des pages de yoga mais n'achète jamais reçoit des tutoriels ou une remise sur un tapis d'entrée de gamme : on transforme le comportement en signal marketing.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Dans le digital, cette segmentation peut aller très loin. Un site e-commerce observe en moyenne 300 à 500 points de données par utilisateur, depuis la durée de navigation jusqu'à la zone géographique ou la vitesse de scroll. Ces signaux, interprétés par des algorithmes, nourrissent les systèmes de recommandation et les scénarios de relance automatisée.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La segmentation psychographique
        </h6>
        <p>
          La segmentation psychographique se concentre sur les valeurs, motivations et styles de vie.
        </p>
        <p>
          Elle repose sur des études qualitatives ou des enquêtes d'opinion, mais elle s'enrichit désormais de signaux comportementaux issus des réseaux sociaux et des contenus consultés.
        </p>
        <p>
          Par exemple, une marque de prêt-à-porter peut identifier trois archétypes : les "consommateurs éthiques" sensibles à la durabilité, les "plaisir immédiat" qui réagissent aux nouveautés, et les "fonctionnels" qui cherchent avant tout la praticité.
        </p>
        <p>
          Les données de navigation renforcent ces profils. Une cliente qui consulte systématiquement les pages "matières recyclées" et partage des contenus liés à l'écologie sur Instagram sera automatiquement classée dans le segment "responsable".
        </p>
        <p>
          Cette approche, croisée avec les outils d'écoute sociale comme Brandwatch ou Talkwalker, permet d'associer un discours de marque à des valeurs précises.
        </p>
        <p>
          C'est ainsi que Patagonia, Veja ou Asphalte orientent leur marketing non pas sur le prix ou le style, mais sur l'adhésion à une vision éthique du produit.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La segmentation RFM et la valeur d'usage
        </h6>
        <p>
          Le modèle RFM (Récence – Fréquence – Montant) reste un pilier du marketing relationnel.
        </p>
        <p>
          Il classe les clients selon trois indicateurs :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>la récence du dernier achat (plus elle est faible, plus le client est actif) ;</li>
          <li>la fréquence des transactions sur une période donnée ;</li>
          <li>le montant total dépensé.</li>
        </ul>
        <p>
          Une enseigne comme Fnac Darty utilise ce modèle pour identifier les clients "champions" (achats récents, fréquents et élevés), les "prometteurs" (achat récent mais faible fréquence), et les "en perte de vitesse" (absence d'achat depuis plus de 12 mois).
        </p>
        <p>
          Chaque groupe reçoit des communications et des offres spécifiques : avantages premium pour les premiers, rappels de panier ou bons d'achat pour les seconds, campagnes de reconquête pour les troisièmes.
        </p>
        <p className="font-semibold">
          Ce type de segmentation, facilement automatisable dans un CRM, constitue un levier puissant de réactivation et d'optimisation du budget marketing.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La segmentation B2B
        </h6>
        <p>
          En B2B, la logique reste la même, mais les critères diffèrent. On ne segmente plus des individus, mais des organisations.
        </p>
        <p>
          Les variables pertinentes sont :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>le secteur d'activité (industrie, services, retail, tech) ;</li>
          <li>la taille de l'entreprise (TPE, PME, grands comptes) ;</li>
          <li>le potentiel de volume d'achat ;</li>
          <li>le niveau de maturité digitale ou la position dans la chaîne de décision.</li>
        </ul>
        <p>
          Par exemple, un fournisseur SaaS différencie ses prospects entre start-ups (petits volumes, forte réactivité) et entreprises du CAC 40 (cycle de vente long, panier élevé).
        </p>
        <p>
          Les outils comme Salesforce Data Cloud ou HubSpot B2B Intelligence permettent de croiser ces données avec les interactions en ligne (pages visitées, webinaires suivis, téléchargements de livres blancs) pour prioriser les leads à plus fort potentiel.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2B — Notion de valeur client et de lifetime value
        </h5>
        <p>
          La segmentation ne se limite pas à décrire des groupes : elle vise à hiérarchiser les priorités d'investissement.
        </p>
        <p>
          La notion de Customer Lifetime Value (CLV), ou valeur vie client, est au cœur de cette logique.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Elle mesure la valeur totale qu'un client apporte à l'entreprise sur l'ensemble de sa relation, et non sur une simple transaction.
        </p>
        <p>
          La formule classique est :
        </p>
        <p className="text-xl font-bold text-center py-4 border-2 border-[#032622] bg-white">
          CLV = (Panier moyen × Fréquence d'achat annuelle × Durée moyenne de la relation) – Coût d'acquisition.
        </p>
        <p>
          Ainsi, si un client dépense 100 € par mois pendant 3 ans, et que le coût pour le recruter est de 120 €, sa CLV est de 3 480 € – 120 € = 3 360 €.
        </p>
        <p>
          Ce calcul permet d'estimer le retour sur investissement à long terme et d'arbitrer entre acquisition et fidélisation.
        </p>
      </section>

      {/* Image INFO4 */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/INFO4.png"
            alt="Infographie - Customer Lifetime Value"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <p>
          Les entreprises s'appuient sur des outils comme Google BigQuery, Power BI, ou Salesforce Marketing Cloud pour modéliser ces données en temps réel.
        </p>
        <p>
          Elles peuvent ainsi identifier les profils à haute valeur (CLV &gt; 1 000 €), les clients occasionnels à potentiel, et les segments à faible rendement à désengager.
        </p>
        <p>
          Prenons l'exemple d'un site de e-commerce comme Sephora :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Les clientes premium, membres du programme Gold, dépensent en moyenne 450 € par an, contre 120 € pour une cliente standard.</li>
          <li>Leur taux de réachat est supérieur de 35 %, et leur probabilité d'achat après un e-mail personnalisé est multipliée par 3.</li>
        </ul>
        <p>
          Cette différence justifie des actions ciblées : invitations exclusives, pré-lancements, services prioritaires.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          La valeur client devient un indicateur de pilotage stratégique, bien plus pertinent que le volume de ventes seul.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_3",
    "strategie_marketing_partie2_5",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 2_5 : Section 2C (Netflix, Amazon) + image 7.png
  const renderStrategieMarketingPartie2_5 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2C — Exemples : Netflix, Amazon et l'usage des données de segmentation comportementale
        </h5>
        <p>
          Les plateformes numériques ont perfectionné la segmentation comportementale au point d'en faire un moteur de personnalisation et de rétention.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Netflix et Amazon en sont les meilleurs exemples, chacun à sa manière.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Netflix : la segmentation par les signaux faibles
        </h6>
        <p>
          Netflix ne segmente pas ses utilisateurs par âge ou pays, mais par micro-comportements.
        </p>
        <p>
          Chaque visionnage génère des centaines de signaux : durée de lecture, moment de la journée, vitesse de défilement, abandon après 10 minutes, navigation entre genres.
        </p>
        <p>
          Ces données alimentent un algorithme de clustering qui regroupe les utilisateurs selon des patterns communs.
        </p>
        <p>
          Ainsi, deux personnes vivant dans la même ville peuvent appartenir à des segments complètement différents : l'une classée "intensif séries dramatiques nocturnes", l'autre "famille comédies dominicales".
        </p>
        <p>
          Netflix ajuste ensuite ses visuels, ses recommandations et même ses campagnes publicitaires selon le segment.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Une étude interne a montré que les recommandations personnalisées génèrent plus de 80 % des heures de visionnage totales sur la plateforme.
        </p>
      </section>

      {/* Image 7.png */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/7.png"
            alt="Infographie - Segmentation comportementale Netflix et Amazon"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Amazon : la segmentation contextuelle et prédictive
        </h6>
        <p>
          Amazon pousse la segmentation encore plus loin en intégrant la donnée contextuelle : historique d'achat, navigation, saison, météo locale ou situation personnelle (mariage, déménagement, naissance).
        </p>
        <p>
          Leur système de "next best offer" anticipe le besoin du client avant même qu'il n'en prenne conscience.
        </p>
        <p>
          Lorsqu'un utilisateur achète un berceau, Amazon active automatiquement une série de recommandations et de campagnes adaptées à la "phase de vie jeune parent" : couches, babyphones, livres éducatifs.
        </p>
        <p>
          Ces modèles sont nourris par l'IA et les scores CLV.
        </p>
        <p>
          Un client avec une forte valeur vie bénéficie de délais de livraison prioritaire et d'offres personnalisées plus agressives.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Résultat : selon Statista, plus de 35 % du chiffre d'affaires d'Amazon provient directement des recommandations générées par son moteur de segmentation.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <p>
          La segmentation est aujourd'hui un outil de pilotage stratégique fondé sur la donnée.
        </p>
        <p>
          Elle ne se résume plus à une classification statique, mais à une analyse continue qui alimente la personnalisation, la fidélisation et la rentabilité.
        </p>
        <p className="font-semibold">
          Comprendre qui sont les clients, ce qu'ils font, et quelle valeur ils génèrent dans le temps, permet d'allouer les ressources là où elles produisent le plus de performance.
        </p>
        <p>
          C'est cette capacité à exploiter la donnée et à modéliser les comportements qui distingue les entreprises réactives des entreprises réellement stratégiques.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_4",
    "strategie_marketing_partie2_6",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 2_6 : Section 3 (positionnement) intro + vidéo YouTube iPhone
  const renderStrategieMarketingPartie2_6 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3 — Positionnement et proposition de valeur
        </h4>
        <p>
          Une fois les segments définis et les cibles prioritaires choisies, l'entreprise doit se différencier clairement.
        </p>
        <p>
          Le positionnement est le pilier de cette différenciation : il exprime la place qu'une marque veut occuper dans l'esprit du consommateur, face à ses concurrents.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          C'est à partir de lui que découle la proposition de valeur, c'est-à-dire la promesse concrète faite à la cible — ce qui justifie son choix, son engagement et sa fidélité.
        </p>
        <p>
          Dans un environnement saturé d'offres similaires, le positionnement est ce qui oriente toutes les décisions marketing : design produit, politique de prix, message publicitaire, ton de communication, expérience client.
        </p>
        <p>
          Il ne s'agit pas simplement de "se démarquer", mais de créer une cohérence entre perception, réalité et avantage concurrentiel.
        </p>
      </section>

      {/* Vidéo YouTube iPhone */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white w-full max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : L'exemple parfait de proposition de valeur - iPhone
            </h5>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/z9w6tO4d90U?si=uWcPzo8q5k23VTq_"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_5",
    "strategie_marketing_partie2_7",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 2_7 : Section 3A (définir positionnement différenciant)
  const renderStrategieMarketingPartie2_7 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3A — Définir un positionnement différenciant
        </h5>
        <p>
          Un bon positionnement doit être à la fois simple, crédible et distinctif.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Il s'exprime sous la forme d'une idée directrice : une marque ne peut pas tout être à la fois, elle doit occuper une place précise dans la carte mentale du consommateur.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Les fondements du positionnement
        </h6>
        <p>
          Un positionnement se construit autour de trois questions structurantes :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>À qui s'adresse-t-on ?</strong> (la cible)</li>
          <li><strong>Quelle valeur lui apporte-t-on ?</strong> (le bénéfice perçu)</li>
          <li><strong>En quoi est-on différent ?</strong> (le point de différence)</li>
        </ul>
        <p>
          Les marques leaders traduisent cette réflexion à travers des modèles simples comme le Brand Key Model ou le Golden Circle de Simon Sinek ("Why – How – What").
        </p>
        <p>
          Dans les deux cas, la démarche consiste à identifier la raison d'être (le "pourquoi"), puis à décliner la façon de la concrétiser (le "comment") et les produits qui la traduisent (le "quoi").
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La carte perceptuelle et les axes de différenciation
        </h6>
        <p>
          Pour objectiver un positionnement, on utilise la carte perceptuelle.
        </p>
        <p>
          Elle représente visuellement les marques sur deux axes stratégiques choisis selon le marché : par exemple, prix / qualité perçue, performance / durabilité, ou émotion / technologie.
        </p>
        <p>
          Cet outil permet d'identifier les zones saturées et les espaces stratégiques disponibles.
        </p>
        <p>
          Prenons le marché de l'automobile électrique : sur une carte "technologie / émotion", Tesla occupe un quadrant unique, là où la performance technique rencontre la dimension aspirationnelle.
        </p>
        <p>
          Les autres acteurs, comme Volkswagen ou Renault, se situent plus bas sur l'échelle émotionnelle malgré une offre comparable sur le plan technique.
        </p>
        <p>
          Les critères de différenciation peuvent être tangibles (vitesse, autonomie, prix, durabilité) ou intangibles (statut, confiance, inspiration).
        </p>
        <p className="font-semibold">
          Les plus fortes marques combinent les deux dimensions : un avantage objectif soutenu par un récit symbolique.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Les outils d'évaluation du positionnement
        </h6>
        <p>
          Un positionnement se valide à travers la cohérence de plusieurs éléments :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Les RTB (Reasons to Believe),</strong> preuves concrètes qui rendent la promesse crédible : certifications, résultats, brevets, avis clients.</li>
          <li><strong>Les KPIs de perception,</strong> mesurés via des études de notoriété, d'image et de préférence de marque.</li>
          <li><strong>Le Net Promoter Score (NPS),</strong> indicateur clé pour mesurer la force émotionnelle du positionnement : "Recommanderiez-vous cette marque à un proche ?".</li>
        </ul>
        <p>
          Une marque bien positionnée doit obtenir un écart positif entre la perception des consommateurs et la moyenne du secteur sur les attributs stratégiques visés (ex. : innovation, confiance, exclusivité).
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Exemples concrets
        </h6>
        <p>
          <strong>IKEA</strong> a bâti son positionnement sur la démocratisation du design : "Du style accessible à tous". Son avantage n'est ni la qualité ni le prix seul, mais l'alliance des deux grâce à un modèle industriel efficace.
        </p>
        <p>
          <strong>Apple</strong> a construit le sien sur la simplicité et l'émotion : "La technologie au service de la créativité humaine".
        </p>
        <p>
          <strong>Michel & Augustin,</strong> dans l'agroalimentaire, joue sur la connivence et l'authenticité : le ton décalé devient une stratégie à part entière.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Dans chacun de ces cas, la marque ne cherche pas à plaire à tout le monde, mais à être identifiable instantanément par une idée directrice forte.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_6",
    "strategie_marketing_partie2_8",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 2_8 : Section 3B (proposition de valeur)
  const renderStrategieMarketingPartie2_8 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3B — Rédiger une proposition de valeur claire et mesurable
        </h5>
        <p>
          La proposition de valeur traduit concrètement le positionnement.
        </p>
        <p>
          C'est une phrase ou un ensemble d'arguments qui exprime pourquoi un client doit choisir cette marque plutôt qu'une autre.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Elle s'appuie sur trois composantes : la pertinence (répond-elle à un besoin réel ?), la différenciation (est-elle unique ?), et la preuve (est-elle crédible ?).
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La structure d'une proposition de valeur
        </h6>
        <p>
          Une formulation efficace répond à quatre points :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>La cible :</strong> à qui s'adresse la marque ;</li>
          <li><strong>Le besoin :</strong> le problème ou l'attente auquel elle répond ;</li>
          <li><strong>L'offre :</strong> la solution proposée ;</li>
          <li><strong>La preuve :</strong> ce qui rend cette promesse crédible.</li>
        </ul>
        <p>
          Par exemple, la proposition de valeur de Deliveroo peut se formuler ainsi :
        </p>
        <p className="text-lg font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          "Pour les urbains pressés qui veulent bien manger, Deliveroo propose une livraison rapide de repas de qualité grâce à une logistique optimisée et des partenaires sélectionnés."
        </p>
        <p>
          Cette formulation ne se limite pas à une phrase de communication : elle devient la boussole stratégique de l'entreprise.
        </p>
        <p>
          Elle oriente le ton, la relation client, la priorisation des fonctionnalités et les choix de canaux.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La mesure de la performance
        </h6>
        <p>
          Une proposition de valeur n'est pertinente que si elle génère un avantage mesurable.
        </p>
        <p>
          Les indicateurs de performance doivent traduire son impact sur :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>la conversion (taux d'achat ou de souscription) ;</li>
          <li>la satisfaction (note moyenne, NPS, taux de réachat) ;</li>
          <li>la rentabilité (CLV, marge moyenne par segment).</li>
        </ul>
        <p>
          Par exemple, après avoir recentré son offre sur la promesse "l'élégance accessible", Zara a vu son taux de réachat augmenter de 18 % en deux ans.
        </p>
        <p className="font-semibold">
          La clarté du message et la cohérence de l'offre ont directement renforcé la fidélité.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Les outils d'aide à la formulation
        </h6>
        <p>
          Plusieurs frameworks aident à formaliser la proposition de valeur :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Le Value Proposition Canvas</strong> (d'Alex Osterwalder), qui relie les "jobs to be done" du client à la solution offerte ;</li>
          <li><strong>Le Triangle de la valeur</strong> (valeur perçue, valeur créée, valeur captée) pour équilibrer rentabilité et attractivité ;</li>
          <li><strong>Le Brand Pyramid,</strong> qui articule les bénéfices fonctionnels, émotionnels et symboliques d'une marque.</li>
        </ul>
        <p>
          Ces outils permettent de s'assurer que la promesse formulée est non seulement claire pour le client, mais aussi cohérente avec la réalité de l'offre.
        </p>
      </section>

      {/* Place pour vidéo */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] bg-white p-4 space-y-4 w-full max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Proposition de valeur
            </h5>
          </div>
          <div className="border-2 border-[#032622] bg-gray-200 p-12 text-center">
            <p className="text-sm font-bold text-[#032622] uppercase mb-2">
              Vidéo à ajouter prochainement
            </p>
            <p className="text-xs text-[#032622]/70 italic">
              Emplacement réservé pour la vidéo sur la proposition de valeur
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_7",
    "strategie_marketing_partie2_9",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 2_9 : Section 3C (Tesla) + vidéo YouTube
  const renderStrategieMarketingPartie2_9 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3C — Étude de cas : Tesla, ou comment un positionnement émotionnel et technologique redéfinit un marché
        </h5>
        <p>
          Tesla illustre à la perfection la manière dont un positionnement différenciant, soutenu par une proposition de valeur forte et mesurable, peut transformer un marché entier.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Avant l'arrivée de Tesla, l'automobile électrique était perçue comme lente, chère et contraignante. Elon Musk a renversé cette perception en installant Tesla à l'intersection de deux territoires : la performance technologique et l'émotion de conduite.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le positionnement : l'innovation au service du progrès humain
        </h6>
        <p>
          Tesla ne se positionne pas comme un constructeur automobile, mais comme une entreprise technologique au service de la transition énergétique.
        </p>
        <p>
          Sa promesse implicite est claire : "rouler électrique sans compromis".
        </p>
        <p>
          Ce positionnement repose sur trois piliers :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>La performance :</strong> accélération de 0 à 100 km/h en moins de 3 secondes pour les modèles S et 3 Performance ;</li>
          <li><strong>La technologie embarquée :</strong> mises à jour logicielles à distance, pilotage semi-autonome, tableau de bord numérique ;</li>
          <li><strong>La vision :</strong> accélérer la transition vers une énergie durable.</li>
        </ul>
        <p>
          La marque se distingue ainsi de ses concurrents par une image d'avant-garde et une narration visionnaire, incarnée directement par son fondateur.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La proposition de valeur : performance + durabilité + expérience
        </h6>
        <p>
          Tesla ne promet pas seulement une voiture électrique : elle propose une expérience d'usage globale.
        </p>
        <p>
          Le client n'achète pas un produit, mais un écosystème complet :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>un réseau de superchargeurs propriétaire, garantissant une autonomie réelle supérieure à 600 km ;</li>
          <li>une application connectée qui contrôle à distance le véhicule, la charge et la climatisation ;</li>
          <li>une expérience de conduite fluide, silencieuse et instantanée.</li>
        </ul>
        <p className="text-lg font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          La proposition de valeur peut se résumer ainsi : "Tesla offre la puissance et le plaisir d'une voiture de sport, sans émission et avec une technologie évolutive."
        </p>
        <p>
          Ce positionnement se vérifie dans les chiffres :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>98 % de satisfaction client selon Consumer Reports (contre 83 % pour la moyenne du secteur premium) ;</li>
          <li>Taux de recommandation (NPS) supérieur à 90, comparable à celui d'Apple ;</li>
          <li>Une valorisation de marque multipliée par 12 entre 2015 et 2024.</li>
        </ul>
      </section>

      {/* Vidéo YouTube Tesla */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white w-full max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Tesla et le positionnement stratégique
            </h5>
          </div>
          <div className="border-2 border-[#032622] bg-gray-200 p-12 text-center">
            <p className="text-sm font-bold text-[#032622] uppercase mb-2">
              Vidéo à ajouter prochainement
            </p>
            <p className="text-xs text-[#032622]/70 italic">
              Emplacement réservé pour la vidéo sur Tesla
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          L'effet sur le marché
        </h6>
        <p>
          L'impact de Tesla dépasse son propre périmètre : elle a redéfini les standards du secteur.
        </p>
        <p>
          L'ensemble des constructeurs a dû intégrer la notion de "plaisir électrique" dans leur communication.
        </p>
        <p>
          Les modèles concurrents comme la Porsche Taycan ou la Mercedes EQS reprennent désormais les codes du "luxe technologique responsable" inventés par Tesla.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Cette transformation illustre une loi fondamentale du marketing stratégique : Une marque ne se différencie pas en criant plus fort, mais en occupant un espace mental que personne d'autre n'a su rendre légitime.
        </p>
        <p>
          Définir un positionnement différenciant et le traduire par une proposition de valeur claire et mesurable permet à une marque de transformer sa promesse en réalité économique.
        </p>
        <p>
          C'est le lien entre la stratégie et le marché, entre la perception et la performance.
        </p>
        <p className="font-semibold">
          Tesla en est la démonstration parfaite : une marque capable de combiner puissance technologique, cohérence de message et vision émotionnelle, tout en imposant ses propres standards à une industrie entière.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_8",
    "quizMarketingPartie2",
    "PARTIE 2 — ÉLABORER UNE STRATÉGIE MARKETING PERFORMANTE ET DIFFÉRENCIANTE"
  );

  // Page 3_1 : Partie 3 intro + Section 1A (Produit) + vidéo YouTube Nike
  const renderStrategieMarketingPartie3_1 = () => {
    // Vérifier si le quiz partie 2 est complété
    if (!quizMarketingPartie2Completed) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <Lock className="w-24 h-24 text-[#032622] mx-auto" />
              <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                PARTIE 3 VERROUILLÉE
              </h2>
              <p className="text-xl text-[#032622]/70">
                Vous devez compléter le quiz de la Partie 2 pour accéder à la Partie 3
              </p>
            </div>
            <div className="border-4 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-12 shadow-2xl">
              <div className="text-center space-y-6">
                <p className="text-lg text-[#032622] font-medium">
                  Pour débloquer la Partie 3, vous devez d'abord :
                </p>
                <ol className="list-decimal list-inside space-y-2 text-left max-w-md mx-auto">
                  <li>Compléter toutes les pages de la Partie 2</li>
                  <li>Répondre au quiz de la Partie 2</li>
                  <li>Voir vos résultats</li>
                </ol>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep("strategie_marketing_partie2_9")}
                className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
              >
                RETOUR À LA PARTIE 2
              </button>
              <button
                onClick={() => setStep("quizMarketingPartie2")}
                className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
              >
                <span>PASSER LE QUIZ PARTIE 2</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    return renderMarketingPageWrapper(
    <>
      <h3 className="text-3xl font-bold text-[#032622] mb-6 text-center uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
        PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE
      </h3>
      <section className="space-y-4 mt-8">
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Objectif : Passer de la stratégie à l'opérationnel en intégrant le digital, la performance et la cohérence de marque.
        </p>
        <p>
          La phase de conception du plan marketing marque la traduction concrète de la stratégie élaborée.
        </p>
        <p>
          Il ne s'agit plus de réfléchir à la position souhaitée sur le marché, mais de déployer les actions cohérentes qui permettront d'y parvenir.
        </p>
        <p>
          C'est ici que le marketing mix stratégique entre en jeu : produit, prix, distribution, communication — les fameux "4P", enrichis aujourd'hui d'une dimension expérientielle et numérique.
        </p>
        <p>
          Un plan marketing efficace repose sur deux exigences :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>la cohérence entre tous les leviers activés (ce qu'on promet, ce qu'on vend et la manière de le vendre) ;</li>
          <li>la mesurabilité, c'est-à-dire la capacité à suivre la performance de chaque décision à travers des indicateurs précis.</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1 — Construire le marketing mix stratégique
        </h4>
        <p>
          Le marketing mix stratégique vise à aligner l'offre et le message avec la stratégie globale de la marque.
        </p>
        <p>
          Chacun de ses piliers est aujourd'hui impacté par la transformation digitale, la data, et la recherche d'expérience.
        </p>
        <p className="font-semibold">
          Le marketeur ne se contente plus de gérer des produits ou des prix : il orchestre un écosystème complet, pensé pour générer de la valeur perçue, de la fidélité et de la préférence.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1A — Produit : design, innovation, storytelling
        </h5>
        <p>
          Le produit reste la pierre angulaire du mix marketing.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Cependant, dans un contexte d'hyper-concurrence et de surabondance d'offres, ce n'est plus seulement ce que le produit fait qui compte, mais ce qu'il raconte.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Design et expérience
        </h6>
        <p>
          Un produit ne se limite plus à une fonction, mais à une expérience sensorielle et émotionnelle.
        </p>
        <p>
          Le design devient un levier stratégique : il incarne les valeurs de la marque et facilite l'usage.
        </p>
        <p>
          Des marques comme Dyson ou Bang & Olufsen font du design un argument commercial aussi fort que la performance technique.
        </p>
        <p>
          Dans le digital, la même logique s'applique à l'UX design : un site fluide, clair et immersif est désormais une extension du produit lui-même.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Innovation et différenciation
        </h6>
        <p>
          L'innovation ne consiste plus seulement à créer du nouveau, mais à anticiper les attentes latentes du consommateur.
        </p>
        <p>
          Elle peut être fonctionnelle (nouvelle technologie), émotionnelle (expérience enrichie) ou servicielle (personnalisation, abonnement, accompagnement).
        </p>
        <p>
          Des outils comme la méthode Blue Ocean Strategy ou la veille technologique concurrentielle (via Crunchbase, Product Hunt ou CB Insights) permettent d'identifier des zones d'innovation inexploitées.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Storytelling et ADN de marque
        </h6>
        <p>
          Chaque produit raconte une histoire. Le storytelling permet d'ancrer le produit dans une vision, une émotion, un imaginaire collectif.
        </p>
        <p>
          Par exemple, Lush ne vend pas du savon : elle vend une philosophie artisanale et éthique.
        </p>
        <p>
          Apple ne vend pas des smartphones : elle vend la simplicité et la créativité.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Le storytelling produit donne du sens à l'acte d'achat, il humanise la technologie et crée de la fidélité cognitive.
        </p>
      </section>

      {/* Vidéo YouTube Nike/Michael Jordan */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white w-full max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Exemple de storytelling - Nike et Michael Jordan
            </h5>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/ZVL9KgHyKRk?si=eYXgJKXaNPAPBz_e"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie2_9",
    "strategie_marketing_partie3_2",
    "PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE"
  );
  };

  // Page 3_2 : Section 1B (Prix) + Section 1C (Distribution) + image INFO5.png
  const renderStrategieMarketingPartie3_2 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1B — Prix : valeur perçue et stratégies de premiumisation
        </h5>
        <p>
          Le prix n'est pas qu'une variable économique : c'est un signal de positionnement.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Il traduit la valeur perçue, la qualité supposée et le niveau de désirabilité.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          De la logique coût à la logique valeur
        </h6>
        <p>
          Autrefois, les prix se fixaient selon une approche "cost-plus" (coût + marge). Aujourd'hui, les marques adoptent une logique de valeur perçue : combien le consommateur est-il prêt à payer pour la promesse vécue ?
        </p>
        <p>
          L'objectif est de créer une équation psychologique positive : le client doit sentir que la valeur reçue dépasse la somme déboursée.
        </p>
        <p>
          Les études de pricing behavior permettent d'estimer cette perception à travers des tests de disposition à payer (WTP – Willingness To Pay), ou des méthodes comme Van Westendorp.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La premiumisation : créer la rareté dans l'abondance
        </h6>
        <p>
          La "premiumisation" consiste à faire évoluer une offre vers le haut de gamme, non pas en augmentant artificiellement les prix, mais en justifiant la valeur par la différenciation.
        </p>
        <p>
          C'est la stratégie de Nespresso : transformer un produit banal (le café) en rituel design, exclusif et émotionnel.
        </p>
        <p>
          De même, dans la mode, Nike ou Adidas créent des éditions limitées pour entretenir la rareté perçue, soutenues par des campagnes d'influence et de storytelling expérientiel.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le digital comme levier de pilotage du prix
        </h6>
        <p>
          Grâce à la donnée, le pricing devient dynamique.
        </p>
        <p>
          Les e-commerçants utilisent des algorithmes de yield management (comme dans l'aérien) pour ajuster les prix en fonction de la demande, de la saisonnalité et du comportement d'achat.
        </p>
        <p>
          Amazon modifie ses prix jusqu'à 2,5 millions de fois par jour selon les fluctuations de marché et le profil utilisateur.
        </p>
        <p className="font-semibold">
          Le prix devient un outil d'optimisation de la marge, en même temps qu'un signal stratégique.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1C — Distribution : omnicanal, e-commerce, marketplaces
        </h5>
        <p>
          La distribution est désormais pensée comme un parcours fluide et intégré, où chaque canal renforce les autres.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Le consommateur ne distingue plus le digital du physique : il passe naturellement de l'un à l'autre.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          L'omnicanal comme norme
        </h6>
        <p>
          Les marques les plus performantes adoptent un modèle omnicanal, qui connecte boutique, site e-commerce, application, service client et réseaux sociaux.
        </p>
        <p>
          Le client peut découvrir un produit sur Instagram, l'essayer en magasin, puis le commander en ligne avec livraison express.
        </p>
        <p>
          Cette cohérence nécessite des systèmes intégrés : ERP, CRM et DMP pour centraliser les données et assurer une expérience homogène.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le rôle stratégique des marketplaces
        </h6>
        <p>
          Les marketplaces (Amazon, Cdiscount, Zalando, ManoMano…) représentent aujourd'hui plus de 60 % des ventes e-commerce en Europe.
        </p>
        <p>
          Elles offrent visibilité et volume, mais réduisent le contrôle sur l'image et la marge.
        </p>
        <p>
          C'est pourquoi certaines marques développent leur propre "brand store" sur ces plateformes, avec storytelling et contenu enrichi.
        </p>
        <p>
          Parallèlement, d'autres choisissent la voie du direct-to-consumer (D2C), comme Glossier ou Gymshark, pour reprendre le contrôle sur la relation client et les données.
        </p>
      </section>

      {/* Image INFO5.png */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/INFO5.png"
            alt="Infographie - Distribution omnicanale et marketplaces"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          L'importance de la logistique et du service
        </h6>
        <p>
          La distribution moderne repose sur l'excellence logistique : rapidité, fiabilité et transparence.
        </p>
        <p>
          Les clients considèrent désormais la livraison et le service après-vente comme partie intégrante du produit.
        </p>
        <p>
          Des outils comme Shipup, Colibri ou Sendcloud permettent de suivre en temps réel les livraisons et d'améliorer la satisfaction.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie3_1",
    "strategie_marketing_partie3_3",
    "PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE"
  );

  // Page 3_3 : Section 1D (Communication) + image INFO1.png + Section 1E (exemples) + image 6.png
  const renderStrategieMarketingPartie3_3 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1D — Communication : cohérence 360°, influence, contenu
        </h5>
        <p>
          La communication ne consiste plus à "faire connaître" un produit, mais à nourrir une relation cohérente et durable avec la cible.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Le marketing 360° vise à harmoniser tous les canaux — publicité, social media, relations presse, influence, contenu de marque — autour d'un même récit.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          La cohérence comme levier de confiance
        </h6>
        <p>
          Une marque forte se reconnaît à la cohérence de son message, quel que soit le point de contact.
        </p>
        <p>
          L'identité visuelle, le ton, les valeurs doivent être alignés du site web à la vidéo TikTok, en passant par les vitrines.
        </p>
        <p>
          Des outils comme Notion Brand Kit ou Frontify aident à centraliser les guidelines et à garantir la constance du discours.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          L'influence et les médias sociaux
        </h6>
        <p>
          L'influence n'est plus un complément, mais un canal de communication central.
        </p>
        <p>
          Les marques ne se contentent plus de sponsoriser des posts : elles co-créent des récits avec des créateurs de contenu.
        </p>
        <p>
          Un influenceur peut générer un ROI supérieur à une campagne TV, à condition que la collaboration soit authentique et intégrée à la stratégie.
        </p>
        <p>
          Red Bull, par exemple, a fait de la production de contenu (vidéos extrêmes, compétitions sportives, événements immersifs) le cœur de sa stratégie média.
        </p>
      </section>

      {/* Image INFO1.png */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/INFO1.png"
            alt="Infographie - Communication 360° et influence"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le contenu de marque comme pilier
        </h6>
        <p>
          Le brand content est devenu un actif stratégique.
        </p>
        <p>
          Il permet d'éduquer, d'inspirer et de fidéliser.
        </p>
        <p>
          Des outils comme HubSpot, Canva Pro, Hootsuite ou Sprout Social permettent de planifier, créer et analyser l'efficacité des campagnes.
        </p>
        <p className="font-semibold">
          Le contenu doit s'appuyer sur la donnée : comprendre quel format (vidéo, article, podcast) génère le plus d'engagement sur chaque segment.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          1E — Exemples : Apple, Dior et Red Bull
        </h5>
        <p>
          <strong>Apple : la cohérence absolue</strong>
        </p>
        <p>
          Chez Apple, chaque élément du mix est pensé comme un tout.
        </p>
        <p>
          Le produit est une œuvre de design, le prix renforce la valeur perçue, la distribution est maîtrisée (Apple Store), et la communication traduit une promesse : "Think Different."
        </p>
        <p>
          Cette cohérence fait d'Apple une marque culte, avec un NPS supérieur à 70 et une marge moyenne par produit de plus de 30 %.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <p>
          <strong>Dior : l'exclusivité maîtrisée</strong>
        </p>
        <p>
          Dior combine tradition et innovation.
        </p>
        <p>
          Le produit incarne le savoir-faire français, la distribution reste sélective (boutiques, corners, site premium), le prix exprime le prestige, et la communication s'appuie sur des symboles artistiques et des ambassadeurs d'exception.
        </p>
        <p>
          Chaque campagne Dior est un équilibre entre patrimoine, émotion et aspiration, garantissant une cohérence de marque mondiale.
        </p>
      </section>

      {/* Image 6.png */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white">
          <Image
            src="/img/info/6.png"
            alt="Infographie - Exemples de marketing mix stratégique"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <p>
          <strong>Red Bull : la marque média</strong>
        </p>
        <p>
          Red Bull a redéfini le marketing mix en devenant un producteur de contenu avant d'être un vendeur de boisson.
        </p>
        <p>
          Le produit est simple, mais le storytelling est total : sports extrêmes, musique, culture urbaine.
        </p>
        <p>
          L'entreprise investit plus de 30 % de son budget marketing dans la production d'événements et de contenus propriétaires.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Résultat : plus de 15 millions d'abonnés YouTube et une domination sur son segment, avec une image d'énergie et d'audace inimitable.
        </p>
        <p>
          Le plan marketing stratégique est l'art de rendre cohérente chaque décision avec le positionnement et la promesse de marque.
        </p>
        <p>
          Du produit à la communication, tout doit converger vers une même expérience, lisible et différenciante.
        </p>
        <p className="font-semibold">
          Les marques qui réussissent — Apple, Dior, Red Bull — partagent une conviction commune : le marketing n'est pas un empilement d'actions, mais un système intégré, où chaque levier renforce l'autre.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie3_2",
    "strategie_marketing_partie3_4",
    "PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE"
  );

  // Page 3_4 : Section 2A (CRM, automatisation) + vidéo YouTube
  const renderStrategieMarketingPartie3_4 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2 — Intégrer la dimension digitale et data-driven
        </h4>
        <p>
          Dans le marketing moderne, la stratégie ne peut plus être séparée de la donnée.
        </p>
        <p>
          L'intuition et la créativité restent indispensables, mais elles doivent être validées, orientées et amplifiées par la mesure et la technologie.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          C'est le sens du marketing data-driven : utiliser la donnée client, comportementale et contextuelle pour piloter les décisions en temps réel, personnaliser les actions et optimiser les performances.
        </p>
        <p>
          Cette évolution marque un changement profond : le digital n'est plus un canal, mais un socle de pilotage.
        </p>
        <p>
          Le CRM devient la colonne vertébrale de la stratégie, l'automatisation en est le moteur, et les campagnes publicitaires ou sociales deviennent des systèmes vivants nourris par les flux de données.
        </p>
        <p>
          L'enjeu est double : être capable de collecter et interpréter l'information pertinente, tout en préservant la cohérence de la marque dans un environnement automatisé.
        </p>
      </section>

      {/* Vidéo YouTube */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] p-4 bg-white w-full max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Marketing data-driven
            </h5>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/JsAT5b2frLQ?si=9G5za1D-QVtrfC9h"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2A — CRM, automatisation, campagnes pilotées par les données
        </h5>
        <p>
          Le CRM (Customer Relationship Management) est devenu la pierre angulaire du marketing moderne.
        </p>
        <p>
          Il centralise les informations issues de tous les points de contact : site web, e-mails, réseaux sociaux, boutique physique, service client, publicité.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Ce n'est plus un simple outil de gestion commerciale, mais un centre de décision marketing.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le CRM comme cœur de l'écosystème marketing
        </h6>
        <p>
          Des plateformes comme Salesforce, HubSpot, Microsoft Dynamics ou Brevo permettent d'unifier les données clients en temps réel.
        </p>
        <p>
          Chaque interaction — un clic, une ouverture d'e-mail, un achat, une visite en boutique — devient une donnée exploitable.
        </p>
        <p>
          Cela permet de créer une vision 360° du parcours client, et de segmenter non plus par profil fixe, mais par comportement évolutif.
        </p>
        <p>
          Cette centralisation facilite la mise en place de stratégies data-driven : on ne s'adresse plus à des audiences hypothétiques, mais à des individus réels, observés et mesurés.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          L'automatisation : du marketing réactif au marketing prédictif
        </h6>
        <p>
          L'automatisation marketing transforme la donnée en action.
        </p>
        <p>
          Elle permet de déclencher des scénarios personnalisés selon les comportements :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Envoi d'un e-mail de relance après un panier abandonné,</li>
          <li>Notification push après une période d'inactivité,</li>
          <li>Proposition d'un produit complémentaire après un achat,</li>
          <li>Récompense automatique après un certain nombre de commandes.</li>
        </ul>
        <p>
          Ces actions, programmées via des outils comme ActiveCampaign, Klaviyo, Customer.io ou Mailchimp, assurent une présence continue et contextuelle.
        </p>
        <p>
          Le marketeur devient chef d'orchestre d'un système automatisé capable de réagir à grande échelle, mais de manière individualisée.
        </p>
        <p>
          L'étape suivante est l'automatisation prédictive, rendue possible par l'intelligence artificielle.
        </p>
        <p>
          Les algorithmes de scoring (propension à l'achat, churn, engagement) permettent de prévoir les comportements futurs et d'ajuster les actions avant même que le client n'agisse.
        </p>
        <p className="font-semibold">
          Ainsi, une plateforme e-commerce peut anticiper la perte d'un client et déclencher automatiquement une offre de réactivation avant la désinscription.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le pilotage des campagnes data-driven
        </h6>
        <p>
          Les campagnes modernes ne reposent plus sur des intuitions créatives isolées, mais sur une boucle d'optimisation continue.
        </p>
        <p>
          Les données de performance alimentent en temps réel les décisions d'allocation budgétaire et de ciblage.
        </p>
        <p>
          Les plateformes publicitaires comme Meta Ads, Google Ads, TikTok Ads ou LinkedIn Campaign Manager ajustent automatiquement les enchères, les audiences et les formats selon les conversions observées.
        </p>
        <p>
          Une marque peut aujourd'hui suivre un taux de conversion précis par canal, heure, région ou type de message, et ajuster sa stratégie quasi instantanément.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Ce marketing piloté par la donnée permet d'atteindre des performances inaccessibles auparavant, à condition de maintenir un équilibre entre automatisation et stratégie de marque : la data optimise, mais c'est la vision qui oriente.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie3_3",
    "strategie_marketing_partie3_5",
    "PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE"
  );

  // Page 3_5 : Section 2B (influence, social ads, SEO/SEA) + place vidéo
  const renderStrategieMarketingPartie3_5 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2B — Marketing d'influence, social ads, SEO/SEA
        </h5>
        <p>
          Le digital a multiplié les points de contact entre une marque et ses consommateurs.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Les canaux ne se concurrencent plus : ils se complètent dans une stratégie d'écosystème où la notoriété, l'engagement et la conversion interagissent en continu.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le marketing d'influence : la confiance incarnée
        </h6>
        <p>
          L'influence est devenue un pilier stratégique du mix digital.
        </p>
        <p>
          Les consommateurs se fient davantage aux recommandations de leurs pairs et des créateurs de contenu qu'à la publicité classique.
        </p>
        <p>
          Une étude Nielsen (2024) montre que 92 % des internautes font plus confiance à une recommandation d'influenceur qu'à un spot publicitaire.
        </p>
        <p>
          Les marques ne se contentent plus de partenariats ponctuels : elles construisent des relations long terme avec des ambassadeurs alignés sur leurs valeurs.
        </p>
        <p>
          L'influence se professionnalise avec des outils de mesure comme Kolsquare, Upfluence ou Traackr, capables d'analyser la portée réelle, le taux d'engagement et la cohérence d'audience.
        </p>
        <p>
          Certaines marques, comme Daniel Wellington ou HelloFresh, ont bâti leur croissance principalement sur ces stratégies, en combinant micro-influence (communautés locales, niches affinitaires) et macro-influence (visibilité massive).
        </p>
        <p className="font-semibold">
          La clé de la performance réside dans l'authenticité perçue : un contenu sincère, incarné, cohérent avec la marque.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Social Ads : la performance pilotée par l'algorithme
        </h6>
        <p>
          Les réseaux sociaux sont devenus des plateformes publicitaires intelligentes.
        </p>
        <p>
          Chaque campagne est optimisée grâce à la donnée comportementale collectée par les plateformes.
        </p>
        <p>
          Facebook et Instagram permettent un ciblage sur des critères extrêmement précis : âge, géolocalisation, affinités culturelles, habitudes d'achat, et même historique de navigation via le pixel Meta.
        </p>
      </section>

      {/* Place pour vidéo */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] bg-white p-4 space-y-4 w-full max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Marketing d'influence et social ads
            </h5>
          </div>
          <div className="border-2 border-[#032622] bg-gray-200 p-12 text-center">
            <p className="text-sm font-bold text-[#032622] uppercase mb-2">
              Vidéo à ajouter prochainement
            </p>
            <p className="text-xs text-[#032622]/70 italic">
              Emplacement réservé pour la vidéo sur le marketing d'influence et les social ads
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <p>
          Les KPIs observés incluent le CPC (coût par clic), le CPM (coût pour mille impressions), et surtout le ROAS (Return On Ad Spend).
        </p>
        <p>
          Une marque comme ASOS ou Nike pilote quotidiennement ses campagnes selon ces indicateurs, en redistribuant les budgets vers les audiences et formats les plus performants.
        </p>
        <p>
          L'optimisation repose sur des tests permanents : A/B testing de visuels, variation de messages, ajustement de fréquence.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          SEO / SEA : la complémentarité de la visibilité et de la conversion
        </h6>
        <p>
          Le référencement naturel (SEO) et le référencement payant (SEA) constituent le socle d'acquisition durable d'une marque.
        </p>
        <p>
          Le SEO travaille sur le long terme : contenu optimisé, maillage interne, expérience utilisateur, autorité de domaine.
        </p>
        <p>
          Des outils comme Semrush, Ahrefs ou Screaming Frog permettent de suivre le positionnement, la concurrence et les performances techniques.
        </p>
        <p>
          Le SEA, via Google Ads, complète le dispositif avec une approche instantanée.
        </p>
        <p>
          L'intérêt du SEA n'est pas seulement d'acheter du trafic, mais d'analyser les mots-clés à fort potentiel et de comprendre la logique de recherche client.
        </p>
        <p>
          Les deux approches s'alimentent mutuellement : le SEO assure la visibilité organique et la crédibilité, le SEA capte l'intention d'achat immédiate.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Une stratégie performante combine les deux en s'appuyant sur des tableaux de bord unifiés (Data Studio, Looker) pour piloter le ROI global.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie3_4",
    "strategie_marketing_partie3_6",
    "PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE"
  );

  // Page 3_6 : Section 2C (KPIs) + Section 3A (tableaux de bord)
  const renderStrategieMarketingPartie3_6 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          2C — Indicateurs clés de performance (KPIs marketing stratégiques)
        </h5>
        <p>
          Le pilotage data-driven repose sur la mesure systématique de la performance.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Mais mesurer ne veut pas dire accumuler des chiffres : il s'agit de suivre les bons indicateurs, ceux qui traduisent la progression vers les objectifs stratégiques.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Les trois niveaux de KPIs
        </h6>
        <p>
          <strong>KPIs de visibilité :</strong> ils mesurent la présence de la marque et son exposition.
        </p>
        <p>
          Cela inclut le reach, les impressions, le trafic web, la part de voix, la position SEO moyenne ou la couverture sociale.
        </p>
        <p>
          Exemple : une campagne TikTok peut générer 3 millions de vues, mais l'intérêt stratégique réside dans la qualité de ces vues (temps moyen de visionnage, taux d'interaction).
        </p>
        <p>
          <strong>KPIs d'engagement :</strong> ils traduisent la qualité de la relation.
        </p>
        <p>
          Il s'agit du taux d'ouverture e-mail, du taux de clic, du taux d'interaction sur les réseaux (likes, commentaires, partages) ou du temps passé sur site.
        </p>
        <p>
          Le taux d'engagement global (interactions / impressions) est aujourd'hui un indicateur central : un taux supérieur à 2 % est considéré comme bon en B2C, au-delà de 5 % comme excellent.
        </p>
        <p>
          <strong>KPIs de conversion et de fidélisation :</strong>
        </p>
        <p>
          Ce sont les plus stratégiques, car ils relient le marketing à la performance économique.
        </p>
        <p>
          On y retrouve :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Le taux de conversion (nombre d'achats / visites),</li>
          <li>Le coût d'acquisition client (CAC),</li>
          <li>La valeur vie client (CLV),</li>
          <li>Le taux de réachat,</li>
          <li>Le churn rate (taux d'attrition).</li>
        </ul>
        <p>
          Le croisement de ces indicateurs donne une vision complète du parcours de performance, depuis la notoriété jusqu'à la fidélité.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Tableaux de bord et pilotage en continu
        </h6>
        <p>
          Les marketeurs s'appuient sur des dashboards automatisés pour centraliser ces données.
        </p>
        <p>
          Des outils comme Google Looker Studio, Power BI ou Tableau permettent d'intégrer les sources multiples (CRM, réseaux sociaux, analytics, ventes) et de visualiser les performances en temps réel.
        </p>
        <p>
          Une entreprise peut ainsi suivre, par exemple, l'impact d'une campagne Meta sur les ventes e-commerce, la progression de la notoriété sur YouTube et le taux de conversion des e-mails dans un même tableau.
        </p>
        <p className="font-semibold">
          Cette centralisation transforme la donnée en pilotage stratégique quotidien.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          De la mesure à la décision
        </h6>
        <p>
          L'objectif du pilotage data-driven n'est pas de produire des rapports, mais de transformer la donnée en action.
        </p>
        <p>
          Une chute du taux d'ouverture sur un segment ? On ajuste le message.
        </p>
        <p>
          Un CAC qui augmente sur un canal ? On revoit le ciblage ou la création.
        </p>
        <p>
          Un taux de réachat stable mais panier moyen en baisse ? On introduit des offres complémentaires.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          La donnée devient alors un langage commun entre le marketing, la finance et la direction, permettant d'aligner les décisions opérationnelles sur les objectifs de croissance.
        </p>
        <p>
          Intégrer la dimension digitale et data-driven, c'est passer d'un marketing intuitif à un marketing piloté par la preuve et orienté performance.
        </p>
        <p>
          Le CRM structure la connaissance client, l'automatisation transforme la donnée en action, et les indicateurs clés assurent la maîtrise du pilotage.
        </p>
        <p>
          Mais cette puissance technologique ne vaut que si elle reste au service d'une vision : celle d'une expérience client cohérente, mesurable et évolutive.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h4 className="text-2xl font-bold text-[#032622] mb-4" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3 — Évaluer et ajuster la stratégie
        </h4>
        <p>
          Une stratégie marketing, même la plus ambitieuse, n'a de valeur que si elle peut être mesurée, pilotée et ajustée.
        </p>
        <p>
          L'évaluation n'est pas une étape finale : c'est une fonction permanente au cœur du processus stratégique.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Dans un environnement où les comportements évoluent rapidement, les entreprises les plus performantes sont celles qui savent apprendre en continu, tester, corriger et itérer.
        </p>
        <p>
          Évaluer, c'est d'abord objectiver la performance grâce à des données fiables.
        </p>
        <p>
          Ajuster, c'est ensuite transformer ces enseignements en décisions opérationnelles.
        </p>
        <p>
          Le marketing moderne repose ainsi sur un principe de boucle continue — observation, analyse, action, réajustement — qui transforme la stratégie en un organisme vivant.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3A — Tableaux de bord marketing
        </h5>
        <p>
          Le tableau de bord marketing est bien plus qu'un simple outil de reporting : c'est un système de pilotage décisionnel.
        </p>
        <p>
          Il permet de visualiser la performance à travers des indicateurs clés, de détecter les écarts par rapport aux objectifs et d'alimenter les arbitrages budgétaires.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Rôle et structure du tableau de bord
        </h6>
        <p>
          Un tableau de bord efficace doit offrir une lecture synthétique et opérationnelle de la stratégie.
        </p>
        <p>
          Il se compose généralement de trois blocs :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Les objectifs stratégiques, traduits en indicateurs mesurables (notoriété, acquisition, fidélisation, rentabilité) ;</li>
          <li>Les données clés, issues du CRM, du site web, des réseaux sociaux et des ventes ;</li>
          <li>Les analyses visuelles, permettant de repérer rapidement les tendances, pics et anomalies.</li>
        </ul>
        <p>
          Par exemple, une marque e-commerce suit simultanément :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Le coût d'acquisition client (CAC) sur chaque canal,</li>
          <li>Le taux de conversion des campagnes publicitaires,</li>
          <li>Le chiffre d'affaires par segment de clientèle,</li>
          <li>Et la Customer Lifetime Value (CLV) moyenne.</li>
        </ul>
        <p>
          Ces informations sont intégrées dans un tableau dynamique (via Looker Studio, Power BI, ou Tableau) et actualisées automatiquement grâce à des connecteurs API.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le choix des indicateurs
        </h6>
        <p>
          Un tableau de bord pertinent repose sur un nombre limité d'indicateurs stratégiques.
        </p>
        <p>
          On distingue généralement :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Les KPIs de pilotage (trafic, leads, conversion, panier moyen) ;</li>
          <li>Les KPIs de satisfaction (NPS, taux de recommandation, avis clients, taux de réachat) ;</li>
          <li>Les KPIs économiques (ROI, CLV, marge brute, taux de churn).</li>
        </ul>
        <p>
          Une entreprise peut compléter ces données par des indicateurs prédictifs, comme le "propensity score" (probabilité d'achat ou de départ), ou le "Customer Health Score" (engagement global d'un client dans le temps).
        </p>
        <p>
          Ces indicateurs permettent non seulement de comprendre le passé, mais d'anticiper le futur.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Data visualisation et interprétation
        </h6>
        <p>
          L'efficacité d'un tableau de bord dépend autant de la qualité des données que de leur lisibilité.
        </p>
        <p>
          Les outils de visualisation doivent simplifier la compréhension : graphes dynamiques, courbes de tendances, comparatifs avant/après campagne, heatmaps d'engagement.
        </p>
        <p>
          Par exemple, un simple tableau de bord peut faire apparaître en un coup d'œil qu'une campagne SEA sur Google génère un fort trafic, mais un taux de conversion faible : c'est un signal pour revoir le ciblage ou la page d'atterrissage.
        </p>
        <p className="font-semibold">
          La visualisation transforme donc les chiffres en décisions.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie3_5",
    "strategie_marketing_partie3_7",
    "PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE"
  );

  // Page 3_7 : Section 3B (suivi performance) + place vidéo + Section 3C (Airbnb)
  const renderStrategieMarketingPartie3_7 = () => renderMarketingPageWrapper(
    <>
      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3B — Suivi de performance et itération continue
        </h5>
        <p>
          Le suivi de performance est une démarche continue et agile, pas un contrôle ponctuel.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Il s'agit de suivre les indicateurs en temps réel, d'en tirer des enseignements et d'ajuster les actions marketing au fil de l'eau.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          De la stratégie figée à la stratégie agile
        </h6>
        <p>
          Dans les modèles traditionnels, les plans marketing étaient établis à l'année et évalués en fin de cycle.
        </p>
        <p>
          Aujourd'hui, les marques adoptent des boucles d'apprentissage rapides (approche test & learn).
        </p>
        <p>
          Chaque action — campagne, contenu, offre, publicité — devient une expérience mesurable.
        </p>
        <p>
          Les résultats orientent immédiatement les actions suivantes.
        </p>
        <p>
          Par exemple, une campagne d'acquisition peut être testée sur une période de deux semaines, comparant plusieurs versions d'un message (A/B testing).
        </p>
        <p>
          Le modèle gagnant est ensuite déployé à grande échelle.
        </p>
        <p className="font-semibold">
          Cette approche permet de réduire le risque et d'augmenter la précision.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Le rôle de la data dans l'itération
        </h6>
        <p>
          Les plateformes digitales offrent une richesse de données inédite : taux de clic, temps de lecture, abandon panier, heatmaps, scroll depth, taux de satisfaction post-achat.
        </p>
        <p>
          En agrégeant ces signaux, le marketeur peut identifier des tendances faibles avant qu'elles ne deviennent des problèmes.
        </p>
        <p>
          Un taux d'ouverture d'e-mail qui chute sur un segment ? Le contenu n'est plus pertinent.
        </p>
        <p>
          Un panier moyen en baisse ? L'intérêt produit décline ou la concurrence a augmenté.
        </p>
        <p>
          Une hausse du taux de rebond mobile ? Le site doit être optimisé pour la vitesse et l'ergonomie.
        </p>
        <p>
          L'analyse de ces micro-signaux alimente un pilotage fin, centré sur la performance réelle plutôt que sur la perception.
        </p>
      </section>

      {/* Place pour vidéo */}
      <div className="my-8 flex justify-center">
        <div className="border-2 border-[#032622] bg-white p-4 space-y-4 w-full max-w-4xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#032622] text-white flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h5 className="text-lg font-bold text-[#032622] uppercase" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Vidéo : Suivi de performance et itération
            </h5>
          </div>
          <div className="border-2 border-[#032622] bg-gray-200 p-12 text-center">
            <p className="text-sm font-bold text-[#032622] uppercase mb-2">
              Vidéo à ajouter prochainement
            </p>
            <p className="text-xs text-[#032622]/70 italic">
              Emplacement réservé pour la vidéo sur le suivi de performance
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Organisation et gouvernance du pilotage
        </h6>
        <p>
          L'évaluation et l'itération nécessitent une gouvernance marketing structurée.
        </p>
        <p>
          Les entreprises performantes instaurent des revues de performance régulières : hebdomadaires pour les campagnes digitales, mensuelles pour les indicateurs business, trimestrielles pour les objectifs stratégiques.
        </p>
        <p>
          Elles impliquent des équipes transverses : marketing, data, produit, finance.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          L'enjeu n'est pas seulement de mesurer, mais de rendre l'information actionnable et partagée.
        </p>
        <p>
          Cette culture de la donnée transforme le marketing en un système apprenant, capable de s'adapter en permanence.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h5 className="font-bold text-xl text-[#032622] mt-6" style={{ fontFamily: "var(--font-termina-bold)" }}>
          3C — Étude de cas : comment Airbnb ajuste sa stratégie mondiale selon les insights régionaux
        </h5>
        <p>
          Airbnb est un exemple emblématique d'entreprise qui a bâti son succès sur une stratégie de pilotage dynamique et localisée.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          Son modèle repose sur une capacité rare à combiner vision globale et adaptation micro-locale, grâce à la puissance de la donnée.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Un pilotage global basé sur la donnée
        </h6>
        <p>
          Airbnb analyse en continu des millions d'interactions issues de sa plateforme :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>150 millions d'utilisateurs actifs,</li>
          <li>plus de 7 millions de logements listés dans 190 pays,</li>
          <li>des centaines de millions de recherches et réservations par an.</li>
        </ul>
        <p>
          Chaque clic, chaque recherche, chaque avis est enregistré et transformé en signal stratégique.
        </p>
        <p>
          Les équipes data identifient ainsi les tendances émergentes :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>croissance des séjours longue durée après le Covid,</li>
          <li>hausse des réservations rurales en période estivale,</li>
          <li>évolution des attentes liées au télétravail (besoin de Wi-Fi haut débit, espaces calmes).</li>
        </ul>
        <p>
          Ces insights guident directement la communication et les priorités produit.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          L'adaptation régionale
        </h6>
        <p>
          Airbnb ne diffuse pas la même stratégie partout.
        </p>
        <p>
          Ses campagnes, son interface et même ses fonctionnalités varient selon les régions.
        </p>
        <p>
          <strong>En Asie,</strong> les recherches incluent davantage de critères liés à la sécurité et à la localisation. Airbnb y a intégré un système de notation spécifique sur la propreté et la conformité des logements.
        </p>
        <p>
          <strong>En Amérique du Nord,</strong> les séjours thématiques ("cabins", "tiny houses", "work from anywhere") sont mis en avant pour répondre aux nouvelles formes de nomadisme digital.
        </p>
        <p>
          <strong>En Europe,</strong> la marque a renforcé ses actions locales de communication : campagnes centrées sur la convivialité, le tourisme responsable, et la collaboration avec les autorités locales pour réguler les locations.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          L'itération en temps réel
        </h6>
        <p>
          Les campagnes sont testées à petite échelle avant d'être étendues.
        </p>
        <p>
          Lors du lancement de la campagne "Belong Anywhere", Airbnb a d'abord expérimenté différents messages sur les marchés tests (États-Unis, France, Japon).
        </p>
        <p>
          Les performances ont été mesurées en termes de taux d'engagement, de recherche de logements et d'inscriptions de nouveaux hôtes.
        </p>
        <p>
          Seules les variantes les plus performantes ont été déployées globalement.
        </p>
        <p>
          Grâce à ce modèle, Airbnb optimise en permanence :
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Les messages publicitaires sont adaptés selon la sensibilité culturelle ;</li>
          <li>Les algorithmes de recherche sont personnalisés selon les comportements régionaux ;</li>
          <li>Les investissements médias sont redirigés vers les zones à plus forte élasticité de la demande.</li>
        </ul>
        <p>
          Cette approche permet à Airbnb de maintenir une cohérence de marque mondiale tout en maximisant la pertinence locale.
        </p>
        <p className="font-semibold italic border-l-4 border-[#032622] pl-4 bg-white/50 py-3">
          En 2024, l'entreprise enregistrait un taux de satisfaction global de 94 % et une croissance de 17 % des réservations internationales, en grande partie grâce à ce pilotage agile.
        </p>
      </section>

      <section className="space-y-4 mt-8">
        <h6 className="font-bold text-lg text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
          Conclusion générale
        </h6>
        <p>
          Évaluer et ajuster la stratégie, c'est transformer le marketing en un système d'intelligence continue.
        </p>
        <p>
          Le tableau de bord devient un outil de vision, l'itération un réflexe, et la donnée une matière première.
        </p>
        <p>
          Les marques les plus performantes ne se contentent plus de "lancer et mesurer" : elles testent, adaptent et réinventent en permanence, en gardant un fil rouge clair — leur identité et leur promesse.
        </p>
        <p>
          Airbnb, comme d'autres leaders data-driven, prouve qu'une stratégie marketing efficace ne se mesure pas seulement en ROI, mais en capacité d'apprentissage organisationnelle.
        </p>
        <p className="text-xl font-bold text-center py-4 border-2 border-[#032622] bg-white">
          À l'ère du digital, la clé n'est plus d'avoir raison du premier coup, mais de savoir ajuster vite, souvent et intelligemment.
        </p>
      </section>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase text-[#032622] mb-2">
          Notes rapides
        </label>
        <textarea
          rows={4}
          className="w-full border border-black p-3 text-sm text-[#032622] bg-white focus:outline-none"
          placeholder="Notez vos réflexions personnelles..."
        ></textarea>
      </div>
    </>,
    "strategie_marketing_partie3_6",
    "quizMarketingPartie3",
    "PARTIE 3 — CONCEVOIR ET PILOTER LE PLAN MARKETING STRATÉGIQUE"
  );

  // Rendu Quiz Marketing Partie 1
  const renderQuizMarketingPartie1 = () => {
    const currentQuestion = quizMarketingPartie1Questions[currentQuizQuestion];
    const totalQuestions = quizMarketingPartie1Questions.length;
    const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;

    const handleAnswer = (answerIndex: number) => {
      setQuizMarketingPartie1Answers({
        ...quizMarketingPartie1Answers,
        [currentQuestion.id]: answerIndex
      });
    };

    const handleNext = () => {
      if (currentQuizQuestion < totalQuestions - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1);
      } else {
        let score = 0;
        quizMarketingPartie1Questions.forEach(q => {
          if (quizMarketingPartie1Answers[q.id] === q.correctAnswer) {
            score++;
          }
        });
        setQuizScore(score);
        setShowQuizResults(true);
        setQuizMarketingPartie1Completed(true);
        setStep("resultsMarketingPartie1");
      }
    };

    const handlePrevious = () => {
      if (currentQuizQuestion > 0) {
        setCurrentQuizQuestion(currentQuizQuestion - 1);
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              QUIZ PARTIE 1
            </h2>
            <p className="text-lg text-[#032622]/70">
              Comprendre les fondements et les nouveaux enjeux de la stratégie marketing
            </p>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#032622]">
                Question {currentQuizQuestion + 1} sur {totalQuestions}
              </span>
              <span className="text-sm font-semibold text-[#032622]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-[#F8F5E4] border-2 border-[#032622] h-3 overflow-hidden">
              <div 
                className="h-full bg-[#032622] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="border-2 border-[#032622] bg-[#F8F5E4] p-8 shadow-2xl transform hover:scale-[1.01] transition-transform">
            <h3 className="text-2xl font-bold text-[#032622] mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizMarketingPartie1Answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#032622] bg-[#032622] text-white shadow-lg transform scale-105'
                        : 'border-[#032622] bg-white text-[#032622] hover:bg-[#032622]/10 hover:transform hover:translate-x-2'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-[#032622]'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[#032622]" />
                        )}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuizQuestion === 0}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-6 py-3 text-sm font-bold text-[#032622] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#032622] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>

            <button
              onClick={handleNext}
              disabled={quizMarketingPartie1Answers[currentQuestion.id] === undefined}
              className="border-2 border-[#032622] bg-[#032622] text-white px-6 py-3 text-sm font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors"
            >
              <span>{currentQuizQuestion === totalQuestions - 1 ? 'VOIR LES RÉSULTATS' : 'SUIVANT'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Résultats Marketing Partie 1
  const renderResultsMarketingPartie1 = () => {
    const totalQuestions = quizMarketingPartie1Questions.length;
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    
    const getEmoji = () => {
      if (percentage >= 90) return "A+";
      if (percentage >= 75) return "B+";
      if (percentage >= 50) return "C+";
      return "D";
    };

    const getMessage = () => {
      if (percentage >= 90) return "Excellent ! Vous maîtrisez parfaitement la Partie 1 !";
      if (percentage >= 75) return "Très bien ! Vous avez une bonne compréhension du sujet.";
      if (percentage >= 50) return "Pas mal ! Quelques révisions seraient bénéfiques.";
      return "Courage ! Relisez la Partie 1 pour mieux comprendre.";
    };
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center space-y-4">
            <div className="text-9xl font-black text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {getEmoji()}
            </div>
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              RÉSULTATS DU QUIZ
            </h2>
            <p className="text-2xl text-[#032622]/70">
              Partie 1 — Comprendre les fondements et les nouveaux enjeux
            </p>
          </div>

          <div className="border-4 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-12 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="text-center space-y-6">
              <div className="text-8xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                {quizScore}/{totalQuestions}
              </div>
              <div className="text-4xl font-bold text-[#032622]">
                {percentage}%
              </div>
              <p className="text-xl text-[#032622] font-medium">
                {getMessage()}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Détails des réponses
            </h3>
            {quizMarketingPartie1Questions.map((question, index) => {
              const userAnswer = quizMarketingPartie1Answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id}
                  className={`border-2 p-6 ${
                    isCorrect ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#032622] mb-2">
                        Question {index + 1}: {question.question}
                      </p>
                      <p className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Votre réponse : {userAnswer !== undefined && userAnswer !== null ? question.options[userAnswer] : "Non répondu"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-2">
                          Bonne réponse : {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-[#032622]/70 italic">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizMarketingPartie1Answers({});
                setShowQuizResults(false);
                setStep("quizMarketingPartie1");
              }}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              REFAIRE LE QUIZ
            </button>
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setShowQuizResults(false);
                setStep("strategie_marketing_partie2_1");
              }}
              className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
            >
              <span>CONTINUER VERS PARTIE 2</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Quiz Marketing Partie 2
  const renderQuizMarketingPartie2 = () => {
    const currentQuestion = quizMarketingPartie2Questions[currentQuizQuestion];
    const totalQuestions = quizMarketingPartie2Questions.length;
    const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;

    const handleAnswer = (answerIndex: number) => {
      setQuizMarketingPartie2Answers({
        ...quizMarketingPartie2Answers,
        [currentQuestion.id]: answerIndex
      });
    };

    const handleNext = () => {
      if (currentQuizQuestion < totalQuestions - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1);
      } else {
        let score = 0;
        quizMarketingPartie2Questions.forEach(q => {
          if (quizMarketingPartie2Answers[q.id] === q.correctAnswer) {
            score++;
          }
        });
        setQuizScore(score);
        setShowQuizResults(true);
        setQuizMarketingPartie2Completed(true);
        setStep("resultsMarketingPartie2");
      }
    };

    const handlePrevious = () => {
      if (currentQuizQuestion > 0) {
        setCurrentQuizQuestion(currentQuizQuestion - 1);
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              QUIZ PARTIE 2
            </h2>
            <p className="text-lg text-[#032622]/70">
              Élaborer une stratégie marketing performante et différenciante
            </p>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#032622]">
                Question {currentQuizQuestion + 1} sur {totalQuestions}
              </span>
              <span className="text-sm font-semibold text-[#032622]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-[#F8F5E4] border-2 border-[#032622] h-3 overflow-hidden">
              <div 
                className="h-full bg-[#032622] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="border-2 border-[#032622] bg-[#F8F5E4] p-8 shadow-2xl transform hover:scale-[1.01] transition-transform">
            <h3 className="text-2xl font-bold text-[#032622] mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizMarketingPartie2Answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#032622] bg-[#032622] text-white shadow-lg transform scale-105'
                        : 'border-[#032622] bg-white text-[#032622] hover:bg-[#032622]/10 hover:transform hover:translate-x-2'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-[#032622]'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[#032622]" />
                        )}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuizQuestion === 0}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-6 py-3 text-sm font-bold text-[#032622] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#032622] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>

            <button
              onClick={handleNext}
              disabled={quizMarketingPartie2Answers[currentQuestion.id] === undefined}
              className="border-2 border-[#032622] bg-[#032622] text-white px-6 py-3 text-sm font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors"
            >
              <span>{currentQuizQuestion === totalQuestions - 1 ? 'VOIR LES RÉSULTATS' : 'SUIVANT'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Résultats Marketing Partie 2
  const renderResultsMarketingPartie2 = () => {
    const totalQuestions = quizMarketingPartie2Questions.length;
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    
    const getEmoji = () => {
      if (percentage >= 90) return "A+";
      if (percentage >= 75) return "B+";
      if (percentage >= 50) return "C+";
      return "D";
    };

    const getMessage = () => {
      if (percentage >= 90) return "Excellent ! Vous maîtrisez parfaitement la Partie 2 !";
      if (percentage >= 75) return "Très bien ! Vous avez une bonne compréhension du sujet.";
      if (percentage >= 50) return "Pas mal ! Quelques révisions seraient bénéfiques.";
      return "Courage ! Relisez la Partie 2 pour mieux comprendre.";
    };
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center space-y-4">
            <div className="text-9xl font-black text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {getEmoji()}
            </div>
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              RÉSULTATS DU QUIZ
            </h2>
            <p className="text-2xl text-[#032622]/70">
              Partie 2 — Élaborer une stratégie marketing performante et différenciante
            </p>
          </div>

          <div className="border-4 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-12 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="text-center space-y-6">
              <div className="text-8xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                {quizScore}/{totalQuestions}
              </div>
              <div className="text-4xl font-bold text-[#032622]">
                {percentage}%
              </div>
              <p className="text-xl text-[#032622] font-medium">
                {getMessage()}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Détails des réponses
            </h3>
            {quizMarketingPartie2Questions.map((question, index) => {
              const userAnswer = quizMarketingPartie2Answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id}
                  className={`border-2 p-6 ${
                    isCorrect ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#032622] mb-2">
                        Question {index + 1}: {question.question}
                      </p>
                      <p className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Votre réponse : {userAnswer !== undefined && userAnswer !== null ? question.options[userAnswer] : "Non répondu"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-2">
                          Bonne réponse : {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-[#032622]/70 italic">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizMarketingPartie2Answers({});
                setShowQuizResults(false);
                setStep("quizMarketingPartie2");
              }}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              REFAIRE LE QUIZ
            </button>
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setShowQuizResults(false);
                setStep("strategie_marketing_partie3_1");
              }}
              className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
            >
              <span>CONTINUER VERS PARTIE 3</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Quiz Marketing Partie 3
  const renderQuizMarketingPartie3 = () => {
    const currentQuestion = quizMarketingPartie3Questions[currentQuizQuestion];
    const totalQuestions = quizMarketingPartie3Questions.length;
    const progress = ((currentQuizQuestion + 1) / totalQuestions) * 100;

    const handleAnswer = (answerIndex: number) => {
      setQuizMarketingPartie3Answers({
        ...quizMarketingPartie3Answers,
        [currentQuestion.id]: answerIndex
      });
    };

    const handleNext = () => {
      if (currentQuizQuestion < totalQuestions - 1) {
        setCurrentQuizQuestion(currentQuizQuestion + 1);
      } else {
        let score = 0;
        quizMarketingPartie3Questions.forEach(q => {
          if (quizMarketingPartie3Answers[q.id] === q.correctAnswer) {
            score++;
          }
        });
        setQuizScore(score);
        setShowQuizResults(true);
        setStep("resultsMarketingPartie3");
      }
    };

    const handlePrevious = () => {
      if (currentQuizQuestion > 0) {
        setCurrentQuizQuestion(currentQuizQuestion - 1);
      }
    };

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              QUIZ PARTIE 3
            </h2>
            <p className="text-lg text-[#032622]/70">
              Concevoir et piloter le plan marketing stratégique
            </p>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-[#032622]">
                Question {currentQuizQuestion + 1} sur {totalQuestions}
              </span>
              <span className="text-sm font-semibold text-[#032622]">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-[#F8F5E4] border-2 border-[#032622] h-3 overflow-hidden">
              <div 
                className="h-full bg-[#032622] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="border-2 border-[#032622] bg-[#F8F5E4] p-8 shadow-2xl transform hover:scale-[1.01] transition-transform">
            <h3 className="text-2xl font-bold text-[#032622] mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = quizMarketingPartie3Answers[currentQuestion.id] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-[#032622] bg-[#032622] text-white shadow-lg transform scale-105'
                        : 'border-[#032622] bg-white text-[#032622] hover:bg-[#032622]/10 hover:transform hover:translate-x-2'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-[#032622]'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-[#032622]" />
                        )}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuizQuestion === 0}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-6 py-3 text-sm font-bold text-[#032622] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#032622] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PRÉCÉDENT</span>
            </button>

            <button
              onClick={handleNext}
              disabled={quizMarketingPartie3Answers[currentQuestion.id] === undefined}
              className="border-2 border-[#032622] bg-[#032622] text-white px-6 py-3 text-sm font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors"
            >
              <span>{currentQuizQuestion === totalQuestions - 1 ? 'VOIR LES RÉSULTATS' : 'SUIVANT'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu Résultats Marketing Partie 3
  const renderResultsMarketingPartie3 = () => {
    const totalQuestions = quizMarketingPartie3Questions.length;
    const percentage = Math.round((quizScore / totalQuestions) * 100);
    
    const getEmoji = () => {
      if (percentage >= 90) return "A+";
      if (percentage >= 75) return "B+";
      if (percentage >= 50) return "C+";
      return "D";
    };

    const getMessage = () => {
      if (percentage >= 90) return "Excellent ! Vous maîtrisez parfaitement la Partie 3 !";
      if (percentage >= 75) return "Très bien ! Vous avez une bonne compréhension du sujet.";
      if (percentage >= 50) return "Pas mal ! Quelques révisions seraient bénéfiques.";
      return "Courage ! Relisez la Partie 3 pour mieux comprendre.";
    };
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8 animate-fadeIn">
          <div className="text-center space-y-4">
            <div className="text-9xl font-black text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              {getEmoji()}
            </div>
            <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              RÉSULTATS DU QUIZ
            </h2>
            <p className="text-2xl text-[#032622]/70">
              Partie 3 — Concevoir et piloter le plan marketing stratégique
            </p>
          </div>

          <div className="border-4 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-[#F8F5E4]/80 p-12 shadow-2xl transform hover:scale-105 transition-transform">
            <div className="text-center space-y-6">
              <div className="text-8xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
                {quizScore}/{totalQuestions}
              </div>
              <div className="text-4xl font-bold text-[#032622]">
                {percentage}%
              </div>
              <p className="text-xl text-[#032622] font-medium">
                {getMessage()}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
              Détails des réponses
            </h3>
            {quizMarketingPartie3Questions.map((question, index) => {
              const userAnswer = quizMarketingPartie3Answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div 
                  key={question.id}
                  className={`border-2 p-6 ${
                    isCorrect ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#032622] mb-2">
                        Question {index + 1}: {question.question}
                      </p>
                      <p className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Votre réponse : {userAnswer !== undefined && userAnswer !== null ? question.options[userAnswer] : "Non répondu"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mb-2">
                          Bonne réponse : {question.options[question.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-[#032622]/70 italic">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setCurrentQuizQuestion(0);
                setQuizMarketingPartie3Answers({});
                setShowQuizResults(false);
                setStep("quizMarketingPartie3");
              }}
              className="border-2 border-[#032622] bg-[#F8F5E4] px-8 py-4 text-sm font-bold text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              REFAIRE LE QUIZ
            </button>
            <button
              onClick={() => setStep("bloc1CoursSelection")}
              className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
            >
              <span>RETOUR AUX COURS</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu sélection des cours du Bloc 2
  const renderBloc2CoursSelection = () => {
    const cours = [
      {
        id: "marketing-operationnel",
        titre: "Marketing opérationnel et plan d'action commercial",
        description: "Maîtrisez les techniques de marketing opérationnel et la création de plans d'action commerciaux efficaces",
        Icon: TrendingUp,
        color: "from-blue-500 to-blue-700",
      },
      {
        id: "management-reseau",
        titre: "Management d'un réseau commercial",
        description: "Apprenez à gérer et développer un réseau commercial performant",
        Icon: Network,
        color: "from-green-500 to-green-700",
      },
      {
        id: "communication-entreprise",
        titre: "Communication d'entreprise (hors digital) et gestion de marques",
        description: "Développez vos compétences en communication corporate et en gestion de marques",
        Icon: Megaphone,
        color: "from-purple-500 to-purple-700",
      },
      {
        id: "communication-digitale",
        titre: "Communication digitale",
        description: "Maîtrisez les outils et stratégies de communication digitale",
        Icon: Globe,
        color: "from-orange-500 to-orange-700",
      },
      {
        id: "anglais",
        titre: "Anglais",
        description: "Développez vos compétences linguistiques en anglais professionnel",
        Icon: Languages,
        color: "from-red-500 to-red-700",
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep("overview")}
            className="flex items-center space-x-2 text-sm font-bold text-[#032622] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>RETOUR</span>
          </button>
          <Bookmark className="w-5 h-5 text-[#032622]" />
        </div>

        {renderProgressBar()}

        <div className="text-center space-y-4 py-8">
          <div className="inline-block border-2 border-[#032622] bg-[#032622] text-white px-6 py-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest">Bloc 2</p>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-[#032622] uppercase"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            MISE EN OEUVRE DE LA POLITIQUE COMMERCIALE
          </h1>
          <div className="w-24 h-1 bg-[#032622] mx-auto"></div>
          <p className="text-lg text-[#032622]/70 max-w-2xl mx-auto mt-4">
            Sélectionnez le cours que vous souhaitez commencer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {cours.map((coursItem, index) => {
            const IconComponent = coursItem.Icon;
            return (
            <div
              key={coursItem.id}
              className="group relative border-2 border-[#032622] bg-[#F8F5E4] hover:bg-white transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out both",
              }}
              onClick={() => {
                console.log(`Cours sélectionné: ${coursItem.titre}`);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="p-8 space-y-4 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 border-2 border-[#032622] bg-[#F8F5E4] flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#032622] group-hover:border-[#044a3a]">
                    <IconComponent className="w-8 h-8 text-[#032622] transform transition-all duration-500 group-hover:text-white" />
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${coursItem.color} opacity-20 rounded-lg transform transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-12`}></div>
                </div>

                <h3
                  className="text-2xl font-black text-[#032622] uppercase leading-tight transform transition-all duration-300 group-hover:text-[#044a3a]"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {coursItem.titre}
                </h3>

                <p className="text-sm text-[#032622]/70 leading-relaxed transform transition-all duration-300 group-hover:text-[#032622]">
                  {coursItem.description}
                </p>

                <div className="pt-4 border-t border-[#032622]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#032622] uppercase tracking-wider transform transition-all duration-300 group-hover:tracking-widest">
                      Commencer
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#032622] transform transition-all duration-300 group-hover:translate-x-3 group-hover:scale-110" />
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#032622] transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-100"></div>
            </div>
            );
          })}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `
        }} />

        <div className="max-w-4xl mx-auto mt-12">
          <div className="border-2 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-white p-8 text-center space-y-4">
            <div className="w-16 h-1 bg-[#032622] mx-auto"></div>
            <p className="text-sm text-[#032622]/70 italic">
              Chaque cours est conçu pour vous donner les compétences essentielles dans votre domaine. 
              Commencez par celui qui vous intéresse le plus !
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Rendu sélection des cours du Bloc 3
  const renderBloc3CoursSelection = () => {
    const cours = [
      {
        id: "gestion-rh",
        titre: "Gestion RH",
        description: "Apprenez les fondamentaux de la gestion des ressources humaines",
        Icon: Users,
        color: "from-purple-500 to-purple-700",
      },
      {
        id: "management-interculturel",
        titre: "Management et communication interculturelle",
        description: "Développez vos compétences en management interculturel et communication",
        Icon: UserCog,
        color: "from-blue-500 to-blue-700",
      },
      {
        id: "management-entreprise",
        titre: "Management d'entreprise",
        description: "Maîtrisez les techniques de management et de leadership d'entreprise",
        Icon: Building2,
        color: "from-green-500 to-green-700",
      },
      {
        id: "management-projet",
        titre: "Management de projet entrepreneurial",
        description: "Apprenez à gérer efficacement des projets entrepreneuriaux",
        Icon: Rocket,
        color: "from-orange-500 to-orange-700",
      },
      {
        id: "management-rse",
        titre: "Management RSE, des risques et de la qualité",
        description: "Intégrez la RSE, la gestion des risques et la qualité dans votre management",
        Icon: Shield,
        color: "from-red-500 to-red-700",
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep("overview")}
            className="flex items-center space-x-2 text-sm font-bold text-[#032622] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>RETOUR</span>
          </button>
          <Bookmark className="w-5 h-5 text-[#032622]" />
        </div>

        {renderProgressBar()}

        <div className="text-center space-y-4 py-8">
          <div className="inline-block border-2 border-[#032622] bg-[#032622] text-white px-6 py-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest">Bloc 3</p>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-[#032622] uppercase"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            MANAGER UNE ÉQUIPE ET UN RÉSEAU COMMERCIAL
          </h1>
          <div className="w-24 h-1 bg-[#032622] mx-auto"></div>
          <p className="text-lg text-[#032622]/70 max-w-2xl mx-auto mt-4">
            Sélectionnez le cours que vous souhaitez commencer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {cours.map((coursItem, index) => {
            const IconComponent = coursItem.Icon;
            return (
            <div
              key={coursItem.id}
              className="group relative border-2 border-[#032622] bg-[#F8F5E4] hover:bg-white transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out both",
              }}
              onClick={() => {
                console.log(`Cours sélectionné: ${coursItem.titre}`);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="p-8 space-y-4 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 border-2 border-[#032622] bg-[#F8F5E4] flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#032622] group-hover:border-[#044a3a]">
                    <IconComponent className="w-8 h-8 text-[#032622] transform transition-all duration-500 group-hover:text-white" />
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${coursItem.color} opacity-20 rounded-lg transform transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-12`}></div>
                </div>

                <h3
                  className="text-2xl font-black text-[#032622] uppercase leading-tight transform transition-all duration-300 group-hover:text-[#044a3a]"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {coursItem.titre}
                </h3>

                <p className="text-sm text-[#032622]/70 leading-relaxed transform transition-all duration-300 group-hover:text-[#032622]">
                  {coursItem.description}
                </p>

                <div className="pt-4 border-t border-[#032622]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#032622] uppercase tracking-wider transform transition-all duration-300 group-hover:tracking-widest">
                      Commencer
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#032622] transform transition-all duration-300 group-hover:translate-x-3 group-hover:scale-110" />
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#032622] transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-100"></div>
            </div>
            );
          })}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `
        }} />

        <div className="max-w-4xl mx-auto mt-12">
          <div className="border-2 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-white p-8 text-center space-y-4">
            <div className="w-16 h-1 bg-[#032622] mx-auto"></div>
            <p className="text-sm text-[#032622]/70 italic">
              Chaque cours est conçu pour vous donner les compétences essentielles dans votre domaine. 
              Commencez par celui qui vous intéresse le plus !
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Rendu sélection des cours du Bloc 4
  const renderBloc4CoursSelection = () => {
    const cours = [
      {
        id: "finance-entreprise",
        titre: "Finance d'entreprise, notion de comptabilité",
        description: "Maîtrisez les bases de la finance d'entreprise et de la comptabilité",
        Icon: Wallet,
        color: "from-green-500 to-green-700",
      },
      {
        id: "droit-affaires",
        titre: "Droit des affaires (juridique et levée de fonds)",
        description: "Comprenez les aspects juridiques des affaires et les mécanismes de levée de fonds",
        Icon: Scale,
        color: "from-blue-500 to-blue-700",
      },
      {
        id: "tableau-bord",
        titre: "Tableau de bord et reporting",
        description: "Apprenez à créer et utiliser des tableaux de bord et systèmes de reporting efficaces",
        Icon: FileBarChart,
        color: "from-purple-500 to-purple-700",
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep("overview")}
            className="flex items-center space-x-2 text-sm font-bold text-[#032622] hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>RETOUR</span>
          </button>
          <Bookmark className="w-5 h-5 text-[#032622]" />
        </div>

        {renderProgressBar()}

        <div className="text-center space-y-4 py-8">
          <div className="inline-block border-2 border-[#032622] bg-[#032622] text-white px-6 py-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest">Bloc 4</p>
          </div>
          <h1
            className="text-4xl md:text-5xl font-black text-[#032622] uppercase"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            MESURER LA PERFORMANCE COMMERCIALE
          </h1>
          <div className="w-24 h-1 bg-[#032622] mx-auto"></div>
          <p className="text-lg text-[#032622]/70 max-w-2xl mx-auto mt-4">
            Sélectionnez le cours que vous souhaitez commencer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {cours.map((coursItem, index) => {
            const IconComponent = coursItem.Icon;
            return (
            <div
              key={coursItem.id}
              className="group relative border-2 border-[#032622] bg-[#F8F5E4] hover:bg-white transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out both",
              }}
              onClick={() => {
                console.log(`Cours sélectionné: ${coursItem.titre}`);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="p-8 space-y-4 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 border-2 border-[#032622] bg-[#F8F5E4] flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#032622] group-hover:border-[#044a3a]">
                    <IconComponent className="w-8 h-8 text-[#032622] transform transition-all duration-500 group-hover:text-white" />
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${coursItem.color} opacity-20 rounded-lg transform transition-all duration-500 group-hover:opacity-30 group-hover:scale-110 group-hover:rotate-12`}></div>
                </div>

                <h3
                  className="text-2xl font-black text-[#032622] uppercase leading-tight transform transition-all duration-300 group-hover:text-[#044a3a]"
                  style={{ fontFamily: "var(--font-termina-bold)" }}
                >
                  {coursItem.titre}
                </h3>

                <p className="text-sm text-[#032622]/70 leading-relaxed transform transition-all duration-300 group-hover:text-[#032622]">
                  {coursItem.description}
                </p>

                <div className="pt-4 border-t border-[#032622]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#032622] uppercase tracking-wider transform transition-all duration-300 group-hover:tracking-widest">
                      Commencer
                    </span>
                    <ArrowRight className="w-5 h-5 text-[#032622] transform transition-all duration-300 group-hover:translate-x-3 group-hover:scale-110" />
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#032622] transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-100"></div>
            </div>
            );
          })}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `
        }} />

        <div className="max-w-4xl mx-auto mt-12">
          <div className="border-2 border-[#032622] bg-gradient-to-br from-[#F8F5E4] to-white p-8 text-center space-y-4">
            <div className="w-16 h-1 bg-[#032622] mx-auto"></div>
            <p className="text-sm text-[#032622]/70 italic">
              Chaque cours est conçu pour vous donner les compétences essentielles dans votre domaine. 
              Commencez par celui qui vous intéresse le plus !
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
        {step === "overview" && renderOverview()}
        {step === "courseIntro" && renderCourseIntro()}
        {step === "bloc1CoursSelection" && renderBloc1CoursSelection()}
        {step === "pse_partie1_1" && renderPSEPartie1_1()}
        {step === "strategie_marketing_partie1_1" && renderStrategieMarketingPartie1_1()}
        {step === "strategie_marketing_partie1_2" && renderStrategieMarketingPartie1_2()}
        {step === "strategie_marketing_partie1_3" && renderStrategieMarketingPartie1_3()}
        {step === "strategie_marketing_partie1_4" && renderStrategieMarketingPartie1_4()}
        {step === "strategie_marketing_partie1_5" && renderStrategieMarketingPartie1_5()}
        {step === "strategie_marketing_partie1_6" && renderStrategieMarketingPartie1_6()}
        {step === "strategie_marketing_partie1_7" && renderStrategieMarketingPartie1_7()}
        {step === "strategie_marketing_partie1_8" && renderStrategieMarketingPartie1_8()}
        {step === "strategie_marketing_partie2_1" && renderStrategieMarketingPartie2_1()}
        {step === "strategie_marketing_partie2_2" && renderStrategieMarketingPartie2_2()}
        {step === "strategie_marketing_partie2_3" && renderStrategieMarketingPartie2_3()}
        {step === "strategie_marketing_partie2_4" && renderStrategieMarketingPartie2_4()}
        {step === "strategie_marketing_partie2_5" && renderStrategieMarketingPartie2_5()}
        {step === "strategie_marketing_partie2_6" && renderStrategieMarketingPartie2_6()}
        {step === "strategie_marketing_partie2_7" && renderStrategieMarketingPartie2_7()}
        {step === "strategie_marketing_partie2_8" && renderStrategieMarketingPartie2_8()}
        {step === "strategie_marketing_partie2_9" && renderStrategieMarketingPartie2_9()}
        {step === "strategie_marketing_partie3_1" && renderStrategieMarketingPartie3_1()}
        {step === "strategie_marketing_partie3_2" && renderStrategieMarketingPartie3_2()}
        {step === "strategie_marketing_partie3_3" && renderStrategieMarketingPartie3_3()}
        {step === "strategie_marketing_partie3_4" && renderStrategieMarketingPartie3_4()}
        {step === "strategie_marketing_partie3_5" && renderStrategieMarketingPartie3_5()}
        {step === "strategie_marketing_partie3_6" && renderStrategieMarketingPartie3_6()}
        {step === "strategie_marketing_partie3_7" && renderStrategieMarketingPartie3_7()}
        {step === "quizMarketingPartie1" && renderQuizMarketingPartie1()}
        {step === "resultsMarketingPartie1" && renderResultsMarketingPartie1()}
        {step === "quizMarketingPartie2" && renderQuizMarketingPartie2()}
        {step === "resultsMarketingPartie2" && renderResultsMarketingPartie2()}
        {step === "quizMarketingPartie3" && renderQuizMarketingPartie3()}
        {step === "resultsMarketingPartie3" && renderResultsMarketingPartie3()}
        {step === "bloc2CoursSelection" && renderBloc2CoursSelection()}
        {step === "bloc3CoursSelection" && renderBloc3CoursSelection()}
        {step === "bloc4CoursSelection" && renderBloc4CoursSelection()}
        {step === "module" && renderModuleView()}
        {step === "partie1_1" && renderPartie1_1()}
        {step === "partie1_2" && renderPartie1_2()}
        {step === "partie1_3" && renderPartie1_3()}
        {step === "partie1_3_suite" && renderPartie1_3_Suite()}
        {step === "quizPartie1" && renderQuizPartie1()}
        {step === "resultsPartie1" && renderResultsPartie1()}
        {step === "partie2" && renderPartie2()}
        {step === "partie2_1" && renderPartie2_1()}
        {step === "partie2_2" && renderPartie2_2()}
        {step === "partie2_2_suite" && renderPartie2_2_Suite()}
        {step === "partie2_3" && renderPartie2_3()}
        {step === "partie2_3_suite" && renderPartie2_3_Suite()}
        {step === "quizPartie2" && renderQuizPartie2()}
        {step === "resultsPartie2" && renderResultsPartie2()}
        {step === "partie3_1" && renderPartie3_1()}
        {step === "partie3_2" && renderPartie3_2()}
        {step === "partie3_3" && renderPartie3_3()}
        {step === "partie3_4" && renderPartie3_4()}
        {step === "partie3_5" && renderPartie3_5()}
        {step === "quizPartie3" && renderQuizPartie3()}
        {step === "resultsPartie3" && renderResultsPartie3()}
        {step === "courseFinal" && renderCourseFinal()}
        {step === "quiz" && renderQuizView()}
        {step === "results" && renderResultsView()}
    </div>
  );
}






