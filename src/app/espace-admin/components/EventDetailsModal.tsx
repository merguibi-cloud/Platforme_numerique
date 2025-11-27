"use client";

import { useState, useEffect } from "react";
import { X, Download, Trash2, Edit, Calendar, MapPin, Users, Clock } from "lucide-react";

interface EventDetails {
  id: string;
  title: string;
  type: "evenement" | "rendezvous" | "rappel";
  date: string;
  time: string;
  endTime?: string;
  lieu?: string;
  ecole?: string;
  created_by?: string;
  // Champs événement
  photoCouverture?: string;
  description?: string;
  lienVisio?: string;
  participants?: string;
  intervenants?: Array<{
    id: string;
    nom: string;
    prenom: string;
    poste?: string;
    photo_path?: string;
  }>;
  // Champs rendez-vous
  motif?: string;
  couleur?: string;
  fichiers?: Array<{
    id: string;
    nom_fichier: string;
    chemin_fichier: string;
  }>;
  // Champs rappel
  titreRappel?: string;
  recurrence?: string;
  descriptionRappel?: string;
  importance?: string;
  // Participants
  participantsList?: Array<{
    id: string;
    user_id: string;
    statut: string;
    user?: {
      nom?: string;
      prenom?: string;
      photo_profil?: string;
    };
  }>;
  isOwner?: boolean;
  currentUserParticipation?: {
    statut: string;
  };
}

interface EventDetailsModalProps {
  event: EventDetails | null;
  onClose: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
  currentUserId?: string;
}

const EventDetailsModal = ({ event, onClose, onUpdate, onDelete, currentUserId }: EventDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<"description" | "objectifs" | "supports" | "replay">("description");
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<EventDetails["participantsList"]>([]);

  useEffect(() => {
    if (event && event.type === "evenement") {
      loadParticipants();
    }
  }, [event]);

  const loadParticipants = async () => {
    if (!event) return;
    try {
      const response = await fetch(`/api/espace-admin/agenda/${event.id}/participants`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setParticipants(result.data || []);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des participants:", error);
    }
  };

  const handleConfirmRappel = async () => {
    if (!event) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/espace-admin/agenda/${event.id}/confirmer`, {
        method: "POST",
      });
      if (response.ok) {
        onUpdate?.();
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRendezvous = async () => {
    if (!event) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/espace-admin/agenda/${event.id}/accepter`, {
        method: "POST",
      });
      if (response.ok) {
        onUpdate?.();
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefuseRendezvous = async () => {
    if (!event) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/espace-admin/agenda/${event.id}/refuser`, {
        method: "POST",
      });
      if (response.ok) {
        onUpdate?.();
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors du refus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInscription = async () => {
    if (!event) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/espace-admin/agenda/${event.id}/inscrire`, {
        method: "POST",
      });
      if (response.ok) {
        await loadParticipants();
        onUpdate?.();
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDesinscription = async () => {
    if (!event) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/espace-admin/agenda/${event.id}/desinscrire`, {
        method: "POST",
      });
      if (response.ok) {
        await loadParticipants();
        onUpdate?.();
      }
    } catch (error) {
      console.error("Erreur lors de la désinscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/espace-admin/agenda/${event.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        onDelete?.();
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNames = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    const monthNames = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
    return `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const getSchoolConfig = (schoolName: string) => {
    const schoolConfigs: Record<string, { color: string; icon: string }> = {
      '1001': { color: '#8B4513', icon: '/logos/1001.png' },
      'EDIFICE': { color: '#FF7400', icon: '/logos/edifice.png' },
      'KEOS': { color: '#03B094', icon: '/logos/keos.png' },
      'LEADER SOCIETY': { color: '#DC143C', icon: '/logos/leader.png' },
      'DIGITAL LEGACY': { color: '#9A83FF', icon: '/logos/digital.png' },
      'FINANCE SOCIETY': { color: '#231BFA', icon: '/logos/finance.png' },
      'AFRICAN BUSINESS SCHOOL': { color: '#DC143C', icon: '/logos/leader.png' },
      'CREATIVE NATION': { color: '#9A83FF', icon: '/logos/digital.png' },
      'CSAM': { color: '#DC143C', icon: '/logos/leader.png' },
      'STUDIO CAMPUS': { color: '#9A83FF', icon: '/logos/digital.png' },
      'TALENT BUSINESS SCHOOL': { color: '#DC143C', icon: '/logos/talent.png' },
      'ELITE SOCIETY ONLINE': { color: '#DC143C', icon: '/logos/leader.png' }
    };
    return schoolConfigs[schoolName] || { color: '#032622', icon: '/logos/leader.png' };
  };

  // Vue RAPPEL
  if (event.type === "rappel") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
        <div className="bg-[#F8F5E4] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#032622]">
          <div className="sticky top-0 bg-[#F8F5E4] border-b-2 border-[#032622] p-8 flex justify-between items-start z-10">
            <h2 className="text-4xl font-bold text-[#032622] uppercase">RAPPEL</h2>
            <button onClick={onClose} className="text-[#032622] hover:opacity-70">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* TITRE */}
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-3">TITRE</label>
              <input
                type="text"
                value={event.titreRappel || event.title}
                readOnly
                className="w-full px-5 py-4 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
              />
            </div>

            {/* DATE */}
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-3">DATE</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={new Date(event.date).getDate()}
                  readOnly
                  className="w-16 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-center text-[#032622]"
                />
                <input
                  type="text"
                  value={new Date(event.date).toLocaleDateString('fr-FR', { month: 'long' })}
                  readOnly
                  className="w-32 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
                />
                <span className="text-[#032622] font-semibold">de</span>
                <input
                  type="text"
                  value={formatTime(event.time)}
                  readOnly
                  className="w-24 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-center text-[#032622]"
                />
                <span className="text-[#032622] font-semibold">à</span>
                <input
                  type="text"
                  value={event.endTime ? formatTime(event.endTime) : ""}
                  readOnly
                  className="w-24 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-center text-[#032622]"
                />
              </div>
            </div>

            {/* LIEU */}
            {event.lieu && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-3">LIEU</label>
                <input
                  type="text"
                  value={event.lieu}
                  readOnly
                  className="w-full px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
                />
              </div>
            )}

            {/* PARTICIPANTS */}
            {event.participants && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-2">PARTICIPANT(S)</label>
                <input
                  type="text"
                  value={event.participants}
                  readOnly
                  className="w-full px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
                />
              </div>
            )}

            {/* DESCRIPTION */}
            {event.descriptionRappel && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-3">DESCRIPTION</label>
                <textarea
                  value={event.descriptionRappel}
                  readOnly
                  rows={6}
                  className="w-full px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622] resize-none"
                />
              </div>
            )}

            {/* BOUTONS */}
            <div className="flex gap-4 pt-4">
              {event.isOwner ? (
                <>
                  <button
                    onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                    className="flex-1 px-6 py-3 bg-[#032622] text-white font-semibold rounded hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    MODIFIER
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    SUPPRIMER
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConfirmRappel}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-[#032622] text-white font-semibold rounded hover:opacity-90"
                >
                  CONFIRMER LE RAPPEL
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue RENDEZ-VOUS
  if (event.type === "rendezvous") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4">
        <div className="bg-[#F8F5E4] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#032622]">
          <div className="sticky top-0 bg-[#F8F5E4] border-b-2 border-[#032622] p-8 flex justify-between items-start z-10">
            <h2 className="text-4xl font-bold text-[#032622] uppercase">RENDEZ-VOUS</h2>
            <button onClick={onClose} className="text-[#032622] hover:opacity-70">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {/* SUJET */}
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-3">SUJET</label>
              <input
                type="text"
                value={event.title}
                readOnly
                className="w-full px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
              />
            </div>

            {/* DATE */}
            <div>
              <label className="block text-sm font-bold text-[#032622] uppercase mb-3">DATE</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={new Date(event.date).getDate()}
                  readOnly
                  className="w-16 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-center text-[#032622]"
                />
                <input
                  type="text"
                  value={new Date(event.date).toLocaleDateString('fr-FR', { month: 'long' })}
                  readOnly
                  className="w-32 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
                />
                <span className="text-[#032622] font-semibold">de</span>
                <input
                  type="text"
                  value={formatTime(event.time)}
                  readOnly
                  className="w-24 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-center text-[#032622]"
                />
                <span className="text-[#032622] font-semibold">à</span>
                <input
                  type="text"
                  value={event.endTime ? formatTime(event.endTime) : ""}
                  readOnly
                  className="w-24 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-center text-[#032622]"
                />
              </div>
            </div>

            {/* LIEN */}
            {event.lienVisio && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-3">LIEN</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={event.lienVisio}
                    readOnly
                    className="flex-1 px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622]"
                  />
                  <a
                    href={event.lienVisio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-[#032622] text-white font-semibold rounded hover:opacity-90"
                  >
                    REJOINDRE
                  </a>
                </div>
              </div>
            )}

            {/* PARTICIPANTS */}
            {event.participants && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-2">PARTICIPANT(S)</label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-gray-200 text-[#032622] rounded border border-[#032622]">
                    {event.participants}
                  </span>
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            {event.motif && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-3">DESCRIPTION</label>
                <textarea
                  value={event.motif}
                  readOnly
                  rows={6}
                  className="w-full px-4 py-3 bg-[#F8F5E4] border-2 border-[#032622] rounded text-[#032622] resize-none"
                />
              </div>
            )}

            {/* DOCUMENTS */}
            {event.fichiers && event.fichiers.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-[#032622] uppercase mb-3">DOCUMENTS RELATIFS</label>
                <div className="space-y-2">
                  {event.fichiers.map((fichier) => (
                    <div key={fichier.id} className="flex items-center gap-2 p-3 bg-[#F8F5E4] border-2 border-[#032622] rounded">
                      <span className="flex-1 text-[#032622]">{fichier.nom_fichier}</span>
                      <a
                        href={fichier.chemin_fichier}
                        download
                        className="text-[#032622] hover:opacity-70"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOUTONS */}
            <div className="flex gap-6 pt-6">
              {event.isOwner ? (
                <>
                  <button
                    onClick={() => {/* TODO: Ouvrir modal d'édition */}}
                    className="flex-1 px-8 py-4 bg-[#032622] text-white font-semibold rounded hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    MODIFIER
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 px-8 py-4 bg-red-600 text-white font-semibold rounded hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    SUPPRIMER
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAcceptRendezvous}
                    disabled={isLoading}
                    className="flex-1 px-8 py-4 bg-[#032622] text-white font-semibold rounded hover:opacity-90"
                  >
                    ACCEPTER LE RENDEZ-VOUS
                  </button>
                  <button
                    onClick={handleRefuseRendezvous}
                    disabled={isLoading}
                    className="flex-1 px-8 py-4 bg-red-600 text-white font-semibold rounded hover:opacity-90"
                  >
                    REFUSER LE RENDEZ-VOUS
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue ÉVÉNEMENT (Masterclass)
  const schoolConfig = event.ecole ? getSchoolConfig(event.ecole) : null;
  const isInscrit = participants?.some(p => p.user_id === currentUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8 border-2 border-[#032622]">
        {/* Header avec photo de couverture */}
        {event.photoCouverture && (
          <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${event.photoCouverture})` }}>
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-4 left-4 text-white text-4xl font-bold">
              {formatTime(event.time)}
            </div>
            {schoolConfig && (
              <div className="absolute bottom-4 left-4">
                <img src={schoolConfig.icon} alt={event.ecole} className="w-16 h-16 object-contain" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-[#032622] text-white hover:opacity-70 z-10 p-2 rounded border-2 border-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {/* Bouton de fermeture si pas de photo */}
        {!event.photoCouverture && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="bg-[#032622] text-white hover:opacity-70 p-2 rounded border-2 border-[#032622]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Titre et date */}
        <div className="bg-[#032622] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm uppercase mb-2">MASTERCLASS</div>
              <h2 className="text-3xl font-bold uppercase">{event.title}</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{new Date(event.date).getDate()}</div>
              <div className="text-sm uppercase">
                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Informations de l'événement */}
        <div className="bg-[#F8F5E4] p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[#032622]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(event.date)}, DE {formatTime(event.time)} À {event.endTime ? formatTime(event.endTime) : ""}</span>
              </div>
              {event.lieu && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.lieu}</span>
                </div>
              )}
            </div>
            {!isInscrit ? (
              <button
                onClick={handleInscription}
                disabled={isLoading}
                className="px-6 py-2 bg-[#032622] text-white font-semibold rounded hover:opacity-90"
              >
                S'INSCRIRE
              </button>
            ) : (
              <button
                onClick={handleDesinscription}
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded hover:opacity-90"
              >
                SE DÉSINSCRIRE
              </button>
            )}
          </div>

          {/* Intervenants et Participants */}
          <div className="flex items-start justify-between pt-6 border-t border-[#032622]">
            <div className="flex-1">
              <div className="font-bold text-[#032622] mb-2">INTERVENANT(S)</div>
              {event.intervenants && event.intervenants.length > 0 ? (
                <div className="space-y-2">
                  {event.intervenants.map((inter) => (
                    <div key={inter.id} className="flex items-center gap-2">
                      {inter.photo_path && (
                        <img src={inter.photo_path} alt={`${inter.prenom} ${inter.nom}`} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <div className="font-semibold text-[#032622]">
                          {inter.prenom} {inter.nom}
                        </div>
                        {inter.poste && (
                          <div className="text-sm text-[#032622]/70">{inter.poste}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[#032622]/70">Aucun intervenant</div>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-[#032622] mb-2">
                {participants?.length || 0} PARTICIPANTS
              </div>
              <div className="flex -space-x-2">
                {participants?.slice(0, 7).map((p) => (
                  <div key={p.id} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-[#032622]">
                    {p.user?.photo_profil ? (
                      <img src={p.user.photo_profil} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{p.user?.prenom?.[0]}{p.user?.nom?.[0]}</span>
                    )}
                  </div>
                ))}
                {participants && participants.length > 7 && (
                  <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs text-[#032622] font-bold">
                    +{participants.length - 7}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-[#F8F5E4] border-b-2 border-[#032622]">
          <div className="flex">
            {["description", "objectifs", "supports", "replay"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-semibold uppercase ${
                  activeTab === tab
                    ? "bg-[#032622] text-white"
                    : "bg-[#F8F5E4] text-[#032622] hover:bg-[#F8F5E4]/80"
                }`}
              >
                {tab === "description" ? "DESCRIPTION" : tab === "objectifs" ? "OBJECTIFS" : tab === "supports" ? "SUPPORTS COMPLÉMENTAIRE" : "REPLAY"}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="p-8 bg-white min-h-[200px]">
          {activeTab === "description" && (
            <div className="text-[#032622] whitespace-pre-line">
              {event.description || "Aucune description disponible."}
            </div>
          )}
          {activeTab === "objectifs" && (
            <div className="text-[#032622]">
              {/* TODO: Ajouter les objectifs dans la base de données */}
              Les objectifs seront affichés ici.
            </div>
          )}
          {activeTab === "supports" && (
            <div className="text-[#032622]">
              {/* TODO: Ajouter les supports dans la base de données */}
              Les supports complémentaires seront affichés ici.
            </div>
          )}
          {activeTab === "replay" && (
            <div className="text-[#032622]">
              {/* TODO: Ajouter le replay dans la base de données */}
              Le replay sera affiché ici.
            </div>
          )}
        </div>

        {/* Boutons d'action pour le propriétaire */}
        {event.isOwner && (
          <div className="p-8 bg-[#F8F5E4] border-t-2 border-[#032622] flex gap-6">
            <button
              onClick={() => {/* TODO: Ouvrir modal d'édition */}}
              className="flex-1 px-8 py-4 bg-[#032622] text-white font-semibold rounded hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" />
              MODIFIER
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-8 py-4 bg-red-600 text-white font-semibold rounded hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              SUPPRIMER
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsModal;

