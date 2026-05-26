import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import {
  ArrowRight,
  Bus,
  Clock,
  CreditCard,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import { ImmersiveHeader } from '@/components/immersive-header';
import { WeatherCard } from '@/features/weather/components/weather-card';
import { getSaoFranciscoDoSulWeather } from '@/services/weather/weather.service';

const heroImage = '/images/cityline/onibus.png';
const stopImage = '/images/cityline/ponto-de-onibus.png';
const cityImage = '/images/cityline/content_DSCF3169.jpg';

async function HomeWeatherSection() {
  const weather = await getSaoFranciscoDoSulWeather();
  return <WeatherCard status={weather ? 'success' : 'error'} weather={weather} />;
}

export default function MoviHomePage() {
  return (
    <main className="min-h-screen bg-[#f5f1e6] text-[#14233c] font-sans">
      <section className="mx-auto min-h-screen max-w-[1460px] overflow-hidden rounded-none bg-[#f5f1e6] shadow-2xl lg:my-0 lg:rounded-[28px]">
        <ImmersiveHeader activeHref="/" />

        <section className="relative min-h-[660px] overflow-hidden">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <Image src={heroImage} alt="Ônibus amarelo MOVI" fill priority className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e6] via-[#f5f1e6]/66 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f1e6]/35 via-transparent to-[#13100b]/10" />
          </div>

          <div className="relative z-10 flex min-h-[660px] flex-col justify-center px-8 pt-28 lg:px-12">
            <div className="max-w-[560px]">
              <p className="mb-6 text-xs font-black uppercase tracking-[0.28em] text-[#14233c]">Mobilidade que conecta</p>
              <h1 className="text-5xl font-black leading-[0.95] tracking-normal text-[#10213d] sm:text-6xl lg:text-7xl">
                São Chico
                <br />
                <span className="text-[#16803f]">em movimento</span>
              </h1>
              <p className="mt-7 max-w-[480px] text-lg font-medium leading-8 text-[#14233c]">
                Transporte coletivo com mais conforto, segurança e compromisso com a cidade.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/linhas"
                  className="flex items-center gap-3 rounded-full bg-[#ffd200] px-8 py-4 text-sm font-black uppercase text-[#101d32] shadow-lg shadow-yellow-500/20 transition hover:scale-[1.02]"
                >
                  <Bus size={18} />
                  Ver linhas e horários
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-8 -mt-16 grid overflow-hidden rounded-2xl bg-[#ffdf43] shadow-xl lg:mx-12 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'Segurança', text: 'Frota monitorada e motoristas treinados para sua segurança.' },
            { icon: Leaf, title: 'Sustentabilidade', text: 'Compromisso com um transporte mais limpo e consciente.' },
            { icon: Users, title: 'Acessibilidade', text: 'Ônibus adaptados para garantir mobilidade para todos.' },
            { icon: Clock, title: 'Pontualidade', text: 'Mais eficiência nos horários para o seu dia render mais.' },
          ].map((item, index) => (
            <article key={item.title} className={`flex gap-5 p-8 ${index > 0 ? 'border-l border-[#c9a900]/40' : ''}`}>
              <item.icon className="mt-1 shrink-0 text-[#0b2440]" size={42} strokeWidth={2.2} />
              <div>
                <h3 className="text-sm font-black uppercase text-[#14233c]">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#14233c]">{item.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="px-8 lg:px-12">
          <Suspense fallback={<WeatherCard status="loading" />}>
            <HomeWeatherSection />
          </Suspense>
        </section>

        <section className="grid gap-10 px-8 py-14 lg:grid-cols-[1.05fr_1.55fr_0.9fr] lg:px-12">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#14233c]">Conectando destinos</p>
            <h2 className="mt-6 text-4xl font-black leading-tight tracking-[-0.04em] text-[#14233c]">
              Mais que transporte,
              <br /> conectamos <span className="text-[#16803f]">pessoas.</span>
            </h2>
            <p className="mt-6 max-w-[360px] text-base font-medium leading-8 text-[#14233c]">
              Do centro aos bairros, da cidade à praia. Nosso compromisso é levar você com conforto e eficiência aonde precisa chegar.
            </p>
            <Link
              href="/linhas"
              className="mt-8 flex w-fit items-center gap-4 rounded-full border border-[#14233c]/40 px-7 py-4 text-sm font-black uppercase text-[#14233c]"
            >
              Conheça nossas linhas
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="relative min-h-[320px] overflow-hidden rounded-2xl shadow-lg">
              <Image src={stopImage} alt="Ponto de ônibus" fill className="h-full w-full object-cover" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[#071d39] p-6 text-white">
                <h3 className="text-sm font-black uppercase">Conforto e estrutura</h3>
                <p className="mt-3 text-sm leading-6">Paradas com mais comodidade para o seu dia a dia.</p>
              </div>
            </article>
            <article className="relative min-h-[320px] overflow-hidden rounded-2xl shadow-lg">
              <Image src={cityImage} alt="Cidade e praia" fill className="h-full w-full object-cover" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[#071d39] p-6 text-white">
                <h3 className="text-sm font-black uppercase">Conectamos você</h3>
                <p className="mt-3 text-sm leading-6">Integramos a cidade e a praia com mais facilidade.</p>
              </div>
            </article>
          </div>

          <aside className="rounded-2xl bg-[#eee8d8] p-7 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#14233c]">Fique por dentro</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#16803f]">Últimas notícias</h2>
            <div className="mt-8 space-y-5">
              {[
                ['20', 'MAI', 'Novos horários para linhas de Praia Grande'],
                ['12', 'MAI', 'Modernização da frota segue em andamento'],
                ['05', 'MAI', 'Campanha do agasalho: solidariedade que aquece'],
              ].map(([day, month, title]) => (
                <div key={title} className="grid grid-cols-[48px_1fr_20px] items-center gap-4 border-b border-[#14233c]/12 pb-4">
                  <div className="text-center font-black text-[#16803f]">
                    <p className="text-xl leading-none">{day}</p>
                    <p className="text-xs">{month}</p>
                  </div>
                  <p className="text-sm font-bold leading-5 text-[#14233c]">{title}</p>
                  <ArrowRight size={16} />
                </div>
              ))}
            </div>
            <Link
              href="/alertas"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-[#16803f]/60 py-4 text-xs font-black uppercase text-[#16803f]"
            >
              Ver todas as notícias
            </Link>
          </aside>
        </section>

        <footer className="mx-8 grid overflow-hidden rounded-t-[34px] bg-[#071d39] text-white lg:mx-12 lg:grid-cols-4">
          {[
            { icon: MapPin, title: 'Planeje sua viagem', text: 'Encontre a melhor rota até o seu destino.', href: '/linhas#mapa' },
            { icon: CreditCard, title: 'Cartão transporte', text: 'Veja como adquirir e recarregar seu cartão.', href: '/bilhetes' },
            { icon: MessageCircle, title: 'Atendimento', text: 'Fale conosco pelos canais oficiais.', href: '/contato' },
            { icon: Smartphone, title: 'App MOVI', text: 'Baixe o app e tenha tudo na palma da mão.', href: '/login' },
          ].map((item, index) => (
            <Link key={item.title} href={item.href} className={`flex gap-5 p-8 ${index > 0 ? 'border-l border-white/10' : ''}`}>
              <item.icon className="shrink-0" size={36} />
              <div>
                <h3 className="text-sm font-black uppercase">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{item.text}</p>
              </div>
            </Link>
          ))}
        </footer>
      </section>
    </main>
  );
}
