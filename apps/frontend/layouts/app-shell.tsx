'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, UserRound, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import { AccountHeaderButton } from '@/components/account-header-button';

const headerItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Linhas e Horarios', href: '/linhas' },
  { label: 'Bilhetes', href: '/bilhetes' },
  { label: 'Noticias', href: '/alertas' },
  { label: 'Contato', href: '/contato' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isImmersiveRoute =
    pathname === '/' ||
    pathname === '/linhas' ||
    pathname === '/horarios' ||
    pathname === '/bilhetes' ||
    pathname === '/alertas' ||
    pathname === '/contato' ||
    pathname === '/login';

  if (isImmersiveRoute) {
    return (
      <div className="min-h-screen bg-[#f5f1e6] text-[#14233c]">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECE8DC] text-[#14233C]">
      <header className="sticky top-0 z-40 border-b border-[#DDD6C7] bg-[#F5F1E6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {headerItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-b-2 pb-1 text-sm font-semibold uppercase tracking-[0.08em] transition ${
                    active ? 'border-[#1E7F3B] text-[#1E7F3B]' : 'border-transparent text-[#14233C] hover:text-[#1E7F3B]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <AccountHeaderButton
              guestClassName="hidden items-center gap-2 rounded-full bg-[#14233C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#0E1A2E] sm:inline-flex"
              iconClassName="hidden h-11 w-11 items-center justify-center rounded-full bg-[#14233C] text-white transition hover:bg-[#0E1A2E] sm:inline-flex"
            />

            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex rounded-2xl border border-[#D7D1C3] bg-white p-3 text-[#14233C] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-[#14233C]/30 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-[300px] bg-[#F5F1E6] p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#14233C]">Menu</p>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-[#D7D1C3] bg-white p-2 text-[#334155]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {headerItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                      active ? 'bg-[#FFD200]/35 text-[#14233C]' : 'text-[#334155]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#14233C] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white"
            >
              Acesse sua conta
              <UserRound className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-14 pt-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
