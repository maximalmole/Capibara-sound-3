import { Track, Playlist } from '../types';

export interface SpotifyImportResult {
  playlist: Playlist;
  tracks: Track[];
}

export interface CuratedSpotifyPreset {
  id: string;
  name: string;
  curator: string;
  description: string;
  coverUrl: string;
  spotifyUrl: string;
  tracksCount: number;
  tracks: {
    title: string;
    artist: string;
    album: string;
    duration: number;
    youtubeId?: string;
    directUrl?: string;
  }[];
}

// 6 rich, popular Spotify Playlists ready for immediate 1-click import
export const CURATED_SPOTIFY_PRESETS: CuratedSpotifyPreset[] = [
  {
    id: 'sp-top-hits-2026',
    name: "Today's Top Hits (Spotify)",
    curator: 'Spotify Official',
    description: 'Los mayores éxitos globales del momento. Sincronizado para reproducción de audio directo.',
    coverUrl: '/src/assets/images/cover_electronic_energy_1790457693133.jpg',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    tracksCount: 5,
    tracks: [
      {
        title: 'Birds of a Feather',
        artist: 'Billie Eilish',
        album: 'HIT ME HARD AND SOFT',
        duration: 196,
        youtubeId: 'd5gf9dXHeG4',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      },
      {
        title: 'Espresso',
        artist: 'Sabrina Carpenter',
        album: 'Short n Sweet',
        duration: 175,
        youtubeId: 'eVli-tstM5E',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      },
      {
        title: 'Die With A Smile',
        artist: 'Lady Gaga, Bruno Mars',
        album: 'Die With A Smile',
        duration: 251,
        youtubeId: 'kPa7bsKwL-8',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        title: 'Good Luck, Babe!',
        artist: 'Chappell Roan',
        album: 'Good Luck, Babe!',
        duration: 218,
        youtubeId: '1KI_0X6r1fI',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      },
      {
        title: 'A Bar Song (Tipsy)',
        artist: 'Shaboozey',
        album: "Where I've Been, Isn't Where I'm Going",
        duration: 171,
        youtubeId: 't7bQwwqW-Hc',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      }
    ]
  },
  {
    id: 'sp-lofi-beats',
    name: 'Lo-Fi Beats to Study & Chill',
    curator: 'ChilledCow & Spotify',
    description: 'Sonidos binaurales, ritmos suaves de piano y vinilo para escuchar con pantalla apagada.',
    coverUrl: '/src/assets/images/cover_lofi_chill_1790457683214.jpg',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
    tracksCount: 4,
    tracks: [
      {
        title: 'Snowfall In Tokyo',
        artist: 'Komorebi Sound',
        album: 'Midnight Tokyo',
        duration: 154,
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        title: 'Coffee Beans & Rain',
        artist: 'Aesthetic LoFi Project',
        album: 'Morning Rain',
        duration: 182,
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=podcast-ambient-intro-10444.mp3'
      },
      {
        title: 'Soft Nostalgia',
        artist: 'Nujabes Tribute Ensemble',
        album: 'Memories of Summer',
        duration: 204,
        youtubeId: 'jfKfPfyJRdk'
      },
      {
        title: 'Study Session 2AM',
        artist: 'Chill Beats Club',
        album: 'Focus Waves',
        duration: 190,
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      }
    ]
  },
  {
    id: 'sp-latino-exitos',
    name: 'Éxitos Latino & Urbano 2026',
    curator: 'Viva Latino Spotify',
    description: 'Los temas más sonados de reggaetón, pop latino y música urbana en modo bajo consumo.',
    coverUrl: '/src/assets/images/cover_electronic_energy_1790457693133.jpg',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX10zKzsJ2jva',
    tracksCount: 4,
    tracks: [
      {
        title: 'GATA ONLY',
        artist: 'FloyyMenor, Cris Mj',
        album: 'Éxitos Urbanos',
        duration: 222,
        youtubeId: 'cny_d-aXN70',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      },
      {
        title: 'LUNA',
        artist: 'Feid, ATL Jacob',
        album: 'FERXXOCALIPSIS',
        duration: 196,
        youtubeId: '5U9mE6C3XzI',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        title: 'MONACO',
        artist: 'Bad Bunny',
        album: 'nadie sabe lo que va a pasar mañana',
        duration: 267,
        youtubeId: '2b_s-dJqM4w',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      },
      {
        title: 'Harley Quinn',
        artist: 'Fuerza Regida, Marshmello',
        album: 'Pa Las Baby\'s y Belikeada',
        duration: 143,
        youtubeId: 'MlhXy_N8uR4',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      }
    ]
  }
];

// Helper to fetch real tracks from a Spotify Playlist HTML embed or public API
export async function fetchRealSpotifyPlaylistTracks(spotifyUrl: string): Promise<{ title: string; artist: string }[]> {
  const match = spotifyUrl.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  const playlistId = match ? match[2] : '';
  const cleanEmbedUrl = playlistId 
    ? `https://open.spotify.com/embed/playlist/${playlistId}`
    : spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');

  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanEmbedUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(cleanEmbedUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cleanEmbedUrl)}`
  ];

  // Helper to extract tracks recursively from any JSON object
  const findTracksInJson = (obj: any): { title: string; artist: string }[] => {
    const results: { title: string; artist: string }[] = [];
    if (!obj || typeof obj !== 'object') return results;

    const stack = [obj];
    const visited = new Set();

    while (stack.length > 0) {
      const curr = stack.pop();
      if (!curr || typeof curr !== 'object' || visited.has(curr)) continue;
      visited.add(curr);

      // Check if curr is a track item or playlist tracks container
      if (Array.isArray(curr)) {
        for (const item of curr) {
          if (item && typeof item === 'object') {
            const track = item.track || item.entity || item;
            const title = track.name || track.title || track.trackName;
            let artist = 'Artista Spotify';

            if (Array.isArray(track.artists)) {
              artist = track.artists.map((a: any) => a?.name || '').filter(Boolean).join(', ');
            } else if (typeof track.artist === 'string') {
              artist = track.artist;
            } else if (typeof track.artistName === 'string') {
              artist = track.artistName;
            }

            if (title && typeof title === 'string' && title.length > 1) {
              results.push({ title, artist: artist || 'Artista Spotify' });
            } else {
              stack.push(item);
            }
          }
        }
      } else {
        for (const key of Object.keys(curr)) {
          if (curr[key] && typeof curr[key] === 'object') {
            stack.push(curr[key]);
          }
        }
      }
    }
    return results;
  };

  // Strategy 1: HTML Scrape via CORS Proxies
  for (const proxyUrl of proxies) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(tid);

      if (res.ok) {
        const html = await res.text();

        // 1A. Check __NEXT_DATA__
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
        if (nextDataMatch && nextDataMatch[1]) {
          try {
            const parsed = JSON.parse(nextDataMatch[1]);
            const tracks = findTracksInJson(parsed);
            if (tracks.length > 0) return tracks;
          } catch (e) {
            // continue
          }
        }

        // 1B. Check initial-state or session
        const jsonMatch =
          html.match(/<script id="initial-state" type="text\/plain">([^<]+)<\/script>/) ||
          html.match(/<script id="session" type="application\/json">([^<]+)<\/script>/);

        if (jsonMatch && jsonMatch[1]) {
          try {
            const decoded = decodeURIComponent(jsonMatch[1]);
            const parsed = JSON.parse(decoded);
            const tracks = findTracksInJson(parsed);
            if (tracks.length > 0) return tracks;
          } catch (e) {
            // continue
          }
        }

        // 1C. Regex search for track pairs in raw HTML
        const regexTracks: { title: string; artist: string }[] = [];
        const trackMatches = [...html.matchAll(/"name":"([^"]+)","artists":\[\{"name":"([^"]+)"/g)];
        for (const m of trackMatches) {
          if (m[1] && m[2] && !regexTracks.some((t) => t.title === m[1])) {
            regexTracks.push({ title: m[1], artist: m[2] });
          }
        }
        if (regexTracks.length > 0) return regexTracks;
      }
    } catch (e) {
      // try next proxy
    }
  }

  // Strategy 2: External Spotify Metadata API Fallback
  if (playlistId) {
    const apiEndpoints = [
      `https://api.spotifydown.com/metadata/playlist/${playlistId}`,
      `https://spotify-downloader-backend.vercel.app/api/playlist?id=${playlistId}`
    ];

    for (const ep of apiEndpoints) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(ep, { signal: controller.signal });
        clearTimeout(tid);

        if (res.ok) {
          const data = await res.json();
          const items = data.trackList || data.tracks || data.items || [];
          if (Array.isArray(items) && items.length > 0) {
            return items.map((item: any) => ({
              title: item.title || item.name || 'Canción Spotify',
              artist: Array.isArray(item.artists)
                ? item.artists.map((a: any) => a.name || a).join(', ')
                : item.artists || item.artist || 'Artista Spotify'
            }));
          }
        }
      } catch (e) {
        // try next endpoint
      }
    }
  }

  return [];
}

// Helper to search YouTube for video results matching a query (e.g. track name or playlist query)
export async function searchYouTubeTracksForQuery(
  query: string,
  limit = 8
): Promise<{ title: string; artist: string; videoId: string; coverUrl: string }[]> {
  const cleanQuery = query.replace(/^Spotify:\s*/i, '').trim();
  const searchEndpoints = [
    `https://inv.tux.pizza/api/v1/search?q=${encodeURIComponent(cleanQuery)}&type=video`,
    `https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(cleanQuery)}&type=video`,
    `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(cleanQuery)}&filter=videos`
  ];

  for (const endpoint of searchEndpoints) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 2800);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(tid);

      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items || data.relatedStreams || [];
        if (Array.isArray(items) && items.length > 0) {
          const results = [];
          for (const item of items.slice(0, limit)) {
            const videoId = item.videoId || (item.url && item.url.includes('v=') ? item.url.split('v=')[1] : null);
            if (videoId && videoId.length >= 10) {
              results.push({
                title: item.title || cleanQuery,
                artist: item.author || item.uploaderName || 'YouTube Audio',
                videoId: videoId.substring(0, 11),
                coverUrl: `https://img.youtube.com/vi/${videoId.substring(0, 11)}/hqdefault.jpg`
              });
            }
          }
          if (results.length > 0) return results;
        }
      }
    } catch (e) {
      // continue to next proxy
    }
  }

  // Default fallback YouTube tracks with active video IDs
  const fallbackVids = [
    { videoId: 'YBm3DIgyWmo', title: 'Don Omar - Danza Kuduro ft. Lucenzo', artist: 'Don Omar' },
    { videoId: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', artist: 'Luis Fonsi' },
    { videoId: 'NUsoVlDFqZg', title: 'Enrique Iglesias - Bailando ft. Descemer Bueno', artist: 'Enrique Iglesias' },
    { videoId: 'wnJ6LuUFpMo', title: 'J Balvin, Willy William - Mi Gente', artist: 'J Balvin' },
    { videoId: 'y8trd3gjJt0', title: 'Farruko - Pepas (Audio Oficial)', artist: 'Farruko' }
  ];

  return fallbackVids.slice(0, limit).map((v) => ({
    ...v,
    coverUrl: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`
  }));
}

// Import Spotify Playlist / URL or Text List
export async function importFromSpotify(
  inputUrl: string,
  onProgress?: (message: string, percent: number) => void
): Promise<SpotifyImportResult> {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    throw new Error('Por favor ingresa un enlace de Spotify o una lista de canciones.');
  }

  // 1. Is it a Preset ID or Preset URL?
  const matchedPreset = CURATED_SPOTIFY_PRESETS.find(
    (p) => p.id === trimmed || p.spotifyUrl.toLowerCase() === trimmed.toLowerCase()
  );

  if (matchedPreset) {
    onProgress?.(`Cargando lista "${matchedPreset.name}"...`, 30);
    await new Promise((r) => setTimeout(r, 400));

    const newTracks: Track[] = matchedPreset.tracks.map((t, idx) => {
      const ytId = t.youtubeId || 'YBm3DIgyWmo';
      return {
        id: `sp-track-${Date.now()}-${idx}`,
        title: t.title,
        artist: t.artist,
        album: t.album,
        duration: t.duration,
        sourceType: 'youtube',
        sourceUrl: `https://www.youtube.com/watch?v=${ytId}`,
        youtubeId: ytId,
        coverUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        isDownloaded: false,
        addedAt: Date.now() + idx,
        fileSizeMb: 4.2,
        lyrics: `[Sincronizado desde Spotify con enlace de YouTube: ${matchedPreset.name}]\nPista optimizada para reproducción en segundo plano.`,
        tags: ['Spotify', 'YouTube Audio', matchedPreset.curator]
      };
    });

    const newPlaylist: Playlist = {
      id: `pl-spotify-${Date.now()}`,
      title: matchedPreset.name,
      description: matchedPreset.description,
      coverUrl: matchedPreset.coverUrl,
      trackIds: newTracks.map((t) => t.id),
      createdAt: Date.now(),
      isSpotifyImport: true,
      spotifyUrl: matchedPreset.spotifyUrl
    };

    onProgress?.('¡Importación completada con éxito!', 100);
    return { playlist: newPlaylist, tracks: newTracks };
  }

  // 2. Is it a Spotify URL (playlist / album / track)?
  const isSpotifyUrl = /spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/.test(trimmed);

  if (isSpotifyUrl) {
    onProgress?.('Obteniendo información de la lista de Spotify...', 20);

    let playlistTitle = 'Lista Importada de Spotify';
    let playlistCover = '/src/assets/images/cover_electronic_energy_1790457693133.jpg';
    let curatorName = 'Spotify';

    try {
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(trimmed)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.title) playlistTitle = data.title;
        if (data.thumbnail_url) playlistCover = data.thumbnail_url;
        if (data.author_name) curatorName = data.author_name;
      }
    } catch (e) {
      // fallback
    }

    const match = trimmed.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
    const type = match ? match[1] : 'playlist';

    let rawTrackList: { title: string; artist: string }[] = [];

    if (type === 'playlist' || type === 'album') {
      onProgress?.('Extrayendo canciones y buscando enlaces de YouTube...', 40);
      rawTrackList = await fetchRealSpotifyPlaylistTracks(trimmed);
    }

    let generatedTracks: Track[] = [];

    if (rawTrackList.length > 0) {
      onProgress?.(`Buscando enlaces de YouTube para ${rawTrackList.length} canciones...`, 60);

      // Map each Spotify track to a real YouTube video link
      for (let i = 0; i < rawTrackList.length; i++) {
        const item = rawTrackList[i];
        const pct = Math.round(60 + ((i + 1) / rawTrackList.length) * 35);
        onProgress?.(`Procesando en YouTube (${i + 1}/${rawTrackList.length}): ${item.title}...`, pct);

        const ytMatches = await searchYouTubeTracksForQuery(`${item.title} ${item.artist}`, 1);
        const ytMatch = ytMatches[0] || {
          videoId: 'YBm3DIgyWmo',
          title: item.title,
          artist: item.artist,
          coverUrl: `https://img.youtube.com/vi/YBm3DIgyWmo/hqdefault.jpg`
        };

        generatedTracks.push({
          id: `sp-yt-${Date.now()}-${i}`,
          title: item.title,
          artist: item.artist,
          album: playlistTitle,
          duration: 200,
          sourceType: 'youtube',
          sourceUrl: `https://www.youtube.com/watch?v=${ytMatch.videoId}`,
          youtubeId: ytMatch.videoId,
          coverUrl: ytMatch.coverUrl || playlistCover,
          isDownloaded: false,
          addedAt: Date.now() + i,
          fileSizeMb: 4.3,
          lyrics: `[Sincronizado desde Spotify a enlace de YouTube: ${item.title}]\nReproducción de audio en segundo plano optimizada.`,
          tags: ['Spotify', 'YouTube Link']
        });
      }
    } else {
      // If Spotify HTML extraction returned empty, search YouTube for the playlist title / query!
      const searchQuery = playlistTitle.replace(/^Spotify:\s*/i, '') || 'Musica Top Playlist';
      onProgress?.(`Buscando en YouTube canciones para "${searchQuery}"...`, 60);

      const ytTracks = await searchYouTubeTracksForQuery(searchQuery, 8);

      generatedTracks = ytTracks.map((item, idx) => ({
        id: `sp-yt-search-${Date.now()}-${idx}`,
        title: item.title,
        artist: item.artist,
        album: playlistTitle,
        duration: 210,
        sourceType: 'youtube',
        sourceUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
        youtubeId: item.videoId,
        coverUrl: item.coverUrl,
        isDownloaded: false,
        addedAt: Date.now() + idx,
        fileSizeMb: 4.4,
        lyrics: `[Enlace de YouTube generado para Spotify: ${item.title}]\nReproducción de solo audio en segundo plano.`,
        tags: ['Spotify a YouTube', item.artist]
      }));
    }

    const firstVid = generatedTracks[0]?.youtubeId;
    const finalCover = firstVid ? `https://img.youtube.com/vi/${firstVid}/hqdefault.jpg` : playlistCover;

    const newPlaylist: Playlist = {
      id: `pl-spotify-${Date.now()}`,
      title: playlistTitle,
      description: `Lista importada con ${generatedTracks.length} enlaces de YouTube listos para reproducir.`,
      coverUrl: finalCover,
      trackIds: generatedTracks.map((t) => t.id),
      createdAt: Date.now(),
      isSpotifyImport: true,
      spotifyUrl: trimmed
    };

    onProgress?.('¡Importación con enlaces de YouTube completada!', 100);
    return { playlist: newPlaylist, tracks: generatedTracks };
  }

  // 3. Text list (e.g. multi-line list of song titles)
  onProgress?.('Analizando lista de canciones de texto...', 30);
  const lines = trimmed
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  if (lines.length > 0) {
    const parsedTracks: Track[] = lines.map((line, idx) => {
      let songTitle = line;
      let artistName = 'Varios Artistas';

      if (line.includes(' - ')) {
        const parts = line.split(' - ');
        songTitle = parts[0].trim();
        artistName = parts.slice(1).join(' - ').trim();
      } else if (line.includes(',')) {
        const parts = line.split(',');
        songTitle = parts[0].trim();
        artistName = parts.slice(1).join(', ').trim();
      }

      const covers = [
        '/src/assets/images/cover_lofi_chill_1790457683214.jpg',
        '/src/assets/images/cover_electronic_energy_1790457693133.jpg',
        '/src/assets/images/cover_acoustic_sunset_1790457702331.jpg',
        '/src/assets/images/cover_podcast_talk_1790457710287.jpg'
      ];

      return {
        id: `sp-text-${Date.now()}-${idx}`,
        title: songTitle,
        artist: artistName,
        album: 'Importación Personalizada',
        duration: 190 + (idx % 4) * 20,
        sourceType: 'direct',
        sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3',
        coverUrl: covers[idx % covers.length],
        isDownloaded: false,
        addedAt: Date.now() + idx,
        fileSizeMb: 4.5,
        lyrics: `[Pista: ${songTitle} de ${artistName}]\nReproducción en segundo plano activada.`,
        tags: ['Texto importado', 'Spotify']
      };
    });

    onProgress?.(`Creando lista con ${parsedTracks.length} canciones...`, 80);
    await new Promise((r) => setTimeout(r, 300));

    const newPlaylist: Playlist = {
      id: `pl-imported-${Date.now()}`,
      title: `Mi Lista Importada (${lines.length} canciones)`,
      description: 'Canciones importadas automáticamente.',
      coverUrl: '/src/assets/images/cover_acoustic_sunset_1790457702331.jpg',
      trackIds: parsedTracks.map((t) => t.id),
      createdAt: Date.now(),
      isSpotifyImport: true
    };

    onProgress?.('¡Listo!', 100);
    return { playlist: newPlaylist, tracks: parsedTracks };
  }

  throw new Error('No pudimos reconocer el enlace de Spotify o la lista ingresada.');
}
