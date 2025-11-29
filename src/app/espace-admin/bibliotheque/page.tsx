import AdminTopBar from '../components/AdminTopBar';
import AdminLibraryContent from '../components/AdminLibraryContent';

export default function AdminBibliotheque() {
  return (
    <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] space-y-4 sm:space-y-5 md:space-y-6">
      <AdminTopBar notificationCount={0} className="mb-4 sm:mb-5 md:mb-6" />
      <AdminLibraryContent />
    </main>
  );
}
