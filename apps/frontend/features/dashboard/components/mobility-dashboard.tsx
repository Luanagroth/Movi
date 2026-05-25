'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';
import { Heart, LocateFixed, LogIn, LogOut, Map, SearchCheck, ShieldCheck, ShipWheel } from 'lucide-react';
import type { TransportMode } from '@cityline/shared';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { SectionCard } from '@/components/ui/section-card';
import { useDashboardLocation } from '@/features/dashboard/hooks/use-dashboard-location';
import { useDashboardPreferences } from '@/features/dashboard/hooks/use-dashboard-preferences';
import { useLineDirectionState } from '@/features/dashboard/hooks/use-line-direction-state';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useFavorites } from '@/hooks/use-favorites';
import { useUserLocation } from '@/hooks/use-user-location';
import { formatDistance } from '@/lib/transport';
import { LOCALE_OPTIONS, getLocalizedLineContent, getTransportModeLabel } from '@/lib/ui-copy';
import type { DashboardData } from '@/types/dashboard';
import type { TransitMapProps } from '@/features/map/components/transit-map';
import { LineCard } from '@/features/lines/components/line-card';
import { LineDetailsPanel } from '@/features/lines/components/line-details-panel';

interface MobilityDashboardProps { initialData: DashboardData; }

const TransitMap = dynamic<TransitMapProps>(() => import('@/features/map/components/transit-map').then((module) => module.TransitMap), {
  ssr: false,
  loading: () => <div className="flex h-[340px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">Carregando mapa interativo...</div>,
});

const SERVER_SAFE_LAST_UPDATED_FORMATTER = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

export function MobilityDashboard({ initialData }: MobilityDashboardProps) {
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const { favoriteIds, hydrated, isFavorite, pendingLineIds, toggleFavorite } = useFavorites(initialData.favorites);
  const { session, isAuthenticated, isLoading: isAuthLoading, logout } = useAuthSession();
  const { location, error: locationError, isLoading: isLocating, requestLocation, supported } = useUserLocation();
  const {
    hasMounted,
    locale,
    query,
    activeTab,
    dayType,
    modeFilter,
    selectedLineId,
    setLocale,
    setQuery,
    setActiveTab,
    setDayType,
    setModeFilter,
    setSelectedLineId,
    copy,
    tabLabels,
    modeLabels,
    dayLabels,
    visibleLines,
    selectedLine,
  } = useDashboardPreferences({ initialData, favoriteIds });
  const {
    selectedDirectionId,
    setSelectedDirectionId,
    directionsLoading,
    directionsError,
    effectiveDirectionOptions,
    effectiveActiveDirection,
  } = useLineDirectionState({ selectedLine, dayType, hasMounted });
  const {
    nearbyStops,
    hasReliableNearbyStops,
    locationFeedback,
    savingLocation,
    handleSaveLocation,
    handleLocationAction,
  } = useDashboardLocation({
    lines: initialData.lines,
    isAuthenticated,
    location,
    requestLocation,
  });
  const locationActionDisabled = hasMounted ? !supported || isLocating : true;
  const lastUpdatedLabel = useMemo(() => SERVER_SAFE_LAST_UPDATED_FORMATTER.format(new Date(initialData.lastUpdated)), [initialData.lastUpdated]);

  useEffect(() => {
    if (!selectedLineId && visibleLines[0]) setSelectedLineId(visibleLines[0].id);
  }, [selectedLineId, setSelectedLineId, visibleLines]);

  useEffect(() => {
    if (!selectedLineId) return;
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedLineId]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700 p-5 text-white shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-sky-100">{copy.sections.heroTag}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">MOVI</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">{copy.sections.heroDescription}</p>
          </div>

          <div className="w-full max-w-2xl space-y-3">
            <div className="flex flex-wrap justify-end gap-2">
              {isAuthenticated && session ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-50 ring-1 ring-white/20">
                    <ShieldCheck className="h-4 w-4" />
                    {session.user.name ?? session.user.email}
                  </span>
                  <button type="button" onClick={() => logout()} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15">
                    <LogOut className="h-4 w-4" />
                    {copy.labels.signOut}
                  </button>
                </>
              ) : (
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-100">
                  <LogIn className="h-4 w-4" />
                  {isAuthLoading ? copy.labels.checking : copy.labels.signIn}
                </Link>
              )}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
              <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-100">{copy.labels.languageLabel}</p>
                    <p className="mt-1 text-xs text-slate-200">
                      {locale === 'en'
                        ? 'Choose the dashboard language'
                        : locale === 'es'
                          ? 'Elige el idioma del panel'
                          : 'Escolha o idioma do painel'}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-100">
                    {LOCALE_OPTIONS.find((option) => option.id === locale)?.shortLabel}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {LOCALE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLocale(option.id)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        locale === option.id
                          ? 'border-white bg-white text-slate-900 shadow-sm'
                          : 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                      }`}
                      aria-label={`Mudar idioma para ${option.label}`}
                    >
                      <span className={`block text-[10px] font-bold uppercase tracking-[0.22em] ${locale === option.id ? 'text-brand-700' : 'text-sky-100'}`}>
                        {option.shortLabel}
                      </span>
                      <span className={`mt-1 block text-sm font-semibold ${locale === option.id ? 'text-slate-900' : 'text-white'}`}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs text-slate-200">{copy.labels.linesMetric}</p>
                  <p className="mt-1 text-xl font-semibold">{initialData.lines.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs text-slate-200">{copy.labels.favoritesMetric}</p>
                  <p className="mt-1 text-xl font-semibold">{favoriteIds.length}</p>
                </div>
                <div className="col-span-2 rounded-2xl bg-sky-500/20 p-3 ring-1 ring-white/10">
                  <p className="text-xs text-sky-100">{copy.labels.updated}</p>
                  <p className="mt-1 text-lg font-semibold">{lastUpdatedLabel}</p>
                  <p className="mt-1 text-xs text-sky-100/80">
                    {locale === 'en'
                      ? 'Reference time for the current transport data'
                      : locale === 'es'
                        ? 'Hora de referencia para los datos actuales'
                        : 'Horario de referencia para os dados atuais'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
        <SectionCard title={copy.sections.linesTitle} description={copy.sections.linesDescription} aside={<span className="text-xs text-slate-500">{hydrated ? copy.labels.synchronized : copy.labels.loading}</span>}>
          <div className="space-y-3">
            <SearchInput value={query} onChange={setQuery} placeholder={copy.labels.searchPlaceholder} />

            <div className="flex flex-wrap gap-2">
              {tabLabels.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeTab === tab.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {modeLabels.map((option) => (
                <button key={option.id} type="button" onClick={() => setModeFilter(option.id as 'all' | TransportMode)} className={`rounded-xl border px-3 py-1.5 text-xs font-medium ${modeFilter === option.id ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {dayLabels.map((option) => (
                <button key={option.id} type="button" onClick={() => setDayType(option.id)} className={`rounded-xl border px-3 py-1.5 text-xs font-medium ${dayType === option.id ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  {option.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visibleLines.length ? visibleLines.map((line) => (
                <LineCard key={line.id} line={line} locale={locale} isFavorite={isFavorite(line.id)} isPending={pendingLineIds.includes(line.id)} onSelect={() => setSelectedLineId(line.id)} onToggleFavorite={() => void toggleFavorite(line.id)} />
              )) : (
                <EmptyState title={activeTab === 'favorites' ? copy.labels.noFavoriteLines : copy.labels.noLinesFound} description={activeTab === 'favorites' ? copy.labels.noFavoriteLinesDescription : copy.labels.noLinesFoundDescription} icon={activeTab === 'favorites' ? <Heart className="h-5 w-5" /> : <SearchCheck className="h-5 w-5" />} />
              )}
            </div>
          </div>
        </SectionCard>

        <div ref={detailsRef} className="space-y-4">
          <LineDetailsPanel
            line={selectedLine}
            locale={locale}
            dayType={dayType}
            isFavorite={selectedLine ? isFavorite(selectedLine.id) : false}
            directions={effectiveDirectionOptions}
            activeDirection={effectiveActiveDirection}
            directionsLoading={directionsLoading}
            directionsError={directionsError}
            selectedDirectionId={selectedDirectionId}
            onDirectionChange={(directionId) => setSelectedDirectionId(directionId)}
            onToggleFavorite={() => {
              if (selectedLine) void toggleFavorite(selectedLine.id);
            }}
          />

          <SectionCard title={copy.sections.locationTitle} description={copy.sections.locationDescription} aside={<LocateFixed className="h-4 w-4 text-brand-700" />}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void handleLocationAction()} disabled={locationActionDisabled} className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                  {isAuthenticated ? isLocating ? copy.labels.locating : location ? copy.labels.updateMyLocation : copy.labels.useMyLocation : copy.labels.signInToUseLocation}
                </button>

                {location && isAuthenticated ? (
                  <button type="button" onClick={() => void handleSaveLocation()} disabled={savingLocation} className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400">
                    {savingLocation ? copy.labels.saving : copy.labels.saveMyLocation}
                  </button>
                ) : null}
              </div>

              {locationFeedback ? <p className={`text-sm ${locationFeedback.startsWith('Localizacao salva') ? 'text-emerald-600' : 'text-rose-600'}`}>{locationFeedback}</p> : null}
              {location && nearbyStops[0] && nearbyStops[0].distanceMeters > 3000 ? <p className="text-xs text-amber-700">{copy.labels.locationDataReviewDescription}</p> : null}
              {!isAuthenticated ? <p className="text-xs text-slate-500">{copy.labels.loginBenefit}</p> : null}
              {locationError ? <p className="text-sm text-rose-600">{locationError}</p> : null}
              {hasMounted && !supported ? <p className="text-sm text-slate-500">{copy.labels.browserNoGeolocation}</p> : null}

              {isAuthenticated && hasReliableNearbyStops ? (
                <div className="space-y-3">
                  {nearbyStops.map((stop) => (
                    <div key={stop.stopId} className="surface-muted p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{stop.stopName}</p>
                          <p className="text-xs text-slate-500">{copy.labels.locationApproximateDistance}: {formatDistance(stop.distanceMeters)}</p>
                        </div>
                        <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold text-brand-700">{stop.lines.length} {copy.labels.nearbyLinesCount}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {stop.lines.map((line) => (
                          <button key={line.id} type="button" onClick={() => setSelectedLineId(line.id)} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:ring-brand-300">
                            {line.code} · {getTransportModeLabel(locale, line.mode ?? 'urban')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title={isAuthenticated ? copy.labels.locationDataReview : copy.labels.signInToUseLocation} description={isAuthenticated ? copy.labels.locationDataReviewDescription : copy.labels.loginBenefit} icon={<LocateFixed className="h-5 w-5" />} />
              )}
            </div>
          </SectionCard>

          <SectionCard title={copy.sections.mapTitle} description={copy.sections.mapDescription} aside={<Map className="h-4 w-4 text-brand-700" />}>
            <TransitMap lines={initialData.mapLines} locale={locale} activeLineId={selectedLine?.id} activeDirectionId={selectedDirectionId} activeDirection={effectiveActiveDirection} userLocation={location ?? undefined} onSelectLine={(lineId) => setSelectedLineId(lineId)} />
          </SectionCard>

          <SectionCard title={copy.labels.ferryTitle} description={copy.labels.ferryDescription} aside={<ShipWheel className="h-4 w-4 text-brand-700" />}>
            <div className="space-y-3">
              {initialData.lines.filter((line) => (line.mode ?? 'urban') === 'ferry').map((line) => (
                <div key={line.id} className="surface-muted p-3">
                  {(() => {
                    const localizedLine = getLocalizedLineContent(locale, line);

                    return (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{localizedLine.name}</p>
                      <p className="text-xs text-slate-500">{localizedLine.routeLabel}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedLineId(line.id)} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-slate-200">
                      {copy.labels.viewLine}
                    </button>
                  </div>
                    );
                  })()}
                  {line.fareLabel ? <p className="mt-2 text-xs text-slate-600">{line.fareLabel}</p> : null}
                </div>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>
    </main>
  );
}
