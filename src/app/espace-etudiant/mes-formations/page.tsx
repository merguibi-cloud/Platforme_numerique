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
} from "lucide-react";

const heroCourse = {
  greeting: "Bonjour, Chadi El Assowad",
  headline: "Prêt à apprendre quelque chose de nouveau aujourd'hui ?",
};

const courseBlocks = [
  {
    id: "bloc-1",
    title: "Bloc 1",
    subtitle: "Culture de l'intelligence artificielle",
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

type Step = "overview" | "courseIntro" | "module" | "partie1_1" | "partie1_2" | "partie1_3" | "partie1_3_suite" | "quizPartie1" | "resultsPartie1" | "partie2" | "partie2_1" | "partie2_2" | "partie2_2_suite" | "partie2_3" | "partie2_3_suite" | "quizPartie2" | "resultsPartie2" | "courseFinal" | "quiz" | "results";

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
  
  // États pour les quiz Partie 1 et Partie 2
  const [quizPartie1Answers, setQuizPartie1Answers] = useState<Record<number, number | null>>({});
  const [quizPartie2Answers, setQuizPartie2Answers] = useState<Record<number, number | null>>({});
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [notebookContent, setNotebookContent] = useState("");
  const [moduleNotes, setModuleNotes] = useState("");
  const [selectedDay, setSelectedDay] = useState(18);
  const courseContentRef = useRef<HTMLDivElement | null>(null);

  // Scroll vers le haut à chaque changement de page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            (textSpan as HTMLElement).style.backgroundColor = color;
            (textSpan as HTMLElement).style.padding = "2px 4px";
            (textSpan as HTMLElement).style.borderRadius = "3px";
            textSpan.dataset.highlight = "true";
            textSpan.dataset.highlightId = highlightId;
            textSpan.textContent = node.textContent;
            container.appendChild(textSpan);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Élément HTML : traiter récursivement ses enfants
            const element = node as Element;
            const clonedElement = element.cloneNode(false) as Element;
            
            // Copier les attributs importants
            if (element.tagName === 'P' && clonedElement instanceof HTMLElement) {
              clonedElement.style.margin = '0';
              clonedElement.style.display = 'inline';
            }
            
            // Traiter les enfants
            Array.from(element.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
                const textSpan = document.createElement("span");
                (textSpan as HTMLElement).style.backgroundColor = color;
                (textSpan as HTMLElement).style.padding = "2px 4px";
                (textSpan as HTMLElement).style.borderRadius = "3px";
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

  const progressMap: Record<Step, number> = {
    overview: 15,
    courseIntro: 20,
    module: 30,
    partie1_1: 40,
    partie1_2: 50,
    partie1_3: 55,
    partie1_3_suite: 60,
    quizPartie1: 63,
    resultsPartie1: 65,
    partie2: 68,
    partie2_1: 72,
    partie2_2: 75,
    partie2_2_suite: 78,
    partie2_3: 81,
    partie2_3_suite: 84,
    quizPartie2: 87,
    resultsPartie2: 90,
    courseFinal: 100,
    quiz: 93,
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
                    setStep("courseIntro");
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
                    Comprendre les logiques techniques et cognitives qui sous-tendent son fonctionnement (apprentissage, algorithmes, données).
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

            {/* Lecteur vidéo avec overlay interactif */}
            <div className="relative mt-8 mb-6 group">
              <div className="relative bg-[#032622] aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-[#032622] hover:shadow-3xl transition-all duration-300">
                {/* Lecteur vidéo principal */}
              <video
                  ref={videoRef}
                  src="/CULTURE%20DE%20L'IA%20-%20Episode%201.mp4"
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
                          INTRODUCTION
                        </h4>
                        <p className="text-[#F8F5E4]/90 text-base max-w-md mx-auto">
                          Culture de l'intelligence artificielle
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

            {/* Lecteur vidéo Episode 2 */}
            <div className="relative mt-8 mb-6 group">
              <div className="relative bg-[#032622] aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-[#032622] hover:shadow-3xl transition-all duration-300">
                <video
                  src="/CULTURE%20DE%20L'IA%20-%20Episode%202.mp4"
                  controls
                  className="w-full h-full object-cover rounded-lg"
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      Épisode 2
                    </span>
                  </div>
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      Culture de l'IA
                    </span>
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

            {/* Lecteur vidéo Episode 3 */}
            <div className="relative mt-8 mb-6 group">
              <div className="relative bg-[#032622] aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-[#032622] hover:shadow-3xl transition-all duration-300">
                <video
                  src="/CULTURE%20DE%20L'IA%20-%20Episode%203.mp4"
                  controls
                  className="w-full h-full object-cover rounded-lg"
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      Épisode 3
                    </span>
                  </div>
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      Culture de l'IA
                    </span>
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

            {/* Vidéo Episode 4_1 */}
            <div className="relative mt-8 mb-6 group">
              <div className="relative bg-[#032622] aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-[#032622] hover:shadow-3xl transition-all duration-300">
                <video
                  src="/Episode%204_1.mp4"
                  controls
                  className="w-full h-full object-cover rounded-lg"
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
                
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      Épisode 4
                    </span>
                  </div>
                  <div className="bg-[#F8F5E4]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#032622]/20">
                    <span className="text-[#032622] text-xs font-bold uppercase tracking-wider">
                      Entreprise Cognitive
                    </span>
                  </div>
                </div>
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
              onClick={() => setStep("courseFinal")}
              className="border-2 border-[#032622] bg-[#032622] text-white px-8 py-4 text-sm font-bold hover:bg-[#F8F5E4] hover:text-[#032622] transition-colors flex items-center space-x-2"
            >
              <span>VOIR LES RÉSULTATS FINAUX</span>
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
                              2
                            </div>
                            <div className="h-1 w-8 bg-[#032622] mx-auto mb-2"></div>
                            <p className="text-xs text-[#032622] uppercase font-bold tracking-wide">Parties</p>
                          </div>

                          <div className="border-2 border-[#032622] bg-white p-4 transform hover:scale-105 transition-transform">
                            <div className="text-3xl font-black text-[#032622] mb-2" style={{ fontFamily: "var(--font-termina-bold)" }}>
                              30
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

  return (
    <div className="p-6">
        {step === "overview" && renderOverview()}
        {step === "courseIntro" && renderCourseIntro()}
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
        {step === "courseFinal" && renderCourseFinal()}
        {step === "quiz" && renderQuizView()}
        {step === "results" && renderResultsView()}
    </div>
  );
}



