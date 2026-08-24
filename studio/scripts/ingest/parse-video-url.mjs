// Mirror of lib/video.ts — provider + id only. See that file for embed-URL building.

/**
 * @param {string} url
 * @returns {{ provider: 'youtube'|'vimeo'|'bunny', id: string } | null}
 */
export function parseVideoUrl(url) {
  let u
  try {
    u = new URL(url)
  } catch {
    return null
  }

  // YouTube
  if (['www.youtube.com', 'youtube.com', 'youtu.be'].includes(u.hostname)) {
    const videoId = u.hostname === 'youtu.be'
      ? u.pathname.slice(1)
      : u.searchParams.get('v')
    if (!videoId) return null
    return { provider: 'youtube', id: videoId }
  }

  // Vimeo
  if (u.hostname === 'vimeo.com' || u.hostname === 'www.vimeo.com') {
    const videoId = u.pathname.split('/').filter(Boolean)[0]
    if (!videoId) return null
    return { provider: 'vimeo', id: videoId }
  }

  // Bunny Stream
  if (u.hostname === 'iframe.mediadelivery.net') {
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length >= 3 && parts[0] === 'embed') {
      return { provider: 'bunny', id: `${parts[1]}-${parts[2]}` }
    }
  }

  return null
}

/**
 * Deterministic Sanity document id from provider + video id.
 * Strips any character not in [A-Za-z0-9._-] as required by Sanity.
 * @param {'youtube'|'vimeo'|'bunny'} provider
 * @param {string} id
 * @returns {string}
 */
export function videoDocId(provider, id) {
  const safe = id.replace(/[^A-Za-z0-9._-]/g, '')
  return `video.${provider}-${safe}`
}
