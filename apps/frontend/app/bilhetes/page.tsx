import Link from 'next/link';
import Image from 'next/image';
import type { ComponentType, ReactNode } from 'react';
import {
  ArrowRight,
  Bike,
  BriefcaseBusiness,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Headphones,
  Info,
  Landmark,
  MapPin,
  QrCode,
  ReceiptText,
  Search,
  ShieldCheck,
  ShipWheel,
  Smartphone,
  Ticket,
  UserRound,
  Wallet,
  Mic,
} from 'lucide-react';
import { AccountHeaderButton } from '@/components/account-header-button';
import { MoviWordmark } from '@/components/movi-wordmark';

const heroImage = '/images/cityline/onibus.png';
const recargaPontos = [
  'Viação Verdes Mares - Rua Marcos Gorresen, 1071 - Rocio Pequeno',
  'Agência Rodoviária Velha - Av. Barão do Rio Branco, 280 - Centro',
  'Agência Enseada - Rua Pernambuco, 1885 - Bairro Enseada',
];

const ferryFares = [
  { icon: Bike, vehicle: 'Moto', fare: 'R$ 6,50' },
  { icon: Bike, vehicle: 'Bicicleta', fare: 'R$ 6,50' },
  { icon: UserRound, vehicle: 'Pedestre', fare: 'R$ 6,50' },
  { icon: Car, vehicle: 'Automóvel', fare: 'R$ 24,70' },
  { icon: Car, vehicle: 'Utilitário / Caminhonete', fare: 'R$ 37,10' },
  { icon: Bus, vehicle: 'Van / Micro-ônibus', fare: 'R$ 49,30' },
  { icon: Bus, vehicle: 'Caminhão', fare: 'R$ 74,10' },
  { icon: Bus, vehicle: 'Ônibus', fare: 'R$ 98,60' },
];

function Header() {
  return (
    <header className="absolute left-0 right-0 top-0 z-30 mx-auto flex max-w-[1460px] items-center justify-between px-8 py-7 lg:px-12">
      <Link href="/">
        <MoviWordmark subtitle="PROJETOS INDEPENDENTES" />
      </Link>

      <nav className="hidden items-center gap-10 text-sm font-extrabold uppercase tracking-tight text-[#14233c] lg:flex">
        <Link href="/">Início</Link>
        <Link href="/linhas">Linhas e horários</Link>
        <Link className="border-b-2 border-[#1e7f3b] pb-1 text-[#1e7f3b]" href="/bilhetes">
          Bilhetes
        </Link>
        <Link href="/alertas">Notícias</Link>
        <Link href="/contato">Contato</Link>
      </nav>

      <AccountHeaderButton guestClassName="hidden items-center gap-3 rounded-full bg-[#071d39] px-7 py-4 text-xs font-extrabold uppercase tracking-wide text-white shadow-xl lg:flex" />
    </header>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: ComponentType<{ size?: number; className?: string }>; title: string }) {
  return (
    <div className="mb-7 flex items-center gap-5">
      <Icon size={36} className="text-[#17803e]" />
      <h2 className="text-3xl font-black tracking-[-0.04em] text-[#14233c]">{title}</h2>
    </div>
  );
}

function PaymentCard({
  label,
  icon: Icon,
  title,
  subtitle,
  children,
  highlighted = false,
  button,
}: {
  label?: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  subtitle: string;
  children: ReactNode;
  highlighted?: boolean;
  button?: string;
}) {
  return (
    <article className={`relative rounded-2xl border bg-white/70 p-8 shadow-sm ${highlighted ? 'border-[#ffd200]' : 'border-[#14233c]/12'}`}>
      {label ? (
        <span className="absolute left-0 top-0 rounded-br-xl rounded-tl-2xl bg-[#ffd200] px-5 py-2 text-xs font-black uppercase text-[#14233c]">
          {label}
        </span>
      ) : null}

      <div className="flex items-start gap-6 pt-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#f5f1e6] text-[#17803e]">
          <Icon size={46} strokeWidth={1.8} />
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-[-0.03em] text-[#14233c]">{title}</h3>
          <p className="mt-1 text-base font-medium text-[#14233c]">{subtitle}</p>
        </div>
      </div>

      <div className="mt-7 space-y-3 text-sm font-medium leading-6 text-[#14233c]">{children}</div>

      {button ? (
        <button type="button" className="mt-8 w-full rounded-xl border border-[#17803e] px-5 py-4 text-xs font-black uppercase text-[#17803e] transition hover:bg-[#17803e] hover:text-white">
          {button}
        </button>
      ) : null}
    </article>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-3">
      <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#17803e]" />
      <span>{children}</span>
    </p>
  );
}

function TopicRow({
  icon: Icon,
  title,
  text,
  tone = 'green',
  href,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  text: string;
  tone?: 'green' | 'blue' | 'orange' | 'purple';
  href?: string;
}) {
  const tones: Record<'green' | 'blue' | 'orange' | 'purple', string> = {
    green: 'bg-[#eef8ef] text-[#17803e]',
    blue: 'bg-[#eff6ff] text-[#2d6ca2]',
    orange: 'bg-[#fff1ed] text-[#e15a3d]',
    purple: 'bg-[#f3efff] text-[#7246d6]',
  };

  const content = (
    <>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={25} />
      </span>
      <span className="flex-1">
        <span className="block text-base font-black text-[#14233c]">{title}</span>
        <span className="mt-1 block text-sm font-medium text-[#14233c]/65">{text}</span>
      </span>
      {href ? <ArrowRight size={18} className="text-[#14233c]" /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex w-full items-center gap-5 border-b border-[#14233c]/10 px-6 py-5 text-left transition hover:bg-[#f5f1e6]/60 last:border-b-0">
        {content}
      </Link>
    );
  }

  return <div className="flex w-full items-center gap-5 border-b border-[#14233c]/10 px-6 py-5 text-left last:border-b-0">{content}</div>;
}

export default function BilhetesPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e6] text-[#14233c] font-sans">
      <section className="mx-auto min-h-screen max-w-[1460px] overflow-hidden bg-[#f5f1e6] shadow-2xl lg:rounded-[28px]">
        <Header />

        <section className="relative min-h-[560px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
            <Image src={heroImage} alt="Ônibus amarelo MOVI" fill className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e6] via-[#f5f1e6]/68 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e6]/35 via-transparent to-[#13100b]/10" />
          </div>

          <div className="relative z-10 flex min-h-[560px] flex-col justify-center px-8 pt-28 lg:px-12">
            <div className="max-w-[570px]">
              <p className="mb-6 text-sm font-black uppercase tracking-[0.24em] text-[#14233c]">Bilhetes e tarifas</p>
              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[#10213d] lg:text-7xl">
                Transparência
                <br />
                <span className="text-[#16803f]">e praticidade</span>
                <br />
                para você
              </h1>
              <p className="mt-7 max-w-[460px] text-lg font-medium leading-8 text-[#14233c]">
                Confira os valores das tarifas e as formas de pagamento aceitas no transporte coletivo do MOVI.
              </p>
            </div>
          </div>
        </section>

        <section className="px-8 py-10 lg:px-12">
          <SectionTitle icon={Ticket} title="Valores das Tarifas" />

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <article className="min-h-[300px] rounded-2xl border border-[#ffd200] bg-white/55 p-8 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-start gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#eaf6e9] text-[#17803e]">
                      <Bus size={42} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-[-0.03em] text-[#17803e]">Transporte Terrestre (Ônibus)</h3>
                      <p className="mt-1 text-base font-medium text-[#14233c]">Tarifa única</p>
                    </div>
                  </div>
                  <span className="rounded-xl border border-[#17803e]/15 bg-[#dff2db] px-8 py-4 text-2xl font-black text-[#17803e]">
                    R$ 6,50
                  </span>
                </div>

                <div className="mt-9 border-t border-[#14233c]/10 pt-7">
                  <p className="text-base font-medium leading-8 text-[#14233c]">
                    Tarifa válida apenas para linhas municipais.
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-[#2d6ca2]/20 bg-white/55 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2d6ca2]">
                      <ShipWheel size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-[-0.03em] text-[#14325c]">Transporte Hidroviário (Lancha)</h3>
                      <p className="mt-1 text-sm font-medium text-[#14233c]">Centro Histórico - Vila da Glória</p>
                    </div>
                  </div>
                  <span className="rounded-xl border border-[#2d6ca2]/20 bg-[#eff6ff] px-6 py-3 text-xl font-black text-[#2d6ca2]">
                    Gratuito
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium leading-6 text-[#14233c]/75">
                  Esta linha hidroviária é separada do Ferry Boat Laranjeiras - Vila da Glória.
                </p>
              </article>
            </div>

            <article className="rounded-2xl border border-[#14233c]/18 bg-white/55 p-8 shadow-sm">
              <div className="mb-6 flex items-start gap-6">
                <ShipWheel size={54} className="text-[#071d39]" />
                <div>
                  <h3 className="text-2xl font-black tracking-[-0.03em] text-[#14325c]">Transporte Hidroviário (Ferry Boat)</h3>
                  <p className="mt-1 text-base font-medium text-[#14233c]">Valores por veículo</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#14233c]/10 bg-white/80">
                <div className="grid grid-cols-[1fr_130px] border-b border-[#14233c]/10 bg-white px-5 py-3 text-sm font-black text-[#14233c]">
                  <p>Tipo de Veículo</p>
                  <p className="text-right">Tarifa</p>
                </div>
                {ferryFares.map((item) => (
                  <div key={item.vehicle} className="grid grid-cols-[1fr_130px] items-center border-b border-[#14233c]/8 px-5 py-3 last:border-b-0">
                    <div className="flex items-center gap-3 text-sm font-medium text-[#14233c]">
                      <item.icon size={18} className="text-[#071d39]" />
                      {item.vehicle}
                    </div>
                    <p className="text-right text-sm font-bold text-[#14233c]">{item.fare}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm font-medium leading-6 text-[#14233c]/70">
                Tarifas referentes ao Ferry Boat Laranjeiras - Vila da Glória. A linha de lancha Centro Histórico - Vila da Glória possui operação separada.
              </p>
            </article>
          </div>
        </section>

        <section className="px-8 pb-10 lg:px-12">
          <SectionTitle icon={CreditCard} title="Formas de Pagamento" />

          <div className="grid gap-8 lg:grid-cols-3">
            <PaymentCard label="Em breve" icon={QrCode} title="PIX / QR Code" subtitle="Direto ao cobrador" highlighted>
              <Bullet>Aponte a câmera do seu celular para o QR Code exibido pelo validador.</Bullet>
              <Bullet>Confirme o pagamento no seu banco.</Bullet>
              <Bullet>Aguarde a confirmação e siga viagem.</Bullet>
              <div className="mt-7 flex items-center gap-3 rounded-xl border border-[#ffd200] bg-[#fff4cd] px-5 py-4 text-sm font-bold text-[#14233c]">
                <Info size={18} className="text-[#d59d00]" />
                Funcionalidade em implementação.
              </div>
            </PaymentCard>

            <PaymentCard icon={CreditCard} title="Cartão Ideal" subtitle="Operado pela Passebus" button="Saiba mais sobre o Cartão Ideal">
              <Bullet>Mais agilidade no embarque.</Bullet>
              <Bullet>Aceito em todas as linhas e modais.</Bullet>
              <Bullet>Recarga via PIX disponível.</Bullet>
              <Bullet>Consulte saldo e extrato pelo app Passebus.</Bullet>
            </PaymentCard>

            <PaymentCard icon={Wallet} title="Dinheiro" subtitle="Direto ao cobrador" button="Dicas para facilitar o troco">
              <Bullet>Pague a tarifa em dinheiro.</Bullet>
              <Bullet>Tenha o valor exato para facilitar o troco e agilizar o embarque.</Bullet>
              <Bullet>O cobrador não possui troco para grandes valores.</Bullet>
            </PaymentCard>
          </div>
        </section>

        <section className="px-8 pb-10 lg:px-12">
          <SectionTitle icon={MapPin} title="Recarga Cartão Ideal SFS" />
          <article className="rounded-2xl border border-[#14233c]/10 bg-white/60 p-8 shadow-sm">
            <p className="text-sm font-medium leading-7 text-[#14233c]">
              A recarga pode ser feita presencialmente nos pontos oficiais da Viação Verdes Mares.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {recargaPontos.map((ponto) => (
                <div key={ponto} className="rounded-xl border border-[#14233c]/12 bg-white px-4 py-3 text-sm font-medium text-[#14233c]">
                  {ponto}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-[#17803e]/20 bg-[#eef8ef] px-4 py-3 text-sm text-[#14233c]">
              Horário do escritório/garagem: segunda a sexta, 7h30 às 12h e 13h30 às 17h30.
            </div>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-[#14233c] md:grid-cols-2">
              <p>Telefone/Fax: (47) 3444-2535</p>
              <p>E-mail: urbano@vmares.com.br</p>
            </div>
          </article>
        </section>

        <section className="px-8 pb-10 lg:px-12">
          <SectionTitle icon={ReceiptText} title="Cartão Ideal Estudante" />
          <article className="rounded-2xl border border-[#14233c]/10 bg-white/60 p-8 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#14233c]/12 bg-white p-4">
                <h3 className="text-sm font-black uppercase text-[#14233c]">Benefício</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#14233c]/75">
                  Desconto de 20% no valor da tarifa para alunos elegíveis das linhas urbanas.
                </p>
              </div>
              <div className="rounded-xl border border-[#14233c]/12 bg-white p-4">
                <h3 className="text-sm font-black uppercase text-[#14233c]">Emissão e revalidação</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#14233c]/75">
                  Solicitar no escritório Ideal (Rua Marcos Gorresen, 1071), com declaração de matrícula/atestado de frequência.
                </p>
              </div>
              <div className="rounded-xl border border-[#14233c]/12 bg-white p-4">
                <h3 className="text-sm font-black uppercase text-[#14233c]">Créditos e limites</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#14233c]/75">
                  Compra limitada a 2 vezes por mês, com teto mensal de R$ 90,00. Limites de uso: 2 viagens/dia e 50/mês.
                </p>
              </div>
              <div className="rounded-xl border border-[#14233c]/12 bg-white p-4">
                <h3 className="text-sm font-black uppercase text-[#14233c]">Segunda via</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#14233c]/75">
                  Em caso de perda/roubo, solicitar o bloqueio rápido pelo (47) 3444-2535. Custo: 2x valor da tarifa.
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm font-semibold text-[#14233c]">Contato Ideal: (47) 3444-2535 / 3444-2109 - ideal@vmares.com.br</p>
          </article>
        </section>

        <section className="px-8 pb-10 lg:px-12">
          <article className="grid overflow-hidden rounded-2xl border border-[#17803e]/35 bg-[#eff8ed] shadow-sm lg:grid-cols-[260px_1fr_130px_130px_130px_130px_150px]">
            <div className="flex items-center gap-4 border-b border-[#17803e]/20 p-7 lg:border-b-0 lg:border-r">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#17803e]">Cartão</p>
                <p className="text-5xl font-black tracking-[-0.07em] text-[#14325c]">ideal</p>
                <p className="mt-2 text-xs font-black uppercase text-[#14325c]">Operado pela Passebus</p>
              </div>
            </div>

            <div className="p-7">
              <h3 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#17803e]">
                Cartão Ideal, mais mobilidade no seu dia a dia.
              </h3>
              <p className="mt-4 max-w-[520px] text-base font-medium leading-7 text-[#14233c]">
                Tecnologia que conecta você a um transporte mais ágil, seguro e moderno.
              </p>
            </div>

            {[
              { icon: ReceiptText, text: 'Recarga via PIX de forma rápida e segura' },
              { icon: Smartphone, text: 'Acompanhe saldo e extrato pelo app' },
              { icon: Bus, text: 'Aceito em todas as linhas terrestres e hidroviárias' },
              { icon: ShieldCheck, text: 'Mais segurança e praticidade para você' },
            ].map((item) => (
              <div key={item.text} className="flex flex-col items-center justify-center border-t border-[#17803e]/20 p-5 text-center lg:border-l lg:border-t-0">
                <item.icon size={34} className="text-[#17803e]" />
                <p className="mt-3 text-xs font-bold leading-5 text-[#14233c]">{item.text}</p>
              </div>
            ))}

            <div className="flex flex-col items-center justify-center border-t border-[#17803e]/20 p-5 lg:border-l lg:border-t-0">
              <button type="button" className="rounded-xl bg-[#17803e] px-5 py-4 text-center text-xs font-black uppercase text-white">
                Baixe o app Passebus
              </button>
            </div>
          </article>
        </section>

        <section className="px-8 pb-12 lg:px-12">
          <article className="rounded-2xl border border-[#14233c]/10 bg-white/55 p-8 shadow-sm">
            <div className="mb-7 flex items-center gap-4">
              <Info size={30} className="text-[#17803e]" />
              <h2 className="text-2xl font-black tracking-[-0.03em] text-[#14233c]">Informações importantes</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              {[
                { icon: CreditCard, title: 'Tarifa Social', text: 'Benefícios e gratuidades conforme legislação vigente.' },
                { icon: Clock, title: 'Integração', text: 'Consulte as regras de integração entre linhas e municípios.' },
                { icon: Landmark, title: 'Legislação', text: 'Tarifas definidas conforme órgãos reguladores.' },
                { icon: Headphones, title: 'Dúvidas?', text: 'Fale com nosso atendimento pelos canais oficiais.' },
              ].map((item, index) => (
                <div key={item.title} className={`flex gap-5 ${index > 0 ? 'lg:border-l lg:border-[#14233c]/10 lg:pl-6' : ''}`}>
                  <item.icon size={38} className="shrink-0 text-[#17803e]" />
                  <div>
                    <h3 className="text-sm font-black text-[#14233c]">{item.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#14233c]/70">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="px-8 pb-10 lg:px-12">
          <h2 className="mb-5 text-2xl font-black tracking-[-0.03em] text-[#14233c]">Outros assuntos</h2>
          <article className="overflow-hidden rounded-2xl border border-[#14233c]/10 bg-white/65 shadow-sm">
            <TopicRow
              icon={Search}
              title="Objetos perdidos"
              text="Consulte diretamente os canais oficiais das operadoras e da administração local para atendimento atualizado."
              tone="green"
            />
            <TopicRow
              icon={CreditCard}
              title="Carteirinha do estudante"
              text="As regras podem mudar com o tempo. Sempre valide condições e documentos nos canais oficiais da instituição responsável."
              tone="blue"
            />
            <TopicRow
              icon={BriefcaseBusiness}
              title="Trabalhe conosco"
              text="Confira nossas vagas abertas e faça parte do time MOVI."
              tone="orange"
              href="/trabalhe-conosco"
            />
            <TopicRow icon={Mic} title="Imprensa" text="Contato da empresa: (47) 3444-2535 | urbano@vmares.com.br." tone="purple" />
          </article>
        </section>

        <footer className="bg-[#071d39] px-8 py-8 text-white lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <p className="text-xl font-black uppercase">MOVI</p>
              <p className="mt-2 text-sm text-white/70">Plataforma independente de mobilidade urbana.</p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-black uppercase">Navegação</h3>
              <div className="space-y-2 text-sm text-white/70">
                <Link href="/" className="block hover:text-white">Início</Link>
                <Link href="/linhas" className="block hover:text-white">Linhas e horários</Link>
                <Link href="/bilhetes" className="block hover:text-white">Bilhetes</Link>
                <Link href="/alertas" className="block hover:text-white">Notícias</Link>
                <Link href="/contato" className="block hover:text-white">Contato</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-black uppercase">Acesso rápido</h3>
              <div className="space-y-2 text-sm text-white/70">
                <Link href="/mapa" className="block hover:text-white">Mapa</Link>
                <Link href="/linhas?painel=ferry" className="block hover:text-white">Ferry boat</Link>
                <Link href="/horarios" className="block hover:text-white">Horários</Link>
                <Link href="/trabalhe-conosco" className="block hover:text-white">Trabalhe conosco</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/65">
            © 2026 MOVI. Todos os direitos reservados.
          </div>
        </footer>
      </section>
    </main>
  );
}
