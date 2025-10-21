"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Bell, ChevronDown, MessageCircle, PencilLine, Users } from "lucide-react";
import { getAllFormations, getFormationsByEcole } from "@/lib/formations";
import { Formation } from "@/types/formations";

// Types pour les données dynamiques de la base de données
type SchoolId = string;
type FormationId = number;

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
}

// Données dynamiques de la base de données

const formationsData: Record<string, FormationData> = {
  devWeb: {
    name: "Développement Web",
    greeting: "Bonjour, Ymir Fritz",
    courses: [
      {
        id: "course-1",
        title: "Module 3",
        mentor: "Jacques Pote",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-2",
        title: "Module 4",
        mentor: "Sarah Croche",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-3",
        title: "Module 1",
        mentor: "Jacques Pote",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
      {
        id: "course-4",
        title: "Module 2",
        mentor: "Jacques Pote",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
    ],
    messages: [
      {
        id: "msg-1",
        author: "Annie L.",
        role: "Étudiante",
        excerpt:
          "Bonjour. Pouvez-vous convenir d'un rapide point (20 min) la semaine prochaine pour évoquer l'intégration ?",
        timeAgo: "Il y a 2 h",
      },
      {
        id: "msg-2",
        author: "Kenny A.",
        role: "Étudiant",
        excerpt:
          "J'ai terminé le module UX. Est-il possible de valider mon dernier quiz ?",
        timeAgo: "Il y a 4 h",
      },
      {
        id: "msg-3",
        author: "Peak F.",
        role: "Étudiant",
        excerpt:
          "Merci pour le support. Puis-je obtenir le lien vers la vidéo complémentaire ?",
        timeAgo: "Il y a 6 h",
      },
    ],
    corrections: {
      late: [
        {
          id: "corr-1",
          blockName:
            "Bloc 2 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "29/08/2024",
          assignedTo: "Jacques Pote",
          status: "en_retard",
        },
        {
          id: "corr-2",
          blockName:
            "Bloc 4 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "29/08/2024",
          assignedTo: "Jacques Pote",
          status: "en_retard",
        },
      ],
      recent: [
        {
          id: "corr-3",
          blockName:
            "Bloc 2 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "29/08/2024",
          assignedTo: "Jacques Pote",
          status: "corrige",
        },
        {
          id: "corr-4",
          blockName:
            "Bloc 4 - Contribuer à la stratégie de développement de l'organisation",
          submissionDate: "29/08/2024",
          assignedTo: "Jacques Pote",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-1",
        title: "Visio tuteur – Bloc 3",
        date: "2025-09-05",
        status: "important",
      },
      {
        id: "agenda-2",
        title: "Correction devoir UX",
        date: "2025-09-12",
        status: "normal",
      },
      {
        id: "agenda-3",
        title: "Suivi projets",
        date: "2025-09-20",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-1", name: "Peak F.", status: "online" },
      { id: "etu-2", name: "Annie L.", status: "online" },
      { id: "etu-3", name: "Hansi Z.", status: "offline" },
      { id: "etu-4", name: "Kenny A.", status: "online" },
      { id: "etu-5", name: "Gaby B.", status: "away" },
      { id: "etu-6", name: "Conny S.", status: "away" },
      { id: "etu-7", name: "Grisha J.", status: "away" },
      { id: "etu-8", name: "Sasha B.", status: "online" },
      { id: "etu-9", name: "Erwin S.", status: "offline" },
    ],
    teachers: [
      { id: "prof-1", name: "Jacques Pote", specialty: "Frontend", status: "online" },
      { id: "prof-2", name: "Sarah Croche", specialty: "Backend", status: "away" },
      { id: "prof-3", name: "Marc Dupont", specialty: "Fullstack", status: "offline" },
    ],
  },
  marketing: {
    name: "Marketing Digital",
    greeting: "Bonjour, Ymir Fritz",
    courses: [
      {
        id: "course-5",
        title: "Campagne Réseaux",
        mentor: "Alice M",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-6",
        title: "Copywriting",
        mentor: "Romain T",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
    ],
    messages: [
      {
        id: "msg-4",
        author: "Mina P.",
        role: "Étudiante",
        excerpt:
          "Le quiz sur la stratégie digitale n'apparaît pas, pouvez-vous vérifier ?",
        timeAgo: "Il y a 1 h",
      },
      {
        id: "msg-5",
        author: "Harold G.",
        role: "Étudiant",
        excerpt:
          "Je serai absent mardi, pourriez-vous me partager les supports à l'avance ?",
        timeAgo: "Il y a 3 h",
      },
    ],
    corrections: {
      late: [
        {
          id: "corr-5",
          blockName: "Bloc 1 - Audit de marque",
          submissionDate: "15/08/2024",
          assignedTo: "Alice M",
          status: "en_retard",
        },
      ],
      recent: [
        {
          id: "corr-6",
          blockName: "Bloc 3 - Tunnel d'acquisition",
          submissionDate: "01/09/2024",
          assignedTo: "Alice M",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-4",
        title: "Atelier SEO",
        date: "2025-09-08",
        status: "important",
      },
      {
        id: "agenda-5",
        title: "Feedback campagnes",
        date: "2025-09-15",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-10", name: "Mina P.", status: "online" },
      { id: "etu-11", name: "Harold G.", status: "away" },
      { id: "etu-12", name: "Lena S.", status: "offline" },
      { id: "etu-13", name: "Oscar V.", status: "online" },
    ],
    teachers: [
      { id: "prof-4", name: "Alice M.", specialty: "SEO", status: "online" },
      { id: "prof-5", name: "Romain T.", specialty: "Content", status: "online" },
    ],
  },
  ia: {
    name: "Intelligence Artificielle",
    greeting: "Bonjour, Ymir Fritz",
    courses: [
      {
        id: "course-7",
        title: "Machine Learning",
        mentor: "Prof. Xavier",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-8",
        title: "Deep Learning",
        mentor: "Jean M",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
      {
        id: "course-9",
        title: "NLP",
        mentor: "Prof. Xavier",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
    ],
    messages: [
      {
        id: "msg-6",
        author: "Eva Q.",
        role: "Étudiante",
        excerpt: "Pourrions-nous avoir un exemple d'évaluation sur le projet IA ?",
        timeAgo: "Il y a 30 min",
      },
      {
        id: "msg-7",
        author: "Noah D.",
        role: "Étudiant",
        excerpt:
          "Je rencontre un blocage sur TensorFlow, est-il possible d'avoir un tutoriel ?",
        timeAgo: "Il y a 5 h",
      },
    ],
    corrections: {
      late: [
        {
          id: "corr-7",
          blockName: "Bloc 5 - Vision par ordinateur",
          submissionDate: "10/08/2024",
          assignedTo: "Jean M",
          status: "en_retard",
        },
      ],
      recent: [
        {
          id: "corr-8",
          blockName: "Bloc 2 - Statistiques avancées",
          submissionDate: "25/08/2024",
          assignedTo: "Prof. Xavier",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-6",
        title: "Workshop IA générative",
        date: "2025-09-18",
        status: "important",
      },
      {
        id: "agenda-7",
        title: "Soutenance projets",
        date: "2025-09-30",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-14", name: "Eva Q.", status: "online" },
      { id: "etu-15", name: "Noah D.", status: "away" },
      { id: "etu-16", name: "Leo W.", status: "offline" },
      { id: "etu-17", name: "Mila R.", status: "online" },
      { id: "etu-18", name: "Aaron P.", status: "offline" },
    ],
    teachers: [
      { id: "prof-6", name: "Prof. Xavier", specialty: "ML & NLP", status: "online" },
      { id: "prof-7", name: "Jean M.", specialty: "Deep Learning", status: "away" },
      { id: "prof-8", name: "Dr. Yamamoto", specialty: "Computer Vision", status: "offline" },
    ],
  },
  designUX: {
    name: "Design UX/UI",
    greeting: "Bonjour, Ymir Fritz",
    courses: [
      {
        id: "course-10",
        title: "Atelier Figma",
        mentor: "Sophie N",
        status: "en_ligne",
        actionLabel: "Modifier",
      },
      {
        id: "course-11",
        title: "Recherche utilisateur",
        mentor: "Sophie N",
        status: "a_valider",
        actionLabel: "À vérifier",
      },
    ],
    messages: [
      {
        id: "msg-8",
        author: "Julien F.",
        role: "Étudiant",
        excerpt:
          "Je n'arrive pas à importer la grille de composants, avez-vous une solution ?",
        timeAgo: "Il y a 1 h",
      },
    ],
    corrections: {
      late: [],
      recent: [
        {
          id: "corr-9",
          blockName: "Bloc 1 - Parcours utilisateur",
          submissionDate: "02/09/2024",
          assignedTo: "Sophie N",
          status: "corrige",
        },
      ],
    },
    agenda: [
      {
        id: "agenda-8",
        title: "Sprint design",
        date: "2025-09-10",
        status: "normal",
      },
    ],
    students: [
      { id: "etu-19", name: "Julien F.", status: "online" },
      { id: "etu-20", name: "Clara E.", status: "away" },
      { id: "etu-21", name: "Sarah T.", status: "offline" },
    ],
    teachers: [
      { id: "prof-9", name: "Sophie N.", specialty: "UX Research", status: "online" },
      { id: "prof-10", name: "Antoine P.", specialty: "UI Design", status: "away" },
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
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolId>("");
  const [selectedFormation, setSelectedFormation] = useState<FormationId | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger toutes les formations au montage du composant
  useEffect(() => {
    const loadFormations = async () => {
      try {
        const formations = await getAllFormations();
        setAllFormations(formations);
        
        // Définir la première école comme sélectionnée par défaut
        if (formations.length > 0) {
          const firstSchool = formations[0].ecole;
          setSelectedSchool(firstSchool);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormations();
  }, []);

  // Obtenir les écoles uniques disponibles
  const availableSchools = useMemo(() => {
    const schools = Array.from(new Set(allFormations.map(f => f.ecole)));
    return schools.map(school => ({
      value: school,
      label: school
    }));
  }, [allFormations]);

  // Obtenir les formations filtrées par école sélectionnée
  const availableFormations = useMemo(() => {
    if (!selectedSchool) return [];
    return allFormations
      .filter(f => f.ecole === selectedSchool)
      .map(formation => ({
        value: formation.id.toString(),
        label: formation.titre
      }));
  }, [allFormations, selectedSchool]);

  // Gérer le changement d'école
  const handleSchoolChange = (schoolId: SchoolId) => {
    setSelectedSchool(schoolId);
    setSelectedFormation(null); // Reset formation selection
  };

  // Gérer le changement de formation
  const handleFormationChange = (formationId: string) => {
    setSelectedFormation(parseInt(formationId));
  };

  // Données statiques pour l'affichage (en attendant la vraie intégration)
  const data = useMemo(() => {
    // Pour l'instant, on garde les données statiques pour les autres éléments
    // TODO: Intégrer les vraies données de formation sélectionnée
    return formationsData["devWeb"]; // Valeur par défaut
  }, [selectedFormation]);

  const totalStudentsOnline = data.students.filter((s: StudentStatus) => s.status === "online").length;
  const totalTeachersOnline = data.teachers.filter((t: TeacherStatus) => t.status === "online").length;

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
              options={availableSchools}
              onChange={(value) => handleSchoolChange(value as SchoolId)}
            />
            <DropdownSelector
              label="FORMATION"
              value={selectedFormation?.toString() || ""}
              options={availableFormations}
              onChange={handleFormationChange}
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
            <ProfileCard />
            <PromoCard 
              students={data.students} 
              teachers={data.teachers}
              totalStudentsOnline={totalStudentsOnline} 
              totalTeachersOnline={totalTeachersOnline}
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

const ProfileCard = () => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6">
    <div className="w-full aspect-square border border-[#032622]/50 bg-[#C9C6B4]" />
  </section>
);

const ProfileDropdown = () => (
  <div className="relative group">
    <div className="flex items-center space-x-3 cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-[#F8F5E4] border-2 border-[#032622] flex items-center justify-center text-[#032622] text-lg">
        YF
      </div>
      <div>
        <p
          className="text-[#032622] font-semibold text-sm"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Ymir Fritz
        </p>
        <p className="text-xs text-[#032622]/70">Administrateur</p>
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
}: {
  students: FormationData["students"];
  teachers: FormationData["teachers"];
  totalStudentsOnline: number;
  totalTeachersOnline: number;
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
        <p className="text-xs text-[#032622]/70">
          {totalTeachersOnline} en ligne
        </p>
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

    {/* Séparateur */}
    <div className="border-t border-[#032622]/20" />

    {/* Section Étudiants */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#032622] uppercase tracking-wide">
          Étudiants
        </h3>
        <p className="text-xs text-[#032622]/70">
          {totalStudentsOnline} en ligne
        </p>
      </div>
      <div className="space-y-2">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between text-sm text-[#032622]">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${studentStatusColors[student.status]}`} />
              <p className="font-semibold">{student.name}</p>
            </div>
            <div className="flex items-center space-x-3 text-[#032622]/60">
              <Users className="w-4 h-4" />
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AdminDashboardContent;

