import { MoviWordmark } from '@/components/movi-wordmark';

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <MoviWordmark compact={compact} subtitle="PROJETOS INDEPENDENTES" />;
}
