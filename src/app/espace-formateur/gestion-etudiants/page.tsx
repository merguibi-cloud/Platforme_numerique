import { FormateurSidebar } from '../components/FormateurSidebar';
import FormateurStudentTracker from '../components/FormateurStudentTracker';

export default function GestionEtudiants() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Sidebar gauche */}
      <FormateurSidebar />
      
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <FormateurStudentTracker />
      </div>
    </div>
  );
}

