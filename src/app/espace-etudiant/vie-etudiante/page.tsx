'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  User,
  Search,
  Plus,
  ChevronDown,
  MessageSquare,
  Tag,
  Send,
  ShieldCheck,
  Users,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';

const stats = [
  {
    id: 'active-discussions',
    title: 'Discussions actives',
    value: '112',
    icon: <MessageSquare className="w-5 h-5" />, 
  },
  {
    id: 'new-topics',
    title: 'Nouveaux sujets cette semaine',
    value: '200',
    icon: <TrendingUp className="w-5 h-5" />, 
  },
  {
    id: 'members',
    title: 'Membres au total',
    value: '200',
    icon: <Users className="w-5 h-5" />, 
  },
  {
    id: 'top-community',
    title: 'École la plus active',
    value: 'Digital Legacy',
    icon: <ShieldCheck className="w-5 h-5" />, 
  },
];

const moderationTasks = [
  {
    id: 'task-1',
    title: 'Signaler un post',
    description: 'Le message de Thomas a été signalé pour contenu inapproprié.',
  },
  {
    id: 'task-2',
    title: 'Nouvelle demande de sujet',
    description: 'Validation attendue pour la rubrique "Orientation".',
  },
  {
    id: 'task-3',
    title: 'Nouveau commentaire',
    description: 'Un commentaire nécessite ton approbation dans "Règles générales".',
  },
];

const filters = ['Sujet', 'Date', 'École', 'Trier par : plus récent'];

const topics = [
  {
    id: 'topic-1',
    title: 'Règles générales',
    badge: 'IMPORTANT',
    category: 'Vie du campus',
    school: 'Digital Legacy',
    excerpt: "Rappel des règles de bonne conduite dans les échanges du forum...",
    author: 'Ymir Fritz',
    responses: 54,
    views: 274,
    updated: 'Il y a 2 jours',
    date: new Date('2025-10-11'),
  },
  {
    id: 'topic-2',
    title: 'Comment réussir son alternance à distance ?',
    badge: 'FAQ',
    category: 'Expériences',
    school: 'KEOS Business School',
    excerpt: "Partage de méthodes pour garder le lien avec l'entreprise...",
    author: 'Louise M.',
    responses: 70,
    views: 321,
    updated: 'Il y a 5 jours',
    date: new Date('2025-10-08'),
  },
  {
    id: 'topic-3',
    title: "Vos meilleurs conseils pour la mémoire de fin d'année",
    badge: 'DOSSIER',
    category: 'Cours & examens',
    school: 'Leader Society',
    excerpt: "Compilation d'astuces pour structurer et planifier la rédaction...",
    author: 'Mouhamed A.',
    responses: 23,
    views: 189,
    updated: 'Il y a 1 jour',
    date: new Date('2025-10-12'),
  },
  {
    id: 'topic-4',
    title: 'Comment utiliser la filière efficacement ?',
    badge: 'RESSOURCE',
    category: 'Outils & plateformes',
    school: 'Digital Legacy',
    excerpt: "Découvre le pas-à-pas pour naviguer sur la plateforme...",
    author: 'Claire T.',
    responses: 46,
    views: 205,
    updated: 'Il y a 3 jours',
    date: new Date('2025-10-10'),
  },
  {
    id: 'topic-5',
    title: 'Vos applis préférées pour mieux organiser son quotidien ?',
    badge: 'SONDAGE',
    category: 'Vie du campus',
    school: 'Finance Academy',
    excerpt: "Partage de bonnes pratiques pour gérer son agenda...",
    author: 'Julien R.',
    responses: 12,
    views: 87,
    updated: 'Il y a 6 heures',
    date: new Date('2025-10-13'),
  },
  {
    id: 'topic-6',
    title: 'Bug sur le quiz du bloc 2 ?',
    badge: 'ASSISTANCE',
    category: 'Support',
    school: 'Digital Legacy',
    excerpt: "Certains étudiants ne peuvent pas valider la question 7...",
    author: 'Anissa P.',
    responses: 9,
    views: 45,
    updated: 'Il y a 8 heures',
    date: new Date('2025-10-13'),
  },
];

const recommendedTags = [
  'Alternance',
  'Communication',
  'Data',
  'Innovation',
  'Événements',
  'Leadership',
  'Productivité',
  'Accompagnement',
];

const messages = [
  {
    id: 'message-1',
    author: 'Canal Legacy Society',
    time: 'Aujourd’hui · 09h45',
    content: 'Quelqu’un peut confirmer l’heure exacte de la masterclass ? J’ai reçu deux invitations différentes.',
    isAlert: true,
  },
  {
    id: 'message-2',
    author: 'Canal Responsables de Blocs',
    time: 'Hier · 18h12',
    content: 'Le replay du coaching leadership est disponible. Merci de le diffuser à vos promotions.',
    isAlert: false,
  },
];

export default function VieEtudiantePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'responses'>('recent');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  // Extraire les valeurs uniques pour les filtres
  const badges = useMemo(() => Array.from(new Set(topics.map(t => t.badge))), []);
  const categories = useMemo(() => Array.from(new Set(topics.map(t => t.category))), []);
  const schools = useMemo(() => Array.from(new Set(topics.map(t => t.school))), []);

  // Filtrer et trier les topics
  const filteredTopics = useMemo(() => {
    let filtered = topics.filter(topic => {
      const matchSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBadge = !selectedBadge || topic.badge === selectedBadge;
      const matchCategory = !selectedCategory || topic.category === selectedCategory;
      const matchSchool = !selectedSchool || topic.school === selectedSchool;
      
      return matchSearch && matchBadge && matchCategory && matchSchool;
    });

    // Trier
    if (sortBy === 'recent') {
      filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'responses') {
      filtered.sort((a, b) => b.responses - a.responses);
    }

    return filtered;
  }, [searchQuery, selectedBadge, selectedCategory, selectedSchool, sortBy]);

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 bg-[#F8F5E4] text-[#032622] overflow-x-hidden max-w-full">
      {/* Top bar */}
          <header className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
            <button 
              className="relative p-1.5 sm:p-2 border border-[#032622] bg-[#F8F5E4] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-[#D96B6B] text-[9px] sm:text-[10px] text-white">
            2
          </span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3 border border-[#032622] bg-[#F8F5E4] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#032622]/10 flex-shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs uppercase font-semibold tracking-[0.2em] truncate">Ymir Fritz</p>
            <p className="text-[10px] sm:text-[11px] text-[#032622]/70 truncate">Étudiant · Digital Legacy</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] min-w-0 max-w-full">
        {/* Main column */}
        <div className="space-y-6 min-w-0 max-w-full overflow-x-hidden">
              {/* Stats */}
              <section className="border border-[#032622] bg-transparent p-4 sm:p-5 md:p-6">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-3 sm:mb-4">Statistiques</h2>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.id} className="border border-[#032622] bg-[#F8F5E4] px-3 sm:px-4 py-3 sm:py-4 md:py-5 flex items-center justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#032622]/60 truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ fontFamily: 'var(--font-termina-bold)' }}>{stat.value}</p>
                  </div>
                  <span className="text-[#032622]/50 flex-shrink-0 ml-2">{stat.icon}</span>
                </div>
              ))}
            </div>
          </section>

              {/* Filters */}
              <section className="space-y-2 sm:space-y-3">
                <div className="relative border border-[#032622] bg-[#F8F5E4]">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#032622]/50" />
              <input
                type="text"
                placeholder="Recherche"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 bg-transparent pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm uppercase tracking-[0.2em] text-[#032622] placeholder-[#032622]/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={() => setShowNewTopicModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#032622] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] border border-[#032622] hover:bg-[#01302C] active:bg-[#012a26] transition-colors"
              >
                <Plus className="w-3 h-3" /> Nouveau
              </button>

              {/* Filtre Sujet */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 sm:gap-2 border border-[#032622] bg-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#032622]/70 hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors whitespace-nowrap">
                  Sujet {selectedBadge && `: ${selectedBadge}`}
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>
                <div className="absolute top-full mt-1 left-0 bg-[#F8F5E4] border border-[#032622] min-w-[180px] sm:min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                  <button
                    onClick={() => setSelectedBadge('')}
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors"
                  >
                    Tous
                  </button>
                  {badges.map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setSelectedBadge(badge)}
                      className={`w-full text-left px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors ${
                        selectedBadge === badge ? 'bg-[#032622] text-white' : ''
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre Date - Pas encore implémenté mais visuel */}
              <button className="flex items-center gap-1.5 sm:gap-2 border border-[#032622] bg-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#032622]/70 hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors whitespace-nowrap">
                Date
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>

              {/* Filtre École */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 sm:gap-2 border border-[#032622] bg-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#032622]/70 hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors whitespace-nowrap">
                  École {selectedSchool && `: ${selectedSchool}`}
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>
                <div className="absolute top-full mt-1 left-0 bg-[#F8F5E4] border border-[#032622] min-w-[220px] sm:min-w-[250px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                  <button
                    onClick={() => setSelectedSchool('')}
                    className="w-full text-left px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors"
                  >
                    Toutes
                  </button>
                  {schools.map((school) => (
                    <button
                      key={school}
                      onClick={() => setSelectedSchool(school)}
                      className={`w-full text-left px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors ${
                        selectedSchool === school ? 'bg-[#032622] text-white' : ''
                      }`}
                    >
                      {school}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtre Trier par */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 sm:gap-2 border border-[#032622] bg-[#F8F5E4] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#032622]/70 hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors whitespace-nowrap">
                  Trier par : {sortBy === 'recent' ? 'plus récent' : sortBy === 'popular' ? 'populaire' : 'réponses'}
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                </button>
                <div className="absolute top-full mt-1 left-0 bg-[#F8F5E4] border border-[#032622] min-w-[180px] sm:min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`w-full text-left px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors ${
                      sortBy === 'recent' ? 'bg-[#032622] text-white' : ''
                    }`}
                  >
                    Plus récent
                  </button>
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`w-full text-left px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors ${
                      sortBy === 'popular' ? 'bg-[#032622] text-white' : ''
                    }`}
                  >
                    Plus populaire
                  </button>
                  <button
                    onClick={() => setSortBy('responses')}
                    className={`w-full text-left px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white transition-colors ${
                      sortBy === 'responses' ? 'bg-[#032622] text-white' : ''
                    }`}
                  >
                    Plus de réponses
                  </button>
                </div>
              </div>
            </div>
          </section>

              {/* Topics list */}
              <section className="space-y-2 sm:space-y-3">
                {filteredTopics.length === 0 && (
                  <div className="border border-[#032622] bg-[#F8F5E4] p-6 sm:p-8 text-center">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#032622]/60">
                      Aucun sujet trouvé
                    </p>
                  </div>
                )}
                {filteredTopics.map((topic) => (
                  <article key={topic.id} className="border border-[#032622] bg-[#F8F5E4] p-3 sm:p-4 space-y-2 sm:space-y-3 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="border border-[#032622] px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.3em] text-[#032622] whitespace-nowrap">
                      {topic.badge}
                    </span>
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#032622]/60">
                      {topic.category}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#032622]/60 whitespace-nowrap">
                    {topic.updated}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold uppercase break-words" style={{ fontFamily: 'var(--font-termina-bold)' }}>
                  {topic.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#032622]/70 break-words">
                  {topic.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#032622]/60">
                  <span className="whitespace-nowrap">{topic.author}</span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <MessageSquare className="w-3 h-3" /> {topic.responses}
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <TrendingUp className="w-3 h-3" /> {topic.views}
                  </span>
                </div>
              </article>
            ))}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6 min-w-0 max-w-full overflow-x-hidden">
              {/* Moderation */}
              <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">Modération</h2>
              <button 
                onClick={() => console.log('Voir toutes les tâches de modération')}
                className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#032622]/60 hover:text-[#032622] active:text-[#032622]/80 transition-colors whitespace-nowrap"
              >
                Tout voir
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
                  {moderationTasks.map((task) => (
                    <div key={task.id} className="border border-[#032622] p-2 sm:p-3 bg-white space-y-1.5 sm:space-y-2">
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] break-words">{task.title}</p>
                      <p className="text-[10px] sm:text-[11px] text-[#032622]/70 leading-relaxed break-words">{task.description}</p>
                      <button 
                        onClick={() => {/* TODO: Implémenter la visualisation de la tâche */}}
                        className="w-full border border-[#032622] bg-[#F8F5E4] py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors"
                      >
                        Voir
                      </button>
                    </div>
                  ))}
            </div>
          </section>

          {/* Recommended topics */}
          <section className="border border-[#032622] bg-[#F8F5E4] p-4 sm:p-5 space-y-3 sm:space-y-4">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">Sujets recommandés</h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {recommendedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="inline-flex items-center gap-1 border border-[#032622] bg-[#F8F5E4] px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors cursor-pointer"
                >
                  <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Messaging */}
          <section className="border border-[#032622] bg-[#F8F5E4]">
            <div className="border-b border-[#032622] p-3 sm:p-4 bg-[#F8F5E4]">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
                Messagerie
              </h2>
            </div>
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="border border-[#032622] bg-[#F8F5E4]">
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] ${message.isAlert ? 'bg-[#D96B6B] text-white' : 'bg-[#032622]/10 text-[#032622]'}`}>
                    <span className="truncate flex-1">{message.author}</span>
                    <span className="text-[9px] sm:text-[10px] whitespace-nowrap">{message.time}</span>
                  </div>
                  <div className="p-2 sm:p-3 text-xs sm:text-sm text-[#032622]/80 break-words">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-[#032622] px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 bg-[#F8F5E4]">
              <input
                type="text"
                placeholder="Tape ton message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && messageInput.trim()) {
                    // Logique d'envoi de message
                    console.log('Message envoyé:', messageInput);
                    setMessageInput('');
                  }
                }}
                className="flex-1 border border-[#032622] bg-[#F8F5E4] px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] placeholder-[#032622]/50 focus:outline-none focus:ring-2 focus:ring-[#032622]"
              />
              <button 
                onClick={() => {
                  if (messageInput.trim()) {
                    console.log('Message envoyé:', messageInput);
                    setMessageInput('');
                  }
                }}
                className="border border-[#032622] bg-[#032622] text-white px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-[#01302C] active:bg-[#012a26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                disabled={!messageInput.trim()}
                aria-label="Envoyer"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Bouton flottant messagerie */}
      <button
        onClick={() => console.log('Ouvrir la messagerie complète')}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-[#032622] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#01302C] active:bg-[#012a26] transition-colors z-40"
        aria-label="Ouvrir la messagerie"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Modal nouveau sujet */}
      {showNewTopicModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowNewTopicModal(false)}
        >
          <div 
            className="bg-[#F8F5E4] border-2 border-[#032622] w-full max-w-2xl p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 
                className="text-lg sm:text-xl md:text-2xl font-bold uppercase"
                style={{ fontFamily: 'var(--font-termina-bold)' }}
              >
                Nouveau sujet
              </h2>
              <button
                onClick={() => setShowNewTopicModal(false)}
                className="text-[#032622] hover:text-[#032622]/70 active:text-[#032622]/50 transition-colors p-1 text-xl sm:text-2xl"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  className="w-full border border-[#032622] bg-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#032622]"
                  placeholder="Titre de votre sujet"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
                  Catégorie
                </label>
                <select className="w-full border border-[#032622] bg-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#032622]">
                  <option>Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
                  Type
                </label>
                <select className="w-full border border-[#032622] bg-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#032622]">
                  <option>Sélectionner un type</option>
                  {badges.map((badge) => (
                    <option key={badge} value={badge}>{badge}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full border border-[#032622] bg-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#032622] resize-none"
                  placeholder="Décrivez votre sujet..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowNewTopicModal(false)}
                  className="border border-[#032622] bg-[#F8F5E4] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#032622] hover:text-white active:bg-[#032622]/80 transition-colors w-full sm:w-auto"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    console.log('Créer un nouveau sujet');
                    setShowNewTopicModal(false);
                  }}
                  className="bg-[#032622] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#01302C] active:bg-[#012a26] transition-colors w-full sm:w-auto"
                >
                  Publier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


