"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageCircle,
  Filter,
  Search,
  ChevronDown,
  BarChart3,
  BookOpen,
  Award
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  promotion: string;
  campus: string;
  school: string;
  track: string;
  progress: number;
  lastLogin: string;
  nextDeadline: {
    label: string;
    date: string;
    status: "on_time" | "warning" | "late";
  };
  upcomingSession: {
    label: string;
    date: string;
  };
  notes: string;
  status: "online" | "offline" | "away";
  modules: {
    id: string;
    name: string;
    progress: number;
    status: "completed" | "in_progress" | "not_started";
    grade?: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    date: string;
    type: "submission" | "login" | "quiz" | "message";
  }[];
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Chadi El Assowad",
    email: "chadi.elassowad@elite-society.fr",
    phone: "+33 6 12 34 56 78",
    avatar: "/images/student-library/IMG_1719 2.PNG",
    promotion: "Promotion 2025",
    campus: "Campus Paris La Défense",
    school: "KEOS Business School",
    track: "BACHELOR · Responsable du développement des activités",
    progress: 72,
    lastLogin: "Aujourd'hui · 08h47",
    nextDeadline: {
      label: "Devoir Bloc 2",
      date: "18 octobre 2025",
      status: "on_time"
    },
    upcomingSession: {
      label: "Visio tuteur",
      date: "15 octobre 2025 · 09h00"
    },
    notes: "Chadi maintient un rythme régulier. Relance prévue sur les livrables Bloc 2 et préparation du quiz final.",
    status: "online",
    modules: [
      { id: "1", name: "Module 1 - Fondamentaux", progress: 100, status: "completed", grade: 18 },
      { id: "2", name: "Module 2 - Stratégie", progress: 85, status: "in_progress", grade: 16 },
      { id: "3", name: "Module 3 - Management", progress: 45, status: "in_progress" },
      { id: "4", name: "Module 4 - Innovation", progress: 0, status: "not_started" }
    ],
    recentActivity: [
      { id: "1", action: "Soumission devoir Module 2", date: "Il y a 2h", type: "submission" },
      { id: "2", action: "Connexion à la plateforme", date: "Aujourd'hui 08h47", type: "login" },
      { id: "3", action: "Quiz Module 1 terminé", date: "Hier 14h30", type: "quiz" }
    ]
  },
  {
    id: "2",
    name: "Lina Bouchard",
    email: "lina.bouchard@elite-society.fr",
    phone: "+33 6 23 45 67 89",
    avatar: "/images/student-library/IMG_1719 2.PNG",
    promotion: "Promotion 2025",
    campus: "Campus Paris La Défense",
    school: "KEOS Business School",
    track: "BACHELOR · Responsable du développement des activités",
    progress: 58,
    lastLogin: "Hier · 16h30",
    nextDeadline: {
      label: "Devoir Bloc 1",
      date: "20 octobre 2025",
      status: "warning"
    },
    upcomingSession: {
      label: "Soutenance Module 2",
      date: "22 octobre 2025 · 14h00"
    },
    notes: "Lina a besoin d'un suivi renforcé sur les concepts théoriques. Proposer des sessions de révision.",
    status: "away",
    modules: [
      { id: "1", name: "Module 1 - Fondamentaux", progress: 100, status: "completed", grade: 14 },
      { id: "2", name: "Module 2 - Stratégie", progress: 60, status: "in_progress", grade: 12 },
      { id: "3", name: "Module 3 - Management", progress: 20, status: "in_progress" },
      { id: "4", name: "Module 4 - Innovation", progress: 0, status: "not_started" }
    ],
    recentActivity: [
      { id: "1", action: "Message envoyé au formateur", date: "Il y a 1 jour", type: "message" },
      { id: "2", action: "Connexion à la plateforme", date: "Hier 16h30", type: "login" },
      { id: "3", action: "Quiz Module 2 en cours", date: "Il y a 2 jours", type: "quiz" }
    ]
  },
  {
    id: "3",
    name: "Youssef Karim",
    email: "youssef.karim@elite-society.fr",
    phone: "+33 6 34 56 78 90",
    avatar: "/images/student-library/IMG_1719 2.PNG",
    promotion: "Promotion 2025",
    campus: "Campus Paris La Défense",
    school: "KEOS Business School",
    track: "BACHELOR · Responsable du développement des activités",
    progress: 89,
    lastLogin: "Aujourd'hui · 10h15",
    nextDeadline: {
      label: "Projet final",
      date: "25 octobre 2025",
      status: "on_time"
    },
    upcomingSession: {
      label: "Présentation Module 3",
      date: "18 octobre 2025 · 10h00"
    },
    notes: "Excellent étudiant, très autonome. Peut servir de tuteur pour les autres étudiants.",
    status: "online",
    modules: [
      { id: "1", name: "Module 1 - Fondamentaux", progress: 100, status: "completed", grade: 19 },
      { id: "2", name: "Module 2 - Stratégie", progress: 100, status: "completed", grade: 17 },
      { id: "3", name: "Module 3 - Management", progress: 95, status: "in_progress", grade: 16 },
      { id: "4", name: "Module 4 - Innovation", progress: 30, status: "in_progress" }
    ],
    recentActivity: [
      { id: "1", action: "Soumission projet Module 3", date: "Il y a 30min", type: "submission" },
      { id: "2", action: "Connexion à la plateforme", date: "Aujourd'hui 10h15", type: "login" },
      { id: "3", action: "Aide fournie à un collègue", date: "Hier 15h20", type: "message" }
    ]
  }
];

const FormateurStudentTracker = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [progressFilter, setProgressFilter] = useState<string>("all");

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesProgress = progressFilter === "all" || 
      (progressFilter === "high" && student.progress >= 80) ||
      (progressFilter === "medium" && student.progress >= 50 && student.progress < 80) ||
      (progressFilter === "low" && student.progress < 50);
    
    return matchesSearch && matchesStatus && matchesProgress;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-[#4CAF50]";
      case "away": return "bg-[#F0C75E]";
      case "offline": return "bg-[#D96B6B]";
      default: return "bg-[#D96B6B]";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-[#4CAF50]";
    if (progress >= 50) return "bg-[#F0C75E]";
    return "bg-[#D96B6B]";
  };

  const getDeadlineStatusColor = (status: string) => {
    switch (status) {
      case "on_time": return "text-[#4CAF50]";
      case "warning": return "text-[#F0C75E]";
      case "late": return "text-[#D96B6B]";
      default: return "text-[#032622]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 
          className="text-3xl font-bold text-[#032622]"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          MES ÉTUDIANTS
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#032622]/60" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#032622]/30 bg-[#F8F5E4] text-[#032622] placeholder-[#032622]/50 focus:outline-none focus:border-[#032622]"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#032622]/30 bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622]"
          >
            <option value="all">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="away">Absent</option>
            <option value="offline">Hors ligne</option>
          </select>

          {/* Filtre progression */}
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="px-4 py-2 border border-[#032622]/30 bg-[#F8F5E4] text-[#032622] focus:outline-none focus:border-[#032622]"
          >
            <option value="all">Toute progression</option>
            <option value="high">Élevée (80%+)</option>
            <option value="medium">Moyenne (50-79%)</option>
            <option value="low">Faible (&lt;50%)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des étudiants */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#F8F5E4] border border-[#032622] p-4">
            <h2 className="text-lg font-semibold text-[#032622] mb-4">Liste des étudiants ({filteredStudents.length})</h2>
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 border border-[#032622]/30 cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id 
                      ? 'bg-[#032622]/10 border-[#032622]' 
                      : 'bg-[#F8F5E4] hover:bg-[#032622]/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#032622]/10 flex items-center justify-center text-[#032622] font-semibold">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(student.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#032622] truncate">{student.name}</h3>
                      <p className="text-sm text-[#032622]/70 truncate">{student.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-[#dcd5b8] h-2 rounded">
                          <div 
                            className={`h-full rounded ${getProgressColor(student.progress)}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-[#032622]">{student.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Détails de l'étudiant sélectionné */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Profil principal */}
              <div className="bg-[#F8F5E4] border border-[#032622] p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-[#032622]/10 flex items-center justify-center text-[#032622] text-xl font-bold">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(selectedStudent.status)}`}></div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-[#032622] mb-2">{selectedStudent.name}</h2>
                    <p className="text-[#032622]/70 mb-1">{selectedStudent.track}</p>
                    <p className="text-sm text-[#032622]/60">{selectedStudent.school} • {selectedStudent.campus}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4 text-[#032622]/60" />
                        <span className="text-sm text-[#032622]">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-[#032622]/60" />
                        <span className="text-sm text-[#032622]">{selectedStudent.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progression globale */}
              <div className="bg-[#F8F5E4] border border-[#032622] p-6">
                <h3 className="text-lg font-semibold text-[#032622] mb-4">Progression globale</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-[#032622]">Avancement général</span>
                      <span className="text-lg font-bold text-[#032622]">{selectedStudent.progress}%</span>
                    </div>
                    <div className="w-full bg-[#dcd5b8] h-3 rounded">
                      <div 
                        className={`h-full rounded ${getProgressColor(selectedStudent.progress)}`}
                        style={{ width: `${selectedStudent.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f8f5e4] border border-[#032622]/30 p-4 rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-[#032622]/60" />
                        <span className="text-sm font-semibold text-[#032622]">Dernière connexion</span>
                      </div>
                      <p className="text-[#032622]">{selectedStudent.lastLogin}</p>
                    </div>
                    
                    <div className="bg-[#f8f5e4] border border-[#032622]/30 p-4 rounded">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-[#032622]/60" />
                        <span className="text-sm font-semibold text-[#032622]">Prochaine échéance</span>
                      </div>
                      <p className={`font-semibold ${getDeadlineStatusColor(selectedStudent.nextDeadline.status)}`}>
                        {selectedStudent.nextDeadline.label}
                      </p>
                      <p className="text-sm text-[#032622]/70">{selectedStudent.nextDeadline.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div className="bg-[#F8F5E4] border border-[#032622] p-6">
                <h3 className="text-lg font-semibold text-[#032622] mb-4">Modules de formation</h3>
                <div className="space-y-4">
                  {selectedStudent.modules.map((module) => (
                    <div key={module.id} className="bg-[#f8f5e4] border border-[#032622]/30 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#032622]">{module.name}</h4>
                        <div className="flex items-center space-x-2">
                          {module.grade && (
                            <span className="text-sm font-bold text-[#032622]">{module.grade}/20</span>
                          )}
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            module.status === 'completed' ? 'bg-[#4CAF50] text-white' :
                            module.status === 'in_progress' ? 'bg-[#F0C75E] text-white' :
                            'bg-[#D96B6B] text-white'
                          }`}>
                            {module.status === 'completed' ? 'Terminé' :
                             module.status === 'in_progress' ? 'En cours' : 'Non commencé'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#dcd5b8] h-2 rounded">
                        <div 
                          className={`h-full rounded ${getProgressColor(module.progress)}`}
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-[#032622]/70 mt-1">{module.progress}% complété</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activité récente */}
              <div className="bg-[#F8F5E4] border border-[#032622] p-6">
                <h3 className="text-lg font-semibold text-[#032622] mb-4">Activité récente</h3>
                <div className="space-y-3">
                  {selectedStudent.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-[#f8f5e4] border border-[#032622]/30 rounded">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'submission' ? 'bg-[#4CAF50]' :
                        activity.type === 'login' ? 'bg-[#F0C75E]' :
                        activity.type === 'quiz' ? 'bg-[#032622]' :
                        'bg-[#D96B6B]'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-[#032622]">{activity.action}</p>
                        <p className="text-xs text-[#032622]/70">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes et actions */}
              <div className="bg-[#F8F5E4] border border-[#032622] p-6">
                <h3 className="text-lg font-semibold text-[#032622] mb-4">Notes et actions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#032622] mb-2">Notes pédagogiques</label>
                    <textarea
                      defaultValue={selectedStudent.notes}
                      className="w-full h-24 p-3 border border-[#032622]/30 bg-[#f8f5e4] text-[#032622] placeholder-[#032622]/50 resize-none focus:outline-none focus:border-[#032622]"
                      placeholder="Ajoutez vos notes sur cet étudiant..."
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-[#032622] text-white text-sm font-semibold hover:bg-[#01302C] transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Envoyer un message</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-[#032622] bg-[#F8F5E4] text-[#032622] text-sm font-semibold hover:bg-[#032622] hover:text-white transition-colors">
                      <Calendar className="w-4 h-4" />
                      <span>Planifier un RDV</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#F8F5E4] border border-[#032622] p-12 text-center">
              <User className="w-16 h-16 text-[#032622]/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#032622] mb-2">Sélectionnez un étudiant</h3>
              <p className="text-[#032622]/70">Choisissez un étudiant dans la liste pour voir ses détails et suivre sa progression.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormateurStudentTracker;
