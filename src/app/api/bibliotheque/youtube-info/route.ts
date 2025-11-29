import { NextRequest, NextResponse } from 'next/server';

/**
 * Route API pour récupérer les informations d'une vidéo YouTube
 * Utilise l'API oEmbed de YouTube (gratuite, pas besoin de clé API)
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL YouTube manquante' },
        { status: 400 }
      );
    }

    // Extraire l'ID de la vidéo
    let videoId = '';
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId) {
      return NextResponse.json(
        { error: 'Impossible d\'extraire l\'ID de la vidéo depuis l\'URL fournie' },
        { status: 400 }
      );
    }

    // Utiliser l'API oEmbed de YouTube pour récupérer les informations
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      // Si oEmbed échoue, essayer de récupérer les infos via l'API YouTube Data v3 si disponible
      // Pour l'instant, on retourne une erreur
      return NextResponse.json(
        { 
          error: 'Vidéo YouTube introuvable ou inaccessible',
          details: 'La vidéo n\'existe pas, est privée, ou a été supprimée'
        },
        { status: 404 }
      );
    }

    const oembedData = await response.json();

    // Récupérer la durée via l'API YouTube Data v3 si une clé API est disponible
    // Sinon, on retourne les infos de base depuis oEmbed
    let duration = null;
    let viewCount = null;
    let channelTitle = null;
    let description = null;

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
      try {
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,statistics,snippet&key=${youtubeApiKey}`;
        const youtubeResponse = await fetch(youtubeApiUrl);
        
        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          if (youtubeData.items && youtubeData.items.length > 0) {
            const video = youtubeData.items[0];
            
            // Convertir la durée ISO 8601 en secondes
            if (video.contentDetails?.duration) {
              const durationMatch = video.contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
              if (durationMatch) {
                const hours = parseInt(durationMatch[1] || '0', 10);
                const minutes = parseInt(durationMatch[2] || '0', 10);
                const seconds = parseInt(durationMatch[3] || '0', 10);
                duration = hours * 3600 + minutes * 60 + seconds;
              }
            }
            
            viewCount = video.statistics?.viewCount || null;
            channelTitle = video.snippet?.channelTitle || null;
            description = video.snippet?.description || null;
          }
        }
      } catch (apiError) {
        console.warn('Erreur lors de la récupération des détails YouTube API:', apiError);
        // On continue avec les données oEmbed seulement
      }
    }

    return NextResponse.json({
      success: true,
      video: {
        id: videoId,
        title: oembedData.title || 'Titre non disponible',
        thumbnail: oembedData.thumbnail_url || null,
        author: oembedData.author_name || channelTitle || 'Auteur inconnu',
        authorUrl: oembedData.author_url || null,
        duration: duration, // en secondes
        durationFormatted: duration ? formatDuration(duration) : null,
        viewCount: viewCount ? parseInt(viewCount, 10) : null,
        description: description || null,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`
      }
    });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des infos YouTube:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des informations de la vidéo YouTube',
        details: error.message || 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

/**
 * Formate une durée en secondes en format lisible (HH:MM:SS ou MM:SS)
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

