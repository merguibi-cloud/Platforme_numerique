import AdminTopBar from '../components/AdminTopBar';
import AdminStudentLifeManager from '../components/AdminStudentLifeManager';

export default function AdminVieEtudiante() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <AdminTopBar notificationCount={0} className="mb-6" />
      <h1
        className="text-3xl font-bold text-[#032622]"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        VIE ÉTUDIANTE
      </h1>
      <AdminStudentLifeManager />
    </div>
  );
}
