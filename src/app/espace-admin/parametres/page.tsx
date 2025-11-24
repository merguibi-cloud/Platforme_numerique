import AdminTopBar from '../components/AdminTopBar';

export default function Parametres() {
  return (
    <div className="flex-1 p-6">
      <AdminTopBar notificationCount={0} className="mb-6" />
      <div className="space-y-6">
        <h1 
          className="text-3xl font-bold text-[#032622]"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          PARAMÈTRES
        </h1>
        
        <div className="bg-[#F8F5E4] p-6 border border-black">
          <p className="text-[#032622]">Contenu des paramètres à venir...</p>
        </div>
      </div>
    </div>
  );
}
