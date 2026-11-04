export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_EDGE = 1600;
export const JPEG_QUALITY = 0.7;
export type ImageType = 'image/jpeg' | 'image/png' | 'image/webp';

/** Identify an image by its first bytes. SVG, GIF, HTML and anything else is refused (threat model T5). */
export function sniffImageType(head: Uint8Array): ImageType | null {
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (head.length >= 8 && head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 && head[4] === 0x0d && head[5] === 0x0a && head[6] === 0x1a && head[7] === 0x0a) return 'image/png';
  if (head.length >= 12 && String.fromCharCode(...head.slice(0, 4)) === 'RIFF' && String.fromCharCode(...head.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

export type FileCheck = { ok: true; type: ImageType } | { ok: false; reason: 'size' | 'type' };

export async function checkImageFile(file: File): Promise<FileCheck> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, reason: 'size' };
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const type = sniffImageType(head);
  return type ? { ok: true, type } : { ok: false, reason: 'type' };
}

/** Scale down so the long edge is at most `max`; never up, never a zero side. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
