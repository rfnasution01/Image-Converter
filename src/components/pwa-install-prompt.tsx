'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'pixconvertly-pwa-install-dismissed';

type InstallPromptOutcome = 'accepted' | 'dismissed';

type BeforeInstallPromptChoice = {
  outcome: InstallPromptOutcome;
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<BeforeInstallPromptChoice>;
  prompt: () => Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

type PwaInstallPromptProps = {
  showTrigger?: boolean;
};

export function PwaInstallPrompt({ showTrigger = false }: PwaInstallPromptProps) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') {
      return;
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('Failed to register PixConvertly service worker', error);
      });
    };

    if (document.readyState === 'complete') {
      registerServiceWorker();
      return;
    }

    window.addEventListener('load', registerServiceWorker);

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  useEffect(() => {
    setIsDismissed(localStorage.getItem(DISMISS_KEY) === 'true');

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
      setIsDismissed(localStorage.getItem(DISMISS_KEY) === 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const dismissPrompt = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsDismissed(true);
  };

  const openPrompt = () => {
    localStorage.removeItem(DISMISS_KEY);
    setIsDismissed(false);
  };

  const installApp = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === 'accepted') {
      setInstallEvent(null);
    }

    dismissPrompt();
  };

  if (!showTrigger && !installEvent) {
    return null;
  }

  const dialog = !isDismissed ? (
    <aside className="fixed bottom-5 right-5 z-[100] w-[calc(100vw-2.5rem)] max-w-md rounded-3xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur" aria-label="Install PixConvertly app prompt">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Download className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-sm font-black text-foreground">Install PixConvertly</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {installEvent ? 'Open the converter faster and use it offline after your first visit.' : 'If the install button is unavailable, use your browser menu and choose Install app or Add to home screen.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          <Button size="sm" onClick={installApp} disabled={!installEvent}>Install</Button>
          <Button size="sm" variant="ghost" onClick={dismissPrompt}>Later</Button>
        </div>
      </div>
    </aside>
  ) : null;

  return (
    <>
      {showTrigger ? (
        <Button size="icon" variant="ghost" className="size-10 rounded-full" onClick={openPrompt} aria-label="Show app install prompt">
          <Download className="size-5" aria-hidden="true" />
        </Button>
      ) : null}
      {isMounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}
