import { Track } from '../types';
import { getOfflineAudioUrl } from './storage';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type AudioEngineEvent = 
  | 'play'
  | 'pause'
  | 'timeupdate'
  | 'durationchange'
  | 'ended'
  | 'error'
  | 'loading'
  | 'loaded'
  | 'previoustrack'
  | 'nexttrack';

type EventListener = (...args: any[]) => void;

class AudioEngine {
  private audioElement: HTMLAudioElement;
  private ytPlayer: any = null;
  private ytReady: boolean = false;
  private ytContainerId = 'yt-hidden-player';
  private currentTrack: Track | null = null;
  private isYouTube: boolean = false;
  private listeners: Map<AudioEngineEvent, Set<EventListener>> = new Map();
  private timeUpdateInterval: any = null;
  private wakeLock: any = null;
  private currentBlobUrl: string | null = null;

  // Live in-memory cache of local File references to play direct from physical storage with 0 duplication!
  public localFilesCache: Map<string, File> = new Map();

  // Volume transition / Fade settings
  private currentVolume: number = 0.8;
  private currentFadeInterval: any = null;
  private isFading: boolean = false;

  // Web Audio API EQ & Crossfade Nodes
  private audioContext: AudioContext | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private mainGainNode: GainNode | null = null;
  private currentEqGains: number[] = [0, 0, 0, 0, 0];
  public crossfadeSeconds: number = 6;
  private crossfadeTriggeredForTrackId: string | null = null;
  private silentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';
    this.setupAudioListeners();
    this.initYouTubeAPI();
    this.setupMediaSession();
    this.setupBackgroundKeepAlive();
  }

  private setupBackgroundKeepAlive() {
    if (typeof window === 'undefined') return;
    try {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // When app goes to background on mobile phone, request wake lock
          this.requestWakeLock();
          if (this.isYouTube && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
            try {
              const state = typeof this.ytPlayer.getPlayerState === 'function' ? this.ytPlayer.getPlayerState() : -1;
              if (state === 1 || state === 3) {
                // Ensure video attempts to continue playing
                this.ytPlayer.playVideo();
              }
            } catch (e) {
              // quiet
            }
          }
        } else {
          // When returning to app
          if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
          }
        }
      });
    } catch (e) {
      console.warn('Background keep-alive setup error:', e);
    }
  }

  private initAudioContext() {
    if (this.audioContext || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioContext = new AudioContextClass();

      if (!this.mediaSourceNode) {
        this.mediaSourceNode = this.audioContext.createMediaElementSource(this.audioElement);
      }

      // 5-Band EQ Frequencies with wide Q=0.7 Butterworth bandwidths for maximum audible contrast
      const freqs = [100, 300, 1200, 4000, 8000];
      const types: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

      this.eqFilters = freqs.map((freq, i) => {
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = types[i];
        filter.frequency.value = freq;
        filter.Q.value = 0.7; // Broad musical Q factor for unmistakable tonal differences!
        filter.gain.value = this.currentEqGains[i] || 0;
        return filter;
      });

      this.mainGainNode = this.audioContext.createGain();
      this.mainGainNode.gain.value = this.currentVolume;

      let lastNode: AudioNode = this.mediaSourceNode;
      this.eqFilters.forEach((filter) => {
        lastNode.connect(filter);
        lastNode = filter;
      });

      lastNode.connect(this.mainGainNode);
      this.mainGainNode.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API EQ initialization fallback:', e);
    }
  }

  public setEqGains(gains: number[]) {
    this.currentEqGains = gains;
    if (!this.audioContext) {
      this.initAudioContext();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    if (this.eqFilters && this.eqFilters.length > 0) {
      this.eqFilters.forEach((filter, i) => {
        if (filter && gains[i] !== undefined) {
          try {
            filter.gain.value = gains[i];
            if (this.audioContext) {
              filter.gain.setTargetAtTime(gains[i], this.audioContext.currentTime, 0.03);
            }
          } catch (e) {
            filter.gain.value = gains[i];
          }
        }
      });
    }
  }

  public setCrossfadeSeconds(sec: number) {
    this.crossfadeSeconds = sec;
  }

  private updateMediaPositionState() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || typeof (navigator.mediaSession as any).setPositionState !== 'function') return;
    try {
      const duration = this.getDuration();
      const position = this.getCurrentTime();
      if (duration > 0 && position >= 0 && position <= duration) {
        (navigator.mediaSession as any).setPositionState({
          duration,
          playbackRate: 1,
          position
        });
      }
    } catch (e) {
      // quiet
    }
  }

  private setupAudioListeners() {
    this.audioElement.addEventListener('play', () => {
      if (!this.isYouTube) {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        this.emit('play');
      }
    });
    this.audioElement.addEventListener('pause', () => {
      if (!this.isYouTube) {
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
        this.emit('pause');
      }
    });
    this.audioElement.addEventListener('timeupdate', () => {
      if (!this.isYouTube) {
        const cur = this.audioElement.currentTime;
        const dur = this.audioElement.duration;
        this.emit('timeupdate', cur);
        this.updateMediaPositionState();

        // Check for crossfade transition near end of track
        if (
          this.crossfadeSeconds > 0 &&
          dur > 5 &&
          cur >= dur - this.crossfadeSeconds &&
          this.currentTrack &&
          this.crossfadeTriggeredForTrackId !== this.currentTrack.id
        ) {
          this.crossfadeTriggeredForTrackId = this.currentTrack.id;
          this.fadeVolume(this.currentVolume, 0, this.crossfadeSeconds * 1000, () => {
            this.emit('ended');
          });
        }
      }
    });
    this.audioElement.addEventListener('durationchange', () => {
      if (!this.isYouTube && !isNaN(this.audioElement.duration)) {
        this.emit('durationchange', this.audioElement.duration);
      }
    });
    this.audioElement.addEventListener('ended', () => {
      if (!this.isYouTube && this.crossfadeTriggeredForTrackId !== this.currentTrack?.id) {
        if (this.currentTrack) {
          this.crossfadeTriggeredForTrackId = this.currentTrack.id;
        }
        this.emit('ended');
      }
    });
    this.audioElement.addEventListener('error', (e) => {
      if (!this.isYouTube) {
        console.warn('HTML5 Audio error:', e);
        this.emit('error', e);
      }
    });
  }

  private initYouTubeAPI() {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('yt-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.initYTPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      this.initYTPlayer();
    }
  }

  private initYTPlayer(initialVideoId?: string) {
    if (typeof window === 'undefined') return;

    let container = document.getElementById(this.ytContainerId);
    if (!container && typeof document !== 'undefined' && document.body) {
      container = document.createElement('div');
      container.id = this.ytContainerId;
      container.style.position = 'fixed';
      container.style.bottom = '0px';
      container.style.right = '0px';
      container.style.width = '240px';
      container.style.height = '180px';
      container.style.opacity = '0.05';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '0';
      container.style.transform = 'scale(0.05)';
      container.style.transformOrigin = 'bottom right';
      document.body.appendChild(container);
    }

    if (!window.YT || !window.YT.Player) {
      this.initYouTubeAPI();
      return;
    }

    try {
      this.ytPlayer = new window.YT.Player(this.ytContainerId, {
        height: '180',
        width: '240',
        videoId: initialVideoId || undefined,
        playerVars: {
          autoplay: initialVideoId ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            this.ytReady = true;
            if (this.isYouTube && this.currentTrack?.youtubeId) {
              try {
                event.target.unMute();
                event.target.setVolume(Math.round(this.currentVolume * 100));
                event.target.playVideo();
              } catch (e) {
                console.warn('Auto-play on ready caught:', e);
              }
            }
          },
          onStateChange: (event: any) => {
            this.handleYTStateChange(event);
          },
          onError: (event: any) => {
            console.warn('YT Player Error:', event.data);
            this.emit('error', event);
          }
        }
      });
    } catch (e) {
      console.error('Error initializing YT Player:', e);
    }
  }

  private handleYTStateChange(event: any) {
    if (typeof window === 'undefined' || !window.YT) return;
    const PlayerState = window.YT.PlayerState;

    switch (event.data) {
      case PlayerState.PLAYING:
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
        this.emit('play');
        this.startYTProgressPolling();
        break;
      case PlayerState.PAUSED:
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
        this.emit('pause');
        this.stopYTProgressPolling();
        break;
      case PlayerState.ENDED:
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'none';
        }
        if (this.crossfadeTriggeredForTrackId !== this.currentTrack?.id) {
          if (this.currentTrack) {
            this.crossfadeTriggeredForTrackId = this.currentTrack.id;
          }
          this.emit('ended');
        }
        this.stopYTProgressPolling();
        break;
      case PlayerState.BUFFERING:
        this.emit('loading');
        break;
    }
  }

  private startYTProgressPolling() {
    this.stopYTProgressPolling();
    this.timeUpdateInterval = setInterval(() => {
      if (this.isYouTube && this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
        const curr = this.ytPlayer.getCurrentTime();
        this.emit('timeupdate', curr);
        this.updateMediaPositionState();
        const dur = this.ytPlayer.getDuration();
        if (dur) {
          this.emit('durationchange', dur);
          if (
            this.crossfadeSeconds > 0 &&
            dur > 5 &&
            curr >= dur - this.crossfadeSeconds &&
            this.currentTrack &&
            this.crossfadeTriggeredForTrackId !== this.currentTrack.id
          ) {
            this.crossfadeTriggeredForTrackId = this.currentTrack.id;
            this.fadeVolume(this.currentVolume, 0, this.crossfadeSeconds * 1000, () => {
              this.emit('ended');
            });
          }
        }
      }
    }, 350);
  }

  private stopYTProgressPolling() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  // High-resolution smooth Volume transition (Fade) to eliminate abrupt cuts
  private fadeVolume(start: number, end: number, durationMs: number, callback?: () => void) {
    if (this.currentFadeInterval) {
      clearInterval(this.currentFadeInterval);
      this.currentFadeInterval = null;
    }

    this.isFading = true;
    const intervalMs = 20; // 50 updates per second for silky smooth volume ramps
    const startTime = Date.now();

    const setVolumeInternal = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      if (this.isYouTube) {
        if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
          this.ytPlayer.setVolume(Math.round(clamped * 100));
        }
      } else {
        this.audioElement.volume = clamped;
      }
    };

    setVolumeInternal(start);

    if (durationMs <= 40) {
      setVolumeInternal(end);
      this.isFading = false;
      if (callback) callback();
      return;
    }

    this.currentFadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth Cosine S-curve easing for natural audio perception
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
      const currentVal = start + (end - start) * easeProgress;

      setVolumeInternal(currentVal);

      if (progress >= 1) {
        clearInterval(this.currentFadeInterval);
        this.currentFadeInterval = null;
        this.isFading = false;
        setVolumeInternal(end);
        if (callback) callback();
      }
    }, intervalMs);
  }

  public loadTrackSync(track: Track) {
    this.currentTrack = track;
    this.crossfadeTriggeredForTrackId = null;
    this.emit('loading');

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    if (track.sourceType === 'youtube' && track.youtubeId && !track.isDownloaded) {
      this.isYouTube = true;
      // Stop standard audio
      this.audioElement.pause();
      this.audioElement.src = '';

      const startAndPlay = () => {
        if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
          try {
            this.ytPlayer.unMute();
            this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
            this.ytPlayer.loadVideoById({
              videoId: track.youtubeId,
              startSeconds: 0,
              suggestedQuality: 'small'
            });
            this.ytPlayer.playVideo();
            this.emit('loaded');
            return true;
          } catch (e) {
            console.warn('loadVideoById threw error:', e);
            return false;
          }
        }
        return false;
      };

      if (!startAndPlay()) {
        // If player is not ready or null, re-initialize with this video ID directly
        this.initYTPlayer(track.youtubeId);

        let retries = 0;
        const checkReady = setInterval(() => {
          retries++;
          if (startAndPlay()) {
            clearInterval(checkReady);
          } else if (retries > 30) {
            clearInterval(checkReady);
            this.emit('error', new Error('No se pudo inicializar la reproducción de YouTube.'));
          }
        }, 150);
      }
    } else if (track.sourceType !== 'youtube' && !track.isDownloaded) {
      this.isYouTube = false;
      this.audioElement.src = track.sourceUrl;
      this.audioElement.load();
      this.emit('loaded');
    }

    this.updateMediaSession(track);
  }

  public async loadTrack(track: Track): Promise<void> {
    this.currentTrack = track;
    this.crossfadeTriggeredForTrackId = null;

    // 1. Fade-out existing track if currently playing
    const isPlaying = this.isYouTube 
      ? (this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function' && this.ytPlayer.getPlayerState() === 1)
      : (!this.audioElement.paused && this.audioElement.currentTime > 0);

    if (isPlaying) {
      const fadeOutMs = this.crossfadeSeconds > 0 ? Math.min(1500, this.crossfadeSeconds * 1000) : 250;
      await new Promise<void>((resolve) => {
        this.fadeVolume(this.currentVolume, 0, fadeOutMs, () => {
          if (this.isYouTube) {
            if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
              this.ytPlayer.pauseVideo();
            }
          } else {
            this.audioElement.pause();
          }
          resolve();
        });
      });
    }

    // Check 0: Check if we have an in-memory direct local File reference (0 duplication)
    const cachedFile = this.localFilesCache.get(track.id);
    if (cachedFile) {
      this.currentTrack = track;
      this.emit('loading');
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = null;
      }
      this.isYouTube = false;
      const localUrl = URL.createObjectURL(cachedFile);
      this.currentBlobUrl = localUrl;
      this.audioElement.src = localUrl;
      this.audioElement.load();
      this.updateMediaSession(track);
      this.emit('loaded');
      return;
    }

    // Check 1: If track is downloaded offline in IndexedDB
    const isOffline = track.isDownloaded;
    const shouldPlayOffline = isOffline && (!navigator.onLine || track.sourceType === 'direct');
    if (shouldPlayOffline) {
      this.currentTrack = track;
      this.emit('loading');

      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = null;
      }

      const offlineUrl = await getOfflineAudioUrl(track.id);
      if (offlineUrl) {
        this.isYouTube = false;
        this.currentBlobUrl = offlineUrl;
        this.audioElement.src = offlineUrl;
        this.audioElement.load();
        this.updateMediaSession(track);
        this.emit('loaded');
        return;
      }
    }

    // Otherwise, load synchronously to keep user gesture context intact
    this.loadTrackSync(track);
  }

  public async play(): Promise<void> {
    this.requestWakeLock();
    this.initAudioContext();

    if (this.silentAudioElement) {
      this.silentAudioElement.play().catch(() => {});
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('AudioContext resume on play:', e);
      }
    }

    const fadeInMs = this.crossfadeSeconds > 0 ? Math.min(3000, this.crossfadeSeconds * 1000) : 300;

    if (this.isYouTube) {
      if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
        try {
          this.ytPlayer.unMute();
          this.fadeVolume(0, this.currentVolume, fadeInMs);
          this.ytPlayer.playVideo();
        } catch (e) {
          console.warn('ytPlayer.playVideo error:', e);
        }
      }
    } else {
      try {
        this.audioElement.volume = 0;
        await this.audioElement.play();
        this.fadeVolume(0, this.currentVolume, fadeInMs);
      } catch (err) {
        console.warn('Playback gesture/permission error:', err);
      }
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }

  public pause(): void {
    if (this.silentAudioElement) {
      this.silentAudioElement.pause();
    }

    this.fadeVolume(this.currentVolume, 0, 200, () => {
      if (this.isYouTube) {
        if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
          this.ytPlayer.pauseVideo();
        }
      } else {
        this.audioElement.pause();
      }

      // Reset volume setup
      if (this.isYouTube) {
        if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
          this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
        }
      } else {
        this.audioElement.volume = this.currentVolume;
      }
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }

  public seek(seconds: number): void {
    if (this.isYouTube) {
      if (this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
        this.ytPlayer.seekTo(seconds, true);
      }
    } else {
      this.audioElement.currentTime = seconds;
    }
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.currentVolume = clamped;
    if (!this.isFading) {
      if (this.isYouTube) {
        if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
          this.ytPlayer.setVolume(Math.round(clamped * 100));
        }
      } else {
        this.audioElement.volume = clamped;
      }
    }
  }

  public setPlaybackRate(rate: number): void {
    if (!this.isYouTube) {
      this.audioElement.playbackRate = rate;
    }
  }

  public getCurrentTime(): number {
    if (this.isYouTube) {
      if (this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
        return this.ytPlayer.getCurrentTime() || 0;
      }
      return 0;
    }
    return this.audioElement.currentTime || 0;
  }

  public getDuration(): number {
    if (this.isYouTube) {
      if (this.ytPlayer && typeof this.ytPlayer.getDuration === 'function') {
        return this.ytPlayer.getDuration() || this.currentTrack?.duration || 0;
      }
      return this.currentTrack?.duration || 0;
    }
    return this.audioElement.duration || this.currentTrack?.duration || 0;
  }

  private setupMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', async () => {
        await this.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset || 10;
        this.seek(this.getCurrentTime() + skip);
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset || 10;
        this.seek(Math.max(0, this.getCurrentTime() - skip));
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.emit('previoustrack');
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.emit('nexttrack');
      });
    } catch (e) {
      console.warn('MediaSession handler error:', e);
    }
  }

  private updateMediaSession(track: Track) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Capibara Sound',
        artwork: [
          { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    } catch (e) {
      console.warn('Error setting MediaMetadata:', e);
    }
  }

  private async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        if (!this.wakeLock) {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
          this.wakeLock.addEventListener('release', () => {
            this.wakeLock = null;
          });
        }
      } catch (err) {
        // quiet
      }
    }
  }

  // Modern W3C Remote Playback API & presentation API prompt for real local network screen/audio casting
  public async promptRemotePlayback(): Promise<boolean> {
    try {
      const elem = this.audioElement as any;
      if (elem && elem.remote && typeof elem.remote.prompt === 'function') {
        await elem.remote.prompt();
        return true;
      }
      
      const presentation = (navigator as any).presentation;
      if (presentation && presentation.defaultRequest) {
        await presentation.defaultRequest.start();
        return true;
      }
    } catch (e) {
      console.warn('Real native Cast/AirPlay selection dismissed or failed:', e);
    }
    return false;
  }

  public on(event: AudioEngineEvent, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: AudioEngineEvent, listener: EventListener) {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: AudioEngineEvent, ...args: any[]) {
    this.listeners.get(event)?.forEach((fn) => {
      try {
        fn(...args);
      } catch (e) {
        console.error(`Error in event listener:`, e);
      }
    });
  }
}

export const audioEngine = new AudioEngine();
