// Espelho do normalizador do backend: converte qualquer link do YouTube em URL de embed.
const ID_RE = /^[\w-]{11}$/;

export function extractYoutubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  if (ID_RE.test(raw)) return raw;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);
  let id = null;
  if (host === 'youtu.be') {
    id = parts[0];
  } else if (['youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(host)) {
    if (parts[0] === 'watch') id = url.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0])) id = parts[1];
  }
  return id && ID_RE.test(id) ? id : null;
}

export function toEmbedUrl(input) {
  const id = extractYoutubeId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
}
