'use client';

import { useEffect, useState } from 'react';
import { Cours } from '../../../../types/cours';

interface ChapitrageProps {
  moduleId: number;
  currentCoursId?: number;
  onCoursClick?: (coursId: number) => void;
}

export const Chapitrage = ({ moduleId, currentCoursId, onCoursClick }: ChapitrageProps) => {
  const [cours, setCours] = useState<Cours[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCours = async () => {
      try {
        const response = await fetch(`/api/cours?moduleId=${moduleId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setCours(data.cours || []);
        } else {
          console.error('Erreur lors du chargement des cours:', await response.text());
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      loadCours();
    }
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-[#F8F5E4] border border-[#032622] overflow-hidden w-[567px] h-[267px] flex flex-col shadow-lg">
        <div className="p-4 border-b border-[#032622]/20">
          <h3 
            className="text-lg font-bold text-[#032622] uppercase"
            style={{ fontFamily: 'var(--font-termina-bold)' }}
          >
            CHAPITRAGE
          </h3>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <p className="text-[#032622]/70 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-[#F8F5E4] border border-[#032622] overflow-hidden w-[567px] h-[267px] flex flex-col shadow-lg">
      <div className="p-4 border-b border-[#032622]/20">
        <h3 
          className="text-lg font-bold text-[#032622] uppercase"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          CHAPITRAGE
        </h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {cours.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#032622]/70 text-sm text-center">
              Aucun cours créé pour ce module
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cours.map((coursItem) => (
              <div
                key={coursItem.id}
                onClick={() => onCoursClick?.(coursItem.id)}
                className={`p-2 border-b border-[#032622]/20 cursor-pointer transition-colors ${
                  currentCoursId === coursItem.id
                    ? 'bg-[#032622]/10 font-semibold'
                    : 'hover:bg-[#032622]/5'
                }`}
              >
                <p 
                  className={`text-[#032622] text-sm ${
                    currentCoursId === coursItem.id ? 'underline' : ''
                  }`}
                  style={{ 
                    fontFamily: 'var(--font-termina-bold)',
                    textDecoration: currentCoursId === coursItem.id ? 'underline' : 'none'
                  }}
                >
                  {coursItem.titre}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

