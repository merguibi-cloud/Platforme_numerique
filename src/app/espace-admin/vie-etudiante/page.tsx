import AdminTopBar from '../components/AdminTopBar';
import AdminStudentLifeManager from '../components/AdminStudentLifeManager';

export default function AdminVieEtudiante() {
  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4] space-y-4 sm:space-y-5 md:space-y-6 overflow-x-hidden max-w-full">
      <AdminTopBar notificationCount={0} className="mb-4 sm:mb-5 md:mb-6" />
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] break-words"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        VIE ÉTUDIANTE
      </h1>
      <AdminStudentLifeManager />
    </div>
  );
}
