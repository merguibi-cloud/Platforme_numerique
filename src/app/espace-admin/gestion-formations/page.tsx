import { AdminSidebar } from '../components/AdminSidebar';
import AdminFormationManager from '../components/AdminFormationManager';

export default function GestionFormations() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Sidebar gauche */}
      <AdminSidebar />
      
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <h1 
            className="text-3xl font-bold text-[#032622]"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            GESTION DES FORMATIONS
          </h1>
          
          <AdminFormationManager />
        </div>
      </div>
    </div>
  );
}
