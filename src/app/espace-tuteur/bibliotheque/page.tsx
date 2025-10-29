"use client";

export default function BibliothequeTuteur() {
  const resources = [
    {
      id: 1,
      title: "Guide du tuteur",
      type: "PDF",
      size: "2.5 MB",
      category: "Documentation"
    },
    {
      id: 2,
      title: "Fiches de suivi étudiant",
      type: "PDF",
      size: "1.2 MB",
      category: "Outils"
    },
    {
      id: 3,
      title: "Référentiel de compétences",
      type: "PDF",
      size: "3.8 MB",
      category: "Référentiels"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <h1 
        className="text-4xl font-bold text-[#032622] mb-8"
        style={{ fontFamily: 'var(--font-termina-bold)' }}
      >
        BIBLIOTHÈQUE
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource.id} className="bg-[#F8F5E4] border-2 border-black p-6 hover:shadow-lg transition-all">
            <div className="mb-4">
              <span className="bg-[#6B9A8E] text-white px-3 py-1 text-xs font-bold">
                {resource.category}
              </span>
            </div>
            <h3 
              className="text-lg font-bold text-[#032622] mb-2"
              style={{ fontFamily: 'var(--font-termina-bold)' }}
            >
              {resource.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-[#032622] mb-4">
              <span>{resource.type}</span>
              <span>{resource.size}</span>
            </div>
            <button className="w-full bg-[#032622] text-white px-4 py-2 font-bold hover:bg-[#044a3a] transition-colors">
              TÉLÉCHARGER
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

