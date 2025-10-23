'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from './TiptapEditor';
import { FormationHeader } from './FormationHeader';
import { Cours, FichierElement } from '../../../../types/cours';

interface CoursEditorProps {
  coursId?: number;
  moduleId: number;
  moduleTitle: string;
  blocTitle: string;
  blocNumber: string;
  moduleOrder?: number;
}

export const CoursEditor = ({ coursId, moduleId, moduleTitle, blocTitle, blocNumber, moduleOrder }: CoursEditorProps) => {
  const router = useRouter();
  const [cours, setCours] = useState<Cours | null>(null);
  const [contenu, setContenu] = useState('');
  const [fichiers, setFichiers] = useState<FichierElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (coursId) {
      loadCours();
    } else {
      setIsLoading(false);
    }
  }, [coursId]);

  const loadCours = async () => {
    try {
      const response = await fetch(`/api/cours?coursId=${coursId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCours(data.cours);
        setContenu(data.cours.contenu);
        // TODO: Charger les fichiers depuis le contenu JSON
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const coursData = {
        module_id: moduleId,
        titre: moduleTitle,
        contenu,
        statut: 'brouillon'
      };

      if (coursId) {
        // Mise à jour
        const response = await fetch('/api/cours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coursId, ...coursData })
        });
      } else {
        // Création
        const response = await fetch('/api/cours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursData)
        });
        
        if (response.ok) {
          const data = await response.json();
          router.push(`/espace-admin/gestion-formations/${moduleId}/cours/${data.cours.id}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    setIsSaving(true);
    try {
      const coursData = {
        module_id: moduleId,
        titre: moduleTitle,
        contenu,
        statut: 'en_cours_examen'
      };

      if (coursId) {
        // Mise à jour
        const response = await fetch('/api/cours', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coursId, ...coursData })
        });
      } else {
        // Création
        const response = await fetch('/api/cours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursData)
        });
        
        if (response.ok) {
          const data = await response.json();
          router.push(`/espace-admin/gestion-formations/${moduleId}/cours/${data.cours.id}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFile = async (file: File) => {
    // TODO: Implémenter l'upload de fichier
    const newFile: FichierElement = {
      id: Date.now().toString(),
      nom: file.name,
      url: URL.createObjectURL(file),
      taille: file.size,
      type: file.type
    };
    setFichiers(prev => [...prev, newFile]);
  };

  const handleRemoveFile = (fileId: string) => {
    setFichiers(prev => prev.filter(f => f.id !== fileId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032622] mx-auto mb-4"></div>
          <p className="text-[#032622]">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Header */}
      <div className="bg-[#F8F5E4] border-b border-[#032622]/20 px-6 py-4">
        <div className="flex mb-[5%] items-center justify-between">
          <div className="flex items-center gap-4">
          </div>
          
          {/* Header avec notifications et profil */}
          <FormationHeader />
        </div>
      </div>
      {/* Main Content */}
      <div className="w-full">
        <div className="w-full space-y-6 px-6">
        </div>

        {/* Éditeur de contenu - Pleine largeur */}
        <TiptapEditor
          content={contenu}
          onChange={setContenu}
          placeholder="ÉCRIS ICI..."
          onSaveDraft={handleSaveDraft}
          onNextStep={handleNextStep}
          isSaving={isSaving}
          fichiers={fichiers}
          onAddFile={handleAddFile}
          onRemoveFile={handleRemoveFile}
          moduleNumber={moduleOrder?.toString() || moduleId.toString()}
          moduleTitle={moduleTitle}
        />
      </div>
      </div>
  );
};
