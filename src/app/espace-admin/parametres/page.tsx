import AdminTopBar from '../components/AdminTopBar';

export default function Parametres() {
  return (
    <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 bg-[#F8F5E4]">
      <AdminTopBar notificationCount={0} className="mb-4 sm:mb-5 md:mb-6" />
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#032622] break-words"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          PARAMÈTRES
        </h1>
        
        <div className="bg-[#F8F5E4] p-4 sm:p-5 md:p-6 border border-black">
          <p className="text-sm sm:text-base text-[#032622]">Contenu des paramètres à venir...</p>
        </div>
      </div>
    </div>
  );
}
