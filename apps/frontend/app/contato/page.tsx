import type { ComponentType, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Code2,
  Database,
  Facebook,
  Github,
  Globe,
  Home,
  Instagram,
  Linkedin,
  Mail,
  ShieldCheck,
  Youtube,
} from 'lucide-react';
import { AccountHeaderButton } from '@/components/account-header-button';
import { MoviWordmark } from '@/components/movi-wordmark';

const heroImage = '/images/cityline/onibus.png';
const portfolioUrl = 'https://luana-groth-portfolio.vercel.app/';

function Header() {
  return (
    <header className="absolute left-0 right-0 top-0 z-30 mx-auto flex max-w-[1460px] items-center justify-between px-8 py-7 lg:px-12">
      <Link href="/">
        <MoviWordmark subtitle="PROJETOS INDEPENDENTES" />
      </Link>

      <nav className="hidden items-center gap-10 text-sm font-extrabold uppercase tracking-tight text-[#14233c] lg:flex">
        <Link href="/">Início</Link>
        <Link href="/linhas">Linhas e horários</Link>
        <Link href="/bilhetes">Bilhetes</Link>
        <Link href="/alertas">Notícias</Link>
        <Link className="border-b-2 border-[#1e7f3b] pb-1 text-[#1e7f3b]" href="/contato">
          Contato
        </Link>
      </nav>

      <AccountHeaderButton guestClassName="hidden items-center gap-3 rounded-full bg-[#071d39] px-7 py-4 text-xs font-extrabold uppercase tracking-wide text-white shadow-xl lg:flex" />
    </header>
  );
}

function ContactCard({
  icon: Icon,
  title,
  text,
  tone = 'green',
  children,
}: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  text: string;
  tone?: 'green' | 'blue' | 'orange' | 'purple';
  children?: ReactNode;
}) {
  const tones: Record<'green' | 'blue' | 'orange' | 'purple', string> = {
    green: 'bg-[#eef8ef] text-[#17803e]',
    blue: 'bg-[#eff6ff] text-[#2d6ca2]',
    orange: 'bg-[#fff1ed] text-[#e15a3d]',
    purple: 'bg-[#f3efff] text-[#7246d6]',
  };

  return (
    <article className="rounded-2xl border border-[#14233c]/10 bg-white/70 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={30} />
      </div>
      <h3 className="text-base font-black text-[#14233c]">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-[#14233c]/75">{text}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  );
}

export default function ContatoPage() {
  return (
    <main className="min-h-screen bg-[#f5f1e6] font-sans text-[#14233c]">
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
            <div className="mb-12 flex items-center gap-3 text-sm font-bold text-[#14233c]/65">
              <Home size={17} className="text-[#17803e]" />
              <span>/</span>
              <span>Contato</span>
            </div>

            <div className="max-w-[560px]">
              <p className="mb-6 text-sm font-black uppercase tracking-[0.24em] text-[#17803e]">Projeto independente</p>
              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[#10213d] lg:text-7xl">
                Projeto independente
                <br />
                <span className="text-[#16803f]">de mobilidade urbana</span>
              </h1>
              <p className="mt-7 max-w-[500px] text-lg font-medium leading-8 text-[#14233c]">
                O MOVI organiza informações públicas sobre horários, linhas e deslocamentos na região, com foco em facilitar a consulta
                dos usuários e demonstrar minhas habilidades em desenvolvimento de software.
              </p>
            </div>
          </div>
        </section>

        <section className="px-8 py-10 lg:px-12">
          <h2 className="mb-7 text-2xl font-black tracking-[-0.03em] text-[#14233c]">Base do projeto</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ContactCard
              icon={ShieldCheck}
              title="Projeto independente"
              text="Sem vínculo com empresas de transporte público, transporte hidroviário, prefeituras ou órgãos oficiais."
              tone="green"
            />
            <ContactCard
              icon={Database}
              title="Dados públicos"
              text="As informações utilizadas foram coletadas de fontes abertas disponíveis na internet, como sites institucionais, portais públicos e redes sociais."
              tone="blue"
            />
            <ContactCard
              icon={Code2}
              title="Desenvolvido por Luana Groth"
              text="Projeto criado para estudo, portfólio e evolução prática em desenvolvimento Full Stack."
              tone="orange"
            />
            <ContactCard icon={Mail} title="Contato da desenvolvedora" text="LinkedIn, GitHub, portfólio e e-mail." tone="purple">
              <div className="space-y-2 text-sm font-semibold">
                <a href="https://linkedin.com/in/luanagroth" target="_blank" rel="noreferrer" className="block text-[#0b62d6] hover:underline">
                  LinkedIn
                </a>
                <a href="https://github.com/luanagroth" target="_blank" rel="noreferrer" className="block text-[#14233c] hover:underline">
                  GitHub
                </a>
                <a href={portfolioUrl} target="_blank" rel="noreferrer" className="block text-[#17803e] hover:underline">
                  Portfólio
                </a>
                <a href="mailto:luanaeulalia56@gmail.com" className="block text-[#7246d6] hover:underline">
                  luanaeulalia56@gmail.com
                </a>
              </div>
            </ContactCard>
          </div>
        </section>

        <section className="px-8 pb-10 lg:px-12">
          <article className="rounded-2xl border border-[#17803e]/25 bg-[#eef8ef] p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-[#17803e]">Sobre o projeto MOVI</h2>
            <p className="mt-4 text-sm font-medium leading-7 text-[#14233c]">
              O MOVI é um projeto independente, desenvolvido por Luana Groth, com o objetivo de organizar e facilitar a busca por
              informações de mobilidade urbana na região.
            </p>
            <p className="mt-4 text-sm font-medium leading-7 text-[#14233c]">
              O projeto não possui vínculo oficial com empresas de transporte público, transporte hidroviário, prefeituras, órgãos
              governamentais ou entidades municipais.
            </p>
            <p className="mt-4 text-sm font-medium leading-7 text-[#14233c]">
              Todas as informações utilizadas para alimentar o sistema foram obtidas a partir de fontes públicas disponíveis na internet. Os
              dados podem sofrer alterações nas fontes originais, por isso recomenda-se sempre confirmar informações sensíveis em canais
              oficiais.
            </p>
            <p className="mt-4 text-sm font-medium leading-7 text-[#14233c]">
              Este projeto foi criado para fins de estudo, portfólio, treinamento técnico e desenvolvimento das minhas habilidades em
              arquitetura, front-end, back-end, organização de dados e experiência do usuário.
            </p>
            <p className="mt-4 rounded-xl border border-[#17803e]/20 bg-white/60 px-4 py-3 text-sm font-bold leading-6 text-[#17803e]">
              Todas as marcas, nomes, rotas, referências e informações pertencem aos seus respectivos proprietários. O MOVI apenas organiza
              e apresenta esses dados de forma independente.
            </p>
          </article>
        </section>

        <footer className="bg-[#071d39] px-8 py-8 text-white lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.7fr_0.9fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Image src="/favicon.svg" alt="MOVI" width={38} height={38} className="h-9 w-9" />
                <div>
                  <p className="text-xl font-black uppercase">MOVI</p>
                  <p className="text-sm text-white/70">Projeto independente</p>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                {[Instagram, Facebook, Youtube].map((Icon) => (
                  <span key={Icon.displayName ?? Icon.name} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80">
                    <Icon size={18} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-black uppercase">Navegação</h3>
              <div className="space-y-3 text-sm text-white/70">
                <Link href="/" className="block hover:text-white">Início</Link>
                <Link href="/linhas" className="block hover:text-white">Linhas e horários</Link>
                <Link href="/bilhetes" className="block hover:text-white">Bilhetes</Link>
                <Link href="/alertas" className="block hover:text-white">Notícias</Link>
                <Link href="/contato" className="block text-[#5bd17b] hover:text-white">Contato</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-black uppercase">Serviços</h3>
              <div className="space-y-3 text-sm text-white/70">
                <Link href="/linhas#mapa" className="block hover:text-white">Planeje sua viagem</Link>
                <Link href="/bilhetes" className="block hover:text-white">Cartão transporte</Link>
                <Link href="/contato" className="block hover:text-white">Atendimento</Link>
                <Link href="/linhas?painel=ferry" className="block hover:text-white">Ferry boat</Link>
                <Link href="/trabalhe-conosco" className="block hover:text-white">Trabalhe conosco</Link>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-black uppercase">Contato profissional</h3>
              <div className="space-y-4 text-sm text-white/70">
                <a href="https://github.com/luanagroth" target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white">
                  <Github size={16} /> github.com/luanagroth
                </a>
                <a href="https://linkedin.com/in/luanagroth" target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white">
                  <Linkedin size={16} /> linkedin.com/in/luanagroth
                </a>
                <a href={portfolioUrl} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white">
                  <Globe size={16} /> luana-groth-portfolio.vercel.app
                </a>
                <a href="mailto:luanaeulalia56@gmail.com" className="flex gap-3 hover:text-white">
                  <Mail size={16} /> luanaeulalia56@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-between gap-5 border-t border-white/10 pt-8 text-sm text-white/65">
            <p>© 2026 MOVI. Todos os direitos reservados.</p>
            <p>Política de Privacidade | Termos de Uso</p>
          </div>
        </footer>
      </section>
    </main>
  );
}
