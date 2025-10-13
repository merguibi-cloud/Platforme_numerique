"use client";

import { useState } from "react";
import { X, ChevronDown, Camera, Plus, Upload } from "lucide-react";

interface EventData {
  title: string;
  type: string;
  day: string;
  month: string;
  year: string;
  startTime: string;
  endTime: string;
  location: string;
  school: string;
  visibility: string;
  eventTitle: string;
  description: string;
  objective: string;
  coverImage: string | null;
  intervenants: Intervenant[];
}

interface Intervenant {
  id: string;
  nom: string;
  prenom: string;
  poste: string;
  photo: string | null;
}

interface CreateEventModalProps {
  onClose: () => void;
  onSubmit: (eventData: EventData) => void;
}

const CreateEventModal = ({ onClose, onSubmit }: CreateEventModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventData>({
    title: "",
    type: "",
    day: "",
    month: "",
    year: "",
    startTime: "",
    endTime: "",
    location: "",
    school: "",
    visibility: "",
    eventTitle: "",
    description: "",
    objective: "",
    coverImage: null,
    intervenants: [{
      id: "default-intervenant",
      nom: "",
      prenom: "",
      poste: "",
      photo: null,
    }],
  });

  const eventTypes = [
    "Cours",
    "Examen",
    "Réunion",
    "Atelier",
    "Événement",
    "Autre"
  ];

  const schools = [
    "KEOS",
    "1001",
    "EDIFICE",
    "Toutes les écoles"
  ];

  const visibilityOptions = [
    "Public",
    "Privé",
    "Formateurs uniquement",
    "Étudiants uniquement"
  ];

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const handleInputChange = (field: keyof EventData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && formData.title.trim()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

  const handleIntervenantChange = (id: string, field: keyof Intervenant, value: string) => {
    setFormData(prev => ({
      ...prev,
      intervenants: prev.intervenants.map(intervenant =>
        intervenant.id === id ? { ...intervenant, [field]: value } : intervenant
      )
    }));
  };

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file.name
      }));
    }
  };

  const handleRemoveCoverImage = () => {
    setFormData(prev => ({
      ...prev,
      coverImage: null
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-4xl bg-[#F8F5E4] border border-[#032622] p-6 relative">
        {/* Header avec titre et bouton fermer */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            {currentStep === 1 ? "CRÉER L'EVENT" : "ÉVÉNEMENT"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#032622] text-white flex items-center justify-center hover:bg-[#01302C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentStep === 1 ? (
          /* ÉTAPE 1: Informations de base */
          <div className="space-y-4">
            {/* Titre de l'event */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#032622]">
                Titre de l'event<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                placeholder="Nom de l'événement"
                required
              />
            </div>

            {/* Type d'event */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#032622]">
                Type d'event
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622] appearance-none pr-8"
                >
                  <option value="">Sélectionner un type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#032622] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#032622]">
                Date
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    value={formData.day}
                    onChange={(e) => handleInputChange("day", e.target.value)}
                    placeholder="Jour"
                    min="1"
                    max="31"
                    className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                  />
                </div>
                <div className="relative">
                  <select
                    value={formData.month}
                    onChange={(e) => handleInputChange("month", e.target.value)}
                    className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622] appearance-none pr-8"
                  >
                    <option value="">Mois</option>
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#032622] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622] appearance-none pr-8"
                  >
                    <option value="">Année</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#032622] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Heures */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#032622]">
                Horaires
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                  />
                </div>
              </div>
            </div>

            {/* Lieu */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#032622]">
                Lieu
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                placeholder="Salle, adresse..."
              />
            </div>

            {/* Écoles */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#032622]">
                Écoles
              </label>
              <div className="relative">
                <select
                  value={formData.school}
                  onChange={(e) => handleInputChange("school", e.target.value)}
                  className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622] appearance-none pr-8"
                >
                  <option value="">Sélectionner une école</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#032622] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Visible */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#032622]">
                Visible
              </label>
              <div className="relative">
                <select
                  value={formData.visibility}
                  onChange={(e) => handleInputChange("visibility", e.target.value)}
                  className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622] appearance-none pr-8"
                >
                  <option value="">Sélectionner la visibilité</option>
                  {visibilityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#032622] absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Bouton SUIVANT */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleNext}
                className="bg-[#032622] text-white px-8 py-3 font-semibold hover:bg-[#01302C] transition-colors"
              >
                SUIVANT
              </button>
            </div>
          </div>
        ) : (
          /* ÉTAPE 2: Détails de l'événement */
          <div className="space-y-6">
            {/* Image de couverture */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#032622]">
                IMPORTER UNE IMAGE DE COUVERTURE
              </h3>
              <div className="border-2 border-dashed border-[#032622]/40 bg-[#F8F5E4] p-8 text-center">
                <p className="text-sm text-[#032622]/70 mb-4">
                  Déposez les fichiers ici ou
                </p>
                <input
                  type="file"
                  id="cover-image"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cover-image"
                  className="inline-block border border-[#032622] px-4 py-2 text-sm text-[#032622] cursor-pointer hover:bg-[#eae5cf] transition-colors"
                >
                  Sélectionnez des fichiers
                </label>
              </div>
              {formData.coverImage && (
                <div className="flex items-center justify-between border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2">
                  <span className="text-sm text-[#032622]">{formData.coverImage}</span>
                  <button
                    onClick={handleRemoveCoverImage}
                    className="text-[#032622] hover:text-[#01302C]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Détails de l'événement */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#032622]">
                  Titre de l'événement
                </label>
                <input
                  type="text"
                  value={formData.eventTitle}
                  onChange={(e) => handleInputChange("eventTitle", e.target.value)}
                  className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                  placeholder="Titre détaillé de l'événement"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#032622]">
                  Description de l'événement
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                  placeholder="Description complète de l'événement..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#032622]">
                  Objectif de l'événement
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => handleInputChange("objective", e.target.value)}
                  rows={4}
                  className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                  placeholder="Objectifs et résultats attendus..."
                />
              </div>
            </div>

            {/* Détails des intervenants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#032622]">
                DÉTAILS DES L'INTERVENANTS
              </h3>

              {formData.intervenants.map((intervenant) => (
                <div key={intervenant.id} className="flex space-x-4">
                  {/* Photo placeholder */}
                  <div className="w-20 h-20 border border-[#032622]/40 bg-[#F8F5E4] flex items-center justify-center relative">
                    <div className="w-8 h-8 bg-[#032622] rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <button className="absolute top-1 left-1 w-6 h-6 bg-[#032622] text-white flex items-center justify-center hover:bg-[#01302C] transition-colors">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Informations intervenant */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold text-[#032622]">
                          Nom<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={intervenant.nom}
                          onChange={(e) => handleIntervenantChange(intervenant.id, "nom", e.target.value)}
                          className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                          placeholder="Nom de famille"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#032622]">
                          Prénom<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={intervenant.prenom}
                          onChange={(e) => handleIntervenantChange(intervenant.id, "prenom", e.target.value)}
                          className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                          placeholder="Prénom"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#032622]">
                        Poste
                      </label>
                      <input
                        type="text"
                        value={intervenant.poste}
                        onChange={(e) => handleIntervenantChange(intervenant.id, "poste", e.target.value)}
                        className="w-full border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
                        placeholder="Fonction ou poste"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddIntervenant}
                className="bg-[#032622] text-white px-4 py-2 text-sm font-semibold hover:bg-[#01302C] transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>AJOUTER UN INTERVENANT</span>
              </button>
            </div>

            {/* Boutons navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="border border-[#032622] text-[#032622] px-6 py-3 font-semibold hover:bg-[#eae5cf] transition-colors"
              >
                RETOUR
              </button>
              <button
                onClick={handleNext}
                className="bg-[#032622] text-white px-8 py-3 font-semibold hover:bg-[#01302C] transition-colors"
              >
                SUIVANT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEventModal;
