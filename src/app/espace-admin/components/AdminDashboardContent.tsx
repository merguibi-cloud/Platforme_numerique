"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { ChevronDown, MessageCircle, PencilLine, Users, UserCog } from "lucide-react";
import { getAllFormations, getFormationsByEcole } from "@/lib/formations";
import { Formation } from "@/types/formations";
import AdminTopBar from "./AdminTopBar";
import { useAdminUser } from "./AdminUserProvider";

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
  id: number;
  titre: string;
  module: string;
  bloc: string;
  statut: "brouillon" | "en_cours_examen" | "en_ligne";
  module_id?: number | null;
  bloc_id?: number | null;
  formation_id?: number;
  created_at?: string;
  updated_at?: string;
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
  courses: Array<{
    id: string;
    title: string;
    mentor: string;
    status: "a_valider" | "en_ligne";
    actionLabel: string;
  }>;
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

// Données dynamiques de la base de données

const formationsData: Record<string, FormationData> = {
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
  const adminUser = useAdminUser();
  const [allFormations, setAllFormations] = useState<Formation[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolId>("");
  const [selectedFormation, setSelectedFormation] = useState<FormationId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [firstBlocId, setFirstBlocId] = useState<number | null>(null);
  const [firstModuleId, setFirstModuleId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Charger toutes les formations au montage du composant et restaurer les sélections
  useEffect(() => {
    const loadFormations = async () => {
      try {
        // Charger les valeurs sauvegardées depuis localStorage
        let savedSchool: SchoolId | null = null;
        let savedFormation: number | null = null;
        
        if (typeof window !== 'undefined') {
          const savedSchoolStr = localStorage.getItem('admin_selected_school');
          const savedFormationStr = localStorage.getItem('admin_selected_formation');
          
          if (savedSchoolStr) {
            savedSchool = savedSchoolStr as SchoolId;
          }
          
          if (savedFormationStr) {
            const formationId = parseInt(savedFormationStr);
            if (!isNaN(formationId)) {
              savedFormation = formationId;
            }
          }
        }

        const formations = await getAllFormations();
        setAllFormations(formations);
        
        if (formations.length === 0) {
          setIsLoading(false);
          return;
        }

        // Vérifier et restaurer l'école sauvegardée
        let schoolToSet: SchoolId;
        if (savedSchool && formations.some(f => f.ecole === savedSchool)) {
          schoolToSet = savedSchool;
        } else {
          // Si l'école sauvegardée n'existe plus ou n'est pas définie, prendre la première
          schoolToSet = formations[0].ecole;
          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_selected_school', schoolToSet);
          }
        }
        setSelectedSchool(schoolToSet);

        // Vérifier et restaurer la formation sauvegardée
        if (savedFormation) {
          const formationExists = formations.some(f => 
            f.id === savedFormation && f.ecole === schoolToSet
          );
          if (formationExists) {
            setSelectedFormation(savedFormation);
          } else {
            // Si la formation sauvegardée n'existe plus, réinitialiser
            setSelectedFormation(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('admin_selected_formation');
            }
          }
        }
      } catch (error) {
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
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_selected_school', schoolId);
      localStorage.removeItem('admin_selected_formation');
    }
  };

  // Gérer le changement de formation
  const handleFormationChange = (formationId: string) => {
    const formationIdNum = parseInt(formationId);
    setSelectedFormation(formationIdNum);
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_selected_formation', formationId);
    }
  };

  // Charger le premier bloc et module de la formation sélectionnée
  useEffect(() => {
    const loadFirstBlocAndModule = async () => {
      if (!selectedFormation) {
        setFirstBlocId(null);
        setFirstModuleId(null);
        return;
      }

      try {
        // Récupérer les blocs de la formation
        const blocsResponse = await fetch(`/api/blocs?formationId=${selectedFormation}`, {
          credentials: 'include'
        });
        
        if (blocsResponse.ok) {
          const blocsData = await blocsResponse.json();
          const blocs = blocsData.blocs || [];
          
          if (blocs.length > 0) {
            // Prendre le premier bloc (trié par ordre_affichage ou numero_bloc)
            const firstBloc = blocs.sort((a: any, b: any) => 
              (a.ordre_affichage || a.numero_bloc || 0) - (b.ordre_affichage || b.numero_bloc || 0)
            )[0];
            setFirstBlocId(firstBloc.id);

            // Récupérer les modules du premier bloc
            const modulesResponse = await fetch(`/api/cours?formationId=${selectedFormation}&blocId=${firstBloc.id}`, {
              credentials: 'include'
            });
            
            if (modulesResponse.ok) {
              const modulesData = await modulesResponse.json();
              const modules = modulesData.modules || [];
              
              if (modules.length > 0) {
                // Prendre le premier module (trié par ordre_affichage ou numero_module)
                const firstModule = modules.sort((a: any, b: any) => 
                  (a.ordre_affichage || a.numero_module || 0) - (b.ordre_affichage || b.numero_module || 0)
                )[0];
                setFirstModuleId(firstModule.id);
              } else {
                setFirstModuleId(null);
              }
            } else {
              setFirstModuleId(null);
            }
          } else {
            setFirstBlocId(null);
            setFirstModuleId(null);
          }
        } else {
          setFirstBlocId(null);
          setFirstModuleId(null);
        }
      } catch (error) {
        setFirstBlocId(null);
        setFirstModuleId(null);
      }
    };

    loadFirstBlocAndModule();
  }, [selectedFormation]);

  // Charger les cours de la formation sélectionnée
  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedFormation) {
        setCourses([]);
        return;
      }

      setIsLoadingCourses(true);
      try {
        const response = await fetch(`/api/cours/by-formation?formationId=${selectedFormation}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setCourses(data.cours || []);
        } else {
          setCourses([]);
        }
      } catch (error) {
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, [selectedFormation]);

  // Formater les cours pour l'affichage
  const formattedCourses = useMemo(() => {
    const toValidate: CourseItem[] = [];
    const online: CourseItem[] = [];

    courses.forEach(course => {
      if (course.statut === 'en_cours_examen') {
        toValidate.push(course);
      } else if (course.statut === 'en_ligne') {
        online.push(course);
      } else {
        // Les brouillons peuvent aussi être considérés comme "à valider"
        toValidate.push(course);
      }
    });

    return { toValidate, online };
  }, [courses]);

  // Données statiques pour l'affichage (en attendant la vraie intégration)
  const data = useMemo(() => {
    // Pour l'instant, on garde les données statiques pour les autres éléments
    return formationsData["devWeb"]; // Valeur par défaut
  }, []);

  const totalStudentsOnline = data.students.filter((s: StudentStatus) => s.status === "online").length;
  const totalTeachersOnline = data.teachers.filter((t: TeacherStatus) => t.status === "online").length;

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 bg-[#F8F5E4]">
      <AdminTopBar notificationCount={6} className="mb-4 sm:mb-6 md:mb-8" />

      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="space-y-2 sm:space-y-3">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] break-words"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            {adminUser.isLoading 
              ? "BONJOUR..." 
              : `BONJOUR, ${adminUser.displayName.toUpperCase()}`}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            <CoursesCard 
              courses={formattedCourses} 
              isLoading={isLoadingCourses}
              formationId={selectedFormation}
              blocId={firstBlocId}
              moduleId={firstModuleId}
            />
            <UsersManagementCard />
            <CorrectionsCard corrections={data.corrections} />
            <AgendaCard agenda={data.agenda} />
          </div>
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
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
  <div className="border border-[#032622] px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center bg-[#F8F5E4] relative">
    <div className="flex-1 min-w-0">
      <p className="text-[10px] sm:text-xs text-[#032622]/70 uppercase tracking-wider">{label}</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="text-sm sm:text-base md:text-lg font-semibold text-[#032622] bg-[#F8F5E4] focus:outline-none appearance-none w-full pr-6 sm:pr-8 cursor-pointer truncate"
        style={{ fontFamily: 'var(--font-termina-medium)' }}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            className="text-[#032622] bg-[#F8F5E4]"
            style={{ backgroundColor: '#F8F5E4', color: '#032622' }}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#032622] absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none flex-shrink-0" />
  </div>
);

const CoursesCard = ({ 
  courses, 
  isLoading, 
  formationId,
  blocId,
  moduleId,
}: { 
  courses: { toValidate: CourseItem[]; online: CourseItem[] };
  isLoading: boolean;
  formationId: number | null;
  blocId: number | null;
  moduleId: number | null;
}) => {
  const hasCourses = courses.toValidate.length > 0 || courses.online.length > 0;

  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2
          className="text-xl sm:text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          COURS
        </h2>
        <Link
          href={
            formationId && blocId
              ? `/espace-admin/gestion-formations/${formationId}/${blocId}`
              : formationId
              ? `/espace-admin/gestion-formations/${formationId}`
              : "/espace-admin/gestion-formations"
          }
          className="text-xs sm:text-sm font-semibold text-[#032622] border border-[#032622] px-3 sm:px-4 py-1.5 sm:py-2 inline-flex items-center space-x-1.5 sm:space-x-2 hover:bg-[#eae5cf] active:bg-[#e0dbc5] transition-colors whitespace-nowrap"
        >
          <PencilLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Accéder aux cours</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-[#032622]">Chargement des cours...</p>
        </div>
      ) : !formationId ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-sm sm:text-base text-[#032622] break-words">Veuillez sélectionner une formation pour voir les cours</p>
        </div>
      ) : !hasCourses ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-base sm:text-lg text-[#032622] mb-1 sm:mb-2">Aucun cours disponible</p>
          <p className="text-xs sm:text-sm text-[#032622]/70">Créez votre premier cours pour commencer</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {courses.toValidate.length > 0 && (
            <BlockCoursesList title="À VALIDER" colorClass="bg-[#F0C75E]" courses={courses.toValidate} />
          )}
          {courses.online.length > 0 && (
            <BlockCoursesList title="EN LIGNE" colorClass="bg-[#4CAF50]" courses={courses.online} />
          )}
        </div>
      )}
    </section>
  );

};

const UsersManagementCard = () => {
  const [inscriptions, setInscriptions] = useState<{
    leads: InscriptionItem[];
    candidats: InscriptionItem[];
  }>({
    leads: [],
    candidats: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInscriptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/inscriptions', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setInscriptions({
              leads: data.leads || [],
              candidats: data.candidats || [],
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des inscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInscriptions();
  }, []);

  const hasInscriptions = inscriptions.leads.length > 0 || inscriptions.candidats.length > 0;

  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h2
          className="text-xl sm:text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          GESTION DES INSCRIPTIONS
        </h2>
        <Link
          href="/espace-admin/gestion-inscriptions"
          className="text-xs sm:text-sm font-semibold text-[#032622] border border-[#032622] px-3 sm:px-4 py-1.5 sm:py-2 inline-flex items-center space-x-1.5 sm:space-x-2 hover:bg-[#eae5cf] active:bg-[#e0dbc5] transition-colors whitespace-nowrap"
        >
          <UserCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Accéder à la gestion</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-b-2 border-[#032622] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-[#032622]">Chargement des inscriptions...</p>
        </div>
      ) : !hasInscriptions ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-base sm:text-lg text-[#032622] mb-1 sm:mb-2">Aucune inscription disponible</p>
          <p className="text-xs sm:text-sm text-[#032622]/70">Les nouvelles inscriptions apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {inscriptions.leads.length > 0 && (
            <BlockInscriptionsList title="LEADS" colorClass="bg-[#F0C75E]" inscriptions={inscriptions.leads} type="lead" />
          )}
          {inscriptions.candidats.length > 0 && (
            <BlockInscriptionsList title="CANDIDATS" colorClass="bg-[#4CAF50]" inscriptions={inscriptions.candidats} type="candidat" />
          )}
        </div>
      )}
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
}) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center space-x-2">
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colorClass}`} />
        <h3 className="text-base sm:text-lg font-semibold text-[#032622]">{title}</h3>
      </div>
      <div className="space-y-2">
        {courses.map((course) => {
          const statusLabel = course.statut === "en_cours_examen" 
            ? "En cours d'examen" 
            : course.statut === "en_ligne" 
            ? "En ligne" 
            : "Brouillon";
          
          // Construire l'URL de redirection vers le cours
          // Nouvelle structure: /formationId/blocId/cours/coursId/chapitre
          let courseUrl = "/espace-admin/gestion-formations";
          if (course.formation_id && course.bloc_id) {
            courseUrl = `/espace-admin/gestion-formations/${course.formation_id}/${course.bloc_id}/cours/${course.id}/chapitre`;
          } else if (course.formation_id) {
            courseUrl = `/espace-admin/gestion-formations/${course.formation_id}`;
          }
          
          return (
            <div
              key={course.id}
              className="grid grid-cols-1 sm:grid-cols-12 items-start sm:items-center gap-2 sm:gap-0 border border-[#032622]/40 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] bg-[#F8F5E4]"
            >
              <span className="col-span-1 sm:col-span-4 uppercase tracking-wide font-semibold break-words">
                {course.titre}
              </span>
              <span className="col-span-1 sm:col-span-3 text-[#032622]/80">{statusLabel}</span>
              <span className="col-span-1 sm:col-span-3 text-[#032622]/80 truncate">{course.module}</span>
              <Link
                href={courseUrl}
                className="col-span-1 sm:col-span-2 text-left sm:text-right font-semibold text-[#032622] hover:underline active:text-[#032622]/80"
              >
                {course.statut === "en_cours_examen" ? "À vérifier" : "Modifier"}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface InscriptionItem {
  id: string;
  name: string;
  email: string;
  status: string;
  formation?: string;
  date?: string;
}

const BlockInscriptionsList = ({
  title,
  colorClass,
  inscriptions,
  type,
}: {
  title: string;
  colorClass: string;
  inscriptions: InscriptionItem[];
  type: "lead" | "candidat";
}) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "nouveau":
        return "Nouveau";
      case "contacte":
        return "Contacté";
      case "en_attente":
        return "En attente";
      case "accepte":
        return "Accepté";
      case "refuse":
        return "Refusé";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nouveau":
        return "bg-[#F0C75E]";
      case "contacte":
        return "bg-[#4CAF50]";
      case "en_attente":
        return "bg-[#F0C75E]";
      case "accepte":
        return "bg-[#4CAF50]";
      case "refuse":
        return "bg-[#D96B6B]";
      default:
        return "bg-[#C9C6B4]";
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center space-x-2">
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colorClass}`} />
        <h3 className="text-base sm:text-lg font-semibold text-[#032622]">{title}</h3>
      </div>
      <div className="space-y-2">
        {inscriptions.map((inscription) => {
          const statusLabel = getStatusLabel(inscription.status);
          const statusColor = getStatusColor(inscription.status);
          
          return (
            <div
              key={inscription.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-center border border-[#032622]/40 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] bg-[#F8F5E4]"
            >
              <span className="col-span-1 sm:col-span-4 uppercase tracking-wide font-semibold truncate">
                {inscription.name}
              </span>
              <span className="col-span-1 sm:col-span-4 text-[#032622]/80 truncate">
                {inscription.formation || "-"}
              </span>
              <span className={`col-span-1 sm:col-span-2 px-2 py-1 text-[10px] sm:text-xs font-semibold text-white ${statusColor} text-center`}>
                {statusLabel}
              </span>
              <Link
                href={`/espace-admin/gestion-inscriptions/${type}/${inscription.id}`}
                className="col-span-1 sm:col-span-2 text-left sm:text-right font-semibold text-[#032622] hover:underline active:text-[#032622]/80"
              >
                Voir
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MessagesCard = ({ messages }: { messages: FormationData["messages"] }) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
    <div className="flex justify-between items-center gap-2">
      <h2
        className="text-lg sm:text-xl md:text-2xl font-bold text-[#032622] flex items-center space-x-1.5 sm:space-x-2"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        <span>MESSAGERIE</span>
        <span className="bg-[#D96B6B] text-white text-[10px] sm:text-xs rounded-full px-1.5 sm:px-2 py-0.5">
          {messages.length}
        </span>
      </h2>
      <button className="text-xs sm:text-sm font-semibold text-[#032622] hover:underline active:text-[#032622]/80 whitespace-nowrap">Tout voir</button>
    </div>
    <div className="space-y-2 sm:space-y-3">
      {messages.map((message) => (
        <article key={message.id} className="border border-[#032622]/30 px-3 sm:px-4 py-2 sm:py-3 bg-[#F8F5E4]">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
              <p className="text-sm sm:text-base text-[#032622] font-semibold truncate">{message.author}</p>
              <p className="text-[10px] sm:text-xs uppercase tracking-wide text-[#032622]/70">
                {message.role}
              </p>
            </div>
            <span className="text-[10px] sm:text-xs text-[#032622]/70 whitespace-nowrap">{message.timeAgo}</span>
          </header>
          <p className="text-xs sm:text-sm text-[#032622]/80 leading-relaxed break-words">{message.excerpt}</p>
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
  <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
    <header className="flex justify-between items-center gap-2">
      <h2
        className="text-xl sm:text-2xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        CORRECTION
      </h2>
      <button className="text-xs sm:text-sm font-semibold text-[#032622] hover:underline active:text-[#032622]/80 whitespace-nowrap">Tout voir</button>
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
  <div className="space-y-2 sm:space-y-3">
    <h3 className="text-base sm:text-lg font-semibold text-[#032622]">{title}</h3>
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 md:gap-4 items-start sm:items-center border border-[#032622]/30 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[#032622] bg-[#F8F5E4]"
        >
          <div className="col-span-1 sm:col-span-5 min-w-0">
            <p className="font-semibold uppercase tracking-wide leading-snug break-words">
              {item.blockName}
            </p>
          </div>
          <div className="col-span-1 sm:col-span-2">
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs uppercase font-semibold ${statusColors[item.status]}`}>
              {item.status === "en_retard" ? "En retard" : "Corrigé"}
            </span>
          </div>
          <span className="col-span-1 sm:col-span-2 text-[#032622]/80">{item.submissionDate}</span>
          <span className="col-span-1 sm:col-span-2 text-[#032622]/80 truncate">{item.assignedTo}</span>
          <Link
            href="/espace-admin/gestion-formations"
            className="col-span-1 text-left sm:text-right text-[10px] sm:text-xs font-semibold text-[#032622] hover:underline active:text-[#032622]/80"
          >
            Voir
          </Link>
        </div>
      ))}
    </div>
  </div>
);

const AgendaCard = ({ agenda }: { agenda: AgendaEvent[] }) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
    <header className="flex justify-between items-center gap-2">
      <div>
        <h2
          className="text-xl sm:text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          AGENDA
        </h2>
        <p className="text-xs sm:text-sm text-[#032622]/70">Septembre 2025</p>
      </div>
      <button className="text-xs sm:text-sm font-semibold text-[#032622] hover:underline active:text-[#032622]/80 whitespace-nowrap">Tout voir</button>
    </header>

    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[10px] sm:text-xs md:text-sm font-medium text-[#032622]">
      {monthWeeks.flat().map((day, index) => (
        <div
          key={`${day}-${index}`}
          className={`py-1 sm:py-1.5 md:py-2 ${index % 7 === 0 ? "text-[#032622]" : ""} ${
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
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm text-[#032622] hover:underline active:text-[#032622]/80"
        >
          <div
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
              event.status === "important"
                ? "bg-[#D96B6B]"
                : event.status === "late"
                ? "bg-[#F0C75E]"
                : "bg-[#4CAF50]"
            }`}
          />
          <p className="break-words">{event.title}</p>
          <span className="text-[10px] sm:text-xs text-[#032622]/70 whitespace-nowrap">{event.date}</span>
        </Link>
      ))}
    </div>
  </section>
);

interface ProfileCardProps {
  selectedStudentId: string | null;
  onClose: () => void;
  students: StudentProfile[];
}

const ProfileCard = ({ selectedStudentId, onClose, students }: ProfileCardProps) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6">
    <div className="w-full aspect-square border border-[#032622]/50 bg-[#C9C6B4] rounded-sm" />
  </section>
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
  <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
    <header>
      <h2
        className="text-lg sm:text-xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        PROMO
      </h2>
    </header>

    {/* Section Formateurs */}
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-[#032622] uppercase tracking-wide">
          Formateurs
        </h3>
        <p className="text-[10px] sm:text-xs text-[#032622]/70 whitespace-nowrap">
          {totalTeachersOnline} en ligne
        </p>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center justify-between text-xs sm:text-sm text-[#032622] gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${studentStatusColors[teacher.status]}`} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{teacher.name}</p>
                <p className="text-[10px] sm:text-xs text-[#032622]/60 truncate">{teacher.specialty}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 text-[#032622]/60 flex-shrink-0">
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="border-t border-[#032622]/20" />

    {/* Section Étudiants */}
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-[#032622] uppercase tracking-wide">
          Étudiants
        </h3>
        <p className="text-[10px] sm:text-xs text-[#032622]/70 whitespace-nowrap">
          {totalStudentsOnline} en ligne
        </p>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between text-xs sm:text-sm text-[#032622] gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${studentStatusColors[student.status]}`} />
              <p className="font-semibold truncate">{student.name}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 text-[#032622]/60 flex-shrink-0">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AdminDashboardContent;

