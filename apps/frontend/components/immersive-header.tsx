'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AccountHeaderButton } from '@/components/account-header-button';
import { MoviWordmark } from '@/components/movi-wordmark';

const navItems = [
  { label: 'Inicio', href: '/' },
  { label: 'Linhas e horarios', href: '/linhas' },
  { label: 'Bilhetes', href: '/bilhetes' },
  { label: 'Noticias', href: '/alertas' },
  { label: 'Contato', href: '/contato' },
] as const;

interface ImmersiveHeaderProps {
  activeHref?: string;
  subtitle?: string;
}

export function ImmersiveHeader({ activeHref, subtitle = 'PROJETOS INDEPENDENTES' }: ImmersiveHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentHref = activeHref ?? pathname;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="absolute left-0 right-0 top-0 z-50 mx-auto flex max-w-[1460px] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-12 lg:py-7">
        <Link href="/" className="min-w-0 shrink-0" aria-label="Ir para inicio">
          <MoviWordmark subtitle={subtitle} />
        </Link>

        <nav className="hidden items-center gap-10 text-sm font-extrabold uppercase tracking-normal text-[#14233c] lg:flex">
          {navItems.map((item) => {
            const active = currentHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'border-b-2 border-[#1e7f3b] pb-1 text-[#1e7f3b]' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <AccountHeaderButton
            guestClassName="hidden items-center gap-3 rounded-full bg-[#071d39] px-7 py-4 text-xs font-extrabold uppercase tracking-wide text-white shadow-xl lg:flex"
            iconClassName="hidden h-11 w-11 items-center justify-center rounded-full bg-[#071d39] text-white shadow-xl lg:inline-flex"
          />
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#14233c]/15 bg-white/90 text-[#14233c] shadow-lg backdrop-blur lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[80] bg-[#14233c]/35 backdrop-blur-sm lg:hidden" role="presentation" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 flex h-full w-[min(86vw,340px)] flex-col bg-[#f5f1e6] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegacao"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <MoviWordmark compact />
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#14233c]/15 bg-white text-[#14233c]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const active = currentHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-4 py-4 text-sm font-black uppercase ${
                      active ? 'bg-[#ffd200] text-[#14233c]' : 'bg-white/70 text-[#14233c]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/login"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#071d39] px-4 py-4 text-xs font-black uppercase tracking-wide text-white"
            >
              Acesse sua conta
              <UserRound className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
