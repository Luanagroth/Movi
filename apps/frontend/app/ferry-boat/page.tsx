import Link from 'next/link';
import type { TransportLine } from '@cityline/shared';
import { AlertTriangle, ArrowRight, Clock3, MapPinned, Route, ShipWheel, Ticket } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import { StatusPill } from '@/components/ui/status-pill';
import { getDashboardData, getLineDirectionSchedules, getLineDirections } from '@/services/transport/transport.service';

const getScheduleCount = (line: TransportLine) =>
  line.schedules.weekday.length + line.schedules.saturday.length + line.schedules.sunday.length;

interface FerryScheduleBoard {
  lineId: string;
  outboundLabel: string;
  inboundLabel: string;
  outboundTimes: string[];
  inboundTimes: string[];
}

async function loadFerryScheduleBoard(line: TransportLine): Promise<FerryScheduleBoard> {
  try {
    const directions = await getLineDirections(line.id);
    const outbound = directions.find((direction) => direction.type === 'outbound') ?? null;
    const inbound = directions.find((direction) => direction.type === 'inbound') ?? null;

    const [outboundSchedules, inboundSchedules] = await Promise.all([
      outbound ? getLineDirectionSchedules(line.id, outbound.id, 'weekday') : Promise.resolve(null),
      inbound ? getLineDirectionSchedules(line.id, inbound.id, 'weekday') : Promise.resolve(null),
    ]);

    return {
      lineId: line.id,
      outboundLabel: outbound?.origin ?? line.origin,
      inboundLabel: inbound?.origin ?? line.destination,
      outboundTimes: outboundSchedules?.items.map((item) => item.time) ?? [],
      inboundTimes: inboundSchedules?.items.map((item) => item.time) ?? [],
    };
  } catch {
    return {
      lineId: line.id,
      outboundLabel: line.origin,
      inboundLabel: line.destination,
      outboundTimes: line.schedules.weekday.map((item) => item.time),
      inboundTimes: [],
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function FerryBoatPage() {
  const dashboardData = await getDashboardData();
  const ferryLines = dashboardData.lines.filter((line) => line.mode === 'ferry');
  const ferryBoards = await Promise.all(ferryLines.map((line) => loadFerryScheduleBoard(line)));
  const boardByLineId = new Map(ferryBoards.map((board) => [board.lineId, board]));
  const hasHydroData = ferryLines.some((line) => line.stops.length > 0 || line.path.length > 0 || getScheduleCount(line) > 0);
  const updatedLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(dashboardData.lastUpdated));

  return (
    <PageTransition>
      <section className="rounded-[30px] bg-[#1F2937] p-7 text-white shadow-[0_26px_80px_rgba(31,41,55,0.16)] sm:p-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Hidroviário</p>
            <h1 className="mt-4 text-4xl font-semibold">Travessias e rotas por água</h1>
            <p className="mt-5 max-w-2xl leading-8 text-gray-300">
              Área pública inicial para consultar linhas hidroviárias de São Francisco do Sul. Os dados oficiais de
              horários, tarifas, rotas e mapa ainda estão em consolidação.
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${dashboardData.dataSource === 'live' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {dashboardData.dataSource === 'live' ? 'API ativa' : 'Modo seguro'}
          </span>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Link href="/linhas" className="inline-flex items-center justify-between rounded-2xl bg-white/8 px-4 py-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/12">
            Ver linhas
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/horarios" className="inline-flex items-center justify-between rounded-2xl bg-white/8 px-4 py-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/12">
            Ver horários
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/mapa" className="inline-flex items-center justify-between rounded-2xl bg-white/8 px-4 py-4 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/12">
            Abrir mapa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {dashboardData.dataSource === 'fallback' ? (
        <section className="mt-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Não foi possível consultar a API agora. Mostrando dados locais para manter a seção disponível.</p>
        </section>
      ) : null}

      <section className="mt-7 rounded-[30px] border border-blue-100 bg-blue-50/70 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm">
            <ShipWheel className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-gray-950">Dados hidroviários em expansão</h2>
            <p className="mt-3 max-w-3xl leading-7 text-gray-600">
              Esta página já está preparada para receber travessias, sentidos, paradas, tarifas, horários e paths
              hidroviários vindos da API. Enquanto a base é validada, as informações abaixo mostram apenas o que existe
              no backend neste momento, sem preencher lacunas com dados fictícios.
            </p>
            <p className="mt-3 text-sm font-semibold text-blue-700">Atualizado as {updatedLabel}</p>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Rotas hidroviárias</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-950">Disponíveis na API</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {ferryLines.length} linha(s)
            </span>
          </div>

          <div className="mt-7 space-y-4">
            {ferryLines.length ? (
              ferryLines.map((line) => {
                const board = boardByLineId.get(line.id);
                const hasScheduleBoard = Boolean(board?.outboundTimes.length || board?.inboundTimes.length);
                const rowCount = Math.max(board?.outboundTimes.length ?? 0, board?.inboundTimes.length ?? 0);
                const rows = Array.from({ length: rowCount }, (_, index) => ({
                  outbound: board?.outboundTimes[index] ?? '-',
                  inbound: board?.inboundTimes[index] ?? '-',
                }));

                return (
                  <article key={line.id} className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="rounded-xl bg-gray-950 px-3 py-2 text-sm font-semibold text-white">{line.code}</span>
                        <h3 className="mt-5 text-xl font-semibold text-gray-950">{line.name}</h3>
                        <p className="mt-2 text-sm font-medium text-gray-500">{line.routeLabel}</p>
                      </div>
                      <StatusPill status={line.status} />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Paradas</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-950">{line.stops.length}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Path</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-950">{line.path.length}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Horários</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-950">{getScheduleCount(line)}</p>
                      </div>
                    </div>

                    {hasScheduleBoard ? (
                      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                        <div className="grid grid-cols-2 bg-slate-100 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                          <p className="px-4 py-3 text-center">Saída {board?.outboundLabel ?? 'Origem'}</p>
                          <p className="border-l border-gray-200 px-4 py-3 text-center">Saída {board?.inboundLabel ?? 'Destino'}</p>
                        </div>
                        {rows.map((row, index) => (
                          <div key={`${line.id}-row-${index}`} className="grid grid-cols-2 border-t border-gray-100 bg-white text-sm font-semibold text-gray-800">
                            <p className="px-4 py-3 text-center">{row.outbound}</p>
                            <p className="border-l border-gray-100 px-4 py-3 text-center">{row.inbound}</p>
                          </div>
                        ))}
                        <p className="border-t border-gray-100 bg-slate-50 px-4 py-2 text-center text-xs font-medium text-slate-500">
                          Horários de segunda a domingo
                        </p>
                      </div>
                    ) : (
                      <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
                        Horários hidroviários ainda não cadastrados para esta rota.
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={`/linhas?linha=${line.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(37,99,235,0.22)]">
                        Ver detalhes
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link href="/mapa" className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800">
                        Ver mapa
                        <MapPinned className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-gray-300 bg-slate-50 p-6">
                <ShipWheel className="h-8 w-8 text-blue-600" />
                <h3 className="mt-5 text-xl font-semibold text-gray-950">Nenhuma rota hidroviária publicada ainda</h3>
                <p className="mt-3 leading-7 text-gray-600">
                  A aba já existe para receber ferry boat, travessias, paradas, tarifas e mapa quando esses dados forem
                  consolidados no backend.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.04)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Próximas etapas</p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-950">O que esta página vai receber</h2>

          <div className="mt-6 space-y-3">
            {[
              { title: 'Horários por sentido', description: 'Saídas por tipo de dia e sentido da travessia.', icon: Clock3 },
              { title: 'Tarifas', description: 'Valores por categoria quando houver fonte confiável.', icon: Ticket },
              { title: 'Rotas e paradas', description: 'Trapiches, pontos de embarque e trajetos no mapa.', icon: Route },
              { title: 'Mapa hidroviário', description: 'Visualização dedicada para paths sobre a Baía da Babitonga.', icon: MapPinned },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {!hasHydroData ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Os dados atuais ainda não são suficientes para operar consulta hidroviária completa. Esta página evita
              simular informações até que a base seja validada.
            </div>
          ) : null}
        </aside>
      </section>
    </PageTransition>
  );
}
