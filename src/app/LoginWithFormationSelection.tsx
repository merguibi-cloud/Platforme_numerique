"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Check, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Formation, categories, niveaux, rythmes } from '@/types/formations';
import { getAllFormations } from '@/lib/formations';
import { signIn, signUp } from '@/lib/auth-api';

interface LoginWithFormationSelectionProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onCompleteAction: (selectedFormations: Formation[]) => void;
}

type Step = 'login' | 'formation-selection' | 'inscription';

export const LoginWithFormationSelection = ({ isOpen, onCloseAction, onCompleteAction }: LoginWithFormationSelectionProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('login');
  const [selectedFormation, setSelectedFormation] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TOUS');
  const [selectedNiveau, setSelectedNiveau] = useState('TOUS');
  const [selectedRythme, setSelectedRythme] = useState('TOUS');
  
  // États pour l'inscription
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // États pour les formations
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour l'authentification
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les formations depuis Supabase
  useEffect(() => {
    const loadFormations = async () => {
      try {
        setLoading(true);
        const data = await getAllFormations();
        setFormations(data);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormations();
  }, []);

  // Reset states when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentStep('login');
      setSelectedFormation(null);
      setSearchTerm('');
      setSelectedCategory('TOUS');
      setSelectedNiveau('TOUS');
      setSelectedRythme('TOUS');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filtrer les formations selon les critères
  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'TOUS' || formation.theme === selectedCategory;
    const matchesNiveau = selectedNiveau === 'TOUS' || formation.niveau === selectedNiveau;
    const matchesRythme = selectedRythme === 'TOUS' || formation.rythme === selectedRythme;
    
    return matchesSearch && matchesCategory && matchesNiveau && matchesRythme;
  });

  const toggleFormationSelection = (formationId: number) => {
    setSelectedFormation(prev => prev === formationId ? null : formationId);
  };

  // Fonction de connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Tentative connexion
      const result = await signIn({
        email: loginEmail,
        password: loginPassword,
      });

      if (!result.success) {
        setError(result.error || 'Erreur lors de la connexion');
        return;
      }

      // Connexion réussie
      onCloseAction();
      router.push('/validation');
    } catch (error) {
      console.error('Erreur connexion');
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const handleSignUp = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }

      if (!acceptTerms) {
        setError('Vous devez accepter les conditions d\'utilisation.');
        return;
      }

      const result = await signUp({
        email,
        password,
        formation_id: selectedFormation || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'inscription');
        return;
      }

      // Rediriger vers la page de confirmation
      router.push(`/confirmation?email=${encodeURIComponent(email)}`);
      onCloseAction();
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError('Une erreur est survenue lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'formation-selection' && selectedFormation) {
      setCurrentStep('inscription');
    } else if (currentStep === 'inscription') {
      handleSignUp();
    }
  };

  const handleFormationDetails = (formation: Formation) => {
    // Fermer le modal et rediriger vers la page de la formation
    onCloseAction();
    window.location.href = formation.redirection;
  };

  const goBack = () => {
    if (currentStep === 'formation-selection') {
      setCurrentStep('login');
    } else if (currentStep === 'inscription') {
      setCurrentStep('formation-selection');
    } else {
      onCloseAction();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCloseAction}
      />
      
      {/* Modal */}
      <div className={`relative w-full ${currentStep === 'login' ? 'max-w-6xl' : 'max-w-7xl'} mx-2 sm:mx-4 bg-[#F8F5E4] shadow-2xl ${currentStep === 'login' ? '' : 'max-h-[90vh] flex flex-col'}`}>
        
        {/* Header - Pour les étapes formation-selection et inscription */}
        {(currentStep === 'formation-selection' || currentStep === 'inscription') && (
          <div className="bg-[#F8F5E4] px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 
                className="text-2xl font-bold text-[#032622] uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
              >
                {currentStep === 'formation-selection' ? 'SÉLECTIONNEZ VOTRE FORMATION' : 'CRÉE TON COMPTE'}
              </h1>
              <button
                onClick={onCloseAction}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Bouton fermer pour l'étape login */}
        {currentStep === 'login' && (
          <button
            onClick={onCloseAction}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Contenu principal */}
        <div className={currentStep === 'login' ? '' : 'flex-1 overflow-hidden'}>
          {currentStep === 'login' && (
            /* Étape Login */
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] sm:min-h-[600px]">
              
              {/* Section gauche - Image avec logo */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900">
                {/* Image de fond */}
                <div className="absolute inset-0">
                  <Image
                    src="/img/login/background.jpg"
                    alt="Connexion"
                    fill
                    className="object-cover opacity-60"
                  />
                </div>
                
                {/* Contenu overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-6 md:p-8 text-center">
                  {/* Logo */}
                  <div className="mb-4 sm:mb-6 md:mb-8">
                    <Image src="/img/accueil/logo_elite_society_online_blanc.png" alt="ELITE SOCIETY" width={300} height={300} className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain" />
                  </div>
                  
                  {/* Texte */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 uppercase tracking-wide">
                    Première connexion ?
                  </h2>
                  
                  {/* Bouton */}
                  <button
                    onClick={() => setCurrentStep('formation-selection')}
                    className="bg-[#F8F5E4] hover:bg-[#F8F5E4]/90 text-[#032622] px-6 py-3 sm:px-8 sm:py-4 font-bold text-base sm:text-lg transition-colors duration-200"
                    style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                  >
                    COMMENCER
                  </button>
                </div>
              </div>

              {/* Section droite - Formulaire */}
              <div className="bg-[#F8F5E4] p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  {/* Titre */}
                  <h1 
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-[#032622] mb-2 uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                  >
                    Accédez à votre espace
                  </h1>
                  
                  <p 
                    className="text-[#032622] mb-6 sm:mb-8 text-sm sm:text-base"
                    style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                  >
                    Connectez-vous si vous avez déjà un compte
                  </p>

                  {/* Message d'erreur */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Formulaire */}
                  <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                    {/* Email */}
                    <div>
                      <label 
                        className="block text-[#032622] text-xs sm:text-sm font-medium mb-2"
                        style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                      >
                        E-MAIL
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#032622]/10 text-[#032622] border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent text-sm sm:text-base"
                        placeholder="Email"
                        required
                      />
                    </div>

                    {/* Mot de passe */}
                    <div>
                      <label 
                        className="block text-[#032622] text-xs sm:text-sm font-medium mb-2"
                        style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                      >
                        MOT DE PASSE
                      </label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-[#032622]/10 text-[#032622] border border-[#032622] focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent text-sm sm:text-base"
                        placeholder="Mot de passe"
                        required
                      />
                    </div>

                    {/* Se souvenir de moi */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 bg-[#032622]/10 border-[#032622] focus:ring-[#032622]"
                      />
                      <label 
                        htmlFor="remember" 
                        className="ml-2 text-[#032622] text-xs sm:text-sm"
                        style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                      >
                        Se souvenir de moi
                      </label>
                    </div>

                    {/* Bouton de connexion */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#032622] hover:bg-[#032622]/90 text-[#F8F5E4] py-3 sm:py-4 font-bold text-base sm:text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                    >
                      {isLoading ? 'CONNEXION...' : 'ME CONNECTER'}
                    </button>

                    {/* Connexions sociales */}
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        type="button"
                        className="w-full bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] py-2 sm:py-3 px-3 sm:px-4 font-medium transition-colors duration-200 border border-gray-300 flex items-center justify-center"
                        style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Image src="/img/login/icon_google.png" alt="Google" width={20} height={20} className="w-5 h-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">CONNEXION AVEC GOOGLE</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="w-full bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] py-2 sm:py-3 px-3 sm:px-4 font-medium transition-colors duration-200 border border-gray-300 flex items-center justify-center"
                        style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Image src="/img/login/icon_facebook.png" alt="Facebook" width={20} height={20} className="w-5 h-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">CONNEXION AVEC FACEBOOK</span>
                        </div>
                      </button>
                    </div>

                    {/* Liens du bas */}
                    <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm space-y-2 sm:space-y-0">
                      <Link 
                        href="/mot-de-passe-oublie"
                        className="text-[#032622] hover:underline text-center sm:text-left"
                        style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                      >
                        Mot de passe oublié
                      </Link>
                      <Link 
                        href="/formateur"
                        className="text-[#032622] hover:underline text-center sm:text-right"
                        style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                      >
                        Je suis formateur
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'formation-selection' && (
            /* Étape Sélection de formations */
            <>
              {/* Filtres */}
              <div className="bg-[#F8F5E4] px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Champ de recherche */}
                  <div className="flex-1 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5" />
                      <input
                        type="text"
                        placeholder="RECHERCHER UNE FORMATION"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#F8F5E4] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent placeholder-[#032622]"
                        style={{ fontFamily: 'var(--font-termina-bold)' }}
                      />
                    </div>
                  </div>

                  {/* Filtre par niveau d'étude */}
                  <div className="relative">
                    <select
                      value={selectedNiveau}
                      onChange={(e) => setSelectedNiveau(e.target.value)}
                      className="appearance-none bg-[#F8F5E4] text-[#032622] px-4 py-3 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent min-w-[200px] border border-gray-300"
                      style={{ fontFamily: 'var(--font-termina-bold)', color: '#032622' }}
                    >
                      <option value="TOUS" className="text-[#032622]" style={{ color: '#032622' }}>NIVEAU D'ÉTUDE</option>
                      {niveaux.map((niveau) => (
                        <option key={niveau} value={niveau} className="text-[#032622]" style={{ color: '#032622' }}>
                          {niveau}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5 pointer-events-none" />
                  </div>

                  {/* Filtre par spécialisation */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="appearance-none bg-[#F8F5E4] text-[#032622] px-4 py-3 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent min-w-[200px] border border-gray-300"
                      style={{ fontFamily: 'var(--font-termina-bold)', color: '#032622' }}
                    >
                      <option value="TOUS" className="text-[#032622]" style={{ color: '#032622' }}>SPÉCIALISATION</option>
                      {categories.map((category) => (
                        <option key={category} value={category} className="text-[#032622]" style={{ color: '#032622' }}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5 pointer-events-none" />
                  </div>

                  {/* Filtre par rythme de formation */}
                  <div className="relative">
                    <select
                      value={selectedRythme}
                      onChange={(e) => setSelectedRythme(e.target.value)}
                      className="appearance-none bg-[#F8F5E4] text-[#032622] px-4 py-3 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent min-w-[200px] border border-gray-300"
                      style={{ fontFamily: 'var(--font-termina-bold)', color: '#032622' }}
                    >
                      <option value="TOUS" className="text-[#032622]" style={{ color: '#032622' }}>RYTHME DE FORMATION</option>
                      {rythmes.map((rythme) => (
                        <option key={rythme} value={rythme} className="text-[#032622]" style={{ color: '#032622' }}>
                          {rythme}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#032622] w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 overflow-y-auto p-6 pb-24 popup-scroll" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032622]"></div>
                    <p className="mt-4 text-[#032622]">Chargement des formations...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                      {filteredFormations.map((formation) => (
                        <div
                          key={formation.id}
                          className="bg-[#032622] shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-[380px] w-full relative"
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleFormationSelection(formation.id)}
                            className={`absolute top-3 left-3 w-6 h-6 border-2 rounded flex items-center justify-center transition-colors z-10 ${
                              selectedFormation === formation.id
                                ? 'bg-[#F8F5E4] border-[#F8F5E4] text-[#032622]'
                                : 'bg-white border-gray-300 hover:border-[#F8F5E4]'
                            }`}
                          >
                            {selectedFormation === formation.id && (
                              <Check className="w-4 h-4" />
                            )}
                          </button>

                          {/* Badge RNCP */}
                          <div className="absolute top-3 right-3 bg-[#F8F5E4] text-[#032622] px-2 py-1 text-xs font-bold z-10">
                            CERTIFIÉE RNCP
                          </div>

                          {/* Image de la formation */}
                          <div className="h-40 bg-gray-200 relative overflow-hidden flex-shrink-0">
                            <Image
                              src={formation.image}
                              alt={formation.titre}
                              width={400}
                              height={160}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/img/formation/forma_digital.png';
                              }}
                            />
                          </div>

                          {/* Contenu de la carte */}
                          <div className="p-5 flex flex-col flex-grow">
                            {/* Titre */}
                            <h3 
                              className="text-[14px] font-bold mb-2 text-[#F8F5E4] leading-tight flex-shrink-0 h-12 overflow-hidden"
                              style={{ fontFamily: 'var(--font-termina-bold)' }}
                            >
                              {formation.titre}
                            </h3>

                            {/* Description */}
                            <p className="text-[#F8F5E4] text-xs mb-3 leading-relaxed flex-grow h-16 overflow-hidden">
                              {formation.description}
                            </p>

                            {/* Bouton et icône - toujours en bas */}
                            <div className="flex items-center justify-between mt-auto">
                              <button
                                onClick={() => handleFormationDetails(formation)}
                                className="bg-[#F8F5E4] text-[#032622] px-3 py-2 text-sm font-bold hover:bg-[#032622] hover:text-[#F8F5E4] transition-colors duration-300"
                                style={{ fontFamily: 'var(--font-termina-bold)' }}
                              >
                                EN SAVOIR PLUS
                              </button>
                              
                              {/* Icône de l'école */}
                              <div className="w-12 h-12 flex items-center justify-center">
                                <Image
                                  src={formation.icon}
                                  alt={`Logo ${formation.ecole}`}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredFormations.length === 0 && (
                      <div className="text-center py-12">
                        <p 
                          className="text-gray-500 text-lg"
                          style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                        >
                          Aucune formation trouvée avec ces critères
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
          
          {currentStep === 'inscription' && (
            /* Étape Inscription */
            <div className="flex-1 overflow-y-auto p-6 pb-24 popup-scroll" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <div className="w-full max-w-4xl mx-auto">
                {/* Formulaire d'inscription */}
                <form className="space-y-6">
                  {/* Email */}
                  <div>
                    <label 
                      className="block text-[#032622] text-sm font-medium mb-2"
                      style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                    >
                      E-MAIL*
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#032622]/16 text-[#032622] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                      placeholder="Votre email"
                      required
                    />
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label 
                      className="block text-[#032622] text-sm font-medium mb-2"
                      style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                    >
                      MOT DE PASSE*
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#032622]/16 text-[#032622] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                      placeholder="Votre mot de passe"
                      required
                    />
                  </div>

                  {/* Confirmation mot de passe */}
                  <div>
                    <label 
                      className="block text-[#032622] text-sm font-medium mb-2"
                      style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                    >
                      CONFIRMATION DU MOT DE PASSE*
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#032622]/16 text-[#032622] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#032622] focus:border-transparent"
                      placeholder="Confirmez votre mot de passe"
                      required
                    />
                  </div>

                  {/* Séparateur OU */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#032622]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span 
                        className="px-2 bg-[#F8F5E4] text-[#032622] font-bold uppercase"
                        style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                      >
                        OU
                      </span>
                    </div>
                  </div>

                  {/* Connexions sociales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="w-full bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] py-4 px-6 font-medium transition-colors duration-200 border border-[#032622] flex items-center justify-center"
                      style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                    >
                      <div className="flex items-center space-x-3">
                        <Image src="/img/login/icon_google.png" alt="Google" width={20} height={20} className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-bold uppercase">INSCRIPTION AVEC GOOGLE</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="w-full bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] py-4 px-6 font-medium transition-colors duration-200 border border-[#032622] flex items-center justify-center"
                      style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                    >
                      <div className="flex items-center space-x-3">
                        <Image src="/img/login/icon_facebook.png" alt="Facebook" width={20} height={20} className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-bold uppercase">INSCRIPTION AVEC FACEBOOK</span>
                      </div>
                    </button>
                  </div>

                  {/* Conditions d'utilisation */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-1 bg-[#032622]/10 border-[#032622] focus:ring-[#032622]"
                      required
                    />
                    <label 
                      htmlFor="terms" 
                      className="text-[#032622] text-xs leading-relaxed"
                      style={{ fontFamily: 'var(--font-termina-medium)', fontWeight: '500' }}
                    >
                      En poursuivant, vous acceptez les conditions d'utilisation et reconnaissez avoir lu notre politique de confidentialité. Informations concernant la collecte de données.
                    </label>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec boutons - Pour les étapes formation-selection et inscription */}
        {(currentStep === 'formation-selection' || currentStep === 'inscription') && (
          <div className="bg-[#F8F5E4] px-6 py-4 border-t-2 border-[#032622] shadow-lg flex-shrink-0">
            <div className="flex justify-between items-center">
              <button
                onClick={goBack}
                className="bg-[#F8F5E4] hover:bg-gray-100 text-[#032622] border-2 border-[#032622] px-8 py-4 font-bold transition-all duration-200 flex items-center gap-3 text-lg hover:shadow-lg"
                style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
              >
                <ArrowLeft className="w-6 h-6" />
                RETOUR
              </button>
              
              <div className="flex flex-col items-center">
                <button
                  onClick={handleNext}
                  disabled={
                    currentStep === 'formation-selection' ? !selectedFormation : 
                    currentStep === 'inscription' ? !email || !password || !confirmPassword || !acceptTerms || isLoading : false
                  }
                  className={`px-8 py-4 font-bold transition-all duration-200 flex items-center gap-3 text-lg ${
                    (currentStep === 'formation-selection' && selectedFormation) ||
                    (currentStep === 'inscription' && email && password && confirmPassword && acceptTerms && !isLoading)
                      ? 'bg-[#032622] hover:bg-[#044a3a] text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: 'var(--font-termina-bold)', fontWeight: '700' }}
                >
                  {isLoading ? 'INSCRIPTION...' : 'SUIVANT'}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};