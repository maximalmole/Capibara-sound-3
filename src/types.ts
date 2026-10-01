export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  sourceType: 'youtube' | 'direct' | 'stream';
  sourceUrl: string; // Original video or audio URL
  youtubeId?: string;
  coverUrl: string;
  isDownloaded: boolean;
  cachedBlobKey?: string;
  addedAt: number;
  lyrics?: string;
  fileSizeMb?: number;
  tags?: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackIds: string[];
  createdAt: number;
  isSpotifyImport?: boolean;
  spotifyUrl?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type EQPresetName = 
  | 'Plano' 
  | 'Bass Boost' 
  | 'Voces Claras' 
  | 'Acústico' 
  | 'Rock' 
  | 'Electrónica' 
  | 'Suave' 
  | 'Agudos Boost' 
  | 'Personalizado';

export interface EQPreset {
  name: EQPresetName;
  label: string;
  gains: number[]; // 5 band gains in dB (-12 to +12)
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  playbackRate: number;
  audioOnlyMode: boolean; // Shuts down video rendering to save mobile data & CPU
  batterySaverActive: boolean; // Disables animations, visualizers, dims UI
  amoledScreenOff: boolean; // True black screen saver for AMOLED displays
  sleepTimerRemaining: number | null; // Seconds remaining
  eqPreset: EQPresetName;
  eqGains: number[]; // 5 band values
  crossfadeSeconds: number; // 0, 2, 3, 5, 8
}

export type ViewTab = 'home' | 'search' | 'library' | 'spotify-import' | 'offline' | 'playlist';

export interface DataSaverStats {
  dataSavedMb: number;
  batterySavedHours: number;
  audioStreamsPlayed: number;
}
