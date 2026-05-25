'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { ApiRequestError } from '@/services/api/client';
import { requestPasswordRecovery } from '@/services/auth/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = await requestPasswordRecovery({ email: email.trim().toLowerCase() });
      setMessage(result.message);
    } catch (submitError) {
      if (submitError instanceof ApiRequestError) {
        setError(submitError.message);
      } else {
        setError('Não foi possível enviar as instruções agora. Tente novamente em instantes.');
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

        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#17803e]">Recuperação de senha</p>
        <h1 className="mt-2 text-2xl font-black">Esqueci minha senha</h1>
        <p className="mt-2 text-sm text-[#14233c]/75">
          Informe seu e-mail. Se ele estiver cadastrado, enviaremos instruções para redefinir sua senha.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block font-bold">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-[#14233c]/20 px-3 py-2 outline-none transition focus:border-[#17803e]"
              placeholder="você@exemplo.com"
            />
          </label>

          {message ? (
            <div className="rounded-xl border border-[#b8ddc2] bg-[#edf7ef] px-3 py-2 text-sm text-[#136a33]">
              <div className="flex items-start gap-2">
                <MailCheck className="mt-0.5 h-4 w-4" />
                <span>{message}</span>
              </div>
            </div>
          ) : null}

          {error ? <p className="rounded-xl bg-[#fff1ed] px-3 py-2 text-sm font-medium text-[#b42318]">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17803e] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#136a33] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Enviando...' : 'Enviar instruções'}
          </button>
        </form>
      </section>
    </main>
  );
}
