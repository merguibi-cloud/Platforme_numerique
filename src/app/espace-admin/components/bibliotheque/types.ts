export type DocumentCategory =
  | "ebook"
  | "pdf"
  | "presentation"
  | "podcast"
  | "masterclass"
  | "replay";

export interface LibraryDocument {
  id: string;
  title: string;
  description?: string;
  author?: string;
  tag: DocumentCategory;
  actionLabel?: string;
}

export interface TableDocument {
  id: string;
  title: string;
  organization: string;
  type: string;
  date: string;
  expiration: string;
}

export interface BibliothequeFichier {
  id: string;
  titre: string;
  nom_fichier_original?: string;
  type_fichier: string;
  taille_fichier: number;
  chemin_fichier: string;
  bucket_name: string;
  description?: string;
  sujet?: string;
  ecole?: string;
  visibilite: string;
  nombre_vues: number;
  nombre_telechargements: number;
  activer_telechargement: boolean;
  date_importation: string;
  date_expiration?: string;
  tags?: string[];
  importe_par: string;
  est_favori?: boolean;
}

export interface School {
  id: string;
  name: string;
  logo: string;
}

export const schools: School[] = [
  { id: "digital", name: "Digital Legacy", logo: "/logos/digital.png" },
  { id: "leader", name: "Leaders Society", logo: "/logos/leader.png" },
  { id: "keos", name: "KEOS", logo: "/logos/keos.png" },
  { id: "talent", name: "Talent", logo: "/logos/talent.png" },
  { id: "finance", name: "Finance Society", logo: "/logos/finance.png" },
  { id: "edifice", name: "Edifice", logo: "/logos/edifice.png" },
  { id: "x1001", name: "1001", logo: "/logos/1001.png" },
];

export const tagConfig: Record<DocumentCategory, { label: string; color: string }> = {
  ebook: { label: "EBOOK", color: "bg-[#D96B6B]" },
  pdf: { label: "PDF", color: "bg-[#9E8DC3]" },
  presentation: { label: "PRÉSENTATION", color: "bg-[#7BC67A]" },
  podcast: { label: "PODCAST", color: "bg-[#F0C75E]" },
  masterclass: { label: "MASTERCLASS", color: "bg-[#7295C2]" },
  replay: { label: "REPLAY", color: "bg-[#032622] text-white" },
};

