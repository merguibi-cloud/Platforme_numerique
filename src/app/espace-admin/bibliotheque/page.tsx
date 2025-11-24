import AdminTopBar from '../components/AdminTopBar';
import AdminLibraryContent from '../components/AdminLibraryContent';

export default function AdminBibliotheque() {
  return (
    <main className="flex-1 p-10 space-y-6">
      <AdminTopBar notificationCount={0} />
      <AdminLibraryContent />
    </main>
  );
}
