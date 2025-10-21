"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  ChevronRight,
  FileText,
  ImageIcon,
  MessageCircle,
  Plus,
  Share2,
  ThumbsUp,
  Upload,
  Video,
  X,
  XCircle,
} from "lucide-react";

type AttachmentType = "image" | "video" | "document" | "link";

interface Attachment {
  id: string;
  type: AttachmentType;
  label: string;
  url: string;
}

interface CommentItem {
  id: string;
  author: string;
  role: "Administrateur" | "Étudiant";
  message: string;
  date: string;
}

type PostStatus = "published" | "pending" | "rejected";

interface StudentLifePost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  authorRole: "Administrateur" | "Étudiant";
  date: string;
  submittedAt: string;
  status: PostStatus;
  attachments: Attachment[];
  likes: number;
  shares: number;
  comments: CommentItem[];
}

interface AttachmentDraft {
  type: AttachmentType;
  label: string;
  url: string;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatDateTime = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }) +
  " • " +
  date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const initialPosts: StudentLifePost[] = [
  {
    id: "post-1",
    title: "Journée portes ouvertes",
    summary:
      "Rencontrez nos équipes et découvrez les locaux lors d’une journée immersive dédiée aux nouvelles promotions.",
    content:
      "Nous ouvrons nos portes samedi 14 septembre pour une journée d’échanges et de rencontres. Au programme : visite guidée, ateliers découvertes, échanges avec les étudiants ambassadeurs et session de questions-réponses avec l’équipe pédagogique.",
    category: "Événement",
    author: "Équipe Pédagogique",
    authorRole: "Administrateur",
    date: "14 septembre 2025",
    submittedAt: "10 septembre 2025 • 09:20",
    status: "published",
    attachments: [
      {
        id: "att-1",
        type: "image",
        label: "Affiche officielle",
        url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
      },
      {
        id: "att-2",
        type: "video",
        label: "Teaser vidéo (YouTube)",
        url: "https://youtu.be/porte-ouverte",
      },
      {
        id: "att-3",
        type: "document",
        label: "Programme détaillé (PDF)",
        url: "programme-journee.pdf",
      },
    ],
    likes: 128,
    shares: 45,
    comments: [
      {
        id: "c-1",
        author: "Lena S.",
        role: "Étudiant",
        message: "Hâte d’y être ! Merci pour l’organisation.",
        date: "11 septembre 2025 • 18:34",
      },
      {
        id: "c-2",
        author: "Administration ESO",
        role: "Administrateur",
        message: "Pensez à vous inscrire via le formulaire afin de réserver votre créneau.",
        date: "12 septembre 2025 • 09:12",
      },
    ],
  },
  {
    id: "post-2",
    title: "Afterwork UX/UI",
    summary:
      "Retour en images sur l’afterwork organisé par la promotion Design UX avec nos partenaires.",
    content:
      "Merci à toutes et tous pour votre participation à l’afterwork UX/UI. Nous partageons ici la galerie photo et les ressources évoquées durant la soirée. N’hésitez pas à commenter vos retours pour les prochaines éditions !",
    category: "Vie du campus",
    author: "Mina P.",
    authorRole: "Étudiant",
    date: "05 septembre 2025",
    submittedAt: "05 septembre 2025 • 22:05",
    status: "published",
    attachments: [
      {
        id: "att-4",
        type: "image",
        label: "Galerie photo",
        url: "https://images.unsplash.com/photo-1529158062015-cad636e69505",
      },
      {
        id: "att-5",
        type: "link",
        label: "Playlist Spotify",
        url: "https://open.spotify.com/playlist/afterwork",
      },
    ],
    likes: 96,
    shares: 27,
    comments: [
      {
        id: "c-3",
        author: "Oscar V.",
        role: "Étudiant",
        message: "Super ambiance, merci à l’équipe organisatrice !",
        date: "06 septembre 2025 • 08:12",
      },
    ],
  },
  {
    id: "post-3",
    title: "Atelier “Pitch ton projet”",
    summary:
      "La promo Start-up souhaite partager un atelier collaboratif prévu la semaine prochaine.",
    content:
      "Nous proposons un atelier ouvert à toutes les promotions pour présenter vos projets devant des mentors. Venez tester votre pitch et obtenir des retours constructifs.",
    category: "Initiative étudiante",
    author: "Collectif Start-up",
    authorRole: "Étudiant",
    date: "18 septembre 2025",
    submittedAt: "09 septembre 2025 • 14:57",
    status: "pending",
    attachments: [
      {
        id: "att-6",
        type: "document",
        label: "Brief atelier (PDF)",
        url: "brief-pitch.pdf",
      },
      {
        id: "att-7",
        type: "image",
        label: "Visuel événement",
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      },
    ],
    likes: 0,
    shares: 0,
    comments: [],
  },
  {
    id: "post-4",
    title: "Tournoi esport inter-promo",
    summary:
      "La team Esport propose un tournoi Rocket League. L’admin doit valider la communication.",
    content:
      "La team esport organise un tournoi Rocket League le 28 septembre. Nous sollicitons la communication officielle et la mise à disposition du hub streaming.",
    category: "Association",
    author: "Team Esport",
    authorRole: "Étudiant",
    date: "28 septembre 2025",
    submittedAt: "12 septembre 2025 • 20:42",
    status: "pending",
    attachments: [
      {
        id: "att-8",
        type: "video",
        label: "Trailer 2024",
        url: "https://youtu.be/rocket-trailer",
      },
    ],
    likes: 0,
    shares: 0,
    comments: [],
  },
];

const emptyPostDraft = {
  title: "",
  summary: "",
  content: "",
  category: "Événement",
  attachments: [] as Attachment[],
};

const emptyAttachmentDraft: AttachmentDraft = {
  type: "image",
  label: "",
  url: "",
};

const attachmentTypeIcons: Record<AttachmentType, React.ReactElement> = {
  image: <ImageIcon className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  link: <Upload className="w-4 h-4" />,
};

const attachmentTypeLabels: Record<AttachmentType, string> = {
  image: "Image",
  video: "Vidéo",
  document: "Document",
  link: "Lien",
};

const AdminStudentLifeManager = () => {
  const [posts, setPosts] = useState<StudentLifePost[]>(initialPosts);
  const publishedPosts = useMemo(
    () => posts.filter((post) => post.status === "published"),
    [posts]
  );
  const pendingPosts = useMemo(
    () => posts.filter((post) => post.status === "pending"),
    [posts]
  );

  const defaultSelected = publishedPosts[0]?.id || pendingPosts[0]?.id || "";
  const [selectedPostId, setSelectedPostId] = useState<string>(defaultSelected);
  const selectedPost = posts.find((post) => post.id === selectedPostId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postDraft, setPostDraft] = useState(emptyPostDraft);
  const [attachmentDraft, setAttachmentDraft] = useState(emptyAttachmentDraft);
  const [commentDraft, setCommentDraft] = useState("");

  const totalLikes = useMemo(
    () => posts.filter((post) => post.status === "published").reduce((acc, post) => acc + post.likes, 0),
    [posts]
  );

  const totalShares = useMemo(
    () => posts.filter((post) => post.status === "published").reduce((acc, post) => acc + post.shares, 0),
    [posts]
  );

  const openCreateModal = () => {
    setPostDraft(emptyPostDraft);
    setAttachmentDraft(emptyAttachmentDraft);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleAddAttachmentToDraft = () => {
    if (!attachmentDraft.label.trim() || !attachmentDraft.url.trim()) {
      return;
    }

    setPostDraft((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          id: `draft-att-${Date.now()}`,
          type: attachmentDraft.type,
          label: attachmentDraft.label,
          url: attachmentDraft.url,
        },
      ],
    }));

    setAttachmentDraft(emptyAttachmentDraft);
  };

  const handleRemoveAttachmentFromDraft = (attachmentId: string) => {
    setPostDraft((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }));
  };

  const handleCreatePost = () => {
    if (!postDraft.title.trim() || !postDraft.summary.trim()) {
      return;
    }

    const now = new Date();
    const newPost: StudentLifePost = {
      id: `post-${Date.now()}`,
      title: postDraft.title,
      summary: postDraft.summary,
      content: postDraft.content,
      category: postDraft.category,
      author: "Administration ESO",
      authorRole: "Administrateur",
      date: formatDate(now),
      submittedAt: formatDateTime(now),
      status: "published",
      attachments: postDraft.attachments,
      likes: 0,
      shares: 0,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setSelectedPostId(newPost.id);
    closeCreateModal();
  };

  const handleApprovePost = (postId: string) => {
    const now = new Date();
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              status: "published",
              date: formatDate(now),
            }
          : post
      )
    );
    setSelectedPostId(postId);
  };

  const handleRejectPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              status: "rejected",
            }
          : post
      )
    );

    if (selectedPostId === postId) {
      const nextPublished = posts.find((post) => post.status === "published" && post.id !== postId);
      setSelectedPostId(nextPublished?.id || "");
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes + 1,
            }
          : post
      )
    );
  };

  const handleSharePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              shares: post.shares + 1,
            }
          : post
      )
    );
  };

  const handleAddComment = (postId: string) => {
    if (!commentDraft.trim()) {
      return;
    }

    const now = new Date();
    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      author: "Administration ESO",
      role: "Administrateur",
      message: commentDraft.trim(),
      date: formatDateTime(now),
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [newComment, ...post.comments],
            }
          : post
      )
    );

    setCommentDraft("");
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
  };

  return (
    <div className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold text-[#032622]"
            style={{ fontFamily: "var(--font-termina-bold)" }}
          >
            Vie étudiante
          </h2>
          <p className="text-sm text-[#032622]/70">
            Gérez les actualités, soumissions étudiantes et interagissez avec la communauté.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 border border-[#032622] px-4 py-2 text-[#032622] font-semibold hover:bg-[#eae5cf] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une actualité</span>
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Actualités publiées" value={publishedPosts.length} />
        <StatCard label="Soumissions en attente" value={pendingPosts.length} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
          <StatCard label="Likes cumulés" value={totalLikes} compact />
          <StatCard label="Partages" value={totalShares} compact />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <PublishedPosts
            posts={publishedPosts}
            selectedPostId={selectedPostId}
            onSelect={handleSelectPost}
          />
          <PendingPosts
            posts={pendingPosts}
            selectedPostId={selectedPostId}
            onSelect={handleSelectPost}
            onApprove={handleApprovePost}
            onReject={handleRejectPost}
          />
        </div>

        <div>
          {selectedPost ? (
            <PostDetails
              post={selectedPost}
              commentDraft={commentDraft}
              onLike={() => handleLikePost(selectedPost.id)}
              onShare={() => handleSharePost(selectedPost.id)}
              onComment={() => handleAddComment(selectedPost.id)}
              setCommentDraft={setCommentDraft}
              onApprove={() => handleApprovePost(selectedPost.id)}
              onReject={() => handleRejectPost(selectedPost.id)}
            />
          ) : (
            <div className="border border-[#032622] bg-[#F8F5E4] p-6 text-[#032622]/70">
              Sélectionnez une actualité pour afficher les détails.
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreatePostModal
          postDraft={postDraft}
          setPostDraft={setPostDraft}
          attachmentDraft={attachmentDraft}
          setAttachmentDraft={setAttachmentDraft}
          onAddAttachment={handleAddAttachmentToDraft}
          onRemoveAttachment={handleRemoveAttachmentFromDraft}
          onClose={closeCreateModal}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: number;
  compact?: boolean;
}) => (
  <div className="border border-[#032622] bg-[#F8F5E4] px-4 py-3">
    <p className="text-xs uppercase tracking-widest text-[#032622]/70">{label}</p>
    <p
      className={`text-[#032622] font-bold ${compact ? "text-xl" : "text-3xl"}`}
      style={{ fontFamily: "var(--font-termina-bold)" }}
    >
      {value}
    </p>
  </div>
);

const PublishedPosts = ({
  posts,
  selectedPostId,
  onSelect,
}: {
  posts: StudentLifePost[];
  selectedPostId: string;
  onSelect: (postId: string) => void;
}) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
    <header className="flex items-center justify-between">
      <h3
        className="text-xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        Actualités publiées
      </h3>
      <span className="text-xs text-[#032622]/60 uppercase">{posts.length} éléments</span>
    </header>

    <div className="space-y-3">
      {posts.map((post) => (
        <button
          key={post.id}
          onClick={() => onSelect(post.id)}
          className={`w-full text-left border border-[#032622]/30 px-4 py-4 transition-colors ${
            selectedPostId === post.id ? "bg-[#E9E3D1]" : "bg-[#F8F5E4] hover:bg-[#ede7d5]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-1">
              <p className="text-sm text-[#032622]/60 uppercase tracking-wide">{post.category}</p>
              <h4 className="text-lg font-semibold text-[#032622]">{post.title}</h4>
            </div>
            <ChevronRight className="w-4 h-4 text-[#032622]/60" />
          </div>
          <p className="text-sm text-[#032622]/80 line-clamp-2">{post.summary}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#032622]/70">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
            <span>
              {post.author} • {post.authorRole}
            </span>
            <span className="ml-auto flex items-center gap-3 text-[#032622]">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" /> {post.shares}
              </span>
            </span>
          </div>
        </button>
      ))}

      {posts.length === 0 && (
        <p className="text-sm text-[#032622]/60">
          Aucune actualité publiée pour le moment.
        </p>
      )}
    </div>
  </section>
);

const PendingPosts = ({
  posts,
  selectedPostId,
  onSelect,
  onApprove,
  onReject,
}: {
  posts: StudentLifePost[];
  selectedPostId: string;
  onSelect: (postId: string) => void;
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
}) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-4">
    <header className="flex items-center justify-between">
      <h3
        className="text-xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        Soumissions étudiantes en attente
      </h3>
      <span className="text-xs text-[#032622]/60 uppercase">{posts.length}</span>
    </header>

    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className={`border border-[#032622]/30 px-4 py-4 bg-[#F8F5E4] ${
            selectedPostId === post.id ? "ring-1 ring-[#032622]" : ""
          }`}
        >
          <button
            className="w-full text-left"
            onClick={() => onSelect(post.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-1">
                <p className="text-sm text-[#032622]/60 uppercase tracking-wide">{post.category}</p>
                <h4 className="text-lg font-semibold text-[#032622]">{post.title}</h4>
              </div>
              <ChevronRight className="w-4 h-4 text-[#032622]/60" />
            </div>
            <p className="text-sm text-[#032622]/80 line-clamp-2">{post.summary}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#032622]/70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.date}
              </span>
              <span>
                Soumis par {post.author}
              </span>
            </div>
          </button>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => onApprove(post.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-[#032622] px-3 py-2 text-sm font-semibold text-[#032622] hover:bg-[#eae5cf] transition-colors"
            >
              <Check className="w-4 h-4" />
              Valider
            </button>
            <button
              onClick={() => onReject(post.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-[#D96B6B] text-[#D96B6B] px-3 py-2 text-sm font-semibold hover:bg-[#f5d5d5] transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Refuser
            </button>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <p className="text-sm text-[#032622]/60">
          Aucune nouvelle soumission en attente de validation.
        </p>
      )}
    </div>
  </section>
);

const PostDetails = ({
  post,
  commentDraft,
  setCommentDraft,
  onLike,
  onShare,
  onComment,
  onApprove,
  onReject,
}: {
  post: StudentLifePost;
  commentDraft: string;
  setCommentDraft: (value: string) => void;
  onLike: () => void;
  onShare: () => void;
  onComment: () => void;
  onApprove: () => void;
  onReject: () => void;
}) => (
  <section className="border border-[#032622] bg-[#F8F5E4] p-6 space-y-5">
    <header className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-[#032622]/60">{post.category}</p>
      <h3
        className="text-2xl font-bold text-[#032622]"
        style={{ fontFamily: "var(--font-termina-bold)" }}
      >
        {post.title}
      </h3>
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#032622]/70">
        <span>{post.author} • {post.authorRole}</span>
        <span>Publié le {post.date}</span>
        {post.status === "pending" && (
          <span className="text-[#D96B6B] uppercase font-semibold">En attente de validation</span>
        )}
      </div>
      <p className="text-sm text-[#032622]/80">{post.summary}</p>
    </header>

    <div className="space-y-2 text-sm text-[#032622]/80 leading-relaxed">
      {post.content}
    </div>

    {post.attachments.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-[#032622] uppercase">Pièces jointes</h4>
        <div className="space-y-2">
          {post.attachments.map((attachment) => (
            <AttachmentRow key={attachment.id} attachment={attachment} />
          ))}
        </div>
      </div>
    )}

    <div className="flex items-center gap-3">
      <button
        onClick={onLike}
        className="flex-1 inline-flex items-center justify-center gap-2 border border-[#032622] px-3 py-2 text-sm font-semibold text-[#032622] hover:bg-[#eae5cf] transition-colors"
      >
        <ThumbsUp className="w-4 h-4" />
        {post.likes} likes
      </button>
      <button
        onClick={onShare}
        className="flex-1 inline-flex items-center justify-center gap-2 border border-[#032622] px-3 py-2 text-sm font-semibold text-[#032622] hover:bg-[#eae5cf] transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {post.shares} partages
      </button>
    </div>

    {post.status === "pending" && (
      <div className="flex items-center gap-3 bg-[#ede7d5] border border-[#032622]/40 px-3 py-3">
        <button
          onClick={onApprove}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-[#032622] px-3 py-2 text-sm font-semibold text-[#032622] hover:bg-[#e0d8c3] transition-colors"
        >
          <Check className="w-4 h-4" />
          Valider la publication
        </button>
        <button
          onClick={onReject}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-[#D96B6B] text-[#D96B6B] px-3 py-2 text-sm font-semibold hover:bg-[#f5d5d5] transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Refuser
        </button>
      </div>
    )}

    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-[#032622] uppercase flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        Commentaires ({post.comments.length})
      </h4>

      <div className="space-y-2">
        {post.comments.map((comment) => (
          <div key={comment.id} className="border border-[#032622]/30 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-[#032622]/70">
              <span>{comment.author} • {comment.role}</span>
              <span>{comment.date}</span>
            </div>
            <p className="text-sm text-[#032622] mt-1">{comment.message}</p>
          </div>
        ))}

        {post.comments.length === 0 && (
          <p className="text-sm text-[#032622]/60">Aucun commentaire pour le moment.</p>
        )}
      </div>

      {post.status === "published" && (
        <div className="space-y-2">
          <textarea
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            placeholder="Ajouter un commentaire en tant qu’administrateur"
            className="w-full border border-[#032622]/40 bg-[#F8F5E4] text-sm text-[#032622] px-3 py-2 focus:outline-none focus:border-[#032622]"
            rows={3}
          />
          <button
            onClick={onComment}
            className="inline-flex items-center gap-2 border border-[#032622] px-3 py-2 text-sm font-semibold text-[#032622] hover:bg-[#eae5cf] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Publier le commentaire
          </button>
        </div>
      )}
    </div>
  </section>
);

const AttachmentRow = ({ attachment }: { attachment: Attachment }) => (
  <div className="flex items-center justify-between border border-[#032622]/30 px-3 py-2 text-sm text-[#032622] bg-[#F8F5E4]">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E9E3D1] text-[#032622]">
        {attachmentTypeIcons[attachment.type]}
      </div>
      <div>
        <p className="font-semibold">{attachment.label}</p>
        <p className="text-xs text-[#032622]/70">{attachmentTypeLabels[attachment.type]}</p>
      </div>
    </div>
    <Link href={attachment.url} target="_blank" className="text-xs text-[#032622] underline">
      Ouvrir
    </Link>
  </div>
);

const CreatePostModal = ({
  postDraft,
  setPostDraft,
  attachmentDraft,
  setAttachmentDraft,
  onAddAttachment,
  onRemoveAttachment,
  onClose,
  onSubmit,
}: {
  postDraft: typeof emptyPostDraft;
  setPostDraft: (value: typeof emptyPostDraft) => void;
  attachmentDraft: AttachmentDraft;
  setAttachmentDraft: (value: AttachmentDraft) => void;
  onAddAttachment: () => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="w-full max-w-3xl bg-[#F8F5E4] border border-[#032622] p-6 space-y-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-[#032622] hover:text-[#01302C]"
      >
        <X className="w-5 h-5" />
      </button>

      <header className="space-y-2">
        <h3
          className="text-2xl font-bold text-[#032622]"
          style={{ fontFamily: "var(--font-termina-bold)" }}
        >
          Nouvelle actualité
        </h3>
        <p className="text-sm text-[#032622]/70">
          Publiez une actualité officielle. Les étudiants verront le contenu après validation.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-[#032622]/70">Titre</label>
          <input
            value={postDraft.title}
            onChange={(event) => setPostDraft({ ...postDraft, title: event.target.value })}
            className="border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
            placeholder="Nom de l’actualité"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-[#032622]/70">Catégorie</label>
          <select
            value={postDraft.category}
            onChange={(event) => setPostDraft({ ...postDraft, category: event.target.value })}
            className="border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
          >
            <option value="Événement">Événement</option>
            <option value="Vie du campus">Vie du campus</option>
            <option value="Association">Association</option>
            <option value="Initiative étudiante">Initiative étudiante</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-[#032622]/70">Accroche</label>
        <textarea
          value={postDraft.summary}
          onChange={(event) => setPostDraft({ ...postDraft, summary: event.target.value })}
          rows={2}
          className="border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
          placeholder="Résumé court visible dans la liste"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-[#032622]/70">Contenu détaillé</label>
        <textarea
          value={postDraft.content}
          onChange={(event) => setPostDraft({ ...postDraft, content: event.target.value })}
          rows={6}
          className="border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
          placeholder="Décrivez l’activité, les intervenants, les informations logistiques…"
        />
      </div>

      <div className="space-y-3 border border-[#032622]/30 p-4">
        <h4 className="text-sm font-semibold text-[#032622] uppercase">Ajouter des pièces jointes</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-[#032622]/70">Type</label>
            <select
              value={attachmentDraft.type}
              onChange={(event) =>
                setAttachmentDraft({ ...attachmentDraft, type: event.target.value as AttachmentType })
              }
              className="border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
            >
              <option value="image">Image</option>
              <option value="video">Vidéo</option>
              <option value="document">Document</option>
              <option value="link">Lien</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-[#032622]/70">Libellé</label>
            <input
              value={attachmentDraft.label}
              onChange={(event) => setAttachmentDraft({ ...attachmentDraft, label: event.target.value })}
              className="border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
              placeholder="Nom du fichier ou lien"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-[#032622]/70">Lien / Fichier</label>
            <input
              value={attachmentDraft.url}
              onChange={(event) => setAttachmentDraft({ ...attachmentDraft, url: event.target.value })}
              className="border border-[#032622]/40 bg-[#F8F5E4] px-3 py-2 text-sm text-[#032622] focus:outline-none focus:border-[#032622]"
              placeholder="URL ou référence"
            />
          </div>
        </div>
        <button
          onClick={onAddAttachment}
          className="inline-flex items-center gap-2 border border-[#032622] px-3 py-2 text-sm font-semibold text-[#032622] hover:bg-[#eae5cf] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter la pièce jointe
        </button>

        {postDraft.attachments.length > 0 && (
          <div className="space-y-2">
            {postDraft.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between border border-[#032622]/30 px-3 py-2 text-sm text-[#032622]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E9E3D1] text-[#032622]">
                    {attachmentTypeIcons[attachment.type]}
                  </div>
                  <div>
                    <p className="font-semibold">{attachment.label}</p>
                    <p className="text-xs text-[#032622]/70">{attachmentTypeLabels[attachment.type]}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveAttachment(attachment.id)}
                  className="text-xs text-[#D96B6B] hover:text-[#a84d4d]"
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="border border-[#032622] px-4 py-2 text-sm font-semibold text-[#032622] hover:bg-[#eae5cf] transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onSubmit}
          className="border border-[#032622] px-4 py-2 text-sm font-semibold text-[#032622] hover:bg-[#e0d8c3] transition-colors"
        >
          Publier l’actualité
        </button>
      </div>
    </div>
  </div>
);

export default AdminStudentLifeManager;

