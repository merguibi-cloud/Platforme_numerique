"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  User, 
  Calendar, 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Settings,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react';
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth-api';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  date_naissance: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  photo_profil_url: string;
  piece_identite_url: string;
  cv_url: string;
  autres_documents_urls: string[];
  profile_completed: boolean;
  formation_id: number;
  formation_titre: string;
  created_at: string;
  updated_at: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userResult = await getCurrentUser();
      
      if (!userResult.success || !userResult.user) {
        router.push('/');
        return;
      }

      setUser(userResult.user);

      // Récupérer le profil utilisateur
      const profileResult = await getUserProfile();

      if (profileResult.success && profileResult.profile) {
        setProfile(profileResult.profile);
        
        // Si le profil n'est pas validé, rediriger vers la page de validation
        if (!profileResult.profile.profile_completed) {
          router.push('/validation');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
      } else {
        console.error('Erreur lors de la déconnexion:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
          <p className="mt-4 text-[#032622]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8F5E4] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#032622] mb-2">Profil non trouvé</h1>
          <p className="text-[#032622] mb-4">Votre profil n'a pas été trouvé.</p>
          <Link 
            href="/validation"
            className="bg-[#032622] text-white px-6 py-3 font-bold hover:bg-[#032622]/90 transition-colors"
          >
            Compléter mon profil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="/img/accueil/logo_elite_society_online_blanc.png" 
                alt="ELITE SOCIETY" 
                width={120} 
                height={40} 
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {profile.photo_profil_url ? (
                  <Image 
                    src={profile.photo_profil_url} 
                    alt="Photo de profil" 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <span 
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'var(--font-termina-medium)' }}
                >
                  {profile.prenom} {profile.nom}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* En-tête de bienvenue */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-bold text-[#032622] mb-2"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Bienvenue dans votre espace étudiant
              </h1>
              <p 
                className="text-lg text-gray-600"
                style={{ fontFamily: 'var(--font-termina-medium)' }}
              >
                {profile.prenom} {profile.nom} - {profile.formation_titre}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
                Inscription validée
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne gauche - Informations utilisateur */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card utilisateur */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                {profile.photo_profil_url ? (
                  <Image 
                    src={profile.photo_profil_url} 
                    alt="Photo de profil" 
                    width={60} 
                    height={60} 
                    className="w-15 h-15 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-15 h-15 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                <div>
                  <h2 
                    className="text-lg font-bold text-[#032622]"
                    style={{ fontFamily: 'var(--font-termina-bold)' }}
                  >
                    {profile.prenom} {profile.nom}
                  </h2>
                  <p 
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    {profile.email}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 
                  className="text-sm font-bold text-[#032622] mb-2 uppercase tracking-wide"
                  style={{ fontFamily: 'var(--font-termina-bold)' }}
                >
                  Informations
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{profile.telephone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(profile.date_naissance).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{profile.ville}, {profile.code_postal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card progression */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 
                className="text-lg font-bold text-[#032622] mb-4"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Progression de la formation
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Inscription validée</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Formation démarrée</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">Module 1 en cours</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Module 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Formation et actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card formation active */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 
                className="text-lg font-bold text-[#032622] mb-4"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Ma formation
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 
                      className="font-bold text-[#032622]"
                      style={{ fontFamily: 'var(--font-termina-bold)' }}
                    >
                      {profile.formation_titre}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Formation certifiée RNCP • Durée : 12 mois
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Code formation</span>
                    <p className="font-bold text-[#032622]">{profile.formation_id}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">15%</div>
                  <div className="text-xs text-blue-600">Progression</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">3/20</div>
                  <div className="text-xs text-green-600">Modules terminés</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="text-2xl font-bold text-yellow-600">8.5/20</div>
                  <div className="text-xs text-yellow-600">Moyenne</div>
                </div>
              </div>
            </div>

            {/* Card actions rapides */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 
                className="text-lg font-bold text-[#032622] mb-4"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Actions rapides
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  href="/espace-etudiant/mes-formations"
                  className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition-colors"
                >
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <span 
                    className="text-sm font-medium text-blue-800"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    Mes formations
                  </span>
                </Link>
                
                <Link 
                  href="/espace-etudiant/agenda"
                  className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center transition-colors"
                >
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <span 
                    className="text-sm font-medium text-green-800"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    Agenda
                  </span>
                </Link>
                
                <Link 
                  href="/espace-etudiant/messagerie"
                  className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 text-center transition-colors"
                >
                  <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <span 
                    className="text-sm font-medium text-purple-800"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    Messagerie
                  </span>
                </Link>
                
                <Link 
                  href="/espace-etudiant/support"
                  className="bg-orange-50 hover:bg-orange-100 rounded-lg p-4 text-center transition-colors"
                >
                  <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <span 
                    className="text-sm font-medium text-orange-800"
                    style={{ fontFamily: 'var(--font-termina-medium)' }}
                  >
                    Support
                  </span>
                </Link>
              </div>
            </div>

            {/* Card dernières activités */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 
                className="text-lg font-bold text-[#032622] mb-4"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Dernières activités
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Quiz Module 1 terminé</p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">16/20</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vidéo "Introduction" regardée</p>
                    <p className="text-xs text-gray-500">Hier</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">100%</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Devoir à rendre</p>
                    <p className="text-xs text-gray-500">Échéance : 3 jours</p>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">En cours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
