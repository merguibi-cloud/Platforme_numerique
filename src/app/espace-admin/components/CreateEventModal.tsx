"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, Camera, Plus, Upload, Info } from "lucide-react";

interface Intervenant {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  photo: string | null;
}

interface EventFormData {
  // Étape 1 - Informations de base
  titre: string;
  type: "evenement" | "rendezvous" | "rappel" | "";
  jour: string;
  mois: string;
  annee: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  ecole: string;
  visibilite: "plateforme" | "ecole" | "";
  
  // Étape 2 - Détails événement
  photoCouverture: File | null;
  description: string;
  lienVisio: string;
  participants: "etudiants" | "formateurs" | "promo" | "ecole" | "";
  intervenants: Intervenant[];
  
  // Détails rendez-vous
  motifRendezVous: string;
  fichiersRendezVous: File[];
  couleurRendezVous: string;
  
  // Détails rappel
  titreRappel: string;
  recurrence: string;
  descriptionRappel: string;
  lienVisioRappel: string;
  importance: "!" | "!!" | "!!!" | "";
  couleurRappel: string;
}

interface CreateEventModalProps {
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

const CreateEventModal = ({ onClose, onSubmit }: CreateEventModalProps) => {
  const router = useRouter();
  
  // Récupérer le type depuis l'URL au chargement
  const getTypeFromUrl = (): "evenement" | "rendezvous" | "rappel" | "" => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      if (type === 'evenement' || type === 'rendezvous' || type === 'rappel') {
        return type;
      }
    }
    return "";
  };
  
  // Récupérer l'étape depuis l'URL (si type présent = étape 2)
  const getStepFromUrl = () => {
    const type = getTypeFromUrl();
    return type ? 2 : 1;
  };
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(getStepFromUrl());
  
  const [formData, setFormData] = useState<EventFormData>({
    titre: "",
    type: "",
    jour: "",
    mois: "",
    annee: "",
    heureDebut: "",
    heureFin: "",
    lieu: "",
    ecole: "",
    visibilite: "",
    photoCouverture: null,
    description: "",
    lienVisio: "",
    participants: "",
    intervenants: [{
      id: "1",
      nom: "",
      prenom: "",
      poste: "",
      photo: null,
    }],
    motifRendezVous: "",
    fichiersRendezVous: [],
    couleurRendezVous: "#FF6B6B",
    titreRappel: "",
    recurrence: "",
    descriptionRappel: "",
    lienVisioRappel: "",
    importance: "",
    couleurRappel: "#FF6B6B",
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showEcoleDropdown, setShowEcoleDropdown] = useState(false);
  const [showVisibiliteDropdown, setShowVisibiliteDropdown] = useState(false);
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Initialiser le type depuis l'URL si présent
  useEffect(() => {
    const typeFromUrl = getTypeFromUrl();
    if (typeFromUrl && !formData.type) {
      handleInputChange("type", typeFromUrl);
    }
  }, []);

  // Mettre à jour l'URL quand le type change ou quand on passe à l'étape 2
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      if (currentStep === 2 && formData.type) {
        // Si on est à l'étape 2 et qu'on a un type, mettre le type dans l'URL
        params.set('type', formData.type);
      } else {
        // Sinon, supprimer le paramètre type
        params.delete('type');
      }
      
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [currentStep, formData.type, router]);

  // Écouter les changements d'URL (pour le bouton retour du navigateur)
  useEffect(() => {
    const handlePopState = () => {
      const type = getTypeFromUrl();
      const step = type ? 2 : 1;
      setCurrentStep(step);
      if (type && !formData.type) {
        handleInputChange("type", type);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [formData.type]);

  const eventTypes = [
    { value: "evenement", label: "Événement" },
    { value: "rendezvous", label: "Rendez-vous" },
    { value: "rappel", label: "Rappel" },
  ];

  const ecoles = ["KEOS", "1001", "EDIFICE", "Toutes les écoles"];
  const visibiliteOptions = [
    { value: "plateforme", label: "Toute la plateforme" },
    { value: "ecole", label: "École uniquement" },
  ];
  const participantsOptions = [
    { value: "etudiants", label: "Étudiants" },
    { value: "formateurs", label: "Formateurs" },
    { value: "promo", label: "Promo" },
    { value: "ecole", label: "Toute l'école" },
  ];
  const recurrenceOptions = [
    "Tous les jours",
    "Toutes les semaines",
    "Tous les mois",
    "Tous les ans",
    "Une seule fois",
  ];
  const couleurs = [
    "#FF6B6B", "#FFA500", "#FFD700", "#90EE90", "#032622", "#87CEEB", "#9370DB", "#FF69B4"
  ];

  const mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const currentYear = new Date().getFullYear();
  const annees = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateInput = (field: "jour" | "mois" | "annee", value: string) => {
    // Ne garder que les chiffres
    const numericValue = value.replace(/\D/g, '');
    
    if (field === "jour") {
      // Maximum 2 chiffres pour le jour
      const dayValue = numericValue.slice(0, 2);
      handleInputChange("jour", dayValue);
      
      // Si on a 2 chiffres, passer au mois
      if (dayValue.length === 2) {
        setTimeout(() => {
          document.getElementById("mois-input")?.focus();
        }, 10);
      }
    } else if (field === "mois") {
      // Maximum 2 chiffres pour le mois
      const monthValue = numericValue.slice(0, 2);
      handleInputChange("mois", monthValue);
      
      // Si on a 2 chiffres, passer à l'année
      if (monthValue.length === 2) {
        setTimeout(() => {
          document.getElementById("annee-input")?.focus();
        }, 10);
      }
    } else if (field === "annee") {
      // Maximum 4 chiffres pour l'année
      const yearValue = numericValue.slice(0, 4);
      handleInputChange("annee", yearValue);
      
      // Si on a 4 chiffres, passer à l'heure de début
      if (yearValue.length === 4) {
        setTimeout(() => {
          document.getElementById("heure-debut-input")?.focus();
        }, 10);
      }
    }
  };

  const handleTimeInput = (field: "heureDebut" | "heureFin", value: string) => {
    // Ne garder que les chiffres
    const numericValue = value.replace(/\D/g, '');
    
    // Format HH:MM
    let formattedValue = numericValue.slice(0, 4);
    
    // Ajouter les deux-points après 2 chiffres
    if (formattedValue.length >= 2) {
      formattedValue = formattedValue.slice(0, 2) + ':' + formattedValue.slice(2, 4);
    }
    
    handleInputChange(field, formattedValue);
    
    // Si on a le format complet HH:MM, passer au champ suivant
    if (formattedValue.length === 5 && field === "heureDebut") {
      setTimeout(() => {
        document.getElementById("heure-fin-input")?.focus();
      }, 10);
    }
  };

  const handleFileUpload = (field: "photoCouverture" | "fichiersRendezVous", file: File | FileList) => {
    if (field === "photoCouverture" && file instanceof File) {
      setFormData(prev => ({ ...prev, photoCouverture: file }));
      const reader = new FileReader();
      reader.onload = (e) => setSelectedCoverImage(e.target?.result as string);
      reader.readAsDataURL(file);
    } else if (field === "fichiersRendezVous" && file instanceof FileList) {
      const filesArray = Array.from(file);
      setFormData(prev => ({ ...prev, fichiersRendezVous: [...prev.fichiersRendezVous, ...filesArray] }));
      setSelectedFiles(prev => [...prev, ...filesArray.map(f => f.name)]);
    }
  };

  const handleAddIntervenant = () => {
    const newIntervenant: Intervenant = {
      id: `intervenant-${Date.now()}`,
      nom: "",
      prenom: "",
      poste: "",
      photo: null,
    };
    setFormData(prev => ({
      ...prev,
      intervenants: [...prev.intervenants, newIntervenant]
    }));
  };

  const handleRemoveIntervenant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      intervenants: prev.intervenants.filter(i => i.id !== id)
    }));
  };

  const handleIntervenantChange = (id: string, field: keyof Intervenant, value: string) => {
    setFormData(prev => ({
      ...prev,
      intervenants: prev.intervenants.map(i =>
        i.id === id ? { ...i, [field]: value } : i
      )
    }));
  };

  const getDateError = () => {
    if (!formData.jour || !formData.mois || !formData.annee) {
      return "";
    }

    const day = parseInt(formData.jour);
    const month = parseInt(formData.mois) - 1;
    const year = parseInt(formData.annee);
    
    // Vérifier que la date est valide
    const eventDate = new Date(year, month, day);
    if (eventDate.getDate() !== day || eventDate.getMonth() !== month || eventDate.getFullYear() !== year) {
      return "Date invalide";
    }

    // Vérifier que la date n'est pas passée
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate < now) {
      return "La date ne peut pas être dans le passé";
    }

    return "";
  };

  const getTimeError = () => {
    if (!formData.heureDebut || !formData.heureFin) {
      return "";
    }

    // Vérifier le format de l'heure (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.heureDebut) || !timeRegex.test(formData.heureFin)) {
      return "Format d'heure invalide (HH:MM)";
    }

    // Si la date est aujourd'hui, vérifier que l'heure de début n'est pas passée
    if (formData.jour && formData.mois && formData.annee) {
      const day = parseInt(formData.jour);
      const month = parseInt(formData.mois) - 1;
      const year = parseInt(formData.annee);
      const eventDate = new Date(year, month, day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate.getTime() === now.getTime()) {
        const [startHours, startMinutes] = formData.heureDebut.split(':').map(Number);
        const currentTime = new Date();
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const startMinutesTotal = startHours * 60 + startMinutes;
        
        if (startMinutesTotal < currentMinutes) {
          return "L'heure de début ne peut pas être dans le passé";
        }
      }
    }

    // Vérifier que l'heure de fin est après l'heure de début
    const [startHours, startMinutes] = formData.heureDebut.split(':').map(Number);
    const [endHours, endMinutes] = formData.heureFin.split(':').map(Number);
    const startMinutesTotal = startHours * 60 + startMinutes;
    const endMinutesTotal = endHours * 60 + endMinutes;

    if (endMinutesTotal <= startMinutesTotal) {
      return "L'heure de fin doit être après l'heure de début";
    }

    return "";
  };

  const validateDateAndTime = () => {
    const dateError = getDateError();
    const timeError = getTimeError();
    
    if (dateError || timeError) {
      return { valid: false, error: dateError || timeError };
    }

    return { valid: true, error: "" };
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (formData.titre && formData.type && formData.jour && formData.mois && formData.annee && 
          formData.heureDebut && formData.heureFin && formData.ecole && formData.visibilite) {
        // Valider la date et l'heure
        const validation = validateDateAndTime();
        if (!validation.valid) {
          // Les messages d'erreur sont déjà affichés sous les champs
          return;
        }
        setCurrentStep(2);
      }
    }
  };

  const handleCreate = async () => {
    try {
      // Préparer les données pour l'API
      const eventData: any = {
        type: formData.type,
        titre: formData.titre,
        date_event: `${formData.annee}-${formData.mois.padStart(2, '0')}-${formData.jour.padStart(2, '0')}`,
        heure_debut: formData.heureDebut,
        heure_fin: formData.heureFin,
        lieu: formData.lieu || null,
        ecole: formData.ecole,
        visibilite: formData.visibilite,
      };

      // Ajouter les champs spécifiques selon le type
      if (formData.type === 'evenement') {
        eventData.description_event = formData.description || null;
        eventData.lien_visio_event = formData.lienVisio || null;
        eventData.participants_event = formData.participants || null;
        
        // Gérer la photo de couverture (si c'est un File, il faudra l'uploader d'abord)
        // Pour l'instant, on suppose que c'est déjà un chemin
        if (formData.photoCouverture) {
          // TODO: Uploader le fichier et récupérer le chemin
          // eventData.photo_couverture = uploadedPath;
        }

        // Intervenants
        if (formData.intervenants && formData.intervenants.length > 0) {
          eventData.intervenants = formData.intervenants.map((inter) => ({
            nom: inter.nom,
            prenom: inter.prenom,
            poste: inter.poste,
            photo: inter.photo, // TODO: Uploader les photos si ce sont des fichiers
          }));
        }
      } else if (formData.type === 'rendezvous') {
        eventData.motif_rendez_vous = formData.motifRendezVous || null;
        eventData.couleur_rendez_vous = formData.couleurRendezVous || '#9370DB';
        eventData.lien_visio_rendez_vous = formData.lienVisio || null;
        eventData.participants_rendez_vous = formData.participants || null;

        // Fichiers
        if (formData.fichiersRendezVous && formData.fichiersRendezVous.length > 0) {
          // TODO: Uploader les fichiers et récupérer les chemins
          // eventData.fichiers = uploadedFiles;
        }
      } else if (formData.type === 'rappel') {
        eventData.titre_rappel = formData.titreRappel || null;
        eventData.recurrence = formData.recurrence || null;
        eventData.description_rappel = formData.descriptionRappel || null;
        eventData.lien_visio_rappel = formData.lienVisioRappel || null;
        eventData.importance = formData.importance || null;
        eventData.couleur_rappel = formData.couleurRappel || '#808080';
      }

      // Appeler l'API
      const response = await fetch('/api/espace-admin/agenda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de l\'événement');
      }

      const result = await response.json();
      
      if (result.success) {
        // Nettoyer l'URL avant de fermer
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          params.delete('type');
          const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
          router.replace(newUrl, { scroll: false });
        }
        
        // Appeler le callback
        onSubmit(result.data);
        onClose();
      } else {
        throw new Error(result.error || 'Erreur lors de la création de l\'événement');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la création de l\'événement');
    }
  };
  
  const handleClose = () => {
    // Nettoyer l'URL avant de fermer
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('type');
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
    onClose();
  };

  const canProceedStep1 = () => {
    const hasAllFields = formData.titre && formData.type && formData.jour && formData.mois && 
      formData.annee && formData.heureDebut && formData.heureFin && formData.ecole && formData.visibilite;
    
    if (!hasAllFields) return false;
    
    const validation = validateDateAndTime();
    return validation.valid;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#F8F5E4] w-full max-w-6xl max-h-[90vh] overflow-y-auto border-2 border-[#032622]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#032622]">
          <h2 className="text-4xl font-bold text-[#032622]" style={{ fontFamily: "var(--font-termina-bold)" }}>
            {currentStep === 1 ? "CRÉER L'EVENT" : 
             formData.type === "evenement" ? "ÉVÉNEMENT" :
             formData.type === "rendezvous" ? "RENDEZ-VOUS" : "RAPPEL"}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 border border-[#032622] flex items-center justify-center hover:bg-[#eae5cf] transition-colors"
          >
            <X className="w-5 h-5 text-[#032622]" />
          </button>
        </div>

        {/* Étape 1 - Informations de base */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            {/* Titre */}
            <input
              type="text"
              placeholder="Titre"
              value={formData.titre}
              onChange={(e) => handleInputChange("titre", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Type d'événement */}
            <div className="relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.type ? eventTypes.find(t => t.value === formData.type)?.label : "Type d'event"}</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {showTypeDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#F8F5E4] border border-[#032622] shadow-lg max-h-60 overflow-y-auto">
                  {eventTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        handleInputChange("type", type.value);
                        setShowTypeDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-[#eae5cf] text-[#032622]"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  id="jour-input"
                  type="text"
                  placeholder="Jour*"
                  value={formData.jour}
                  onChange={(e) => handleDateInput("jour", e.target.value)}
                  maxLength={2}
                  className={`px-4 py-3 border ${
                    getDateError() ? "border-red-500" : "border-[#032622]"
                  } bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  id="mois-input"
                  type="text"
                  placeholder="Mois*"
                  value={formData.mois}
                  onChange={(e) => handleDateInput("mois", e.target.value)}
                  maxLength={2}
                  className={`px-4 py-3 border ${
                    getDateError() ? "border-red-500" : "border-[#032622]"
                  } bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  id="annee-input"
                  type="text"
                  placeholder="Année*"
                  value={formData.annee}
                  onChange={(e) => handleDateInput("annee", e.target.value)}
                  maxLength={4}
                  className={`px-4 py-3 border ${
                    getDateError() ? "border-red-500" : "border-[#032622]"
                  } bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {getDateError() && (
                <p className="text-red-600 text-xs mt-1 ml-1">{getDateError()}</p>
              )}
            </div>

            {/* Heures */}
            <div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  id="heure-debut-input"
                  type="text"
                  placeholder="Heure de début* (HH:MM)"
                  value={formData.heureDebut}
                  onChange={(e) => handleTimeInput("heureDebut", e.target.value)}
                  maxLength={5}
                  className={`px-4 py-3 border ${
                    getTimeError() ? "border-red-500" : "border-[#032622]"
                  } bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  id="heure-fin-input"
                  type="text"
                  placeholder="Heure de fin* (HH:MM)"
                  value={formData.heureFin}
                  onChange={(e) => handleTimeInput("heureFin", e.target.value)}
                  maxLength={5}
                  className={`px-4 py-3 border ${
                    getTimeError() ? "border-red-500" : "border-[#032622]"
                  } bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {getTimeError() && (
                <p className="text-red-600 text-xs mt-1 ml-1">{getTimeError()}</p>
              )}
            </div>

            {/* Lieu */}
            <input
              type="text"
              placeholder="Lieu"
              value={formData.lieu}
              onChange={(e) => handleInputChange("lieu", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* École */}
            <div className="relative">
              <button
                onClick={() => setShowEcoleDropdown(!showEcoleDropdown)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.ecole || "Écoles"}</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {showEcoleDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#F8F5E4] border border-[#032622] shadow-lg max-h-60 overflow-y-auto">
                  {ecoles.map((ecole) => (
                    <button
                      key={ecole}
                      onClick={() => {
                        handleInputChange("ecole", ecole);
                        setShowEcoleDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-[#eae5cf] text-[#032622]"
                    >
                      {ecole}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Visibilité */}
            <div className="relative">
              <button
                onClick={() => setShowVisibiliteDropdown(!showVisibiliteDropdown)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.visibilite ? visibiliteOptions.find(v => v.value === formData.visibilite)?.label : "Visibilité"}</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {showVisibiliteDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#F8F5E4] border border-[#032622] shadow-lg max-h-60 overflow-y-auto">
                  {visibiliteOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleInputChange("visibilite", option.value);
                        setShowVisibiliteDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-[#eae5cf] text-[#032622]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton Suivant */}
            <button
              onClick={handleNext}
              disabled={!canProceedStep1()}
              className={`w-full py-3 font-bold text-white ${
                canProceedStep1() ? "bg-[#032622] hover:bg-[#032622]/90" : "bg-gray-400 cursor-not-allowed"
              } transition-colors`}
            >
              SUIVANT
            </button>
          </div>
        )}

        {/* Étape 2 - Détails selon le type */}
        {currentStep === 2 && formData.type === "evenement" && (
          <div className="p-6 space-y-8">
            {/* Photo de couverture */}
            <div>
              <label className="block text-sm font-semibold text-[#032622] mb-2">
                IMPORTER UNE IMAGE DE COUVERTURE
              </label>
              <div className="border-2 border-dashed border-[#032622] p-8 text-center">
                <p className="text-[#032622] mb-4">Déposez les fichiers ici ou</p>
                <label className="inline-block px-4 py-2 bg-[#032622] text-white cursor-pointer hover:bg-[#032622]/90">
                  Sélectionnez des fichiers
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("photoCouverture", e.target.files[0])}
                  />
                </label>
              </div>
              {selectedCoverImage && (
                <div className="mt-2 flex items-center justify-between p-3 bg-[#F8F5E4] border border-[#032622]">
                  <span className="text-sm text-[#032622]">images de couverture.png</span>
                  <button
                    onClick={() => {
                      setSelectedCoverImage(null);
                      handleInputChange("photoCouverture", null);
                    }}
                    className="text-[#032622] hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#032622] mb-2">
                Description de l'événement
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description de l'événement"
              />
            </div>

            {/* Lien visio */}
            <input
              type="text"
              placeholder="Lien de la visio-conférence"
              value={formData.lienVisio}
              onChange={(e) => handleInputChange("lienVisio", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Participants */}
            <div className="relative">
              <label className="block text-sm font-semibold text-[#032622] mb-2">
                Participant(s)
              </label>
              <button
                onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.participants ? participantsOptions.find(p => p.value === formData.participants)?.label : "Participant(s)"}</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {showParticipantsDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-[#F8F5E4] border border-[#032622]">
                  {participantsOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleInputChange("participants", option.value);
                        setShowParticipantsDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-[#eae5cf] text-[#032622]"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Intervenants */}
            {formData.intervenants.map((intervenant, index) => (
              <div key={intervenant.id} className="border border-[#032622] p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-[#032622]">
                    DÉTAILS DES L'INTERVENANTS
                  </label>
                  {formData.intervenants.length > 1 && (
                    <button
                      onClick={() => handleRemoveIntervenant(intervenant.id)}
                      className="text-[#032622] hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="w-24 h-24 border border-[#032622] bg-gray-100 flex items-center justify-center relative">
                    <Camera className="w-8 h-8 text-gray-400" />
                    <label className="absolute top-1 left-1 w-6 h-6 bg-[#032622] text-white flex items-center justify-center cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Nom*"
                      value={intervenant.nom}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "nom", e.target.value)}
                      className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Prénom*"
                      value={intervenant.prenom}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "prenom", e.target.value)}
                      className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Poste"
                      value={intervenant.poste}
                      onChange={(e) => handleIntervenantChange(intervenant.id, "poste", e.target.value)}
                      className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleAddIntervenant}
              className="w-full py-2 border-2 border-[#032622] text-[#032622] font-semibold flex items-center justify-center gap-2 hover:bg-[#eae5cf] transition-colors"
            >
              <Plus className="w-5 h-5" />
              AJOUTER UN INTERVENANT
            </button>

            <button
              onClick={handleCreate}
              className="w-full py-3 bg-[#032622] text-white font-bold hover:bg-[#032622]/90 transition-colors"
            >
              CRÉER L'ÉVÉNEMENT
            </button>
          </div>
        )}

        {/* Étape 2 - Rendez-vous */}
        {currentStep === 2 && formData.type === "rendezvous" && (
          <div className="p-6 space-y-6">
            <input
              type="text"
              placeholder="Lien de la visio-conférence"
              value={formData.lienVisio}
              onChange={(e) => handleInputChange("lienVisio", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Motif du rendez-vous"
              value={formData.motifRendezVous}
              onChange={(e) => handleInputChange("motifRendezVous", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Participant(s)"
              value={formData.participants}
              onChange={(e) => handleInputChange("participants", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Upload fichiers */}
            <div className="border-2 border-dashed border-[#032622] p-8 text-center">
              <p className="text-[#032622] mb-4">Déposez les fichiers ici ou</p>
              <label className="inline-block px-4 py-2 border border-[#032622] text-[#032622] cursor-pointer hover:bg-[#eae5cf]">
                Sélectionnez des fichiers
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload("fichiersRendezVous", e.target.files)}
                />
              </label>
            </div>

            {/* Sélecteur de couleur */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-[#032622]">Choisir la couleur :</label>
              <div className="flex gap-2">
                {couleurs.map((couleur) => (
                  <button
                    key={couleur}
                    onClick={() => handleInputChange("couleurRendezVous", couleur)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.couleurRendezVous === couleur ? "border-[#032622]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: couleur }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 bg-[#032622] text-white font-bold hover:bg-[#032622]/90 transition-colors"
            >
              CRÉER LE RENDEZ-VOUS
            </button>
          </div>
        )}

        {/* Étape 2 - Rappel */}
        {currentStep === 2 && formData.type === "rappel" && (
          <div className="p-6 space-y-6">
            <input
              type="text"
              placeholder="Titre du rappel"
              value={formData.titreRappel}
              onChange={(e) => handleInputChange("titreRappel", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="relative">
              <button
                onClick={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
                className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{formData.recurrence || "Récurrence"}</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {showRecurrenceDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-[#F8F5E4] border border-[#032622] shadow-lg max-h-60 overflow-y-auto">
                  {recurrenceOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        handleInputChange("recurrence", option);
                        setShowRecurrenceDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-[#eae5cf] text-[#032622]"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Description"
              value={formData.descriptionRappel}
              onChange={(e) => handleInputChange("descriptionRappel", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Lien"
              value={formData.lienVisioRappel}
              onChange={(e) => handleInputChange("lienVisioRappel", e.target.value)}
              className="w-full px-4 py-3 border border-[#032622] bg-[#F8F5E4] text-[#032622] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Importance */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-[#032622]">Importance :</label>
              <div className="flex gap-2">
                {(["!", "!!", "!!!"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleInputChange("importance", level)}
                    className={`w-10 h-10 border-2 border-[#032622] flex items-center justify-center font-bold ${
                      formData.importance === level
                        ? "bg-[#032622] text-white"
                        : "bg-white text-[#032622]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélecteur de couleur */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-[#032622]">Choisir la couleur :</label>
              <div className="flex gap-2">
                {couleurs.map((couleur) => (
                  <button
                    key={couleur}
                    onClick={() => handleInputChange("couleurRappel", couleur)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.couleurRappel === couleur ? "border-[#032622]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: couleur }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full py-3 bg-[#032622] text-white font-bold hover:bg-[#032622]/90 transition-colors"
            >
              CRÉER LE RAPPEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEventModal;
