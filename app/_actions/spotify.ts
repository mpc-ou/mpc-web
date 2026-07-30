"use server";

const TITLE_TAG_RE = /<title>(.*?)<\/title>/;
const TRACK_TITLE_RE = /(.*?) - song (?:and lyrics )?by (.*)/i;
const ALBUM_TITLE_RE = /(.*?) - album by (.*)/i;
const PLAYLIST_TITLE_RE = /(.*?) - playlist by (.*)/i;

export async function getSpotifyMetadata(uri: string) {
  try {
    if (!uri) {
      return null;
    }
    let cleanUrl = uri;
    if (uri.startsWith("spotify:")) {
      const parts = uri.split(":");
      if (parts.length >= 3) {
        cleanUrl = `https://open.spotify.com/${parts[1]}/${parts[2]}`;
      }
    }

    const response = await fetch(cleanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify page: ${response.statusText}`);
    }

    const html = await response.text();
    const titleMatch = html.match(TITLE_TAG_RE);
    if (!titleMatch) {
      return null;
    }

    const titleStr = titleMatch[1];
    let cleanTitle = titleStr.replace(" | Spotify", "").trim();

    let title = cleanTitle;
    let artist = "";

    if (TRACK_TITLE_RE.test(cleanTitle)) {
      const match = cleanTitle.match(TRACK_TITLE_RE);
      title = match ? match[1] : cleanTitle;
      artist = match ? match[2] : "";
    } else if (ALBUM_TITLE_RE.test(cleanTitle)) {
      const match = cleanTitle.match(ALBUM_TITLE_RE);
      title = match ? match[1] : cleanTitle;
      artist = match ? match[2] : "";
    } else if (PLAYLIST_TITLE_RE.test(cleanTitle)) {
      const match = cleanTitle.match(PLAYLIST_TITLE_RE);
      title = match ? match[1] : cleanTitle;
      artist = match ? match[2] : "";
    } else if (cleanTitle.includes(" - ")) {
      const parts = cleanTitle.split(" - ");
      title = parts[0];
      artist = parts[1];
    }

    const oembedResponse = await fetch(`https://open.spotify.com/oembed?url=${cleanUrl}`, {
      next: { revalidate: 3600 }
    });
    let thumbnailUrl = "";
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      thumbnailUrl = oembedData.thumbnail_url || "";
    }

    return {
      title: title.trim(),
      artist: artist.trim() || "Spotify Music",
      thumbnailUrl,
      spotifyUrl: cleanUrl
    };
  } catch (err) {
    console.error("Error fetching Spotify metadata server-side:", err);
    return null;
  }
}
