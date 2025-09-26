"use client";

interface FormationDetailsProps {
  niveau: string;
  titre: string;
  description: string;
  isOnline?: boolean;
  isCertified?: boolean;
}

export const FormationDetails = ({ 
  niveau, 
  titre, 
  description, 
  isOnline = true, 
  isCertified = true 
}: FormationDetailsProps) => {
  return (
    <div className="py-16 px-4" style={{ backgroundColor: '#F8F5E4' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Détails de la formation */}
          <div className="lg:col-span-2">
            {/* Niveau de formation */}
            <div className="mb-4">
              <span 
                className="text-sm font-bold uppercase tracking-wide"
                style={{ 
                  color: '#032622',
                  fontFamily: 'var(--font-termina-bold)'
                }}
              >
                {niveau}
              </span>
            </div>

            {/* Titre de la formation */}
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ 
                color: '#032622',
                fontFamily: 'var(--font-termina-bold)'
              }}
            >
              {titre}
            </h1>

            {/* Description */}
            <p 
              className="text-lg leading-relaxed mb-8"
              style={{ 
                color: '#032622',
                fontFamily: 'var(--font-rota-medium)'
              }}
            >
              {description}
            </p>

            {/* Bouton S'inscrire */}
            <button
              className="bg-[#032622] text-white px-8 py-4 text-lg font-bold uppercase tracking-wide hover:bg-[#044a3a] transition-colors duration-300"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              S'INSCRIRE
            </button>
          </div>

          {/* Colonne droite - Tableau d'informations */}
          <div className="lg:col-span-1">
            <div 
              className="bg-[#F8F5E4] border-2 border-[#032622] p-6 h-fit"
            >
              {/* Section 100% EN LIGNE */}
              <div className="text-center mb-6">
                <h3 
                  className="text-lg font-bold uppercase tracking-wide"
                  style={{ 
                    color: '#032622',
                    fontFamily: 'var(--font-termina-bold)'
                  }}
                >
                  100% EN LIGNE
                </h3>
              </div>

              {/* Ligne de séparation */}
              <div className="border-t-2 border-[#032622] mb-6"></div>

              {/* Section CERTIFICATION */}
              <div className="text-center">
                <h3 
                  className="text-lg font-bold uppercase tracking-wide"
                  style={{ 
                    color: '#032622',
                    fontFamily: 'var(--font-termina-bold)'
                  }}
                >
                  CERTIFICATION
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
