/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Track, Playlist, PlaybackState, ViewTab, DataSaverStats, EQPresetName } from './types';
import { 
  initializeStorage, 
  saveTrack, 
  savePlaylist, 
  deletePlaylist,
  deleteTrack,
  downloadTrackOffline, 
  removeOfflineDownload, 
  getStorageUsage, 
  getDataSaverStats, 
  incrementDataSaved,
  getAllTracks
} from './services/storage';
import { audioEngine } from './services/audioEngine';
import { EQ_PRESETS } from './utils/eqPresets';
import { TopHeader } from './components/TopHeader';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PlayerBar } from './components/PlayerBar';
import { FullPlayerModal } from './components/FullPlayerModal';
import { EqualizerModal } from './components/EqualizerModal';
import { AmoledPocketScreen } from './components/AmoledPocketScreen';
import { AddTrackModal } from './components/AddTrackModal';
import { DataSaverModal } from './components/DataSaverModal';
import { PlaylistView } from './components/PlaylistView';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { OfflineLibraryView } from './components/OfflineLibraryView';
import { StorageInfoModal } from './components/StorageInfoModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { extractSingleYouTubeVideoId, fetchYouTubeOEmbed } from './services/youtubeImporter';

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [storageUsedMb, setStorageUsedMb] = useState<number>(0);
  const [stats, setStats] = useState<DataSaverStats>({
    dataSavedMb: 148.5,
    batterySavedHours: 3.2,
    audioStreamsPlayed: 14
  });

  // Playback State
  const [playback, setPlayback] = useState<PlaybackState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.9,
    isMuted: false,
    isShuffle: false,
    repeatMode: 'off',
    playbackRate: 1,
    audioOnlyMode: true,
    batterySaverActive: false,
    amoledScreenOff: false,
    sleepTimerRemaining: null,
    eqPreset: 'Plano',
    eqGains: [0, 0, 0, 0, 0],
    crossfadeSeconds: 3
  });

  // Modals
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState(false);
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isDataSaverModalOpen, setIsDataSaverModalOpen] = useState(false);
  const [isStorageInfoModalOpen, setIsStorageInfoModalOpen] = useState(false);

  // Favorites tracking
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<Set<string>>(new Set());



  // Ref to hold playback state for event listeners
  const playbackRef = useRef(playback);
  playbackRef.current = playback;

  const queueRef = useRef(queue);
  queueRef.current = queue;

  // Initialize DB and Storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { tracks: loadedTracks, playlists: loadedPlaylists } = await initializeStorage();
        const safePlaylists = (loadedPlaylists || []).map((pl) => ({
          ...pl,
          trackIds: Array.isArray(pl.trackIds) ? pl.trackIds : []
        }));
        setTracks(loadedTracks || []);
        setPlaylists(safePlaylists);
        setQueue(loadedTracks || []);

        // Seed favorites
        const favPlaylist = safePlaylists.find((p) => p.id === 'playlist-favorites');
        if (favPlaylist) {
          setFavoriteTrackIds(new Set(favPlaylist.trackIds || []));
        }

        // Stats
        const currentStats = await getDataSaverStats();
        setStats(currentStats);

        const storage = await getStorageUsage();
        setStorageUsedMb(storage.totalMb);

        // Restore last playback state from localStorage
        const savedStateStr = localStorage.getItem('capibara_playback_state');
        if (savedStateStr) {
          try {
            const savedState = JSON.parse(savedStateStr);
            if (savedState.currentTab) {
              setCurrentTab(savedState.currentTab);
            }
            if (savedState.selectedPlaylistId) {
              setSelectedPlaylistId(savedState.selectedPlaylistId);
            }
            if (savedState.playback) {
              if (typeof savedState.playback.volume === 'number') {
                audioEngine.setVolume(savedState.playback.volume);
              }
              setPlayback((prev) => ({
                ...prev,
                volume: savedState.playback.volume ?? prev.volume,
                isShuffle: savedState.playback.isShuffle ?? prev.isShuffle,
                repeatMode: savedState.playback.repeatMode ?? prev.repeatMode,
                audioOnlyMode: savedState.playback.audioOnlyMode ?? prev.audioOnlyMode,
                batterySaverActive: savedState.playback.batterySaverActive ?? prev.batterySaverActive
              }));
            }

            if (savedState.queue && Array.isArray(savedState.queue) && savedState.queue.length > 0) {
              const mappedQueue = savedState.queue.map((savedTrack: Track) => {
                const freshTrack = loadedTracks.find((t) => t.id === savedTrack.id);
                return freshTrack || savedTrack;
              });
              setQueue(mappedQueue);

              if (savedState.currentTrack) {
                const freshCurrent = loadedTracks.find((t) => t.id === savedState.currentTrack.id) || savedState.currentTrack;
                setPlayback((prev) => ({
                  ...prev,
                  currentTrack: freshCurrent,
                  currentTime: savedState.currentTime || 0,
                  duration: freshCurrent.duration || 0
                }));

                await audioEngine.loadTrack(freshCurrent);
                audioEngine.seek(savedState.currentTime || 0);
              }
            }
          } catch (e) {
            console.error('Error parsing restored state:', e);
          }
        }
      } catch (err) {
        console.error('Failed to init storage:', err);
      }
    }
    loadData();
  }, []);

  // Save state to localStorage when changes occur (throttled/periodic on time update to avoid disk overhead)
  const lastSavedTimeRef = useRef<number>(0);
  useEffect(() => {
    const now = Date.now();
    if (now - lastSavedTimeRef.current < 1500) return;
    lastSavedTimeRef.current = now;

    const stateToSave = {
      currentTab,
      selectedPlaylistId,
      queue,
      currentTrack: playback.currentTrack,
      currentTime: playback.currentTime,
      playback: {
        volume: playback.volume,
        isShuffle: playback.isShuffle,
        repeatMode: playback.repeatMode,
        audioOnlyMode: playback.audioOnlyMode,
        batterySaverActive: playback.batterySaverActive
      }
    };
    localStorage.setItem('capibara_playback_state', JSON.stringify(stateToSave));
  }, [
    currentTab,
    selectedPlaylistId,
    queue,
    playback.currentTrack,
    playback.currentTime,
    playback.volume,
    playback.isShuffle,
    playback.repeatMode,
    playback.audioOnlyMode,
    playback.batterySaverActive
  ]);

  // Audio Engine Subscriptions
  useEffect(() => {
    const handlePlay = () => {
      setPlayback((prev) => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setPlayback((prev) => ({ ...prev, isPlaying: false }));
    };

    const handleTimeUpdate = (time: number) => {
      setPlayback((prev) => ({ ...prev, currentTime: time }));
    };

    const handleDurationChange = (dur: number) => {
      setPlayback((prev) => ({ ...prev, duration: dur }));
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audioEngine.on('play', handlePlay);
    audioEngine.on('pause', handlePause);
    audioEngine.on('timeupdate', handleTimeUpdate);
    audioEngine.on('durationchange', handleDurationChange);
    audioEngine.on('ended', handleEnded);
    audioEngine.on('previoustrack', handlePrevTrack);
    audioEngine.on('nexttrack', handleNextTrack);

    return () => {
      audioEngine.off('play', handlePlay);
      audioEngine.off('pause', handlePause);
      audioEngine.off('timeupdate', handleTimeUpdate);
      audioEngine.off('durationchange', handleDurationChange);
      audioEngine.off('ended', handleEnded);
      audioEngine.off('previoustrack', handlePrevTrack);
      audioEngine.off('nexttrack', handleNextTrack);
    };
  }, []);

  // Sleep Timer countdown
  useEffect(() => {
    if (playback.sleepTimerRemaining === null || playback.sleepTimerRemaining <= 0) return;

    const timer = setInterval(() => {
      setPlayback((prev) => {
        if (prev.sleepTimerRemaining === null) return prev;
        const next = prev.sleepTimerRemaining - 1;
        if (next <= 0) {
          audioEngine.pause();
          return { ...prev, sleepTimerRemaining: null, isPlaying: false };
        }
        return { ...prev, sleepTimerRemaining: next };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playback.sleepTimerRemaining]);

  // Periodic Data & Battery Savings increment while playing
  useEffect(() => {
    if (!playback.isPlaying) return;

    const interval = setInterval(async () => {
      // Audio-only saves ~2.5 MB per minute vs 1080p video
      await incrementDataSaved(0.4);
      const updated = await getDataSaverStats();
      setStats(updated);
    }, 10000);

    return () => clearInterval(interval);
  }, [playback.isPlaying]);

  // Track Playback Handlers
  const handlePlayTrack = async (track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    }
    setPlayback((prev) => ({
      ...prev,
      currentTrack: track,
      currentTime: 0,
      duration: track.duration || 0,
      isPlaying: true
    }));

    await audioEngine.loadTrack(track);
    await audioEngine.play();
  };

  const handleTogglePlay = async () => {
    if (!playback.currentTrack && tracks.length > 0) {
      handlePlayTrack(tracks[0], tracks);
      return;
    }

    if (playback.isPlaying) {
      audioEngine.pause();
    } else {
      await audioEngine.play();
    }
  };

  const handleNextTrack = () => {
    const currentList = queueRef.current.length > 0 ? queueRef.current : tracks;
    if (currentList.length === 0) return;

    const currentTrack = playbackRef.current.currentTrack;
    let nextIndex = 0;

    if (playbackRef.current.repeatMode === 'one' && currentTrack) {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }

    if (playbackRef.current.isShuffle) {
      if (currentList.length > 1 && currentTrack) {
        const currentIdx = currentList.findIndex((t) => t.id === currentTrack.id);
        do {
          nextIndex = Math.floor(Math.random() * currentList.length);
        } while (nextIndex === currentIdx);
      } else {
        nextIndex = Math.floor(Math.random() * currentList.length);
      }
    } else if (currentTrack) {
      const idx = currentList.findIndex((t) => t.id === currentTrack.id);
      nextIndex = (idx + 1) % currentList.length;
    }

    handlePlayTrack(currentList[nextIndex], currentList);
  };

  const handlePrevTrack = () => {
    const currentList = queueRef.current.length > 0 ? queueRef.current : tracks;
    if (currentList.length === 0) return;

    // If current time > 3s, replay current track
    if (playbackRef.current.currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    const currentTrack = playbackRef.current.currentTrack;
    let prevIndex = 0;

    if (playbackRef.current.isShuffle) {
      if (currentList.length > 1 && currentTrack) {
        const currentIdx = currentList.findIndex((t) => t.id === currentTrack.id);
        do {
          prevIndex = Math.floor(Math.random() * currentList.length);
        } while (prevIndex === currentIdx);
      } else {
        prevIndex = Math.floor(Math.random() * currentList.length);
      }
    } else if (currentTrack) {
      const idx = currentList.findIndex((t) => t.id === currentTrack.id);
      prevIndex = (idx - 1 + currentList.length) % currentList.length;
    }

    handlePlayTrack(currentList[prevIndex], currentList);
  };

  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
    setPlayback((prev) => ({ ...prev, currentTime: seconds }));
  };

  const handleVolumeChange = (vol: number) => {
    audioEngine.setVolume(vol);
    setPlayback((prev) => ({ ...prev, volume: vol, isMuted: vol === 0 }));
  };

  const handleToggleMute = () => {
    const newMuted = !playback.isMuted;
    if (newMuted) {
      audioEngine.setVolume(0);
    } else {
      audioEngine.setVolume(playback.volume || 0.8);
    }
    setPlayback((prev) => ({ ...prev, isMuted: newMuted }));
  };

  const handleToggleShuffle = () => {
    setPlayback((prev) => ({ ...prev, isShuffle: !prev.isShuffle }));
  };

  const handleToggleRepeatMode = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIdx = modes.indexOf(playback.repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setPlayback((prev) => ({ ...prev, repeatMode: nextMode }));
  };

  const handleCycleRepeat = handleToggleRepeatMode;

  const handleSetPlaybackRate = (rate: number) => {
    audioEngine.setPlaybackRate(rate);
    setPlayback((prev) => ({ ...prev, playbackRate: rate }));
  };

  const handleSelectEqPreset = (presetName: EQPresetName) => {
    if (presetName === 'Personalizado') {
      audioEngine.setEqGains(playback.eqGains);
      setPlayback((prev) => ({
        ...prev,
        eqPreset: 'Personalizado'
      }));
      return;
    }
    const presetObj = EQ_PRESETS.find((p) => p.name === presetName);
    const gains = presetObj ? presetObj.gains : [0, 0, 0, 0, 0];
    audioEngine.setEqGains(gains);
    setPlayback((prev) => ({
      ...prev,
      eqPreset: presetName,
      eqGains: gains
    }));
  };

  const handleChangeEqGain = (bandIdx: number, gainDb: number) => {
    const updatedGains = [...playback.eqGains];
    updatedGains[bandIdx] = gainDb;
    audioEngine.setEqGains(updatedGains);
    setPlayback((prev) => ({
      ...prev,
      eqPreset: 'Personalizado',
      eqGains: updatedGains
    }));
  };

  const handleChangeCrossfade = (seconds: number) => {
    audioEngine.setCrossfadeSeconds(seconds);
    setPlayback((prev) => ({
      ...prev,
      crossfadeSeconds: seconds
    }));
  };

  const handleResetEqAndCrossfade = () => {
    const defaultGains = [0, 0, 0, 0, 0];
    audioEngine.setEqGains(defaultGains);
    audioEngine.setCrossfadeSeconds(3);
    setPlayback((prev) => ({
      ...prev,
      eqPreset: 'Plano',
      eqGains: defaultGains,
      crossfadeSeconds: 3
    }));
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    setPlayback((prev) => ({
      ...prev,
      sleepTimerRemaining: minutes ? minutes * 60 : null
    }));
  };

  // Favorites
  const handleToggleFavorite = async (trackId: string) => {
    const nextFavs = new Set(favoriteTrackIds);
    if (nextFavs.has(trackId)) {
      nextFavs.delete(trackId);
    } else {
      nextFavs.add(trackId);
    }
    setFavoriteTrackIds(nextFavs);

    // Sync to favorites playlist
    let favPlaylist = playlists.find((p) => p.id === 'playlist-favorites');
    if (favPlaylist) {
      favPlaylist.trackIds = Array.from(nextFavs);
      await savePlaylist(favPlaylist);
      setPlaylists([...playlists]);
    }
  };

  // Offline Download - strictly verifies if already downloaded
  const handleDownloadTrack = async (track: Track) => {
    if (track.isDownloaded && track.cachedBlobKey) {
      // Already downloaded! Skip redundant work
      return;
    }
    try {
      const updated = await downloadTrackOffline(track);
      setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      if (playback.currentTrack?.id === updated.id) {
        setPlayback((prev) => ({ ...prev, currentTrack: updated }));
      }

      const storage = await getStorageUsage();
      setStorageUsedMb(storage.totalMb);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleRemoveDownload = async (track: Track) => {
    try {
      const updated = await removeOfflineDownload(track);
      setTracks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

      if (playback.currentTrack?.id === updated.id) {
        setPlayback((prev) => ({ ...prev, currentTrack: updated }));
      }

      const storage = await getStorageUsage();
      setStorageUsedMb(storage.totalMb);
    } catch (err) {
      console.error('Remove download failed:', err);
    }
  };

  const handleDownloadAllInPlaylist = async (playlistTracks: Track[]) => {
    // Strictly filter only tracks that are not yet downloaded
    const pendingTracks = playlistTracks.filter((t) => !t.isDownloaded);
    for (const t of pendingTracks) {
      await handleDownloadTrack(t);
    }
  };

  // Add Track / Video Link
  const handleAddTrack = async (newTrack: Track, targetPlaylistId?: string) => {
    await saveTrack(newTrack);
    setTracks((prev) => [newTrack, ...prev]);

    if (targetPlaylistId) {
      const targetPl = playlists.find((p) => p.id === targetPlaylistId);
      if (targetPl) {
        targetPl.trackIds.push(newTrack.id);
        await savePlaylist(targetPl);
        setPlaylists([...playlists]);
      }
    }

    // Immediately play the added track
    handlePlayTrack(newTrack, [newTrack, ...tracks]);
  };

  // Quick play link from search
  const handleQuickPlayUrl = async (url: string) => {
    const ytId = extractSingleYouTubeVideoId(url);
    const isYt = !!ytId;

    let trackTitle = isYt ? 'Audio de Video YouTube' : 'Audio Stream Enlace';
    let trackArtist = isYt ? 'YouTube Web Audio' : 'Web Stream';
    let trackCover = ytId 
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` 
      : '/src/assets/images/cover_electronic_energy_1790457693133.jpg';

    if (ytId) {
      try {
        const meta = await fetchYouTubeOEmbed(ytId);
        trackTitle = meta.title;
        trackArtist = meta.author;
        trackCover = meta.coverUrl;
      } catch (e) {
        // fallback
      }
    }

    const quickTrack: Track = {
      id: `track-quick-${Date.now()}`,
      title: trackTitle,
      artist: trackArtist,
      album: 'Reproducción Inmediata',
      duration: 200,
      sourceType: isYt ? 'youtube' : 'direct',
      sourceUrl: url,
      youtubeId: ytId || undefined,
      coverUrl: trackCover,
      isDownloaded: false,
      addedAt: Date.now(),
      fileSizeMb: 4.5,
      tags: ['Enlace Rápido', 'Solo Audio']
    };

    handleAddTrack(quickTrack);
  };

  const handleImportYouTubeSearchTrack = async (searchTrack: {
    title: string;
    artist: string;
    duration: number;
    youtubeId: string;
    coverUrl: string;
    sourceUrl: string;
  }, targetPlaylistId?: string): Promise<Track> => {
    // Check if we already have this track
    const existing = tracks.find((t) => t.youtubeId === searchTrack.youtubeId);
    if (existing) {
      if (targetPlaylistId) {
        await handleAddToPlaylist(targetPlaylistId, existing.id);
      }
      return existing;
    }

    const newTrack: Track = {
      id: `yt-track-${searchTrack.youtubeId}`,
      title: searchTrack.title,
      artist: searchTrack.artist,
      album: 'YouTube Live Search',
      duration: searchTrack.duration,
      sourceType: 'youtube',
      sourceUrl: searchTrack.sourceUrl,
      youtubeId: searchTrack.youtubeId,
      coverUrl: searchTrack.coverUrl,
      isDownloaded: false,
      addedAt: Date.now(),
      fileSizeMb: parseFloat((searchTrack.duration * 0.022).toFixed(1)) || 4.5,
      lyrics: `[Pista buscada en YouTube]\nReproducción de audio en segundo plano sin video.`,
      tags: ['YouTube', searchTrack.artist]
    };

    await saveTrack(newTrack);
    setTracks((prev) => [newTrack, ...prev]);

    if (targetPlaylistId) {
      const targetPl = playlists.find((p) => p.id === targetPlaylistId);
      if (targetPl) {
        if (!targetPl.trackIds.includes(newTrack.id)) {
          const updatedPl = { ...targetPl, trackIds: [...targetPl.trackIds, newTrack.id] };
          await savePlaylist(updatedPl);
          setPlaylists((prev) => prev.map((p) => (p.id === targetPlaylistId ? updatedPl : p)));
        }
      }
    }

    return newTrack;
  };


  // Create new blank playlist with full details
  const handleCreatePlaylistWithDetails = async (
    title: string,
    description = 'Lista de reproducción personalizada con ahorro de datos y batería.',
    coverUrl = '/src/assets/images/cover_lofi_chill_1790457683214.jpg',
    shouldNavigate = true
  ): Promise<Playlist | null> => {
    if (!title || !title.trim()) return null;

    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Lista de reproducción personalizada.',
      coverUrl: coverUrl || '/src/assets/images/cover_lofi_chill_1790457683214.jpg',
      trackIds: [],
      createdAt: Date.now(),
      isSpotifyImport: false
    };

    await savePlaylist(newPl);
    setPlaylists((prev) => [newPl, ...prev]);
    if (shouldNavigate) {
      setSelectedPlaylistId(newPl.id);
      setCurrentTab('playlist');
    }
    return newPl;
  };

  // Create new blank playlist (handles both string and modal opening)
  const handleCreatePlaylist = async (customName?: any, shouldNavigate = true): Promise<Playlist | null> => {
    // If called with a valid string title (e.g. from YouTube search "add to new playlist")
    if (typeof customName === 'string' && customName.trim().length > 0) {
      return handleCreatePlaylistWithDetails(customName.trim(), undefined, undefined, shouldNavigate);
    }

    // Otherwise, open the dedicated playlist creation modal
    setIsCreatePlaylistModalOpen(true);
    return null;
  };

  const handleRenamePlaylist = async (playlistId: string, newTitle: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updatedPl = { ...pl, title: newTitle.trim() || pl.title };
    await savePlaylist(updatedPl);
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updatedPl : p)));
  };

  const handleUpdatePlaylistCover = async (playlistId: string, newCoverUrl: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    const updatedPl = { ...pl, coverUrl: newCoverUrl };
    await savePlaylist(updatedPl);
    setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updatedPl : p)));
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    await deletePlaylist(playlistId);
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null);
      setCurrentTab('library');
    }
  };

  const handleRemoveTrackFromPlaylist = async (trackId: string) => {
    if (!selectedPlaylistId) return;
    const pl = playlists.find((p) => p.id === selectedPlaylistId);
    if (!pl) return;

    pl.trackIds = pl.trackIds.filter((id) => id !== trackId);
    await savePlaylist(pl);
    setPlaylists([...playlists]);
  };

  const handleAddToPlaylist = async (playlistId: string, trackId: string) => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;
    if (!pl.trackIds.includes(trackId)) {
      const updatedPl = { ...pl, trackIds: [...pl.trackIds, trackId] };
      await savePlaylist(updatedPl);
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updatedPl : p)));
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrack(trackId);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      setPlaylists((prev) =>
        prev.map((pl) => ({
          ...pl,
          trackIds: pl.trackIds.filter((id) => id !== trackId)
        }))
      );
      if (playback.currentTrack?.id === trackId) {
        handleNextTrack();
      }
    } catch (err) {
      console.error('Delete track error:', err);
    }
  };

  const handleDataRestored = (restored: { tracks: Track[]; playlists: Playlist[] }) => {
    setTracks(restored.tracks);
    setPlaylists(restored.playlists);
    setQueue(restored.tracks);
  };

  const handleLocalFilesImported = async (newTracks: Track[]) => {
    try {
      const freshTracks = await getAllTracks();
      setTracks(freshTracks);
      
      const storage = await getStorageUsage();
      setStorageUsedMb(storage.totalMb);
    } catch (e) {
      console.error('Error refreshing storage after local import:', e);
    }
  };

  // Active playlist for PlaylistView
  const activePlaylist = selectedPlaylistId
    ? playlists.find((p) => p.id === selectedPlaylistId)
    : null;

  const activePlaylistTracks = activePlaylist
    ? (activePlaylist.trackIds || [])
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is Track => t !== undefined)
    : [];

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col bg-[#121212] text-white selection:bg-[#c8824b] selection:text-black ${
      playback.batterySaverActive ? 'transition-none' : ''
    }`}>
      {/* Top App Header */}
      <TopHeader
        batterySaverActive={playback.batterySaverActive}
        onToggleBatterySaver={() =>
          setPlayback((prev) => ({ ...prev, batterySaverActive: !prev.batterySaverActive }))
        }
        onOpenAmoledPocket={() =>
          setPlayback((prev) => ({ ...prev, amoledScreenOff: true }))
        }
        onOpenAddTrack={() => setIsAddTrackModalOpen(true)}
        onOpenDataSaverModal={() => setIsDataSaverModalOpen(true)}
        onOpenStorageInfoModal={() => setIsStorageInfoModalOpen(true)}
        onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentTab !== 'search') setCurrentTab('search');
        }}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setSelectedPlaylistId(null);
            setCurrentTab(tab);
          }}
          playlists={playlists}
          selectedPlaylistId={selectedPlaylistId}
          onSelectPlaylist={(plId) => {
            setSelectedPlaylistId(plId);
            setCurrentTab('playlist');
          }}
          onCreatePlaylist={handleCreatePlaylist}
        />

        {/* Central Scrollable Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#181818]/60 to-[#121212] relative">
          {/* Active Tab Router */}
          {selectedPlaylistId && activePlaylist ? (
            <PlaylistView
              playlist={activePlaylist}
              tracks={activePlaylistTracks}
              allPlaylists={playlists}
              currentTrackId={playback.currentTrack?.id}
              isPlaying={playback.isPlaying}
              isShuffle={playback.isShuffle}
              onToggleShuffle={handleToggleShuffle}
              repeatMode={playback.repeatMode}
              onToggleRepeatMode={handleToggleRepeatMode}
              onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
              eqPreset={playback.eqPreset}
              onPlayTrack={(track, context) => handlePlayTrack(track, context)}
              onTogglePlay={handleTogglePlay}
              onPlayAll={(shuffle) => {
                if (activePlaylistTracks.length > 0) {
                  if (shuffle) {
                    setPlayback((prev) => ({ ...prev, isShuffle: true }));
                    const randomIndex = Math.floor(Math.random() * activePlaylistTracks.length);
                    handlePlayTrack(activePlaylistTracks[randomIndex], activePlaylistTracks);
                  } else {
                    handlePlayTrack(activePlaylistTracks[0], activePlaylistTracks);
                  }
                }
              }}
              onDownloadTrack={handleDownloadTrack}
              onDownloadAll={() => handleDownloadAllInPlaylist(activePlaylistTracks)}
              onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onUpdatePlaylistCover={handleUpdatePlaylistCover}
              onOpenAddTrack={() => setIsAddTrackModalOpen(true)}
              onDeleteTrack={handleDeleteTrack}
              onAddToPlaylist={handleAddToPlaylist}
              onCreatePlaylist={(name) => handleCreatePlaylist(name, false)}
            />
          ) : currentTab === 'home' ? (
            <HomeView
              playlists={playlists}
              tracks={tracks}
              onSelectPlaylist={(plId) => {
                setSelectedPlaylistId(plId);
                setCurrentTab('playlist');
              }}
              onPlayTrack={(track, context) => handlePlayTrack(track, context)}
              currentTrackId={playback.currentTrack?.id}
              isPlaying={playback.isPlaying}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onUpdatePlaylistCover={handleUpdatePlaylistCover}
              onOpenDataSaverModal={() => setIsDataSaverModalOpen(true)}
              onOpenAddTrack={() => setIsAddTrackModalOpen(true)}
              onDeleteTrack={handleDeleteTrack}
              onDownloadTrack={handleDownloadTrack}
              onAddToPlaylist={handleAddToPlaylist}
              onCreatePlaylist={(name) => handleCreatePlaylist(name, false)}
            />
          ) : currentTab === 'search' ? (
            <SearchView
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              tracks={tracks}
              playlists={playlists}
              onPlayTrack={(track, context) => handlePlayTrack(track, context)}
              currentTrackId={playback.currentTrack?.id}
              isPlaying={playback.isPlaying}
              onDownloadTrack={handleDownloadTrack}
              onAddTrackQuick={handleQuickPlayUrl}
              onDeleteTrack={handleDeleteTrack}
              onAddToPlaylist={handleAddToPlaylist}
              onCreatePlaylist={(name) => handleCreatePlaylist(name, false)}
              onImportYouTubeSearchTrack={handleImportYouTubeSearchTrack}
            />
          ) : currentTab === 'library' ? (
            <LibraryView
              playlists={playlists}
              tracks={tracks}
              onSelectPlaylist={(plId) => {
                setSelectedPlaylistId(plId);
                setCurrentTab('playlist');
              }}
              onCreatePlaylist={handleCreatePlaylist}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onUpdatePlaylistCover={handleUpdatePlaylistCover}
              onOpenStorageInfo={() => setIsStorageInfoModalOpen(true)}
              onSelectTab={setCurrentTab}
              onDataRestored={handleDataRestored}
            />
          ) : currentTab === 'offline' ? (
            <OfflineLibraryView
              tracks={tracks}
              playlists={playlists}
              onPlayTrack={(track, context) => handlePlayTrack(track, context)}
              onRemoveDownload={handleRemoveDownload}
              totalMbUsed={storageUsedMb}
              onDeleteTrack={handleDeleteTrack}
              onAddToPlaylist={handleAddToPlaylist}
              onCreatePlaylist={(name) => handleCreatePlaylist(name, false)}
              onLocalFilesImported={handleLocalFilesImported}
            />
          ) : null}
        </main>
      </div>

      {/* Sticky Bottom Player Bar */}
      <PlayerBar
        playback={playback}
        playlists={playlists}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrevious={handlePrevTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={handleToggleShuffle}
        onCycleRepeat={handleCycleRepeat}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={
          playback.currentTrack ? favoriteTrackIds.has(playback.currentTrack.id) : false
        }
        onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        onOpenAmoledPocket={() =>
          setPlayback((prev) => ({ ...prev, amoledScreenOff: true }))
        }
        onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
        onDeleteTrack={handleDeleteTrack}
        onDownloadTrack={handleDownloadTrack}
        onAddToPlaylist={handleAddToPlaylist}
      />

      {/* Mobile Bottom Tab Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onClearSelectedPlaylist={() => setSelectedPlaylistId(null)}
      />

      {/* Full Screen Player Modal */}
      <FullPlayerModal
        isOpen={isFullPlayerOpen}
        onClose={() => setIsFullPlayerOpen(false)}
        playback={playback}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrevious={handlePrevTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleShuffle={handleToggleShuffle}
        onCycleRepeat={handleCycleRepeat}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={
          playback.currentTrack ? favoriteTrackIds.has(playback.currentTrack.id) : false
        }
        onDownloadTrack={handleDownloadTrack}
        onOpenAmoledPocket={() => {
          setIsFullPlayerOpen(false);
          setPlayback((prev) => ({ ...prev, amoledScreenOff: true }));
        }}
        onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
        onSetSleepTimer={handleSetSleepTimer}
        onSetPlaybackRate={handleSetPlaybackRate}
        queue={queue}
        onPlayFromQueue={(t) => handlePlayTrack(t, queue)}
      />

      {/* Equalizer & Crossfade PRO Modal */}
      <EqualizerModal
        isOpen={isEqualizerModalOpen}
        onClose={() => setIsEqualizerModalOpen(false)}
        eqPreset={playback.eqPreset}
        eqGains={playback.eqGains}
        crossfadeSeconds={playback.crossfadeSeconds}
        isPlaying={playback.isPlaying}
        onSelectPreset={handleSelectEqPreset}
        onChangeGain={handleChangeEqGain}
        onChangeCrossfade={handleChangeCrossfade}
        onReset={handleResetEqAndCrossfade}
      />

      {/* AMOLED Pocket Black Screen Saver */}
      <AmoledPocketScreen
        isActive={playback.amoledScreenOff}
        onExit={() => setPlayback((prev) => ({ ...prev, amoledScreenOff: false }))}
        track={playback.currentTrack}
        isPlaying={playback.isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrevious={handlePrevTrack}
      />

      {/* Add Track or Video Link Modal */}
      <AddTrackModal
        isOpen={isAddTrackModalOpen}
        onClose={() => setIsAddTrackModalOpen(false)}
        onAddTrack={handleAddTrack}
        playlists={playlists}
        onCreatePlaylist={(name) => handleCreatePlaylist(name, false)}
      />

      {/* Data & Battery Saver Modal */}
      <DataSaverModal
        isOpen={isDataSaverModalOpen}
        onClose={() => setIsDataSaverModalOpen(false)}
        stats={stats}
        batterySaverActive={playback.batterySaverActive}
        onToggleBatterySaver={() =>
          setPlayback((prev) => ({ ...prev, batterySaverActive: !prev.batterySaverActive }))
        }
        onOpenAmoledPocket={() => {
          setIsDataSaverModalOpen(false);
          setPlayback((prev) => ({ ...prev, amoledScreenOff: true }));
        }}
      />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setIsCreatePlaylistModalOpen(false)}
        onCreate={handleCreatePlaylistWithDetails}
        defaultIndex={playlists.length + 1}
      />

      {/* Storage and Backup Info Modal */}
      <StorageInfoModal
        isOpen={isStorageInfoModalOpen}
        onClose={() => setIsStorageInfoModalOpen(false)}
        playlistsCount={playlists.length}
        tracksCount={tracks.length}
        storageUsedMb={storageUsedMb}
        onDataRestored={handleDataRestored}
      />


    </div>
  );
}
