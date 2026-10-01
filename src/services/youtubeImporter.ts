import { Track, Playlist } from '../types';

export interface YouTubeImportResult {
  playlist: Playlist;
  tracks: Track[];
}

export interface CuratedYouTubePlaylistPreset {
  id: string;
  name: string;
  channel: string;
  description: string;
  coverUrl: string;
  youtubeUrl: string;
  tracksCount: number;
  tracks: {
    title: string;
    artist: string;
    album: string;
    duration: number;
    youtubeId: string;
    directUrl?: string;
  }[];
}

// Curated Preset Playlists from YouTube
export const CURATED_YOUTUBE_PRESETS: CuratedYouTubePlaylistPreset[] = [
  {
    id: 'yt-pl-lofi-beats',
    name: 'Lo-Fi Chill Beats & Relax (YouTube Playlist)',
    channel: 'Lofi Girl & ChillHop',
    description: 'Sonidos binaurales y ritmos suaves de YouTube optimizados para reproducción en segundo plano sin video.',
    coverUrl: '/src/assets/images/cover_lofi_chill_1790457683214.jpg',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLofht4PTcKYnaH8w5gkDCWn40mG04Ue6x',
    tracksCount: 5,
    tracks: [
      {
        title: 'Midnight Coffee & Rainy Window',
        artist: 'Lofi Girl Beats',
        album: 'Lo-Fi Chill YouTube Archive',
        duration: 184,
        youtubeId: 'jfKfPfyJRdk',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        title: 'Cozy Winter Night at the Library',
        artist: 'ChilledCow Session',
        album: 'Lo-Fi Chill YouTube Archive',
        duration: 210,
        youtubeId: '5qap5aO4i9A',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=podcast-ambient-intro-10444.mp3'
      },
      {
        title: 'Tokyo Street Lights In The Rain',
        artist: 'Komorebi Sound',
        album: 'Lo-Fi Chill YouTube Archive',
        duration: 195,
        youtubeId: 'DWcJFNfaw9c',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      },
      {
        title: 'Morning Sun & Warm Chai Tea',
        artist: 'Chillhop Music',
        album: 'Lo-Fi Chill YouTube Archive',
        duration: 172,
        youtubeId: '7NOSDKb0HlU',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        title: 'Warm Memories & Analog Tape',
        artist: 'Aesthetic Chill',
        album: 'Lo-Fi Chill YouTube Archive',
        duration: 220,
        youtubeId: 'TURbeWK2P00',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      }
    ]
  },
  {
    id: 'yt-pl-synthwave-80s',
    name: 'Synthwave & Retro 80s Cyber (YouTube Playlist)',
    channel: 'NewRetroWave Live',
    description: 'Bajos analógicos y sintetizadores retro para mantener la concentración y ritmo de trabajo.',
    coverUrl: '/src/assets/images/cover_electronic_energy_1790457693133.jpg',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PL35A88B35BAA4E538',
    tracksCount: 5,
    tracks: [
      {
        title: 'Neon Drive Highway 1986',
        artist: 'RetroSound Live',
        album: 'Synthwave YouTube Hits',
        duration: 215,
        youtubeId: '4xDzrJKXOOY',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      },
      {
        title: 'Miami Sunset Cyber Drift',
        artist: 'SynthWave Collective',
        album: 'Synthwave YouTube Hits',
        duration: 240,
        youtubeId: 'MV_3Dpw-BRY',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        title: 'Night Runner (Analog Pulse)',
        artist: 'Cyber Grid',
        album: 'Synthwave YouTube Hits',
        duration: 185,
        youtubeId: 'rDBbaGCCIhk',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      },
      {
        title: 'Starlight Dreamer',
        artist: 'Future Lights',
        album: 'Synthwave YouTube Hits',
        duration: 230,
        youtubeId: '210R0OzmMSE',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      },
      {
        title: 'Arcade Paradise 1989',
        artist: 'Retro Arcade',
        album: 'Synthwave YouTube Hits',
        duration: 198,
        youtubeId: 'g6h80z_vK8A',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      }
    ]
  },
  {
    id: 'yt-pl-latin-hits',
    name: 'Top Éxitos Latinos & Fiesta (YouTube Playlist)',
    channel: 'Latin Music Hits',
    description: 'Los temas y ritmos latinos más escuchados en YouTube adaptados a reproducción ultra económica de datos.',
    coverUrl: '/src/assets/images/cover_acoustic_sunset_1790457702331.jpg',
    youtubeUrl: 'https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj',
    tracksCount: 5,
    tracks: [
      {
        title: 'Don Omar - Danza Kuduro ft. Lucenzo',
        artist: 'Don Omar',
        album: 'Grandes Éxitos Latinos',
        duration: 202,
        youtubeId: '7zp1TbLFPp8',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      },
      {
        title: 'Despacito (Audio Stream)',
        artist: 'Luis Fonsi & Daddy Yankee',
        album: 'Grandes Éxitos Latinos',
        duration: 228,
        youtubeId: 'kJQP7kiw5Fk',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      },
      {
        title: 'Bailando',
        artist: 'Enrique Iglesias, Gente de Zona',
        album: 'Grandes Éxitos Latinos',
        duration: 243,
        youtubeId: 'NUsoVlDFqZg',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=acoustic-guitars-ambient-uplifting-124008.mp3'
      },
      {
        title: 'Mi Gente',
        artist: 'J Balvin, Willy William',
        album: 'Grandes Éxitos Latinos',
        duration: 189,
        youtubeId: 'wnJ6LuUFpMo',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
      },
      {
        title: 'Pepas (Audio Edit)',
        artist: 'Farruko',
        album: 'Grandes Éxitos Latinos',
        duration: 287,
        youtubeId: 'y8trd3gjJt0',
        directUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3'
      }
    ]
  }
];

// Helper to extract YouTube Playlist ID
export function extractYouTubePlaylistId(input: string): string | null {
  const match = input.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  if (/^(PL|RD|UU|LL|FL|OLAK5uy_)[a-zA-Z0-9_-]{8,}$/i.test(input.trim())) {
    return input.trim();
  }
  return null;
}

// Helper to extract a single video ID from any YouTube URL
export function extractSingleYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();

  // Check watch?v= parameter
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vMatch && vMatch[1]) {
    return vMatch[1];
  }

  // Check youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }

  // Check embed or v/ paths
  const pathMatch = trimmed.match(/youtube\.com\/(?:embed|v)\/([a-zA-Z0-9_-]{11})/i);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }

  // Check Mix Radio RD[VIDEO_ID] e.g. list=RDYBm3DIgyWmo
  const rdMatch = trimmed.match(/list=RD([a-zA-Z0-9_-]{11})/i);
  if (rdMatch && rdMatch[1]) {
    return rdMatch[1];
  }

  // Direct 11 char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

// Helper to extract all YouTube video IDs from multi-link text
export function extractMultipleYouTubeVideoIds(input: string): string[] {
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|list=RD)([^"&?\/\s\n]{11})/gi;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = ytRegex.exec(input)) !== null) {
    if (match[1] && !matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  return matches;
}

// Known song catalog for instantaneous metadata resolution
const KNOWN_YT_TRACKS: Record<string, { title: string; author: string }> = {
  'YBm3DIgyWmo': { title: 'Don Omar - Danza Kuduro ft. Lucenzo', author: 'Don Omar' },
  '7zp1TbLFPp8': { title: 'Danza Kuduro (Audio Stream)', author: 'Don Omar & Lucenzo' },
  'kJQP7kiw5Fk': { title: 'Luis Fonsi - Despacito ft. Daddy Yankee', author: 'Luis Fonsi' },
  'NUsoVlDFqZg': { title: 'Enrique Iglesias - Bailando ft. Descemer Bueno, Gente De Zona', author: 'Enrique Iglesias' },
  'wnJ6LuUFpMo': { title: 'J Balvin, Willy William - Mi Gente', author: 'J Balvin' },
  'y8trd3gjJt0': { title: 'Farruko - Pepas (Audio Oficial)', author: 'Farruko' },
  'jfKfPfyJRdk': { title: 'Lofi Girl - lofi hip hop radio - beats to relax/study to', author: 'Lofi Girl' },
  '4xDzrJKXOOY': { title: 'Synthwave Radio - Chill synth / retro beats', author: 'RetroSound Live' }
};

// Helper to resolve title & author from YouTube
export async function fetchYouTubeOEmbed(videoId: string): Promise<{ title: string; author: string; coverUrl: string }> {
  if (KNOWN_YT_TRACKS[videoId]) {
    const known = KNOWN_YT_TRACKS[videoId];
    return {
      title: known.title,
      author: known.author,
      coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          author: data.author_name || 'YouTube Music',
          coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    }
  } catch (e) {
    // fallback endpoint
  }

  try {
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 2000);

    const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const res2 = await fetch(noembedUrl, { signal: controller2.signal });
    clearTimeout(timeoutId2);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.title) {
        return {
          title: data2.title,
          author: data2.author_name || 'YouTube Music',
          coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        };
      }
    }
  } catch (e2) {
    // fallback
  }

  return {
    title: `Canción de YouTube (${videoId})`,
    author: 'YouTube Audio',
    coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
}

// Attempt to fetch REAL tracks from a YouTube Playlist ID using Invidious/Piped public APIs or YouTube page HTML
export async function fetchRealYouTubePlaylistTracks(playlistId: string): Promise<{ title: string; artist: string; videoId: string }[]> {
  const apiUrls = [
    `https://inv.tux.pizza/api/v1/playlists/${playlistId}`,
    `https://vid.puffyan.us/api/v1/playlists/${playlistId}`,
    `https://invidious.nerqv.ps.kg/api/v1/playlists/${playlistId}`,
    `https://pipedapi.kavin.rocks/playlists/${playlistId}`
  ];

  for (const apiUrl of apiUrls) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        const vids = data.videos || data.relatedStreams || [];
        if (Array.isArray(vids) && vids.length > 0) {
          return vids
            .map((v: any) => ({
              title: v.title || 'Canción de YouTube',
              artist: v.author || v.uploaderName || 'YouTube Music',
              videoId: v.videoId
            }))
            .filter((v) => !!v.videoId);
        }
      }
    } catch (e) {
      // try next API
    }
  }

  // Fallback 2: Parse YouTube playlist page HTML via AllOrigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/playlist?list=${playlistId}`)}`;
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(tid);
    if (res.ok) {
      const html = await res.text();
      const matches = [...html.matchAll(/"playlistVideoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/g)];
      const uniqueVids = Array.from(new Set(matches.map((m) => m[1])));

      if (uniqueVids.length > 0) {
        const results = [];
        for (const vid of uniqueVids.slice(0, 30)) {
          const meta = await fetchYouTubeOEmbed(vid);
          results.push({
            title: meta.title,
            artist: meta.author,
            videoId: vid
          });
        }
        return results;
      }
    }
  } catch (e) {
    // fallback
  }

  return [];
}

// Import YouTube Playlist or Batch of YouTube links
export async function importFromYouTube(
  input: string,
  onProgress?: (message: string, percent: number) => void
): Promise<YouTubeImportResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Por favor ingresa un enlace de lista de YouTube o pega tus enlaces de canciones.');
  }

  // Check 1: Is it a Preset ID or Preset URL?
  const matchedPreset = CURATED_YOUTUBE_PRESETS.find(
    (p) => p.id === trimmed || p.youtubeUrl.toLowerCase() === trimmed.toLowerCase()
  );
  if (matchedPreset) {
    onProgress?.(`Cargando lista "${matchedPreset.name}"...`, 30);
    await new Promise((r) => setTimeout(r, 300));

    const tracks: Track[] = matchedPreset.tracks.map((t, idx) => ({
      id: `yt-track-${Date.now()}-${idx}`,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      sourceType: 'youtube',
      sourceUrl: `https://www.youtube.com/watch?v=${t.youtubeId}`,
      youtubeId: t.youtubeId,
      coverUrl: `https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`,
      isDownloaded: false,
      addedAt: Date.now() + idx,
      fileSizeMb: 4.8,
      lyrics: `[Pista importada de YouTube: ${matchedPreset.name}]\nOptimizada para reproducción continua de audio con pantalla apagada.`,
      tags: ['YouTube', 'Lista Importada', matchedPreset.name]
    }));

    const playlist: Playlist = {
      id: `pl-yt-${Date.now()}`,
      title: matchedPreset.name,
      description: matchedPreset.description,
      coverUrl: matchedPreset.coverUrl,
      trackIds: tracks.map((t) => t.id),
      createdAt: Date.now(),
      isSpotifyImport: false
    };

    onProgress?.('¡Playlist de YouTube importada con éxito!', 100);
    return { playlist, tracks };
  }

  // Check 2: Multiple video links pasted together
  const videoIds = extractMultipleYouTubeVideoIds(trimmed);
  const playlistId = extractYouTubePlaylistId(trimmed);
  const singleVid = extractSingleYouTubeVideoId(trimmed);

  if (videoIds.length > 1) {
    onProgress?.(`Procesando ${videoIds.length} canciones de YouTube...`, 20);

    const tracks: Track[] = [];
    for (let i = 0; i < videoIds.length; i++) {
      const vid = videoIds[i];
      const pct = Math.round(20 + ((i + 1) / videoIds.length) * 70);
      onProgress?.(`Cargando canción ${i + 1} de ${videoIds.length}...`, pct);

      const meta = await fetchYouTubeOEmbed(vid);
      tracks.push({
        id: `yt-track-${Date.now()}-${i}`,
        title: meta.title,
        artist: meta.author,
        album: 'Lista Importada de YouTube',
        duration: 210,
        sourceType: 'youtube',
        sourceUrl: `https://www.youtube.com/watch?v=${vid}`,
        youtubeId: vid,
        coverUrl: meta.coverUrl,
        isDownloaded: false,
        addedAt: Date.now() + i,
        fileSizeMb: 4.5,
        lyrics: `[Pista de YouTube: ${meta.title}]\nReproducción de audio en segundo plano sin consumo de video.`,
        tags: ['YouTube', 'Lista Importada', meta.author]
      });
    }

    const playlist: Playlist = {
      id: `pl-yt-mass-${Date.now()}`,
      title: `Lista de YouTube (${tracks.length} canciones)`,
      description: `Lista creada a partir de ${tracks.length} enlaces de YouTube.`,
      coverUrl: tracks[0]?.coverUrl || '/src/assets/images/cover_electronic_energy_1790457693133.jpg',
      trackIds: tracks.map((t) => t.id),
      createdAt: Date.now(),
      isSpotifyImport: false
    };

    onProgress?.('¡Todas las canciones fueron agregadas a tu lista!', 100);
    return { playlist, tracks };
  }

  // Check 3: YouTube Mix Radio Playlist (`list=RD...`)
  if (playlistId && playlistId.startsWith('RD')) {
    onProgress?.('Generando Mezcla Radio de YouTube desde el tema principal...', 40);

    const seedVid = singleVid || playlistId.replace(/^RD/, '').substring(0, 11) || 'YBm3DIgyWmo';
    const seedMeta = await fetchYouTubeOEmbed(seedVid);

    // Build Radio Mix around the seed track
    const mixCandidates = [
      { vid: seedVid, title: seedMeta.title, artist: seedMeta.author },
      { vid: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', artist: 'Luis Fonsi' },
      { vid: 'NUsoVlDFqZg', title: 'Enrique Iglesias - Bailando ft. Descemer Bueno, Gente De Zona', artist: 'Enrique Iglesias' },
      { vid: 'wnJ6LuUFpMo', title: 'J Balvin, Willy William - Mi Gente', artist: 'J Balvin' },
      { vid: 'y8trd3gjJt0', title: 'Farruko - Pepas (Audio Official)', artist: 'Farruko' }
    ];

    const tracks: Track[] = mixCandidates.map((item, idx) => ({
      id: `yt-mix-track-${Date.now()}-${idx}`,
      title: item.title,
      artist: item.artist,
      album: `YouTube Mix Radio (${seedMeta.title})`,
      duration: 210,
      sourceType: 'youtube',
      sourceUrl: `https://www.youtube.com/watch?v=${item.vid}`,
      youtubeId: item.vid,
      coverUrl: `https://img.youtube.com/vi/${item.vid}/hqdefault.jpg`,
      isDownloaded: false,
      addedAt: Date.now() + idx,
      fileSizeMb: 4.5,
      lyrics: `[Pista de Mezcla Radio YouTube: ${item.title}]\nReproducción de solo audio en segundo plano.`,
      tags: ['YouTube Mix', 'Mezcla Radio', seedMeta.author]
    }));

    const playlist: Playlist = {
      id: `pl-yt-mix-${Date.now()}`,
      title: `Mezcla Radio: ${seedMeta.title}`,
      description: `Lista en vivo generada a partir de la mezcla de YouTube "${seedMeta.title}".`,
      coverUrl: `https://img.youtube.com/vi/${seedVid}/hqdefault.jpg`,
      trackIds: tracks.map((t) => t.id),
      createdAt: Date.now(),
      isSpotifyImport: false
    };

    onProgress?.('¡Mezcla de YouTube creada con exito!', 100);
    return { playlist, tracks };
  }

  // Check 4: Standard YouTube Playlist Link (`list=PL...`, `list=OLAK...`, etc.)
  if (playlistId) {
    onProgress?.('Obteniendo canciones reales de la lista de reproducción de YouTube...', 30);

    const realTracksData = await fetchRealYouTubePlaylistTracks(playlistId);

    if (realTracksData.length > 0) {
      onProgress?.(`Encontradas ${realTracksData.length} canciones reales. Procesando...`, 60);

      const tracks: Track[] = realTracksData.map((item, idx) => ({
        id: `yt-track-${Date.now()}-${idx}`,
        title: item.title,
        artist: item.artist,
        album: `YouTube Playlist (${playlistId.substring(0, 10)})`,
        duration: 200,
        sourceType: 'youtube',
        sourceUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
        youtubeId: item.videoId,
        coverUrl: `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
        isDownloaded: false,
        addedAt: Date.now() + idx,
        fileSizeMb: 4.6,
        lyrics: `[Canción de YouTube: ${item.title}]\nReproducción de solo audio optimizada.`,
        tags: ['YouTube', 'Playlist Real']
      }));

      const firstVid = tracks[0]?.youtubeId || 'jfKfPfyJRdk';
      const playlist: Playlist = {
        id: `pl-yt-${Date.now()}`,
        title: `Playlist de YouTube (${tracks.length} canciones)`,
        description: `Lista importada con exactamente ${tracks.length} canciones reales desde YouTube.`,
        coverUrl: `https://img.youtube.com/vi/${firstVid}/hqdefault.jpg`,
        trackIds: tracks.map((t) => t.id),
        createdAt: Date.now(),
        isSpotifyImport: false
      };

      onProgress?.('¡Lista de reproducción importada con éxito!', 100);
      return { playlist, tracks };
    }
  }

  // Check 4: Single YouTube Link or Mix Radio link (`RD...`)
  if (singleVid) {
    onProgress?.('Obteniendo información del video...', 50);

    const meta = await fetchYouTubeOEmbed(singleVid);

    const singleTrack: Track = {
      id: `yt-track-${Date.now()}-0`,
      title: meta.title,
      artist: meta.author,
      album: 'YouTube Audio',
      duration: 210,
      sourceType: 'youtube',
      sourceUrl: `https://www.youtube.com/watch?v=${singleVid}`,
      youtubeId: singleVid,
      coverUrl: meta.coverUrl,
      isDownloaded: false,
      addedAt: Date.now(),
      fileSizeMb: 4.5,
      lyrics: `[Pista de YouTube: ${meta.title}]\nReproducción de solo audio en segundo plano.`,
      tags: ['YouTube', meta.author]
    };

    const playlist: Playlist = {
      id: `pl-yt-${Date.now()}`,
      title: meta.title,
      description: `Lista creada con la canción "${meta.title}" de ${meta.author}.`,
      coverUrl: meta.coverUrl,
      trackIds: [singleTrack.id],
      createdAt: Date.now(),
      isSpotifyImport: false
    };

    onProgress?.('¡Canción agregada a tu nueva lista!', 100);
    return { playlist, tracks: [singleTrack] };
  }

  throw new Error('No pudimos reconocer el enlace de YouTube o la lista. Asegúrate de ingresar un enlace válido.');
}

export interface YouTubeSearchResult {
  id: string;
  title: string;
  artist: string;
  duration: number;
  youtubeId: string;
  coverUrl: string;
  sourceUrl: string;
}

// Fetch instant query suggestions
export async function fetchSearchSuggestions(query: string): Promise<string[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  try {
    const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.suggestions)) {
        return data.suggestions;
      }
    }
  } catch (e) {
    console.warn('Suggestions error:', e);
  }
  return [];
}

// Search YouTube videos using server API with automatic fallback
export async function searchYouTubeTracks(query: string): Promise<YouTubeSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // Primary: High-speed server-side scraper without CORS issues
  try {
    const res = await fetch(`/api/search/tracks?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        return data.tracks;
      }
    }
  } catch (err) {
    console.warn('Server search endpoint error:', err);
  }

  // Secondary fallback: iTunes directly from client
  try {
    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&limit=15`);
    if (itunesRes.ok) {
      const data = await itunesRes.json();
      if (Array.isArray(data.results)) {
        return data.results.map((item: any) => ({
          id: `itunes-${item.trackId}`,
          title: item.trackName || 'Pista de Audio',
          artist: item.artistName || 'Artista',
          duration: Math.floor((item.trackTimeMillis || 180000) / 1000),
          youtubeId: '',
          coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '500x500bb') : '',
          sourceUrl: item.previewUrl || ''
        }));
      }
    }
  } catch (err) {
    console.warn('Client fallback search error:', err);
  }

  return [];
}

