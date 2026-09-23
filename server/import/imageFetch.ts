import dns from 'dns';
import net from 'net';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB per image
const FETCH_TIMEOUT_MS = 10000;
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export interface SafeImageResult {
  ok: true;
  buffer: Buffer;
  contentType: string;
  extension: string;
}
export interface SafeImageError {
  ok: false;
  error: string;
}

/** Basic RFC1918 / loopback / link-local (incl. cloud metadata 169.254.169.254) check. */
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    if (lower.startsWith('fe80')) return true;
    if (lower.startsWith('::ffff:')) {
      const v4 = lower.split(':').pop() || '';
      if (net.isIPv4(v4)) return isPrivateIp(v4);
    }
    return false;
  }
  return true; // unrecognized format: fail closed
}

/**
 * Downloads an image URL server-side with SSRF mitigations: http/https only,
 * DNS-resolves the host and rejects private/internal/link-local addresses
 * before fetching, disables automatic redirect-following (a safe URL could
 * otherwise redirect to an internal one), enforces a content-type allowlist,
 * a size cap, and a timeout.
 *
 * Known limitation: this checks the resolved IP once before connecting, which
 * stops the vast majority of SSRF attempts but is not fully immune to DNS
 * rebinding (an attacker-controlled DNS server changing the answer between
 * our lookup and Node's own connect). Full protection would require pinning
 * the resolved IP at the socket layer.
 */
export async function downloadImageSafely(rawUrl: string): Promise<SafeImageResult | SafeImageError> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, error: 'Only http/https URLs are allowed' };
  }

  let addresses: string[];
  try {
    const looked = await dns.promises.lookup(url.hostname, { all: true });
    addresses = looked.map(r => r.address);
  } catch {
    return { ok: false, error: 'Could not resolve image host' };
  }
  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    return { ok: false, error: 'Image host resolves to a disallowed network address' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal, redirect: 'manual' });

    if (res.status >= 300 && res.status < 400) {
      return { ok: false, error: 'Image URL redirects are not allowed; use the direct file URL' };
    }
    if (!res.ok) {
      return { ok: false, error: `Image request failed with status ${res.status}` };
    }

    const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const extension = ALLOWED_CONTENT_TYPES[contentType];
    if (!extension) {
      return { ok: false, error: `Unsupported image content-type: ${contentType || 'unknown'}` };
    }

    const contentLength = Number(res.headers.get('content-length') || '0');
    if (contentLength && contentLength > MAX_IMAGE_BYTES) {
      return { ok: false, error: 'Image exceeds the 8MB size limit' };
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      return { ok: false, error: 'Image exceeds the 8MB size limit' };
    }
    if (arrayBuffer.byteLength === 0) {
      return { ok: false, error: 'Image download returned no data' };
    }

    return { ok: true, buffer: Buffer.from(arrayBuffer), contentType, extension };
  } catch (err: any) {
    if (err?.name === 'AbortError') return { ok: false, error: 'Image download timed out' };
    return { ok: false, error: `Image download failed: ${err?.message || 'unknown error'}` };
  } finally {
    clearTimeout(timeout);
  }
}
