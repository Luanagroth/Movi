'use client';

import Image from 'next/image';
import { useState } from 'react';
import { BriefcaseBusiness, Mail, MapPin, Phone, Send } from 'lucide-react';
import { ImmersiveHeader } from '@/components/immersive-header';

const heroImage = '/images/cityline/onibus.png';

const vagas = [
  {
    titulo: 'Motorista Urbano',
    regime: 'Efetivo',
    local: 'São Francisco do Sul - SC',
    descricao: 'Condução segura, atendimento ao passageiro e cumprimento da operação diária.',
  },
  {
    titulo: 'Agente de Atendimento',
    regime: 'Efetivo',
    local: 'São Francisco do Sul - SC',
    descricao: 'Atendimento presencial e digital para usuários do transporte coletivo.',
  },
  {
    titulo: 'Auxiliar Administrativo',
    regime: 'Efetivo',
    local: 'São Francisco do Sul - SC',
    descricao: 'Apoio em rotinas operacionais, documentação e suporte interno.',
  },
];

export default function TrabalheConoscoPage() {
  const [pdfName, setPdfName] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPdfError('');
    setSubmitMessage('');
    const file = event.target.files?.[0];

    if (!file) {
      setPdfName('');
      return;
    }

    const isPdfType = file.type === 'application/pdf';
    const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfType && !isPdfExtension) {
      setPdfName('');
      setPdfError('Envie um arquivo em PDF.');
      event.target.value = '';
      return;
    }

    setPdfName(file.name);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage('');

    if (!pdfName) {
      setPdfError('Adicione um currículo em PDF para continuar.');
      return;
    }

    setPdfError('');
    setSubmitMessage('Formulário pronto para envio. Currículo PDF validado com sucesso.');
  };

  return (
    <main className="min-h-screen bg-[#f5f1e6] font-sans text-[#14233c]">
      <section className="mx-auto min-h-screen max-w-[1460px] overflow-hidden bg-[#f5f1e6] shadow-2xl lg:rounded-[28px]">
        <ImmersiveHeader activeHref="/trabalhe-conosco" />

        <section className="relative min-h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={heroImage} alt="Ônibus MOVI" fill className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e6] via-[#f5f1e6]/68 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e6]/35 via-transparent to-[#13100b]/10" />
          </div>

          <div className="relative z-10 flex min-h-[500px] flex-col justify-center px-8 pt-28 lg:px-12">
            <div className="max-w-[620px]">
              <p className="mb-6 text-sm font-black uppercase tracking-[0.24em] text-[#17803e]">Carreiras</p>
              <h1 className="text-4xl font-black leading-[0.98] tracking-normal text-[#10213d] sm:text-5xl lg:text-7xl">
                Trabalhe
                <br />
                <span className="text-[#16803f]">conosco</span>
              </h1>
              <p className="mt-7 max-w-[520px] text-lg font-medium leading-8 text-[#14233c]">
                Veja vagas em aberto e envie seu currículo para oportunidades na operação de transporte coletivo.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 px-8 py-10 lg:grid-cols-[1fr_1fr] lg:px-12">
          <article className="rounded-2xl border border-[#14233c]/10 bg-white/70 p-7 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <BriefcaseBusiness className="text-[#17803e]" size={26} />
              <h2 className="text-2xl font-black tracking-[-0.03em] text-[#14233c]">Vagas em aberto</h2>
            </div>

            <div className="space-y-4">
              {vagas.map((vaga) => (
                <div key={vaga.titulo} className="rounded-xl border border-[#14233c]/10 bg-white p-4">
                  <h3 className="text-base font-black text-[#14233c]">{vaga.titulo}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#14233c]/60">
                    {vaga.regime} · {vaga.local}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#14233c]/75">{vaga.descricao}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-[#14233c]/10 bg-[#f5f1e6] p-4 text-sm font-medium leading-6 text-[#14233c]/80">
              Para dúvidas sobre recrutamento, contato: urbano@vmares.com.br.
            </div>
          </article>

          <article className="rounded-2xl border border-[#14233c]/10 bg-white/70 p-7 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-[#14233c]">Enviar candidatura</h2>
            <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#14233c]">Nome completo</span>
                <input
                  required
                  className="rounded-xl border border-[#14233c]/15 bg-white px-5 py-4 text-sm outline-none focus:border-[#17803e]"
                  placeholder="Digite seu nome"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#14233c]">Telefone</span>
                <input
                  required
                  className="rounded-xl border border-[#14233c]/15 bg-white px-5 py-4 text-sm outline-none focus:border-[#17803e]"
                  placeholder="(47) 99999-9999"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#14233c]">E-mail</span>
                <input
                  required
                  type="email"
                  className="rounded-xl border border-[#14233c]/15 bg-white px-5 py-4 text-sm outline-none focus:border-[#17803e]"
                  placeholder="seuemail@exemplo.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#14233c]">Currículo (PDF)</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  className="rounded-xl border border-[#14233c]/15 bg-white px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-[#f5f1e6] file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:text-[#14233c]"
                />
                {pdfName ? <span className="text-xs font-semibold text-[#17803e]">Arquivo selecionado: {pdfName}</span> : null}
                {pdfError ? <span className="text-xs font-semibold text-[#e15a3d]">{pdfError}</span> : null}
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-[#14233c]">Mensagem</span>
                <textarea
                  required
                  className="min-h-[140px] resize-none rounded-xl border border-[#14233c]/15 bg-white px-5 py-4 text-sm outline-none focus:border-[#17803e]"
                  placeholder="Conte um pouco sobre seu perfil e interesse."
                />
              </label>

              <button type="submit" className="mt-2 inline-flex items-center justify-center gap-3 rounded-xl bg-[#17803e] px-6 py-4 text-sm font-black uppercase text-white shadow-lg shadow-green-700/20">
                <Send size={18} />
                Enviar candidatura
              </button>
              {submitMessage ? <p className="text-sm font-semibold text-[#17803e]">{submitMessage}</p> : null}
            </form>
          </article>
        </section>

        <section className="px-8 pb-12 lg:px-12">
          <article className="grid gap-4 rounded-2xl border border-[#14233c]/10 bg-white/60 p-6 text-sm font-medium leading-6 text-[#14233c] md:grid-cols-3">
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-[#17803e]" />
              Rua Marcos Gorresen, 1071 - Rocio Pequeno
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-[#17803e]" />
              (47) 3444-2535
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-[#17803e]" />
              urbano@vmares.com.br
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
