"use client";

import Link from "next/link";

interface AdminUser {
  id: string;
  nom: string;
  prenom: string;
  mail: string;
  ecole: string;
  role: string;
}

// Données de démonstration (sera remplacé par le back plus tard)
const mockAdmins: AdminUser[] = [
  {
    id: "1",
    nom: "DRAKE",
    prenom: "NATHAN",
    mail: "NDRAKE@ELITE-SOCIETY.FR",
    ecole: "LEADER SOCIETY",
    role: "ADMINISTRATEUR ADV",
  },
  {
    id: "2",
    nom: "MILLER",
    prenom: "JOEL",
    mail: "JMILLER@ELITE-SOCIETY.FR",
    ecole: "DIGITAL LEGACY",
    role: "ADMINISTRATEUR COMMERCIAL",
  },
  {
    id: "3",
    nom: "FISHER",
    prenom: "SAM",
    mail: "SFISHER@ELITE-SOCIETY.FR",
    ecole: "FINANCE SOCIETY",
    role: "FORMATEUR",
  },
];

const AttributionCard = () => {
  // Limiter à 3 éléments pour l'affichage dans le dashboard
  const displayedAdmins = mockAdmins.slice(0, 3);

  return (
    <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          ESPACE D'ATTRIBUTION
        </h2>
        <Link
          href="/espace-admin/attribution"
          className="text-sm font-semibold text-[#032622] hover:underline"
        >
          TOUT VOIR
        </Link>
      </div>

      <div className="space-y-2">
        {displayedAdmins.map((admin) => (
          <div
            key={admin.id}
            className="grid grid-cols-12 gap-4 items-center border-b border-[#032622]/30 pb-3 text-sm text-[#032622]"
          >
            <div className="col-span-4 font-semibold uppercase tracking-wide">
              {admin.nom} {admin.prenom}
            </div>
            <div className="col-span-4 text-[#032622]/80">{admin.mail}</div>
            <div className="col-span-2 text-[#032622]/80">{admin.ecole}</div>
            <div className="col-span-2 text-[#032622]/80">{admin.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AttributionCard;

