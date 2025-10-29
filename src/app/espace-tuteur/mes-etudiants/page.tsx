"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function MesEtudiants() {
  const [searchTerm, setSearchTerm] = useState('');

  // Liste des étudiants
  const students = [
    {
      id: 1,
      name: "Jean Bobine",
      formation: "Responsable du développement des activités",
      progress: 10,
      lastConnection: "24/09/2025",
      status: "actif",
      image: "/images/student-library/IMG_1719 2.PNG"
    },
    {
      id: 2,
      name: "Marie Durand",
      formation: "Responsable du développement des activités",
      progress: 45,
      lastConnection: "28/10/2025",
      status: "actif",
      image: "/images/student-library/IMG_1719 2.PNG"
    },
    {
      id: 3,
      name: "Pierre Martin",
      formation: "Responsable du développement des activités",
      progress: 78,
      lastConnection: "27/10/2025",
      status: "actif",
      image: "/images/student-library/IMG_1719 2.PNG"
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F5E4] p-6">
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold text-[#032622] mb-6"
          style={{ fontFamily: 'var(--font-termina-bold)' }}
        >
          MES ÉTUDIANTS
        </h1>

        {/* Barre de recherche */}
        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-[#032622] bg-white text-[#032622] placeholder-gray-400 focus:outline-none"
          />
          <button className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#044a3a] transition-colors">
            RECHERCHER
          </button>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Link 
            key={student.id} 
            href="/espace-tuteur/dashboard"
            className="bg-[#F8F5E4] border-2 border-black p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#032622]">
                <Image
                  src={student.image}
                  alt={student.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 
                  className="text-lg font-bold text-[#032622] mb-1 group-hover:text-[#6B9A8E]"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  {student.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-[#032622]">{student.status}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[#032622] mb-2">{student.formation}</p>
              <div className="flex items-center justify-between text-xs text-[#032622] mb-2">
                <span>Progression</span>
                <span className="font-bold">{student.progress}%</span>
              </div>
              <div className="w-full bg-gray-300 h-2">
                <div 
                  className="bg-[#032622] h-2 transition-all"
                  style={{ width: `${student.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-xs text-[#032622] pt-2 border-t border-gray-300">
              Dernière connexion : {student.lastConnection}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

