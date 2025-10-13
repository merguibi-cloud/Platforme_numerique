"use client";
import { useState } from 'react';
import { User, Download } from 'lucide-react';
import { ProgressHeader } from './ProgressHeader';

interface ContratProps {
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Contrat = ({ onClose, onNext, onPrev }: ContratProps) => {
  const [acceptConditions, setAcceptConditions] = useState(false);
  const [attestCorrect, setAttestCorrect] = useState(false);

  // Données de démonstration - dans une vraie app, ces données viendraient du state global ou des props
  const candidateData = {
    nom: "Bobine",
    prenom: "Jean",
    adresse: "1 route de Grand Line 93200 Saint-Denis",
    titre: "Responsable du développement des activités- RNCP40889",
    situation: "Chomage",
    motivation: "Jai choisi cette formation en finance parce que je veux acquérir des bases solides et des compétences concrètes dans un domaine qui me passionne. La finance est au cœur de la stratégie et du développement des entreprises, et je suis motivé à comprendre ces mécanismes pour être capable, demain, d'analyser, de décider et d'accompagner des projets ambitieux. Cette formation représente pour moi une opportunité d'allier rigueur intellectuelle, ouverture professionnelle et perspectives d'avenir.",
    entrepriseAccueil: "Oui",
    documents: {
      cv: "CV de Jean.pdf",
      diplome: "DUT de Jean.pdf",
      releves: "Relevé de notes.pdf",
      pieceIdentite: "Carte d'identité.pdf",
      lettreMotivation: "Lettre de motivation de Jean.pdf"
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Contenu principal */}
      <main className="px-2 sm:px-4 py-4 sm:py-8">
        <ProgressHeader currentStep="CONTRAT" onClose={onClose} />

        {/* Document de contrat - modèle exact */}
        <div className="w-full mb-6 p-8 ">
          {/* Section photo et informations personnelles */}
          <div className="flex gap-6 mb-8">
            {/* Photo de profil */}
            <div className="w-48 h-60 border border-[#032622] bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="w-16 h-16 text-[#032622]" />
            </div>
            
            {/* Informations personnelles */}
            <div className="flex-1">
              <div className="space-y-3 text-[#032622]">
                <div>
                  <span className="font-bold">NOM :</span> {candidateData.nom}
                </div>
                <div>
                  <span className="font-bold">PRÉNOM :</span> {candidateData.prenom}
                </div>
                <div>
                  <span className="font-bold">ADRESSE :</span> {candidateData.adresse}
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal du document */}
          <div className="space-y-6 text-[#032622]">
            <div>
              <span className="font-bold">TITRE SOUHAITÉ :</span> {candidateData.titre}
            </div>
            
            <div>
              <span className="font-bold">SITUATION ACTUELLE :</span> {candidateData.situation}
            </div>
            
            <div>
              <span className="font-bold">LETTRE DE MOTIVATION :</span> {candidateData.documents.lettreMotivation}
            </div>
            
            <div>
              <span className="font-bold">POURQUOI CETTE FORMATION :</span>
              <p className="mt-2">{candidateData.motivation}</p>
            </div>
            
            <div>
              <span className="font-bold">AVEZ-VOUS DÉJÀ UNE ENTREPRISE D'ACCUEIL? :</span> {candidateData.entrepriseAccueil}
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="font-bold">TÉLÉCHARGER VOTRE CV :</span> {candidateData.documents.cv}
              </div>
              
              <div>
                <span className="font-bold">TÉLÉCHARGEZ VOTRE DERNIER DIPLÔME OBTENU :</span> {candidateData.documents.diplome}
              </div>
              
              <div>
                <span className="font-bold">TÉLÉCHARGEZ VOS RELEVÉS DE NOTES DES 2 DERNIÈRES ANNÉES :</span> {candidateData.documents.releves}
              </div>
              
              <div>
                <span className="font-bold">TÉLÉCHARGEZ VOTRE PIÈCE D'IDENTITÉ RECTO/VERSO* :</span> {candidateData.documents.pieceIdentite}
              </div>
            </div>
          </div>
        </div>

        {/* Zone d'intégration PDF du règlement 
        <div className="w-full mb-6">
          <div className="border border-[#032622] bg-gray-100 flex items-center justify-center" style={{ height: '890px' }}>
            <div className="text-center text-[#032622]">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-[#032622]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="font-bold">RÈGLEMENT INTÉRIEUR</p>
              <p className="text-sm mt-2">Zone d'intégration PDF</p>
            </div>
          </div>
        </div>
*/}
        {/* Checkboxes */}
        <div className="w-full mb-6 space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={acceptConditions}
              onChange={(e) => setAcceptConditions(e.target.checked)}
              className="mt-1"
            />
            <span className="text-[#032622]">
              J'accepte les conditions générales d'utilisation et la politique de confidentialité
            </span>
          </label>
          
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={attestCorrect}
              onChange={(e) => setAttestCorrect(e.target.checked)}
              className="mt-1"
            />
            <span className="text-[#032622]">
              J'atteste que mes informations sont correctes
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 border border-[#032622]">
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              className="px-6 py-3 border border-[#032622] text-[#032622] hover:bg-[#032622] hover:text-[#032622] transition-colors"
            >
              RETOUR
            </button>
            
            <button
              onClick={onNext}
              disabled={!acceptConditions || !attestCorrect}
              className="px-6 py-3 bg-[#032622] text-white hover:bg-[#032622]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SUIVANT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
