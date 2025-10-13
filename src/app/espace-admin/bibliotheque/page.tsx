import { AdminSidebar } from '../components/AdminSidebar';
import AdminLibraryContent from '../components/AdminLibraryContent';

export default function AdminBibliotheque() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <AdminSidebar />
      <main className="flex-1 p-10">
        <AdminLibraryContent />
      </main>
    </div>
  );
}
