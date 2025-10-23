'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, FileText, Download, Edit, Eye } from 'lucide-react';

interface ModuleViewerPageProps {
  params: Promise<{
    formationId: string;
    blocId: string;
    moduleId: string;
  }>;
}

interface CoursContenu {
  id: string;
  titre: string;
  description: string;
  type_contenu: 'video' | 'texte' | 'presentation' | 'ressource';
  contenu?: string;
  url_video?: string;
  duree_video?: number;
  ordre_affichage: number;
}

interface ModuleDetails {
  id: string;
  titre: string;
  description: string;
  type_module: string;
  duree_estimee: number;
  statut: 'en_ligne' | 'brouillon' | 'manquant';
  cours: CoursContenu[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export default function ModuleViewerPage({ params }: ModuleViewerPageProps) {
  const router = useRouter();
  const { formationId, blocId, moduleId } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [module, setModule] = useState<ModuleDetails | null>(null);
  const [selectedCours, setSelectedCours] = useState<CoursContenu | null>(null);

  useEffect(() => {
    const loadModule = async () => {
      try {
        const response = await fetch(`/api/modules/${moduleId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setModule(data.module);
        } else {
          console.error('Erreur lors du chargement du module');
          setModule(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du module:', error);
        setModule(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  const handleBackToModules = () => {
    router.push(`/espace-admin/gestion-formations/${formationId}/${blocId}`);
  };

  const handleEditModule = () => {
    // TODO: Implémenter l'édition du module
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'en_ligne': { color: 'bg-green-500', text: 'EN LIGNE' },
      'brouillon': { color: 'bg-orange-500', text: 'BROUILLON' },
      'manquant': { color: 'bg-gray-400', text: 'MANQUANT' }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider rounded ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'presentation':
        return <FileText className="w-4 h-4" />;
      case 'texte':
        return <FileText className="w-4 h-4" />;
      case 'ressource':
        return <Download className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels = {
      'video': 'Vidéo',
      'presentation': 'Présentation',
      'texte': 'Texte',
      'ressource': 'Ressource'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement du module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#032622]">Module non trouvé</p>
          <button
            onClick={handleBackToModules}
            className="mt-4 bg-[#032622] text-[#F8F5E4] px-4 py-2 rounded hover:bg-[#032622]/90 transition-colors"
          >
            Retour aux modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      <div className="flex">
        {/* Sidebar avec la liste des cours */}
        <div className="w-1/3 bg-white border-r-2 border-[#032622] min-h-screen">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBackToModules}
                className="text-[#032622] hover:text-[#032622]/70 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 
                className="text-xl font-bold text-[#032622] uppercase"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Contenu du module
              </h1>
            </div>

            <div className="space-y-3">
              {module.cours.map((cours) => (
                <button
                  key={cours.id}
                  onClick={() => setSelectedCours(cours)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    selectedCours?.id === cours.id
                      ? 'border-[#032622] bg-[#032622] text-[#F8F5E4]'
                      : 'border-gray-300 bg-white text-[#032622] hover:border-[#032622]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getContentIcon(cours.type_contenu)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{cours.titre}</h3>
                      <p className="text-xs opacity-75 mb-2">{cours.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          {getContentTypeLabel(cours.type_contenu)}
                        </span>
                        {cours.duree_video && (
                          <span className="text-xs text-gray-500">
                            {Math.floor(cours.duree_video / 60)}:{(cours.duree_video % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-6">
          {/* Header du module */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h1 
                  className="text-2xl font-bold text-[#032622] uppercase"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {module.titre}
                </h1>
                {getStatusBadge(module.statut)}
              </div>
              <button
                onClick={handleEditModule}
                className="bg-[#032622] text-[#F8F5E4] px-4 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[#032622]/90 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                <Edit className="w-4 h-4" />
                MODIFIER
              </button>
            </div>
            
            <p className="text-[#032622] mb-4">{module.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-[#032622]">
              <span>Durée estimée: {module.duree_estimee} minutes</span>
              <span>Créé par: {module.created_by}</span>
              <span>Dernière modification: {new Date(module.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Contenu du cours sélectionné */}
          {selectedCours ? (
            <div className="bg-white rounded-lg border-2 border-[#032622] p-6">
              <div className="mb-4">
                <h2 
                  className="text-xl font-bold text-[#032622] mb-2"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {selectedCours.titre}
                </h2>
                <p className="text-[#032622] mb-4">{selectedCours.description}</p>
                <div className="flex items-center gap-2">
                  {getContentIcon(selectedCours.type_contenu)}
                  <span className="text-sm font-semibold text-[#032622]">
                    {getContentTypeLabel(selectedCours.type_contenu)}
                  </span>
                </div>
              </div>

              {/* Affichage du contenu selon le type */}
              <div className="mt-6">
                {selectedCours.type_contenu === 'video' && selectedCours.url_video && (
                  <div className="bg-black rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-64"
                      src={selectedCours.url_video}
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                )}
                
                {selectedCours.type_contenu === 'presentation' && (
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Présentation PowerPoint</p>
                    <button className="bg-[#032622] text-[#F8F5E4] px-4 py-2 rounded hover:bg-[#032622]/90 transition-colors">
                      Ouvrir la présentation
                    </button>
                  </div>
                )}
                
                {selectedCours.type_contenu === 'texte' && selectedCours.contenu && (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <pre className="whitespace-pre-wrap text-[#032622] font-sans">
                        {selectedCours.contenu}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedCours.type_contenu === 'ressource' && (
                  <div className="bg-gray-100 rounded-lg p-6">
                    <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-center text-gray-600 mb-4">Ressources complémentaires</p>
                    <div className="space-y-2">
                      <button className="w-full bg-[#032622] text-[#F8F5E4] px-4 py-2 rounded hover:bg-[#032622]/90 transition-colors">
                        Télécharger le PDF
                      </button>
                      <button className="w-full bg-gray-200 text-[#032622] px-4 py-2 rounded hover:bg-gray-300 transition-colors">
                        Accéder aux liens externes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-[#032622] p-12 text-center">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 
                className="text-xl font-bold text-[#032622] mb-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Sélectionnez un cours
              </h2>
              <p className="text-[#032622]">
                Choisissez un cours dans la liste à gauche pour commencer la lecture.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
