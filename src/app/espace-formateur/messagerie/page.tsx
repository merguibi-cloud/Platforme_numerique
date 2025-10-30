import { FormateurSidebar } from '../components/FormateurSidebar';
import MessagerieComponent from '../components/MessagerieComponent';

export default function FormateurMessagerie() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Sidebar gauche */}
      <FormateurSidebar />
      
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <h1 
            className="text-3xl font-bold text-[#032622]"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            MESSAGERIE FORMATEUR
          </h1>
          
          <MessagerieComponent />
        </div>
      </div>
    </div>
  );
}



