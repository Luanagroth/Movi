import type { ComponentType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Info,
  Instagram,
  Newspaper,
  ShipWheel,
  Tag,
} from 'lucide-react';
import { ImmersiveHeader } from '@/components/immersive-header';

const heroImage = '/images/cityline/onibus.png';

const featuredNews = {
  category: 'Travessia hidroviária',
  title: 'Travessia entre Centro Histórico e Vila da Glória ganha nova embarcação e ampliação de horários',
  summary:
    'A travessia hidroviária de São Francisco do Sul passou a operar com uma embarcação maior e novos horários, ampliando a capacidade de atendimento e melhorando o deslocamento dos usuários.',
  source: 'NSC Total',
  date: 'Atualização recente',
  link: 'https://www.nsctotal.com.br/noticias/travessia-em-paraiso-ecologico-ganha-lancha-maior-e-ampliacao-de-horarios-em-sc',
  image: '/images/cityline/noticia-destaque-ferry.png',
} as const;

const news = [
  {
    icon: Instagram,
    category: 'Instagram oficial',
    title: 'Estudantes do IFC São Francisco do Sul recebem atualização sobre transporte coletivo',
    summary:
      'Publicação relacionada ao atendimento de estudantes e à comunicação sobre o transporte coletivo no município.',
    source: 'Instagram',
    link: 'https://www.instagram.com/p/DYjqO-IEc1R/',
    tone: 'green',
    image: '/images/cityline/noticia-card-01.png',
  },
  {
    icon: Instagram,
    category: 'Sistema',
    title: 'Verdes Mares divulga comunicação operacional em seus canais oficiais',
    summary:
      'Aviso publicado nas redes sociais com orientações relevantes para usuários do transporte coletivo.',
    source: 'Instagram',
    link: 'https://www.instagram.com/p/DYNtqFqvfXe/',
    tone: 'yellow',
    image: '/images/cityline/noticia-card-02.png',
  },
  {
    icon: Instagram,
    category: 'Aviso ao usuário',
    title: 'Informação oficial sobre operação e atendimento do transporte público',
    summary:
      'Publicação externa usada como referência para manter os usuários informados dentro do MOVI.',
    source: 'Instagram',
    link: 'https://www.instagram.com/p/DVfHhURjnpy/',
    tone: 'blue',
    image: '/images/cityline/noticia-card-03.png',
  },
  {
    icon: Instagram,
    category: 'Mobilidade urbana',
    title: 'Atualização sobre transporte coletivo em São Francisco do Sul',
    summary:
      'Conteúdo publicado em rede social oficial, reunido aqui para facilitar o acesso dos passageiros.',
    source: 'Instagram',
    link: 'https://www.instagram.com/p/DXINjO-jyV4/',
    tone: 'green',
    image: '/images/cityline/noticia-card-04.png',
  },
] as const;

const notices = [
  'Horários podem sofrer alterações em feriados e fins de semana.',
  'Acompanhe comunicados oficiais antes de se deslocar.',
  'Notícias externas abrem em uma nova aba.',
] as const;

type NewsTone = 'green' | 'yellow' | 'blue';

function NewsCard({
  item,
}: {
  item: {
    icon: ComponentType<{ size?: number; className?: string }>;
    category: string;
    title: string;
    summary: string;
    source: string;
    link: string;
    tone: NewsTone;
    image: string;
  };
}) {
  const Icon = item.icon;

  const tones: Record<NewsTone, string> = {
    green: 'bg-[#eef8ef] text-[#17803e] border-[#17803e]/25',
    yellow: 'bg-[#fff4cd] text-[#9c7400] border-[#ffd200]/60',
    blue: 'bg-[#eff6ff] text-[#2d6ca2] border-[#2d6ca2]/25',
  };

  return (
    <article className="rounded-2xl border border-[#14233c]/10 bg-white/65 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative mb-5 h-44 overflow-hidden rounded-xl border border-[#14233c]/10">
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase ${tones[item.tone]}`}>
          <Icon size={15} />
          {item.category}
        </span>
        <ExternalLink size={18} className="text-[#14233c]/55" />
      </div>

      <h3 className="text-2xl font-black leading-tight tracking-[-0.04em] text-[#14233c]">{item.title}</h3>
      <p className="mt-4 text-sm font-medium leading-7 text-[#14233c]/75">{item.summary}</p>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#14233c]/10 pt-5">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-[#14233c]/65">
          <Tag size={14} />
          Fonte: {item.source}
        </span>
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#17803e] px-5 py-3 text-xs font-black uppercase text-[#17803e] hover:bg-[#17803e] hover:text-white"
        >
          Ver publicação
          <ArrowRight size={15} />
        </a>
      </div>
    </article>
  );
}

function Footer() {
  return (
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
            <Link href="/linhas#mapa" className="block hover:text-white">Mapa</Link>
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
  );
}

export default function NoticiasPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e6] text-[#14233c] font-sans">
      <section className="mx-auto min-h-screen max-w-[1460px] overflow-hidden bg-[#f5f1e6] shadow-2xl lg:rounded-[28px]">
        <ImmersiveHeader activeHref="/alertas" />

        <section className="relative min-h-[560px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={heroImage} alt="Ônibus amarelo MOVI" fill className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e6] via-[#f5f1e6]/68 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e6]/35 via-transparent to-[#13100b]/10" />
          </div>

          <div className="relative z-10 flex min-h-[560px] flex-col justify-center px-8 pt-28 lg:px-12">
            <div className="max-w-[610px]">
              <p className="mb-6 text-sm font-black uppercase tracking-[0.24em] text-[#14233c]">Notícias e avisos</p>
              <h1 className="text-4xl font-black leading-[0.98] tracking-normal text-[#10213d] sm:text-5xl lg:text-7xl">
                Informação
                <br />
                <span className="text-[#16803f]">para seguir</span>
                <br />
                em movimento
              </h1>
              <p className="mt-7 max-w-[500px] text-lg font-medium leading-8 text-[#14233c]">
                Acompanhe comunicados, atualizações operacionais e notícias importantes sobre o transporte em{' '}
                <span className="whitespace-nowrap">São Francisco do Sul</span>.
              </p>
            </div>
          </div>
        </section>

        <section className="px-8 pb-10 pt-10 lg:px-12">
          <div className="mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#17803e]">Central de comunicação</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#14233c]">Últimas atualizações</h2>
            </div>
          </div>

          <article className="grid overflow-hidden rounded-3xl border border-[#14233c]/10 bg-white/65 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[390px] overflow-hidden">
              <Image src={featuredNews.image} alt={featuredNews.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071d39]/70 via-[#071d39]/30 to-transparent" />
              <div className="absolute inset-0 flex h-full flex-col justify-between p-8">
                <span className="w-fit rounded-full bg-[#2d6ca2] px-5 py-2 text-xs font-black uppercase text-white">
                  Destaque hidroviário
                </span>

                <div className="mt-auto">
                  <ShipWheel size={72} className="mb-6 text-white" />
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-white">Centro Histórico &lt;-&gt; Vila da Glória</p>
                  <p className="mt-3 text-5xl font-black leading-none tracking-[-0.07em] text-white">Nova embarcação</p>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eff6ff] px-4 py-2 text-xs font-black uppercase text-[#2d6ca2]">
                  <Newspaper size={15} />
                  {featuredNews.category}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5f1e6] px-4 py-2 text-xs font-black uppercase text-[#14233c]/70">
                  <CalendarDays size={15} />
                  {featuredNews.date}
                </span>
              </div>

              <h3 className="text-4xl font-black leading-tight tracking-[-0.06em] text-[#14233c]">{featuredNews.title}</h3>
              <p className="mt-6 text-base font-medium leading-8 text-[#14233c]/75">{featuredNews.summary}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {['Maior capacidade de atendimento', 'Ampliação de horários', 'Melhorias no embarque', 'Operação diária'].map((text) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl border border-[#14233c]/10 bg-[#f5f1e6] px-4 py-3 text-sm font-bold text-[#14233c]">
                    <Info size={17} className="text-[#17803e]" />
                    {text}
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href={featuredNews.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-[#ffd200] px-7 py-4 text-xs font-black uppercase text-[#14233c] shadow-lg shadow-yellow-500/20"
                >
                  Ler notícia completa
                  <ExternalLink size={16} />
                </a>
                <Link href="/linhas?painel=ferry" className="inline-flex items-center gap-3 rounded-full border border-[#17803e] px-7 py-4 text-xs font-black uppercase text-[#17803e]">
                  Ver horários da travessia
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-8 px-8 pb-12 lg:grid-cols-[1fr_340px] lg:px-12">
          <div>
            <div className="mb-7 flex items-center gap-5">
              <Bell size={36} className="text-[#17803e]" />
              <h2 className="text-3xl font-black tracking-[-0.04em] text-[#14233c]">Mais notícias e comunicados</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {news.map((item) => (
                <NewsCard key={item.link} item={item} />
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-[#14233c]/10 bg-[#f0eadc] p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-4">
                <Info size={32} className="text-[#17803e]" />
                <h3 className="text-2xl font-black tracking-[-0.04em] text-[#14233c]">Avisos importantes</h3>
              </div>

              <div className="space-y-4">
                {notices.map((notice) => (
                  <p key={notice} className="rounded-xl border border-[#14233c]/10 bg-white/55 p-4 text-sm font-medium leading-6 text-[#14233c]">
                    {notice}
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-3xl bg-[#071d39] p-8 text-white shadow-sm">
              <Instagram size={42} />
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">Publicações externas</h3>
              <p className="mt-4 text-sm font-medium leading-7 text-white/75">
                Alguns comunicados são vinculados a canais oficiais externos, como Instagram e portais de notícia.
              </p>
              <a
                href="https://www.instagram.com/verdesmaresoficial/"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#ffd200] px-6 py-4 text-xs font-black uppercase text-[#14233c]"
              >
                Ver canais oficiais
                <ArrowRight size={16} />
              </a>
            </article>

            <article className="rounded-3xl border border-[#ffd200] bg-[#fff4cd] p-8 shadow-sm">
              <GraduationCap size={42} className="text-[#14233c]" />
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#14233c]">Transporte estudantil</h3>
              <p className="mt-4 text-sm font-medium leading-7 text-[#14233c]/75">
                Conteúdos relacionados a estudantes e instituições de ensino podem aparecer aqui em destaque.
              </p>
            </article>
          </aside>
        </section>

        <Footer />
      </section>
    </main>
  );
}
