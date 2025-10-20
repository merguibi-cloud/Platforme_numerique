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
    greeting: "Bonjour, Sophie Moreau",
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
    greeting: "Bonjour, Sophie Moreau",
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
    greeting: "Bonjour, Sophie Moreau",
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
    greeting: "Bonjour, Sophie Moreau",
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

const AdminDashboardContent = () => {
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
      <div className="flex justify-end items-center space-x-4 mb-8">
        <div className="relative">
          <Bell className="w-6 h-6 text-[#032622]" />
          <span className="absolute -top-2 -right-2 bg-[#D96B6B] text-white text-xs rounded-full px-1.5 py-0.5">
            6
          </span>
        </div>
        <ProfileDropdown />
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <h1
            className="text-4xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            {data.greeting.toUpperCase()}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropdownSelector
              label="ÉCOLE"
              value={selectedSchool}
              options={Object.entries(schools).map(([id, info]) => ({
                value: id,
                label: info.label,
              }))}
              onChange={(value) => handleSchoolChange(value as SchoolId)}
            />
            <DropdownSelector
              label="FORMATION"
              value={selectedFormation}
              options={availableFormations.map((id) => ({
                value: id,
                label: formationsData[id].name,
              }))}
              onChange={(value) => {
                setSelectedFormation(value as FormationId);
                setSelectedStudentId(null);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CoursesCard courses={data.courses} />
            <CorrectionsCard corrections={data.corrections} />
            <AgendaCard agenda={data.agenda} />
          </div>
          <div className="space-y-6">
            <MessagesCard messages={data.messages} />
            <ProfileCard
              selectedStudentId={selectedStudentId}
              onClose={() => setSelectedStudentId(null)}
              students={data.studentProfiles ?? []}
            />
            <PromoCard
              students={data.students}
              teachers={data.teachers}
              totalStudentsOnline={totalStudentsOnline}
              totalTeachersOnline={totalTeachersOnline}
              onStudentFocus={setSelectedStudentId}
              selectedStudentId={selectedStudentId}
            />
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

const DropdownSelector = ({ label, value, options, onChange }: DropdownSelectorProps) => (
  <div className="border border-[#032622] px-4 py-3 flex justify-between items-center bg-[#F8F5E4] relative">
    <div className="flex-1">
      <p className="text-xs text-[#032622]/70 uppercase tracking-wider">{label}</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="text-lg font-semibold text-[#032622] bg-transparent focus:outline-none appearance-none w-full pr-8"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-[#032622]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
    <ChevronDown className="w-5 h-5 text-[#032622] absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
  </div>
);

const CoursesCard = ({ courses }: { courses: FormationData["courses"] }) => {
  const toValidate = courses.filter((course) => course.status === "a_valider");
  const online = courses.filter((course) => course.status === "en_ligne");

  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          COURS
        </h2>
        <Link
          href="/espace-admin/gestion-formations"
          className="text-sm font-semibold text-[#032622] border border-[#032622] px-4 py-2 inline-flex items-center space-x-2 hover:bg-[#eae5cf] transition-colors"
        >
          <PencilLine className="w-4 h-4" />
          <span>Créer un cours</span>
        </Link>
      </div>

      <div className="space-y-6">
        <BlockCoursesList title="À VALIDER" colorClass="bg-[#F0C75E]" courses={toValidate} />
        <BlockCoursesList title="EN LIGNE" colorClass="bg-[#4CAF50]" courses={online} />
      </div>
    </section>
  );
};

const BlockCoursesList = ({
  title,
  colorClass,
  courses,
}: {
  title: string;
  colorClass: string;
  courses: CourseItem[];
}) => (
  <div className="space-y-3">
    <div className="flex items-center space-x-2">
      <span className={`w-2 h-2 rounded-full ${colorClass}`} />
      <h3 className="text-lg font-semibold text-[#032622]">{title}</h3>
    </div>
    <div className="space-y-2">
      {courses.map((course) => (
        <div
          key={course.id}
          className="grid grid-cols-12 items-center border border-[#032622]/40 px-4 py-3 text-sm text-[#032622] bg-[#F8F5E4]"
        >
          <span className="col-span-3 uppercase tracking-wide font-semibold">
            {course.title}
          </span>
          <span className="col-span-4">{course.status === "a_valider" ? "En cours d’examen" : "En ligne"}</span>
          <span className="col-span-3">{course.mentor}</span>
          <Link
            href="/espace-admin/gestion-formations"
            className="col-span-2 text-right font-semibold text-[#032622] hover:underline"
          >
            {course.actionLabel}
          </Link>
        </div>
      ))}
    </div>
  </div>
);

const MessagesCard = ({ messages }: { messages: FormationData["messages"] }) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
    <div className="flex justify-between items-center">
      <h2
        className="text-2xl font-bold text-[#032622] flex items-center space-x-2"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        <span>MESSAGERIE</span>
        <span className="bg-[#D96B6B] text-white text-xs rounded-full px-2 py-0.5">
          {messages.length}
        </span>
      </h2>
      <button className="text-sm font-semibold text-[#032622]">Tout voir</button>
    </div>
    <div className="space-y-3">
      {messages.map((message) => (
        <article key={message.id} className="border border-[#032622]/30 px-4 py-3 bg-[#F8F5E4]">
          <header className="flex justify-between items-center mb-2">
            <div className="space-y-1">
              <p className="text-[#032622] font-semibold">{message.author}</p>
              <p className="text-xs uppercase tracking-wide text-[#032622]/70">
                {message.role}
              </p>
            </div>
            <span className="text-xs text-[#032622]/70">{message.timeAgo}</span>
          </header>
          <p className="text-sm text-[#032622]/80 leading-relaxed">{message.excerpt}</p>
        </article>
      ))}
    </div>
  </section>
);

const CorrectionsCard = ({
  corrections,
}: {
  corrections: FormationData["corrections"];
}) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
    <header className="flex justify-between items-center">
      <h2
        className="text-2xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        CORRECTION
      </h2>
      <button className="text-sm font-semibold text-[#032622]">Tout voir</button>
    </header>

    <CorrectionList title="EN RETARD" items={corrections.late} />
    <CorrectionList title="DERNIERS RENDU" items={corrections.recent} />
  </section>
);

const CorrectionList = ({
  title,
  items,
}: {
  title: string;
  items: CorrectionItem[];
}) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-[#032622]">{title}</h3>
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-12 gap-4 items-center border border-[#032622]/30 px-4 py-3 text-sm text-[#032622] bg-[#F8F5E4]"
        >
          <div className="col-span-5">
            <p className="font-semibold uppercase tracking-wide leading-snug">
              {item.blockName}
            </p>
          </div>
          <div className="col-span-2">
            <span className={`px-3 py-1 text-xs uppercase font-semibold ${statusColors[item.status]}`}>
              {item.status === "en_retard" ? "En retard" : "Corrigé"}
            </span>
          </div>
          <span className="col-span-2">{item.submissionDate}</span>
          <span className="col-span-2">{item.assignedTo}</span>
          <Link
            href="/espace-admin/gestion-formations"
            className="col-span-1 text-right text-xs font-semibold text-[#032622] hover:underline"
          >
            Voir
          </Link>
        </div>
      ))}
    </div>
  </div>
);

const AgendaCard = ({ agenda }: { agenda: AgendaEvent[] }) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
    <header className="flex justify-between items-center">
      <div>
        <h2
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          AGENDA
        </h2>
        <p className="text-sm text-[#032622]/70">Septembre 2025</p>
      </div>
      <button className="text-sm font-semibold text-[#032622]">Tout voir</button>
    </header>

    <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-[#032622]">
      {monthWeeks.flat().map((day, index) => (
        <div
          key={`${day}-${index}`}
          className={`py-2 ${index % 7 === 0 ? "text-[#032622]" : ""} ${
            day === "30" ? "bg-[#F8F5E4] text-[#032622] border-2 border-[#032622]" : "bg-[#F8F5E4]"
          } border border-[#032622]/20`}
        >
          {day}
        </div>
      ))}
    </div>

    <div className="space-y-2">
      {agenda.map((event) => (
        <Link
          key={event.id}
          href="/espace-admin/agenda"
          className="flex items-center space-x-3 text-sm text-[#032622] hover:underline"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              event.status === "important"
                ? "bg-[#D96B6B]"
                : event.status === "late"
                ? "bg-[#F0C75E]"
                : "bg-[#4CAF50]"
            }`}
          />
          <p>{event.title}</p>
          <span className="text-xs text-[#032622]/70">{event.date}</span>
        </Link>
      ))}
    </div>
  </section>
);

const ProfileCard = ({
  selectedStudentId,
  onClose,
  students,
}: {
  selectedStudentId: string | null;
  onClose: () => void;
  students: StudentProfile[];
}) => {
  const student = students.find((item) => item.id === selectedStudentId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAction = (message: string) => {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    setFeedback(message);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 2500);
  };

  const handleClose = () => {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = null;
    }
    setFeedback(null);
    onClose();
  };

  if (!student) {
    return (
      <section className="border border-[#032622] bg-[#F8F5E4] p-6">
        <div className="flex flex-col items-center justify-center gap-3 text-center text-[#032622]/70">
          <UserRound className="w-10 h-10" />
          <p className="text-sm font-semibold">
            Sélectionnez un étudiant pour afficher sa fiche de suivi
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#032622]/20 px-6 py-4 bg-[#032622]/10">
        <h2
          className="text-xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Suivi étudiant
        </h2>
        <button
          onClick={handleClose}
          className="text-[#032622]/60 hover:text-[#032622] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#032622]">
            <Image
              src={student.avatar}
              alt={student.id}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div>
            <h3
              className="text-lg font-bold text-[#032622]"
              style={{ fontFamily: "var(--font-termina-bold)" }}
            >
              Chadi El Assowad
            </h3>
            <p className="text-xs uppercase tracking-[0.2em] text-[#032622]/70">
              {student.track}
            </p>
            <span className="inline-flex items-center gap-2 border border-[#032622] bg-[#032622] text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] mt-2">
              {student.school}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/70">
                Progression globale
              </span>
              <span className="text-sm font-bold text-[#032622]">
                {student.progress}%
              </span>
            </div>
            <div className="h-2 bg-[#dcd5b8]">
              <div
                className="h-full bg-[#032622]"
                style={{ width: `${student.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-[#032622]">
            <div className="border border-[#032622]/30 p-3 bg-[#f0e8cb] space-y-1">
              <span className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/60">
                Dernière connexion
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="w-4 h-4" />
                {student.lastLogin}
              </div>
            </div>
            <div className="border border-[#032622]/30 p-3 bg-[#f0e8cb] space-y-1">
              <span className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/60">
                Prochaine échéance
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Target className="w-4 h-4" />
                {student.nextDeadline.label}
              </div>
              <p className="text-xs text-[#032622]/70">{student.nextDeadline.date}</p>
            </div>
            <div className="border border-[#032622]/30 p-3 bg-[#f0e8cb] space-y-1">
              <span className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/60">
                Prochaine séance
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarClock className="w-4 h-4" />
                {student.upcomingSession.label}
              </div>
              <p className="text-xs text-[#032622]/70">{student.upcomingSession.date}</p>
            </div>
            <div className="border border-[#032622]/30 p-3 bg-[#f0e8cb] space-y-1">
              <span className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/60">
                Promotion
              </span>
              <p className="text-sm font-semibold">{student.promotion}</p>
              <p className="text-xs text-[#032622]/70">{student.campus}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/60">
            Contact direct
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleAction("Appel préparé : pense à confirmer avec Chadi l'heure exacte de la visio.")}
              className="flex items-center gap-2 border border-[#032622] bg-[#032622] text-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#01302C] transition-colors"
            >
              <Phone className="w-3 h-3" />
              Appeler
            </button>
            <button
              onClick={() => handleAction("Brouillon d'e-mail créé pour Chadi. Ajoute le replay et le plan d'action Bloc 2.")}
              className="flex items-center gap-2 border border-[#032622] bg-[#f0e8cb] text-[#032622] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3" />
              Envoyer un mail
            </button>
            <button
              onClick={() => handleAction("Message envoyé au coach référent pour caler un point avec Chadi.")}
              className="flex items-center gap-2 border border-[#032622] bg-[#f0e8cb] text-[#032622] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Coach référent
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/60">
            Notes administratives
          </h4>
          <div className="border border-[#032622]/30 bg-[#f0e8cb] p-4 text-sm text-[#032622]/80 leading-relaxed">
            {student.notes}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs uppercase font-semibold tracking-[0.2em] text-[#032622]/60">
            Relancer ou planifier
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction("Relance mail programmée pour ce soir à 18h.")}
              className="flex items-center justify-center gap-2 border border-[#032622] bg-[#f0e8cb] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              <Send className="w-3 h-3" />
              Relancer par mail
            </button>
            <button
              onClick={() => handleAction("Créneau proposé le 17/10 à 10h30 pour un rendez-vous de suivi.")}
              className="flex items-center justify-center gap-2 border border-[#032622] bg-[#f0e8cb] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#032622] hover:bg-[#032622] hover:text-white transition-colors"
            >
              <CalendarClock className="w-3 h-3" />
              Planifier un rendez-vous
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className="border border-[#032622]/30 bg-[#032622]/10 px-4 py-3 text-xs font-semibold text-[#032622]"
            role="status"
            aria-live="polite"
          >
            {feedback}
          </div>
        )}
      </div>
    </section>
  );
};

const ProfileDropdown = () => (
  <div className="relative group">
    <div className="flex items-center space-x-3 cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-[#F8F5E4] border-2 border-[#032622] flex items-center justify-center text-[#032622] text-lg">
        SM
      </div>
      <div>
        <p
          className="text-[#032622] font-semibold text-sm"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Sophie Moreau
        </p>
        <p className="text-xs text-[#032622]/70">Coordinatrice pédagogique</p>
      </div>
    </div>

    <div className="absolute right-0 mt-3 w-52 border border-[#032622] bg-[#F8F5E4] shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
      <nav className="flex flex-col divide-y divide-[#032622]/20 text-sm text-[#032622]">
        <Link href="/espace-admin/compte" className="px-4 py-3 hover:bg-[#eae5cf] transition-colors">
          Mon compte
        </Link>
        <Link href="/espace-admin/parametres" className="px-4 py-3 hover:bg-[#eae5cf] transition-colors">
          Paramètres
        </Link>
        <button className="px-4 py-3 text-left hover:bg-[#eae5cf] transition-colors">
          Se déconnecter
        </button>
      </nav>
    </div>
  </div>
);

const PromoCard = ({
  students,
  teachers,
  totalStudentsOnline,
  totalTeachersOnline,
  onStudentFocus,
  selectedStudentId,
}: {
  students: FormationData["students"];
  teachers: FormationData["teachers"];
  totalStudentsOnline: number;
  totalTeachersOnline: number;
  onStudentFocus: (id: string) => void;
  selectedStudentId: string | null;
}) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-6">
    <header>
      <h2
        className="text-xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        PROMO
      </h2>
    </header>

    {/* Section Formateurs */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#032622] uppercase tracking-wide">
          Formateurs
        </h3>
        <p className="text-xs text-[#032622]/70">{totalTeachersOnline} en ligne</p>
      </div>
      <div className="space-y-2">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center justify-between text-sm text-[#032622]">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${studentStatusColors[teacher.status]}`} />
              <div>
                <p className="font-semibold">{teacher.name}</p>
                <p className="text-xs text-[#032622]/60">{teacher.specialty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-[#032622]/60">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-[#032622]/20" />

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#032622] uppercase tracking-wide">
          Étudiants
        </h3>
        <p className="text-xs text-[#032622]/70">{totalStudentsOnline} en ligne</p>
      </div>
      <div className="space-y-2">
        {students.map((student) => (
          <div
            key={student.id}
            className={`flex items-center justify-between text-sm text-[#032622] transition-colors ${
              selectedStudentId === student.id ? "bg-[#032622]/10" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${studentStatusColors[student.status]}`} />
              <p className="font-semibold">{student.name}</p>
            </div>
            <div className="flex items-center space-x-2 text-[#032622]/60">
              <Users className="w-4 h-4" />
              <button
                onClick={() => onStudentFocus(student.id)}
                className="border border-[#032622] bg-[#F8F5E4] text-[#032622] px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors"
              >
                Suivre
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AdminDashboardContent;

