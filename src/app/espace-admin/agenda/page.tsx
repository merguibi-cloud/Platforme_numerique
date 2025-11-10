import AgendaComponent from '../components/AgendaComponent';

export default function AdminAgenda() {
  return (
    <div className="p-6 space-y-6">
      <h1
        className="text-3xl font-bold text-[#032622]"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        AGENDA
      </h1>
      <AgendaComponent />
    </div>
  );
}









