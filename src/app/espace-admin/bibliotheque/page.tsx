import { AdminSidebar } from '../components/AdminSidebar';
import AdminTopBar from '../components/AdminTopBar';
import AdminLibraryContent from '../components/AdminLibraryContent';

export default function AdminBibliotheque() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <AdminSidebar />
      <main className="flex-1 p-10 space-y-6">
        <AdminTopBar notificationCount={0} />
        <AdminLibraryContent />
      </main>
    </div>
  );
}
