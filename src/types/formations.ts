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
  prix: number; // Prix en euros
}

export const categories = ['DIGITAL', 'BUSINESS', 'FINANCE', 'CRÉATIVITÉ', 'MANAGEMENT'];
export const niveaux = ['BAC', 'BAC+2', 'BAC+3', 'BAC+5', 'MASTER'];
export const rythmes = ['TEMPS PLEIN', 'TEMPS PARTIEL', 'ALTERNANCE', 'DISTANCIEL'];
