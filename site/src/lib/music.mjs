/**
 * Companion music catalogue for The Ministry of Doubt.
 * Designed for ~20 tracks. Masters live in repo `music/` (not deployed).
 * Public site: cover art + Spotify / YouTube links only.
 */

export const MUSIC = {
  seriesTitle: "Companion music",
  artist: "OzeAuMusic",
  artistSpotify: "https://open.spotify.com/artist/73vZgxBGArQl55zCohABAk",
  capacity: 20,
  intro:
    "Songs for the book’s atmosphere — doubt, evidence, language and the cost of belief. Stream on Spotify; watch films on YouTube when available. Masters stay offline.",
};

/**
 * @typedef {Object} Track
 * @property {number} n - Track number 1–20
 * @property {string} slug
 * @property {string} title
 * @property {'released'|'coming'} status
 * @property {string} [duration] - display e.g. "5:49"
 * @property {string} [note] - short blurb
 * @property {string} [cover] - public path
 * @property {string} [spotifyAlbum]
 * @property {string} [spotifyTrack]
 * @property {string} [youtube]
 * @property {string} [year]
 */

/** @type {Track[]} */
export const TRACKS = [
  {
    n: 1,
    slug: "show-me-the-file",
    title: "Show me the File",
    status: "released",
    duration: "5:49",
    year: "2026",
    note: "Evidence, records and the demand to see the source — not the story about the source.",
    cover: "/music/show-me-the-file/square.jpg",
    spotifyAlbum: "6V5Ayd53K3VkQSNrecCLPr",
    spotifyTrack: "3l2yLXzuCf8dWeZoREhho7",
  },
  {
    n: 2,
    slug: "the-dictionary-wont-save-you",
    title: "The Dictionary Won’t Save You",
    status: "released",
    duration: "6:38",
    year: "2026",
    note: "Political language, definitions as weapons — filmed over Quarantine Bay, Eden NSW.",
    cover: "/music/the-dictionary-wont-save-you/square.jpg",
    spotifyAlbum: "5tAR7wNvZu1KAKVEWLgkm3",
    spotifyTrack: "6UCSGBn1Mpqmw4qNwL3HKC",
    youtube: "xUjcG0wWFWA",
  },
  // 03–20: reserved slots — add objects as songs land in music/<slug>/
  ...Array.from({ length: 18 }, (_, i) => ({
    n: i + 3,
    slug: `track-${String(i + 3).padStart(2, "0")}`,
    title: "Untitled",
    status: "coming",
  })),
];

export const releasedTracks = () => TRACKS.filter((t) => t.status === "released");

export const defaultTrack = () => releasedTracks()[0] ?? TRACKS[0];

/** Spotify embed URL for a track (album embed for singles is reliable). */
export function spotifyEmbedUrl(track) {
  if (track.spotifyAlbum) {
    return `https://open.spotify.com/embed/album/${track.spotifyAlbum}?utm_source=generator&theme=0`;
  }
  if (track.spotifyTrack) {
    return `https://open.spotify.com/embed/track/${track.spotifyTrack}?utm_source=generator&theme=0`;
  }
  return null;
}

export function spotifyOpenUrl(track) {
  if (track.spotifyAlbum) return `https://open.spotify.com/album/${track.spotifyAlbum}`;
  if (track.spotifyTrack) return `https://open.spotify.com/track/${track.spotifyTrack}`;
  return MUSIC.artistSpotify;
}

export function youtubeUrl(track) {
  return track.youtube ? `https://www.youtube.com/watch?v=${track.youtube}` : null;
}

export function youtubeEmbedUrl(track) {
  return track.youtube ? `https://www.youtube.com/embed/${track.youtube}` : null;
}

export function padN(n) {
  return String(n).padStart(2, "0");
}
