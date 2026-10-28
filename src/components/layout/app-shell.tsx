'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { StoreProvider } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <StoreProvider>
      <div className="relative min-h-screen text-[#f8fafc] antialiased selection:bg-sky-500/25 selection:text-sky-200">
        {/* Layout Container */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Sidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          <div
            className={cn(
              'flex flex-1 flex-col transition-all duration-300 ease-in-out',
              collapsed ? 'lg:pl-20' : 'lg:pl-64'
            )}
          >
            <Header onMobileMenuToggle={() => setMobileOpen(true)} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </StoreProvider>
  );
}
