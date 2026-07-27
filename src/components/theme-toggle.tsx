'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

const themeStorageKey = 'pixconvertly-theme';
type ThemePreference = 'light' | 'dark';

function getInitialTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'light';
  const storedTheme = window.localStorage.getItem(themeStorageKey);
  return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
}

function applyTheme(theme: ThemePreference) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemePreference = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  };

  const isDark = isMounted && theme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-10 rounded-none border border-foreground/30 bg-background text-foreground shadow-none hover:bg-muted"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
