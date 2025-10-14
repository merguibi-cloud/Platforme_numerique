import { AdminSidebar } from '../components/AdminSidebar';
import AgendaComponent from '../components/AgendaComponent';

export default function AdminAgenda() {
  return (
    <div className="min-h-screen bg-[#F8F5E4] flex">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1
          className="text-3xl font-bold text-[#032622]"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          AGENDA
        </h1>
        <AgendaComponent />
      </div>
    </div>
  );
}









