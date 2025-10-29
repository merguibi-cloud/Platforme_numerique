"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  ChevronDown,
  Clock,
  Mail,
  MessageCircle,
  PencilLine,
  Phone,
  Send,
  Target,
  UserRound,
  Users,
  X,
  BarChart3,
  Plus,
  Eye,
  CheckCircle,
} from "lucide-react";

type SchoolId = "keos" | "edifice" | "x1001";

type FormationId = "devWeb" | "marketing" | "ia" | "designUX";

interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  status: "important" | "normal" | "late";
}

interface CorrectionItem {
  id: string;
  blockName: string;
  submissionDate: string;
  assignedTo: string;
  status: "en_retard" | "corrige";
}

interface CourseItem {
  id: string;
  title: string;
  mentor: string;
  status: "a_valider" | "en_ligne";
  actionLabel: string;
}

interface MessageItem {
  id: string;
  author: string;
  role: string;
  excerpt: string;
  timeAgo: string;
}

interface StudentStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "away";
}

interface TeacherStatus {
  id: string;
  name: string;
  specialty: string;
  status: "online" | "offline" | "away";
}

interface StudentProfile {
  id: string;
  promotion: string;
  campus: string;
  school: string;
  track: string;
  focus: string;
  progress: number;
  lastLogin: string;
  nextDeadline: {
    label: string;
    date: string;
  };
  upcomingSession: {
    label: string;
    date: string;
  };
  email: string;
  phone: string;
  notes: string;
  avatar: string;
}

interface FormationData {
  name: string;
  greeting: string;
  courses: CourseItem[];
  messages: MessageItem[];
  corrections: {
    late: CorrectionItem[];
    recent: CorrectionItem[];
  };
  agenda: AgendaEvent[];
  students: StudentStatus[];
  teachers: TeacherStatus[];
  studentProfiles?: StudentProfile[];
}

const schools: Record<SchoolId, { label: string }> = {
  keos: { label: "KEOS" },
  x1001: { label: "1001" },
  edifice: { label: "EDIFICE" },
};

const formationsPerSchool: Record<SchoolId, FormationId[]> = {
  keos: ["devWeb", "marketing", "ia"],
  edifice: ["designUX", "marketing"],
  x1001: ["devWeb", "ia"],
};

const formationsData: Record<FormationId, FormationData> = {
  devWeb: {
    name: "Développement Web",
    greeting: "Bonjour, Jean Dupont",
    courses: [
      {
        id: "course-1",
        title: "Module 3",
        mentor: "Samantha Leroy",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-2",
        title: "Module 4",
        mentor: "Samantha Leroy",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-3",
        title: "Module 1",
        mentor: "Nicolas Bernard",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
      {
        id: "course-4",
        title: "Module 2",
        mentor: "Nicolas Bernard",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
    ],
    messages: [
      {
        id: "msg-1",
        author: "Chadi El Assowad",
        role: "Étudiant",
        excerpt:
          "Bonjour Sophie, j'ai déposé le devoir du Bloc 1. Peux-tu me confirmer sa bonne réception ?",
        timeAgo: "Il y a 2 h",
      },
      {
        id: "msg-2",
        author: "Lina Bouchard",
        role: "Étudiante",
        excerpt:
          "Merci pour le retour sur le module 2, dois-je déjà commencer la préparation du prochain quiz ?",
        timeAgo: "Il y a 3 h",
      },
      {
        id: "msg-3",
        author: "Youssef Karim",
        role: "Étudiant",
        excerpt:
          "Je serai absent vendredi matin. Est-ce possible d'obtenir le replay du live ?",
        timeAgo: "Il y a 5 h",
      },
    ],
    corrections: {
      late: [
        {
          id: "corr-1",
          blockName:
            "Bloc 2 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "07/10/2025",
          assignedTo: "Samantha Leroy",
          status: "en_retard",
        },
        {
          id: "corr-2",
          blockName:
            "Bloc 4 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "05/10/2025",
          assignedTo: "Samantha Leroy",
          status: "en_retard",
        },
      ],
      recent: [
        {
          id: "corr-3",
          blockName:
            "Bloc 1 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "10/10/2025",
          assignedTo: "Nicolas Bernard",
          status: "corrige",
        },
        {
          id: "corr-4",
          blockName:
            "Bloc 3 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "09/10/2025",
          assignedTo: "Nicolas Bernard",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-1",
        title: "Visio tuteur – suivi individuel Chadi",
        date: "2025-10-15",
        status: "important",
      },
      {
        id: "agenda-2",
        title: "Correction devoir Bloc 2",
        date: "2025-10-18",
        status: "normal",
      },
      {
        id: "agenda-3",
        title: "Point d'équipe formateurs",
        date: "2025-10-22",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-1", name: "Chadi El Assowad", status: "online" },
      { id: "etu-2", name: "Lina Bouchard", status: "online" },
      { id: "etu-3", name: "Youssef Karim", status: "away" },
      { id: "etu-4", name: "Anaïs Dubois", status: "online" },
      { id: "etu-5", name: "Marc Lefort", status: "away" },
      { id: "etu-6", name: "Clémence Vidal", status: "online" },
      { id: "etu-7", name: "Noah Perret", status: "offline" },
      { id: "etu-8", name: "Inès Roussel", status: "offline" },
      { id: "etu-9", name: "Thomas Nguyen", status: "away" },
    ],
    teachers: [
      { id: "prof-1", name: "Samantha Leroy", specialty: "Frontend", status: "online" },
      { id: "prof-2", name: "Nicolas Bernard", specialty: "Fullstack", status: "online" },
      { id: "prof-3", name: "Helena Costa", specialty: "Architecture", status: "away" },
    ],
    studentProfiles: [
      {
        id: "etu-1",
        promotion: "Promotion 2025",
        campus: "Campus Paris La Défense",
        school: "KEOS Business School",
        track: "BACHELOR · Responsable du développement des activités",
        focus: "Bloc 2 · Pilotage de la performance",
        progress: 72,
        lastLogin: "Aujourd'hui · 08h47",
        nextDeadline: {
          label: "Devoir Bloc 2",
          date: "18 octobre 2025",
        },
        upcomingSession: {
          label: "Visio tuteur",
          date: "15 octobre 2025 · 09h00",
        },
        email: "chadi.elassowad@elite-society.fr",
        phone: "+33 6 12 34 56 78",
        notes:
          "Chadi maintient un rythme régulier. Relance prévue sur les livrables Bloc 2 et préparation du quiz final.",
        avatar: "/images/student-library/IMG_1719 2.PNG",
      },
    ],
  },
  marketing: {
    name: "Marketing Digital",
    greeting: "Bonjour, Jean Dupont",
    courses: [
      {
        id: "course-5",
        title: "Campagne Réseaux",
        mentor: "Pauline Rey",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-6",
        title: "Copywriting",
        mentor: "Romain Tessier",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
    ],
    messages: [
      {
        id: "msg-4",
        author: "Juliette Morel",
        role: "Étudiante",
        excerpt:
          "Le quiz sur la stratégie digitale reste bloqué à la question 7, peux-tu le débloquer ?",
        timeAgo: "Il y a 1 h",
      },
      {
        id: "msg-5",
        author: "Harold Giraud",
        role: "Étudiant",
        excerpt:
          "Je suis en déplacement jeudi, pourrais-tu me partager les supports en amont ?",
        timeAgo: "Il y a 3 h",
      },
    ],
    corrections: {
      late: [
        {
          id: "corr-5",
          blockName: "Bloc 1 - Audit de marque",
          submissionDate: "04/10/2025",
          assignedTo: "Pauline Rey",
          status: "en_retard",
        },
      ],
      recent: [
        {
          id: "corr-6",
          blockName: "Bloc 3 - Tunnel d'acquisition",
          submissionDate: "09/10/2025",
          assignedTo: "Pauline Rey",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-4",
        title: "Atelier SEO avancé",
        date: "2025-10-16",
        status: "important",
      },
      {
        id: "agenda-5",
        title: "Revue campagnes étudiants",
        date: "2025-10-20",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-10", name: "Juliette Morel", status: "online" },
      { id: "etu-11", name: "Harold Giraud", status: "away" },
      { id: "etu-12", name: "Lena Sorel", status: "offline" },
      { id: "etu-13", name: "Oscar Verdier", status: "online" },
    ],
    teachers: [
      { id: "prof-4", name: "Pauline Rey", specialty: "SEO", status: "online" },
      { id: "prof-5", name: "Romain Tessier", specialty: "Stratégie de contenu", status: "online" },
    ],
  },
  ia: {
    name: "Intelligence Artificielle",
    greeting: "Bonjour, Jean Dupont",
    courses: [
      {
        id: "course-7",
        title: "Machine Learning",
        mentor: "Alexandre Petit",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-8",
        title: "Deep Learning",
        mentor: "Nadia Slimani",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-9",
        title: "NLP",
        mentor: "Alexandre Petit",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
    ],
    messages: [
      {
        id: "msg-6",
        author: "Eva Quentin",
        role: "Étudiante",
        excerpt: "Pourrais-tu partager un exemple d'évaluation sur le projet IA ?",
        timeAgo: "Il y a 30 min",
      },
      {
        id: "msg-7",
        author: "Noah Delorme",
        role: "Étudiant",
        excerpt:
          "Je bloque sur l'installation de TensorFlow. Est-il possible d'avoir une session d'assistance ?",
        timeAgo: "Il y a 4 h",
      },
    ],
    corrections: {
      late: [
        {
          id: "corr-7",
          blockName: "Bloc 5 - Vision par ordinateur",
          submissionDate: "02/10/2025",
          assignedTo: "Nadia Slimani",
          status: "en_retard",
        },
      ],
      recent: [
        {
          id: "corr-8",
          blockName: "Bloc 2 - Statistiques avancées",
          submissionDate: "08/10/2025",
          assignedTo: "Alexandre Petit",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-6",
        title: "Workshop IA générative",
        date: "2025-10-21",
        status: "important",
      },
      {
        id: "agenda-7",
        title: "Soutenance projets",
        date: "2025-10-30",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-14", name: "Eva Quentin", status: "online" },
      { id: "etu-15", name: "Noah Delorme", status: "away" },
      { id: "etu-16", name: "Léo Waechter", status: "offline" },
      { id: "etu-17", name: "Mila Roussel", status: "online" },
      { id: "etu-18", name: "Aaron Perrin", status: "offline" },
    ],
    teachers: [
      { id: "prof-6", name: "Alexandre Petit", specialty: "ML & NLP", status: "online" },
      { id: "prof-7", name: "Nadia Slimani", specialty: "Deep Learning", status: "away" },
      { id: "prof-8", name: "Hélène Yamamoto", specialty: "Computer Vision", status: "offline" },
    ],
  },
  designUX: {
    name: "Design UX/UI",
    greeting: "Bonjour, Jean Dupont",
    courses: [
      {
        id: "course-10",
        title: "Atelier Figma",
        mentor: "Sophie Nicolas",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
      {
        id: "course-11",
        title: "Recherche utilisateur",
        mentor: "Sophie Nicolas",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
    ],
    messages: [
      {
        id: "msg-8",
        author: "Julien Fabre",
        role: "Étudiant",
        excerpt:
          "Je n'arrive pas à importer la grille de composants sur Figma. Peux-tu m'orienter ?",
        timeAgo: "Il y a 1 h",
      },
    ],
    corrections: {
      late: [],
      recent: [
        {
          id: "corr-9",
          blockName: "Bloc 1 - Parcours utilisateur",
          submissionDate: "11/10/2025",
          assignedTo: "Sophie Nicolas",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-8",
        title: "Sprint design",
        date: "2025-10-19",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-19", name: "Julien Fabre", status: "online" },
      { id: "etu-20", name: "Clara Estrada", status: "away" },
      { id: "etu-21", name: "Sarah Thibault", status: "offline" },
    ],
    teachers: [
      { id: "prof-9", name: "Sophie Nicolas", specialty: "UX Research", status: "online" },
      { id: "prof-10", name: "Antoine Pacot", specialty: "UI Design", status: "away" },
    ],
  },
};

const statusColors: Record<CorrectionItem["status"], string> = {
  en_retard: "bg-[#D96B6B] text-white",
  corrige: "bg-[#5AA469] text-white",
};

const studentStatusColors: Record<StudentStatus["status"], string> = {
  online: "bg-[#4CAF50]",
  offline: "bg-[#D96B6B]",
  away: "bg-[#F0C75E]",
};

const monthWeeks = [
  ["1", "2", "3", "4", "5", "6", "7"],
  ["8", "9", "10", "11", "12", "13", "14"],
  ["15", "16", "17", "18", "19", "20", "21"],
  ["22", "23", "24", "25", "26", "27", "28"],
  ["29", "30", "1", "2", "3", "4", "5"],
];

const FormateurDashboardContent = () => {
  const [selectedSchool, setSelectedSchool] = useState<SchoolId>("keos");
  const availableFormations = formationsPerSchool[selectedSchool];
  const [selectedFormation, setSelectedFormation] = useState<FormationId>(
    availableFormations[0]
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const data = useMemo(() => formationsData[selectedFormation], [selectedFormation]);

  const handleSchoolChange = (school: SchoolId) => {
    setSelectedSchool(school);
    const firstFormation = formationsPerSchool[school][0];
    setSelectedFormation(firstFormation);
    setSelectedStudentId(null);
  };

  const totalStudentsOnline = data.students.filter((s) => s.status === "online").length;
  const totalTeachersOnline = data.teachers.filter((t) => t.status === "online").length;

  return (
    <div className="flex-1 p-10 bg-[#F8F5E4]">
      {/* Header avec notifications et profil */}
      <div className="flex justify-end items-center space-x-4 mb-8">
        <div className="relative">
          <Bell className="w-6 h-6 text-[#032622]" />
          <span className="absolute -top-2 -right-2 bg-[#D96B6B] text-white text-xs rounded-full px-1.5 py-0.5">
            5
          </span>
        </div>
        <ProfileDropdown />
      </div>

      <div className="space-y-8">
        {/* Salutation et rôle */}
        <div className="space-y-3">
          <h1
            className="text-4xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            BONJOUR, JACQUES POTE.
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-[#032622]">RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS</span>
            <ChevronDown className="w-4 h-4 text-[#032622]" />
          </div>
        </div>


        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Mes Cours, Quiz et Agenda */}
          <div className="lg:col-span-2 space-y-6">
            <MesCoursCard />
            <QuizCard />
            <AgendaCard />
          </div>

          {/* Colonne droite - Rendus, Messagerie et Promo */}
          <div className="space-y-6">
            <RendusCard />
            <MessagerieCard />
            <PromoCard />
          </div>
        </div>
      </div>
    </div>
  );
};

interface DropdownSelectorProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const DropdownSelector = ({ label, value, options, onChange }: DropdownSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <div 
        className="border border-[#032622] px-4 py-3 flex justify-between items-center bg-[#F8F5E4] cursor-pointer hover:bg-[#eae5cf] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <p className="text-xs text-[#032622]/70 uppercase tracking-wider">{label}</p>
          <p className="text-lg font-semibold text-[#032622]">{selectedOption?.label}</p>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-[#032622] transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full border border-[#032622] bg-[#F8F5E4] shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-[#032622] hover:bg-[#eae5cf] transition-colors border-b border-[#032622]/20 last:border-b-0"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const MesCoursCard = () => {
  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          MES COURS
        </h2>
        <Link href="/espace-formateur/gestion-cours">
          <button className="bg-[#032622] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#01302C] transition-colors">
            CRÉER UN COURS
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {/* Module 1 */}
        <div className="flex items-center justify-between border border-[#032622]/40 px-4 py-3 bg-[#F8F5E4]">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-[#032622]">MODULE 1</span>
            <span className="bg-[#4CAF50] text-white px-3 py-1 text-xs font-semibold uppercase">EN LIGNE</span>
          </div>
          <Link href="/espace-formateur/gestion-cours">
            <button className="text-[#032622] font-semibold hover:underline">MODIFIER</button>
          </Link>
        </div>

        {/* Module 2 */}
        <div className="flex items-center justify-between border border-[#032622]/40 px-4 py-3 bg-[#F8F5E4]">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-[#032622]">MODULE 2</span>
            <span className="bg-[#4CAF50] text-white px-3 py-1 text-xs font-semibold uppercase">EN LIGNE</span>
          </div>
          <Link href="/espace-formateur/gestion-cours">
            <button className="text-[#032622] font-semibold hover:underline">MODIFIER</button>
          </Link>
        </div>

        {/* Module 3 */}
        <div className="flex items-center justify-between border border-[#032622]/40 px-4 py-3 bg-[#F8F5E4]">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-[#032622]">MODULE 3</span>
            <span className="bg-[#F0C75E] text-white px-3 py-1 text-xs font-semibold uppercase">BROUILLON</span>
          </div>
          <Link href="/espace-formateur/gestion-cours">
            <button className="text-[#032622] font-semibold hover:underline">MODIFIER</button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const QuizCard = () => {
  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
      <h2
        className="text-2xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        QUIZ
      </h2>

      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-[#032622]">11,5</div>
        <div className="text-lg text-[#032622]">DE MOYENNE GLOBALE</div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#032622]">TEMPS DE CONNEXION</h3>
        <div className="flex items-end justify-between space-x-2 h-20">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 bg-[#032622] h-8"></div>
            <span className="text-xs text-[#032622]">L</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 bg-[#032622] h-12"></div>
            <span className="text-xs text-[#032622]">M</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 bg-[#032622] h-16"></div>
            <span className="text-xs text-[#032622]">M</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 bg-[#032622] h-10"></div>
            <span className="text-xs text-[#032622]">J</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 bg-[#032622] h-14"></div>
            <span className="text-xs text-[#032622]">V</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 bg-[#032622] h-6"></div>
            <span className="text-xs text-[#032622]">S</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-6 bg-[#032622] h-4"></div>
            <span className="text-xs text-[#032622]">D</span>
          </div>
        </div>
      </div>
    </section>
  );
};


const RendusCard = () => {
  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          RENDUS
        </h2>
        <button className="text-sm font-semibold text-[#032622] hover:underline">TOUT VOIR</button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border border-[#032622]/40 px-4 py-3 bg-[#F8F5E4]">
          <span className="text-lg font-bold text-[#032622]">ÉTUDE DE CAS ERWIN</span>
          <Link href="/espace-formateur/gestion-cours">
            <button className="bg-[#032622] text-white px-3 py-1 text-xs font-semibold uppercase hover:bg-[#01302C] transition-colors">
              CORRIGER
            </button>
          </Link>
        </div>

        <div className="flex items-center justify-between border border-[#032622]/40 px-4 py-3 bg-[#F8F5E4]">
          <span className="text-lg font-bold text-[#032622]">ÉTUDE DE CAS CONNY</span>
          <Link href="/espace-formateur/gestion-cours">
            <button className="bg-[#032622] text-white px-3 py-1 text-xs font-semibold uppercase hover:bg-[#01302C] transition-colors">
              CORRIGER
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const MessagerieCard = () => {
  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-[#032622] flex items-center space-x-2"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          <span>MESSAGERIE</span>
          <span className="bg-[#D96B6B] text-white text-xs rounded-full px-2 py-0.5">
            5
          </span>
        </h2>
        <button className="text-sm font-semibold text-[#032622] hover:underline">TOUT VOIR</button>
      </div>

      <div className="space-y-3">
        <div className="border border-[#032622]/30 px-4 py-3 bg-[#F8F5E4]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#032622] font-semibold">ANNIEL</span>
            <span className="text-xs text-[#032622]/70">il y a 1 jour</span>
          </div>
          <p className="text-sm text-[#032622]/80">Bonjour, j'ai une question sur le module...</p>
        </div>

        <div className="border border-[#032622]/30 px-4 py-3 bg-[#F8F5E4]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#032622] font-semibold">SASHA.B</span>
            <span className="text-xs text-[#032622]/70">Aujourd'hui 10h03</span>
          </div>
          <p className="text-sm text-[#032622]/80">Merci pour le retour sur le devoir...</p>
        </div>

        <div className="border border-[#032622]/30 px-4 py-3 bg-[#F8F5E4]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#032622] font-semibold">GRISHA.J</span>
            <span className="text-xs text-[#032622]/70">Aujourd'hui 09h45</span>
          </div>
          <p className="text-sm text-[#032622]/80">Pouvez-vous m'aider avec...</p>
        </div>

        <div className="border border-[#032622]/30 px-4 py-3 bg-[#F8F5E4]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#032622] font-semibold">GRISHA.J</span>
            <span className="text-xs text-[#032622]/70">Aujourd'hui 08h30</span>
          </div>
          <p className="text-sm text-[#032622]/80">J'ai terminé l'exercice...</p>
        </div>
      </div>
    </section>
  );
};


const AgendaCard = () => {
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
  const currentDate = new Date();
  const weekDates = [];
  
  // Calculer les dates de la semaine courante (lundi au dimanche)
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    weekDates.push(weekDate);
  }

  // Événements de la semaine
  const weekEvents = [
    { day: 1, title: "RENDEZ-VOUS PEAK.F", time: "11h30" }, // Mardi
    { day: 3, title: "CORRECTION BLOC 2", time: "14h00" }, // Jeudi
    { day: 4, title: "ATELIER SEO", time: "09h30" }, // Vendredi
  ];

  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          AGENDA
        </h2>
        <button className="text-sm font-semibold text-[#032622] hover:underline">TOUT VOIR</button>
      </div>

      {/* En-têtes des jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-[#032622]">
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-center border-r border-[#032622] last:border-r-0">
            <div className="font-bold text-[#032622] text-sm">{day}</div>
            <div className="text-xs text-[#032622]/70 mt-1">{weekDates[index].getDate()}</div>
          </div>
        ))}
      </div>

      {/* Zone des événements */}
      <div className="grid grid-cols-7 min-h-32">
        {weekDates.map((date, index) => {
          const dayEvents = weekEvents.filter(event => event.day === index);
          return (
            <div key={index} className="border-r border-[#032622] last:border-r-0 p-1 bg-[#F8F5E4]">
              <div className="space-y-1">
                {dayEvents.map((event, eventIndex) => (
                  <div key={eventIndex} className="bg-[#032622] text-white text-xs p-1 rounded text-center font-medium">
                    <div className="truncate">{event.title}</div>
                    <div className="text-xs opacity-80">{event.time}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};


const ProfileDropdown = () => (
  <div className="relative group">
    <div className="flex items-center space-x-3 cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-[#F8F5E4] border-2 border-[#032622] flex items-center justify-center text-[#032622] text-lg">
        JP
      </div>
      <div>
        <p
          className="text-[#032622] font-semibold text-sm"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Jacques Pote
        </p>
        <p className="text-xs text-[#032622]/70">Formateur</p>
      </div>
    </div>

    <div className="absolute right-0 mt-3 w-52 border border-[#032622] bg-[#F8F5E4] shadow-lg z-30 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
      <nav className="flex flex-col divide-y divide-[#032622]/20 text-sm text-[#032622]">
        <Link href="/espace-formateur/compte" className="px-4 py-3 hover:bg-[#eae5cf] transition-colors">
          Mon compte
        </Link>
        <Link href="/espace-formateur/parametres" className="px-4 py-3 hover:bg-[#eae5cf] transition-colors">
          Paramètres
        </Link>
        <button className="px-4 py-3 text-left hover:bg-[#eae5cf] transition-colors">
          Se déconnecter
        </button>
      </nav>
    </div>
  </div>
);

const PromoCard = () => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const students = [
    { 
      name: "PEAK.F", 
      status: "online",
      progress: 85,
      lastLogin: "Aujourd'hui 14h30",
      nextDeadline: "Devoir Bloc 3 - 25 Mars",
      upcomingSession: "Visio tuteur - 22 Mars 10h00",
      email: "peak.f@elite-society.fr",
      notes: "Excellent travail sur le projet final. Progression constante."
    },
    { 
      name: "ANNIE.L", 
      status: "online",
      progress: 72,
      lastLogin: "Aujourd'hui 11h15",
      nextDeadline: "Quiz Module 2 - 20 Mars",
      upcomingSession: "Atelier pratique - 21 Mars 14h00",
      email: "annie.l@elite-society.fr",
      notes: "Très motivée, quelques difficultés sur les concepts avancés."
    },
    { 
      name: "HANSI.Z", 
      status: "away",
      progress: 68,
      lastLogin: "Hier 16h45",
      nextDeadline: "Rendu projet - 23 Mars",
      upcomingSession: "Soutenance - 24 Mars 15h30",
      email: "hansi.z@elite-society.fr",
      notes: "Besoin de soutien sur la partie technique du projet."
    },
    { 
      name: "KENNY.A", 
      status: "online",
      progress: 91,
      lastLogin: "Aujourd'hui 09h20",
      nextDeadline: "Examen final - 30 Mars",
      upcomingSession: "Révision - 28 Mars 16h00",
      email: "kenny.a@elite-society.fr",
      notes: "Performance exceptionnelle, excellent leadership dans le groupe."
    },
    { 
      name: "GABY.B", 
      status: "away",
      progress: 55,
      lastLogin: "Lundi 18h30",
      nextDeadline: "Catch-up Module 1 - 26 Mars",
      upcomingSession: "Soutien individuel - 25 Mars 11h00",
      email: "gaby.b@elite-society.fr",
      notes: "Rattrapage nécessaire, difficultés de compréhension des bases."
    },
    { 
      name: "CONNY.S", 
      status: "online",
      progress: 78,
      lastLogin: "Aujourd'hui 13h45",
      nextDeadline: "Présentation - 27 Mars",
      upcomingSession: "Préparation oral - 26 Mars 14h30",
      email: "conny.s@elite-society.fr",
      notes: "Bon niveau général, amélioration des compétences de présentation."
    },
    { 
      name: "GRISHA.J", 
      status: "away",
      progress: 63,
      lastLogin: "Mardi 10h15",
      nextDeadline: "Devoir Module 3 - 24 Mars",
      upcomingSession: "Tutorat - 23 Mars 09h00",
      email: "grisha.j@elite-society.fr",
      notes: "Progression lente mais régulière, besoin d'encouragement."
    },
    { 
      name: "SASHA.B", 
      status: "online",
      progress: 88,
      lastLogin: "Aujourd'hui 15h20",
      nextDeadline: "Projet final - 29 Mars",
      upcomingSession: "Validation projet - 28 Mars 10h30",
      email: "sasha.b@elite-society.fr",
      notes: "Très créative, excellente approche méthodologique."
    },
    { 
      name: "ERWIN.S", 
      status: "offline",
      progress: 45,
      lastLogin: "Vendredi 12h00",
      nextDeadline: "Rattrapage urgent - 22 Mars",
      upcomingSession: "Entretien individuel - 21 Mars 15h00",
      email: "erwin.s@elite-society.fr",
      notes: "Absences répétées, situation préoccupante nécessitant un suivi."
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-[#4CAF50]";
      case "away": return "bg-[#F0C75E]";
      case "offline": return "bg-[#D96B6B]";
      default: return "bg-[#D96B6B]";
    }
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
        <div>
          <h2
            className="text-xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            PROMO
          </h2>
          <p className="text-sm text-[#032622]/70">RESPONSABLE DÉVELOPPEMENT DES ACTIVITÉS</p>
        </div>

        <div className="space-y-3">
          {students.map((student, index) => (
            <div key={index} className="flex items-center justify-between text-sm text-[#032622]">
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${getStatusColor(student.status)}`} />
                <span className="font-semibold">{student.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-[#032622]/60">
                <button 
                  onClick={() => handleStudentClick(student)}
                  className="hover:text-[#032622] transition-colors cursor-pointer"
                  title="Voir le profil"
                >
                  <UserRound className="w-4 h-4" />
                </button>
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal d'informations de l'étudiant */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F8F5E4] border-2 border-[#032622] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#032622]">
                {selectedStudent.name}
              </h3>
              <button 
                onClick={closeModal}
                className="text-[#032622] hover:text-[#01302C] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Statut et progression */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(selectedStudent.status)}`} />
                  <span className="text-sm text-[#032622]">
                    {selectedStudent.status === "online" ? "En ligne" : 
                     selectedStudent.status === "away" ? "Absent" : "Hors ligne"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#032622]">{selectedStudent.progress}%</div>
                  <div className="text-xs text-[#032622]/70">Progression</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-[#032622]/20 rounded-full h-2">
                <div 
                  className="bg-[#032622] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${selectedStudent.progress}%` }}
                ></div>
              </div>

              {/* Informations détaillées */}
              <div className="space-y-2 text-sm text-[#032622]">
                <div>
                  <span className="font-semibold">Dernière connexion:</span> {selectedStudent.lastLogin}
                </div>
                <div>
                  <span className="font-semibold">Prochaine échéance:</span> {selectedStudent.nextDeadline}
                </div>
                <div>
                  <span className="font-semibold">Prochaine session:</span> {selectedStudent.upcomingSession}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {selectedStudent.email}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-[#032622]/10 p-3 rounded border border-[#032622]/20">
                <div className="text-sm font-semibold text-[#032622] mb-1">Notes:</div>
                <div className="text-xs text-[#032622]/80">{selectedStudent.notes}</div>
              </div>

              {/* Boutons d'action */}
              <div className="flex space-x-2 pt-2">
                <Link 
                  href="/espace-formateur/gestion-etudiants"
                  className="flex-1 bg-[#032622] text-white px-4 py-2 text-xs font-semibold uppercase text-center hover:bg-[#01302C] transition-colors"
                >
                  Voir le profil complet
                </Link>
                <button className="bg-[#4CAF50] text-white px-4 py-2 text-xs font-semibold uppercase hover:bg-[#45a049] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormateurDashboardContent;

