"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { StudentSidebar } from "../components/StudentSidebar";
import Image from "next/image";
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
} from "lucide-react";

const heroCourse = {
  greeting: "Bonjour, El Assowad Chadi",
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

const upcomingEvents = [
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
];

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
  const courseContentRef = useRef<HTMLDivElement | null>(null);

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
    }
  }, []);

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
    { label: "Jaune", value: "#fef3c7" },
    { label: "Vert", value: "#d9f99d" },
    { label: "Rose", value: "#fbcfe8" },
    { label: "Bleu", value: "#bae6fd" },
  ];

  const applyHighlight = (color: string) => {
    if (!courseContentRef.current || typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setQuizError(null);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!courseContentRef.current.contains(range.commonAncestorContainer)) return;
    const span = document.createElement("span");
    span.style.backgroundColor = color;
    span.style.padding = "0 2px";
    span.dataset.highlight = "true";
    try {
      range.surroundContents(span);
      selection.removeAllRanges();
    } catch (error) {
      console.warn("Impossible d'appliquer le surlignage sur cette sélection.", error);
    }
  };

  const clearHighlights = () => {
    if (!courseContentRef.current) return;
    const highlights = courseContentRef.current.querySelectorAll('[data-highlight="true"]');
    highlights.forEach((element) => {
      const parent = element.parentNode;
      if (!parent) return;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
      if (parent instanceof HTMLElement || parent instanceof Text) {
        (parent as HTMLElement).normalize?.();
      }
    });
  };

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
                    className={`h-8 flex items-center justify-center border border-black ${
                      day === 18 ? "bg-[#032622] text-white" : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="border border-black p-3 text-xs bg-white/60">
                    <div className="font-bold text-[#032622]">{event.title}</div>
                    <div className="text-[#032622] opacity-80">{event.time}</div>
                  </div>
                ))}
              </div>
              <button className="border border-black bg-[#F8F5E4] text-[#032622] px-4 py-2 text-xs font-semibold flex items-center justify-center space-x-2">
                <CalendarDays className="w-4 h-4" />
                <span>OUVRIR L'AGENDA</span>
              </button>
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
            <div className="bg-[#032622] aspect-video flex items-center justify-center mb-6">
              <video
                src="/menue_etudiant/nonselectionner/SSvid.net--Technique-de-vente-Les-10-qualités-pour-devenir-un_1080p.mp4"
                controls
                className="w-full h-full"
              />
            </div>
            <div className="border border-black bg-[#F8F5E4] p-4 mb-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <Highlighter className="w-4 h-4 text-[#032622]" />
                <span className="text-xs font-bold uppercase text-[#032622]">
                  Surligneur
                </span>
              </div>
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => applyHighlight(color.value)}
                  className="w-8 h-8 border border-black"
                  style={{ backgroundColor: color.value }}
                  title={`Surligner en ${color.label}`}
                ></button>
              ))}
              <button
                onClick={clearHighlights}
                className="flex items-center space-x-1 border border-black px-3 py-1 text-xs font-semibold text-[#032622] bg-white"
              >
                <Eraser className="w-3 h-3" />
                <span>Effacer</span>
              </button>
            </div>
            <h3 className="text-xl font-bold text-[#032622] mb-4">
              Analyse de marché et veille stratégique
            </h3>
            <div
              ref={courseContentRef}
              className="space-y-4 text-sm text-[#032622] leading-relaxed"
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
                    <CheckCircle className="w-4 h-4 text-[#032622]" />
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
                    <span className={`ml-2 ${isCorrect ? "text-[#032622]" : "text-red-600"}`}>
                      {selected !== null ? question.options[selected] : "Non renseignée"}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="font-semibold text-[#032622]">
                      Bonne réponse :
                      <span className="ml-2 text-[#032622]">
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
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <StudentSidebar />
      <div className="flex-1 p-6">
        {step === "overview" && renderOverview()}
        {step === "module" && renderModuleView()}
        {step === "quiz" && renderQuizView()}
        {step === "results" && renderResultsView()}
      </div>
    </div>
  );
}


