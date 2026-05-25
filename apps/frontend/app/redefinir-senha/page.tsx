'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ApiRequestError } from '@/services/api/client';
import { resetPassword } from '@/services/auth/auth.service';

function isStrongPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('Link inválido. Solicite uma nova recuperação de senha.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Use ao menos 8 caracteres, com letra e número.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword: password });
      setSuccess(true);
    } catch (submitError) {
      if (submitError instanceof ApiRequestError) {
        setError(submitError.message);
      } else {
        setError('Não foi possível redefinir a senha agora. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f1e6] px-4 py-8 text-[#14233c]">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-[#14233c]/10 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#14233c]/75 hover:text-[#14233c]">
          <ArrowLeft className="h-4 w-4" />
          Voltar para login
        </Link>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#17803e]">Nova senha</p>
        <h1 className="mt-2 text-2xl font-black">Redefinir senha</h1>
        <p className="mt-2 text-sm text-[#14233c]/75">Defina uma nova senha para acessar sua conta.</p>

        {success ? (
          <div className="mt-6 rounded-xl border border-[#b8ddc2] bg-[#edf7ef] p-4 text-sm text-[#136a33]">
            Senha atualizada com sucesso. Agora você pode entrar com sua nova senha.
            <div className="mt-3">
              <Link href="/login" className="inline-flex rounded-lg bg-[#17803e] px-3 py-2 text-xs font-black uppercase text-white">
                Ir para login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span className="mb-1 block font-bold">Nova senha</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#14233c]/20 px-3 py-2 pr-11 outline-none transition focus:border-[#17803e]"
                  placeholder="Mínimo 8 caracteres com letra e número"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#14233c]/65 hover:bg-[#f5f1e6]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-bold">Confirmar senha</span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#14233c]/20 px-3 py-2 pr-11 outline-none transition focus:border-[#17803e]"
                  placeholder="Repita a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#14233c]/65 hover:bg-[#f5f1e6]"
                  aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error ? <p className="rounded-xl bg-[#fff1ed] px-3 py-2 text-sm font-medium text-[#b42318]">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17803e] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#136a33] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Atualizando...' : 'Redefinir senha'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
