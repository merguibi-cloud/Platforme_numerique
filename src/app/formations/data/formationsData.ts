// Interface pour définir la structure d'une formation
export interface Formation {
  id: number;
  titre: string;
  description: string;
  redirection: string;
  icon: string;
  image: string;
  theme: 'DIGITAL' | 'BUSINESS' | 'FINANCE' | 'CRÉATIVITÉ' | 'MANAGEMENT';
  ecole: 'DIGITAL LEGACY' | 'KEOS' | '1001' | 'AFRICAN BUSINESS SCHOOL' | 'CREATIVE NATION' | 'CSAM' |
          'EDIFICE' | 'FINANCE SOCIETY' | 'LEADER SOCIETY' | 'STUDIO CAMPUS' | 'TALENT BUSINESS SCHOOL' |
           'ELITE SOCIETY ONLINE';
  niveau?: 'BAC' | 'BAC+2' | 'BAC+3' | 'BAC+5' ;
  rythme?: 'TEMPS PLEIN' | 'TEMPS PARTIEL' | 'ALTERNANCE' | 'DISTANCIEL';
}

// Données des formations
export const formationsData: Formation[] = [
  {
    id: 1,
    titre: "RESPONSABLE MARKETING PRODUITS ET SERVICES",
    description: "Piloter des stratégies marketing et valoriser des offres adaptées aux besoins du marché",
    redirection: "/formations/responsable-marketing-produits",
    icon: "/img/icon_ecole/D_logo.png",
    image: "/img/formation/forma_digital.png",
    theme: "BUSINESS",
    ecole: "DIGITAL LEGACY",
    niveau: "BAC+5",
    rythme: "TEMPS PLEIN"
  },
  {
    id: 2,
    titre: "NÉGOCIATEUR TECHNICO-COMMERCIAL",
    description: "Vendre des solutions techniques en alliant expertise produit et sens de la négociation",
    redirection: "/formations/negociateur-technico-commercial",
    icon: "/img/icon_ecole/K_KEOS.png",
    image: "/img/formation/forma_keos2.png",
    theme: "BUSINESS",
    ecole: "KEOS",
    niveau: "BAC+2",
    rythme: "ALTERNANCE"
  },
  {
    id: 3,
    titre: "MANAGER FINANCIER",
    description: "Superviser la gestion financière et optimiser la performance économique de l'entreprise",
    redirection: "/formations/manager-financier",
    icon: "/img/icon_ecole/Finance.png",
    image: "/img/formation/forma_finance.png",
    theme: "FINANCE",
    ecole: "FINANCE SOCIETY",
    niveau: "BAC+5",
    rythme: "TEMPS PLEIN"
  },
  {
    id: 4,
    titre: "DÉVELOPPEUR EN INTELLIGENCE ARTIFICIELLE",
    description: "Concevoir des applications intelligentes basées sur des modèles d'IA",
    redirection: "/formations/developpeur-intelligence-artificielle",
    icon: "/img/icon_ecole/1001_logo.png",
    image: "/img/formation/forma_1001.png",
    theme: "DIGITAL",
    ecole: "1001",
    niveau: "BAC+3",
    rythme: "DISTANCIEL"
  },
  {
    id: 5,
    titre: "MANAGEMENT COMMERCIAL OPÉRATIONNEL",
    description: "Encadrer des équipes terrain et optimiser les performances commerciales",
    redirection: "/formations/management-commercial-operationnel",
    icon: "/img/icon_ecole/K_KEOS.png",
    image: "/img/formation/forma_keos.png",
    theme: "MANAGEMENT",
    ecole: "KEOS",
    niveau: "BAC+3",
    rythme: "TEMPS PLEIN"
  },
  {
    id: 6,
    titre: "MANAGER EN RESSOURCES HUMAINES",
    description: "Piloter la stratégie RH et accompagner les transformations humaines",
    redirection: "/formations/manager-ressources-humaines",
    icon: "/img/icon_ecole/Talent.png",
    image: "/img/formation/forma_talent.png",
    theme: "MANAGEMENT",
    ecole: "TALENT BUSINESS SCHOOL",
    niveau: "BAC+5",
    rythme: "TEMPS PLEIN"
  },
  {
    id: 7,
    titre: "MANAGER COMMERCIAL ET MARKETING",
    description: "Concevoir des plans marketing et diriger les actions commerciales",
    redirection: "/formations/manager-commercial-et-marketing",
    icon: "/img/icon_ecole/K_KEOS.png",
    image: "/img/formation/forma_keos3.jpg",
    theme: "MANAGEMENT",
    ecole: "KEOS",
    niveau: "BAC+5",
    rythme: "TEMPS PLEIN"
  },
  {
    id: 8,
    titre: "RESPONSABLE DU DÉVELOPPEMENT DES ACTIVITÉS",
    description: "Identifier de nouveaux leviers de croissance et structurer leur mise en œuvre",
    redirection: "/formations/responsable-developpement",
    icon: "/img/icon_ecole/Leader.png",
    image: "/img/formation/forma_leader.png",
    theme: "BUSINESS",
    ecole: "LEADER SOCIETY",
    niveau: "BAC+5",
    rythme: "TEMPS PLEIN"
  },
];

export const categories = ['DIGITAL', 'BUSINESS', 'FINANCE', 'CRÉATIVITÉ', 'MANAGEMENT'];
export const niveaux = ['BAC', 'BAC+2', 'BAC+3', 'BAC+5', 'MASTER'];
export const rythmes = ['TEMPS PLEIN', 'TEMPS PARTIEL', 'ALTERNANCE', 'DISTANCIEL'];
