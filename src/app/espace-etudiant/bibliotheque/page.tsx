import { StudentSidebar } from '../components/StudentSidebar';

export default function BibliothequePage() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Sidebar gauche */}
      <StudentSidebar />
      
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <h1 
            className="text-3xl font-bold text-[#032622]"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            BIBLIOTHÈQUE NUMÉRIQUE
          </h1>
          
          <div className="bg-[#F8F5E4] p-6 border border-black">
            <p className="text-[#032622]">Contenu de la bibliothèque à venir...</p>
          </div>
        </div>
      </div>
    </div>
  );
}


