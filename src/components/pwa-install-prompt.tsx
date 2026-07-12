'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'fileflow-pwa-install-dismissed';

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

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') {
      return;
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('Failed to register FileFlow service worker', error);
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

  if (!installEvent || isDismissed) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-3xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur md:left-auto md:right-6 md:max-w-md" aria-label="Install FileFlow app prompt">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Download className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-sm font-black text-foreground">Install FileFlow</p>
            <p className="mt-1 text-sm text-muted-foreground">Buka converter lebih cepat dan gunakan lagi secara offline setelah kunjungan pertama.</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          <Button size="sm" onClick={installApp}>Install</Button>
          <Button size="sm" variant="ghost" onClick={dismissPrompt}>Nanti</Button>
        </div>
      </div>
    </aside>
  );
}
