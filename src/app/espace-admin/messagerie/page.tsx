import { AdminSidebar } from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import MessagerieComponent from '../components/MessagerieComponent';

export default function AdminMessagerie() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      {/* Sidebar gauche */}
      <AdminSidebar />
      
      {/* Contenu principal */}
      <div className="flex-1 p-6">
        <AdminTopBar notificationCount={0} className="mb-6" />
        <div className="space-y-6">
          <h1 
            className="text-3xl font-bold text-[#032622]"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            MESSAGERIE ADMINISTRATEUR
          </h1>
          
          <MessagerieComponent />
        </div>
      </div>
    </div>
  );
}
