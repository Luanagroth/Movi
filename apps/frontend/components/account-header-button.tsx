'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useAuthSession } from '@/hooks/use-auth-session';

interface AccountHeaderButtonProps {
  guestClassName: string;
  iconClassName?: string;
  guestLabel?: string;
}

export function AccountHeaderButton({
  guestClassName,
  iconClassName = 'hidden h-11 w-11 items-center justify-center rounded-full bg-[#071d39] text-white shadow-xl lg:inline-flex',
  guestLabel = 'Acesse sua conta',
}: AccountHeaderButtonProps) {
  const { isAuthenticated } = useAuthSession();

  if (isAuthenticated) {
    return (
      <Link href="/perfil" className={iconClassName} aria-label="Perfil do usuario" title="Perfil do usuario">
        <UserRound size={16} />
      </Link>
    );
  }

  return (
    <Link href="/login" className={guestClassName}>
      {guestLabel}
      <UserRound size={16} />
    </Link>
  );
}

