type Provider = "youtube" | "vimeo" | "bunny";

export interface ParsedVideo {
  provider: Provider;
  id: string;
  embedUrl(startSeconds?: number, autoplay?: boolean): string;
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  try {
    const u = new URL(url);

    // YouTube
    const ytHosts = ["www.youtube.com", "youtube.com", "youtu.be"];
    if (ytHosts.includes(u.hostname)) {
      let videoId: string | null = null;
      if (u.hostname === "youtu.be") {
        videoId = u.pathname.slice(1);
      } else {
        videoId = u.searchParams.get("v");
      }
      if (!videoId) return null;
      const id = videoId;
      return {
        provider: "youtube",
        id,
        embedUrl(startSeconds = 0, autoplay = false) {
          const params = new URLSearchParams();
          if (autoplay) params.set("autoplay", "1");
          if (startSeconds > 0) params.set("start", String(Math.floor(startSeconds)));
          const qs = params.toString();
          return `https://www.youtube-nocookie.com/embed/${id}${qs ? `?${qs}` : ""}`;
        },
      };
    }

    // Vimeo
    if (u.hostname === "vimeo.com" || u.hostname === "www.vimeo.com") {
      const videoId = u.pathname.split("/").filter(Boolean)[0];
      if (!videoId) return null;
      return {
        provider: "vimeo",
        id: videoId,
        embedUrl(startSeconds = 0, autoplay = false) {
          const params = new URLSearchParams();
          if (autoplay) params.set("autoplay", "1");
          const qs = params.toString();
          const hash = startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : "";
          return `https://player.vimeo.com/video/${videoId}${qs ? `?${qs}` : ""}${hash}`;
        },
      };
    }

    // Bunny Stream
    if (u.hostname === "iframe.mediadelivery.net") {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length >= 3 && parts[0] === "embed") {
        const libraryId = parts[1];
        const videoId = parts[2];
        return {
          provider: "bunny",
          id: videoId,
          embedUrl(startSeconds = 0, autoplay = false) {
            const params = new URLSearchParams();
            if (autoplay) params.set("autoplay", "true");
            if (startSeconds > 0) params.set("t", String(Math.floor(startSeconds)));
            const qs = params.toString();
            return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}${qs ? `?${qs}` : ""}`;
          },
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
