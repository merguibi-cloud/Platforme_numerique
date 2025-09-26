import { Navbar } from '../../Navbar';
import { Footer } from '../../Footer';
import { FormationHero } from './components/FormationHero';
import { FormationDetails } from './components/FormationDetails';

export default function ResponsableDeveloppementPage() {
  // Données spécifiques à la formation "Responsable du développement des activités"
  const formationData = {
    niveau: 'MASTÈRE BAC+3 - TITRE NIVEAU 6',
    titre: 'RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS',
    description: 'Le Responsable du développement des activités pilote la croissance d\'une entreprise en analysant les marchés, en concevant des projets innovants et en coordonnant les équipes commerciales et marketing.',
    backgroundImage: '/img/formation/hero_leader.png',
    schoolLogo: '/img/logo_ecole/leader_society_blanc.png',
    schoolName: 'leadersociety'
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <FormationHero 
        backgroundImage={formationData.backgroundImage}
        schoolLogo={formationData.schoolLogo}
        schoolName={formationData.schoolName}
      />
      <FormationDetails 
        niveau={formationData.niveau}
        titre={formationData.titre}
        description={formationData.description}
        isOnline={true}
        isCertified={true}
      />
      <Footer />
    </main>
  );
}
