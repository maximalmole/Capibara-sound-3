import { Playlist, Track } from '../types';

/**
 * Gets the cover image for a playlist.
 * If the playlist doesn't have an explicit track-specific cover or uses a default template,
 * and there are tracks inside, it defaults to the cover of the first track.
 */
export const getPlaylistCover = (playlist: Playlist, playlistTracks: Track[]): string => {
  // If the cover is default/template or empty, and we have tracks in the playlist, return the cover of the first track
  const isDefaultCover = 
    !playlist.coverUrl || 
    playlist.coverUrl.includes('cover_lofi_chill') || 
    playlist.coverUrl.includes('cover_electronic_energy') ||
    playlist.coverUrl.includes('cover_acoustic_sunset') ||
    playlist.coverUrl.includes('cover_podcast_talk') ||
    playlist.coverUrl === '';

  if (isDefaultCover && playlistTracks.length > 0 && playlistTracks[0]?.coverUrl) {
    return playlistTracks[0].coverUrl;
  }

  return playlist.coverUrl || '/src/assets/images/cover_lofi_chill_1790457683214.jpg';
};
