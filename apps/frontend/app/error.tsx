'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10">
      <div className="surface w-full p-6 text-center sm:p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-brand-700">MOVI</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Não foi possível carregar esta página</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tente novamente. Se a API estiver instável, o sistema volta para modo seguro automaticamente.
        </p>
        <button
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          onClick={() => reset()}
        >
          <RotateCcw className="h-4 w-4" />
          Recarregar
        </button>
      </div>
    </main>
  );
}
