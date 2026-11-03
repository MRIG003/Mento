'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Button, Sheet, useI18n } from '@/modules/foundation';
import type { Services } from '@/modules/services';

type Props = { open: boolean; onClose: () => void; url: string; message: string; services: Services; resultsHref: string; onShared: () => void };

/** Share a published homework: wa.me with a ready message (opened by the teacher, never auto-sent), copy, native share. */
export function ShareSheet({ open, onClose, url, message, services, resultsHref, onShared }: Props) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  return (
    <Sheet open={open} onClose={onClose} title={t('share.title')}>
      <p className="text-ink-muted">{t('share.body')}</p>
      <p className="my-3 break-all rounded-xl bg-paper p-3 font-mono text-sm" data-testid="share-url">{url}</p>
      <div className="flex flex-col gap-3">
        <a href={services.share.whatsappUrl(message)} target="_blank" rel="noopener noreferrer" onClick={onShared}
          className="inline-flex min-h-pill w-full items-center justify-center rounded-full bg-primary px-6 text-lg font-extrabold text-card">
          {t('share.whatsapp')}
        </a>
        <Button variant="secondary" onClick={async () => { const r = await services.share.copyLink(url); setCopied(r.ok); if (r.ok) onShared(); }}>
          {t(copied ? 'share.copied' : 'share.copy')}
        </Button>
        {services.share.nativeShare ? (
          <Button variant="quiet" onClick={async () => { const r = await services.share.nativeShare?.({ title: 'Mento', text: message, url }); if (r?.ok) onShared(); }}>{t('share.more')}</Button>
        ) : null}
        <p className="flex items-start gap-2 text-sm text-ink-muted"><Badge kind="preview" />{t('share.singleDevice')}</p>
        <Link href={resultsHref} className="inline-flex min-h-tap items-center justify-center font-extrabold text-primary underline underline-offset-4">{t('share.toResults')}</Link>
      </div>
    </Sheet>
  );
}
