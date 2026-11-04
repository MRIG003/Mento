import { describe, expect, it } from 'vitest';
import { MAX_FILE_BYTES, checkImageFile, fitWithin, sniffImageType } from './file-check';

const bytes = (...b: number[]) => new Uint8Array(b);
const riff = (tag: string) => new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, ...[...tag].map((c) => c.charCodeAt(0))]);

describe('sniffImageType (trust the bytes, not the file name or declared type)', () => {
  it('recognises JPEG, PNG and WebP', () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0))).toBe('image/jpeg');
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe('image/png');
    expect(sniffImageType(riff('WEBP'))).toBe('image/webp');
  });
  it('rejects HTML, SVG, GIF, empty and other RIFF files', () => {
    const text = (s: string) => new TextEncoder().encode(s);
    expect(sniffImageType(text('<html><script>alert(1)</script>'))).toBeNull();
    expect(sniffImageType(text('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(sniffImageType(text('GIF89a'))).toBeNull();
    expect(sniffImageType(new Uint8Array())).toBeNull();
    expect(sniffImageType(riff('WAVE'))).toBeNull();
  });
});

describe('checkImageFile', () => {
  const file = (data: Uint8Array, name = 'p.jpg', type = 'image/jpeg') => new File([data as BlobPart], name, { type });
  it('accepts a real JPEG', async () => expect(await checkImageFile(file(bytes(0xff, 0xd8, 0xff, 0xe0, 1, 2)))).toEqual({ ok: true, type: 'image/jpeg' }));
  it('rejects an HTML file renamed .jpg (polyglot)', async () => {
    expect(await checkImageFile(file(new TextEncoder().encode('<html>x</html>')))).toEqual({ ok: false, reason: 'type' });
  });
  it('rejects files over 10 MB', async () => {
    const big = file(bytes(0xff, 0xd8, 0xff, 0xe0));
    Object.defineProperty(big, 'size', { value: MAX_FILE_BYTES + 1 });
    expect(await checkImageFile(big)).toEqual({ ok: false, reason: 'size' });
  });
});

describe('fitWithin (1600 px long edge)', () => {
  it('keeps small images as they are', () => expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 }));
  it('scales landscape and portrait to the long edge, keeping the ratio', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });
  it('never returns a zero side', () => expect(fitWithin(10000, 1, 1600)).toEqual({ width: 1600, height: 1 }));
});
