import { Boxes, Construction, Home, Moon, PanelLeft, ShieldAlert, Sun } from 'lucide-react';
import { NavLink, Route, Routes } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ComingSoonPage } from '@/pages/coming-soon-page';
import { ComponentsShowcasePage } from '@/pages/components-showcase-page';
import { ErrorDemoPage } from '@/pages/error-demo-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { ErrorBoundary } from '@/shared/components/error-boundary';

const menus = [
  { to: '/', label: 'Komponen UI', icon: Boxes, end: true },
  { to: '/coming-soon', label: 'Coming Soon', icon: Construction },
  { to: '/error-boundary', label: 'Error Boundary', icon: ShieldAlert },
  { to: '/not-found-preview', label: '404 Preview', icon: Home },
];

export function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r bg-card/80 backdrop-blur md:block">
          <div className="flex h-16 items-center gap-2 border-b px-5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><PanelLeft className="size-5" /></div>
            <div>
              <p className="font-semibold leading-none">Boilerplate UI</p>
              <p className="text-xs text-muted-foreground">Shadcn showcase</p>
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {menus.map((menu) => (
              <NavLink
                key={menu.to}
                to={menu.to}
                end={menu.end}
                className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground', isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground')}
              >
                <menu.icon className="size-4" />
                {menu.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="md:pl-72">
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
              <div>
                <p className="text-sm font-medium">Vite + React + TypeScript</p>
                <p className="text-xs text-muted-foreground">Reusable components, light/dark, router, API ready.</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="icon" onClick={() => document.documentElement.classList.toggle('dark')}>
                    <Sun className="size-4 dark:hidden" />
                    <Moon className="hidden size-4 dark:block" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle light/dark</TooltipContent>
              </Tooltip>
            </div>
          </header>

          <div className="border-b bg-card/60 p-2 md:hidden">
            <nav className="flex gap-2 overflow-x-auto">
              {menus.map((menu) => (
                <NavLink key={menu.to} to={menu.to} end={menu.end} className={({ isActive }) => cn('inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground', isActive && 'bg-primary text-primary-foreground')}>
                  <menu.icon className="size-4" /> {menu.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<ComponentsShowcasePage />} />
                <Route path="/coming-soon" element={<ComingSoonPage />} />
                <Route path="/error-boundary" element={<ErrorDemoPage />} />
                <Route path="/not-found-preview" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
