import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Life OS — Obsidian & Titanium Luxury Glass Dashboard',
  description: 'Ultra-luxurious Obsidian & Titanium Personal & Work Operational Dashboard with automated n8n sync',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030407] font-sans text-[#f8fafc] relative overflow-x-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="fixed top-[-10%] left-[25%] w-[600px] h-[600px] bg-sky-900/20 rounded-full blur-[150px] pointer-events-none -z-10" />
        <div className="fixed bottom-[-10%] right-[15%] w-[500px] h-[500px] bg-indigo-950/25 rounded-full blur-[160px] pointer-events-none -z-10" />

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
