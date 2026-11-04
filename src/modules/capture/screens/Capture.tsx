'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Badge, useI18n, type TKey } from '@/modules/foundation';
import { useCamera } from '../hooks/useCamera';
import { createAutoCapture } from '../lib/auto-capture';
import { JPEG_QUALITY, MAX_EDGE, checkImageFile, fitWithin } from '../lib/file-check';
import { assess, type Gray, type Issue } from '../lib/quality';

export type CapturedPhoto = { blob: Blob; qualityScore: number; issue: Issue | null };
type Props = { onUse: (photo: Pick<CapturedPhoto, 'blob' | 'qualityScore'>) => void | Promise<void>; onCancel?: () => void };

const MESSAGE: Record<Issue, TKey> = { 'too-dark': 'cap.dark', glare: 'cap.glare', 'hold-still': 'cap.holdStill', 'show-whole-page': 'cap.wholePage', 'move-closer': 'cap.closer' };
const SAMPLE_MS = 200; // ~5 frames per second keeps low-end phones cool
const MESSAGE_MIN_MS = 1200; // one message at a time, not flickering
const TIP_KEY = 'mento:lensTipSeen';

/** Re-encode through a canvas: drops EXIF/GPS and any payload, caps the size (threat model T5, I4). */
async function reencode(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
  const { width: w, height: h } = fitWithin(width, height, MAX_EDGE);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')?.drawImage(source, 0, 0, w, h);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
}

export function Capture({ onUse, onCancel }: Props) {
  const { t } = useI18n();
  const { videoRef, state: camState, start: startCamera, stop: stopCamera, torchSupported, torchOn, toggleTorch } = useCamera();
  const analysis = useRef<HTMLCanvasElement | null>(null);
  const prev = useRef<Gray | undefined>(undefined);
  const auto = useRef(createAutoCapture());
  const lastMsg = useRef({ at: 0, key: '' });
  const [message, setMessage] = useState<TKey>('cap.searching');
  const [shot, setShot] = useState<{ url: string; blob: Blob; score: number; issue: Issue | null } | null>(null);
  const [fileError, setFileError] = useState<TKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [showTip] = useState(() => { try { return !localStorage.getItem(TIP_KEY); } catch { return true; } });

  const takePhoto = async (score: number, issue: Issue | null) => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const blob = await reencode(video, video.videoWidth, video.videoHeight);
    if (!blob) return;
    try { localStorage.setItem(TIP_KEY, '1'); } catch { /* storage blocked: tip shows again, harmless */ }
    stopCamera();
    setShot({ url: URL.createObjectURL(blob), blob, score, issue });
  };

  // Sample frames while live. Pure assessment over ImageData (SPEC-capture).
  useEffect(() => {
    if (camState !== 'live') return undefined;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return;
      const canvas = (analysis.current ??= document.createElement('canvas'));
      canvas.width = 320;
      canvas.height = Math.round((320 * video.videoHeight) / video.videoWidth);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const result = assess(ctx.getImageData(0, 0, canvas.width, canvas.height), prev.current);
      prev.current = result.gray;
      const key: TKey = result.issue ? MESSAGE[result.issue] : 'cap.good';
      const now = Date.now();
      if (key !== lastMsg.current.key && now - lastMsg.current.at >= MESSAGE_MIN_MS) { lastMsg.current = { at: now, key }; setMessage(key); }
      if (auto.current.feed(result.ok)) void takePhoto(result.score, null);
    }, SAMPLE_MS);
    return () => window.clearInterval(timer);
    // takePhoto only uses refs and stable callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camState]);

  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot.url); }, [shot]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const check = await checkImageFile(file);
    if (!check.ok) { setFileError(check.reason === 'size' ? 'cap.fileSize' : 'cap.fileType'); return; }
    setFileError(null);
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const blob = await reencode(bitmap, bitmap.width, bitmap.height);
      const small = document.createElement('canvas');
      small.width = 320; small.height = Math.round((320 * bitmap.height) / bitmap.width);
      const ctx = small.getContext('2d', { willReadFrequently: true });
      ctx?.drawImage(bitmap, 0, 0, small.width, small.height);
      const a = ctx ? assess(ctx.getImageData(0, 0, small.width, small.height)) : null;
      bitmap.close();
      if (blob) setShot({ url: URL.createObjectURL(blob), blob, score: a?.score ?? 0.5, issue: a?.issue ?? null });
    } catch { setFileError('cap.fileType'); }
    setBusy(false);
  };

  if (shot) {
    const clear = shot.score >= 0.5;
    return (
      <div className="flex flex-col gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL, not optimisable */}
        <img src={shot.url} alt={t('cap.photoOf', { name: '' }).trim()} className="max-h-96 w-full rounded-xl border-2 border-line object-contain" />
        <p className="font-extrabold" role="status">{t(clear ? 'cap.quality.clear' : 'cap.quality.hard')}</p>
        {!clear && shot.issue ? <p className="text-sm text-ink-muted">{t('cap.retakeWhy', { reason: t(MESSAGE[shot.issue]) })}</p> : null}
        <Button busy={busy} onClick={async () => { setBusy(true); await onUse({ blob: shot.blob, qualityScore: shot.score }); setBusy(false); }}>{t('cap.use')}</Button>
        <Button variant="secondary" onClick={() => { URL.revokeObjectURL(shot.url); setShot(null); prev.current = undefined; auto.current.reset(); }}>{t('cap.retake')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <video ref={videoRef} playsInline muted className={`w-full rounded-xl bg-ink ${camState === 'live' ? '' : 'hidden'}`} aria-hidden={camState !== 'live'} />
      {camState === 'live' ? (
        <>
          <p role="status" aria-live="polite" className="rounded-xl bg-note p-3 text-center text-lg font-extrabold">{t(message)}</p>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => void takePhoto(0.5, null)}>{t('cap.shutter')}</Button>
            {torchSupported ? <Button variant="secondary" aria-pressed={torchOn} onClick={() => void toggleTorch()}>{t(torchOn ? 'cap.torchOff' : 'cap.torchOn')}</Button> : null}
          </div>
          <Button variant="quiet" onClick={stopCamera}>{t('cap.stop')}</Button>
        </>
      ) : (
        <>
          <p className="text-ink-muted">{t('cap.intro')}</p>
          {showTip ? <p className="rounded-xl bg-paper p-2 text-sm font-bold">{t('cap.lensTip')}</p> : null}
          {camState === 'denied' ? <p role="alert" className="font-bold">{t('cap.denied')}</p> : null}
          <Button onClick={() => void startCamera()} busy={camState === 'starting'}>{t('cap.start')}</Button>
        </>
      )}
      <label className="min-h-tap cursor-pointer text-center font-extrabold text-primary underline underline-offset-4">
        {t('cap.chooseFile')}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
      </label>
      {fileError ? <p role="alert" className="font-bold text-bad">{t(fileError)}</p> : null}
      {onCancel ? <Button variant="quiet" onClick={onCancel}>{t('common.close')}</Button> : null}
      <p className="flex items-center gap-2 text-xs text-ink-muted"><Badge kind="preview" />{t('cap.review')}</p>
    </div>
  );
}
