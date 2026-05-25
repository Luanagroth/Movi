'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ServiceDay } from '@cityline/shared';
import {
  getLineDirectionPath,
  getLineDirectionSchedules,
  getLineDirections,
  getLineDirectionStops,
} from '@/services/transport/transport.service';
import type { DashboardData } from '@/types/dashboard';
import type { LineDirectionDetail, LineDirectionSummary } from '@/types/transport-detail';
import {
  buildDirectionDetailFromResponses,
  fallbackDirectionDetailsFromLine,
  fallbackDirectionSummariesFromLine,
} from '../lib/direction-view';

interface UseLineDirectionStateInput {
  selectedLine: DashboardData['lines'][number] | null;
  dayType: ServiceDay;
  hasMounted: boolean;
  initialDirectionId?: string;
  enableLiveDirectionRequests?: boolean;
}

const isConnectionFailure = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('fetch failed') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('load failed')
  );
};

export function useLineDirectionState({
  selectedLine,
  dayType,
  hasMounted,
  initialDirectionId,
  enableLiveDirectionRequests = true,
}: UseLineDirectionStateInput) {
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | undefined>(undefined);
  const [directionOptions, setDirectionOptions] = useState<LineDirectionSummary[]>([]);
  const [directionOptionsLineId, setDirectionOptionsLineId] = useState<string | undefined>(undefined);
  const [activeDirectionDetail, setActiveDirectionDetail] = useState<LineDirectionDetail | null>(null);
  const [activeDirectionContext, setActiveDirectionContext] = useState<{ lineId: string; directionId: string } | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [liveRequestsBlocked, setLiveRequestsBlocked] = useState(false);

  const selectedLineId = selectedLine?.id;
  const fallbackDirectionOptions = useMemo(
    () => (selectedLine ? fallbackDirectionSummariesFromLine(selectedLine) : []),
    [selectedLine]
  );
  const fallbackDirectionDetails = useMemo(
    () => (selectedLine ? fallbackDirectionDetailsFromLine(selectedLine, dayType, hasMounted ? new Date() : null) : []),
    [selectedLine, dayType, hasMounted]
  );

  const effectiveDirectionOptions =
    selectedLineId && directionOptionsLineId === selectedLineId && directionOptions.length
      ? directionOptions
      : fallbackDirectionOptions;
  const hasLiveDirectionsForSelectedLine = Boolean(
    selectedLineId && directionOptionsLineId === selectedLineId && directionOptions.length
  );
  const shouldUseLiveRequests = enableLiveDirectionRequests && !liveRequestsBlocked;
  const isCurrentDirectionLive = Boolean(
    selectedDirectionId && hasLiveDirectionsForSelectedLine && directionOptions.some((direction) => direction.id === selectedDirectionId)
  );
  const isCurrentDirectionValid = Boolean(
    selectedDirectionId && effectiveDirectionOptions.some((direction) => direction.id === selectedDirectionId)
  );
  const effectiveActiveDirection =
    selectedLineId &&
    selectedDirectionId &&
    activeDirectionContext?.lineId === selectedLineId &&
    activeDirectionContext.directionId === selectedDirectionId
      ? activeDirectionDetail
      : null;
  const fallbackActiveDirection =
    fallbackDirectionDetails.find((direction) => direction.id === selectedDirectionId) ?? fallbackDirectionDetails[0] ?? null;
  const resolvedActiveDirection = effectiveActiveDirection ?? fallbackActiveDirection;

  useEffect(() => {
    setLiveRequestsBlocked(false);
  }, [selectedLineId, enableLiveDirectionRequests]);

  useEffect(() => {
    setDirectionOptions([]);
    setDirectionOptionsLineId(undefined);
    setActiveDirectionDetail(null);
    setActiveDirectionContext(null);
    setDirectionsError(null);

    if (!selectedLineId || !selectedLine) {
      setSelectedDirectionId(undefined);
      return;
    }

    const fallbackForLine = fallbackDirectionSummariesFromLine(selectedLine);
    const hasLineDataForDirectionRequests =
      selectedLine.stops.length > 0 ||
      selectedLine.path.length > 0 ||
      selectedLine.schedules.weekday.length > 0 ||
      selectedLine.schedules.saturday.length > 0 ||
      selectedLine.schedules.sunday.length > 0;
    const currentLineId = selectedLineId;

    if (!shouldUseLiveRequests || !hasLineDataForDirectionRequests) {
      setSelectedDirectionId((current) => {
        if (current && fallbackForLine.some((item) => item.id === current)) return current;
        if (initialDirectionId && fallbackForLine.some((item) => item.id === initialDirectionId)) return initialDirectionId;
        return fallbackForLine[0]?.id;
      });
      return;
    }

    let cancelled = false;

    setDirectionsLoading(true);
    setSelectedDirectionId(undefined);

    void getLineDirections(currentLineId)
      .then((items) => {
        if (cancelled) return;

        setDirectionOptions(items);
        setDirectionOptionsLineId(currentLineId);
        setSelectedDirectionId((current) => {
          if (current && items.some((item) => item.id === current)) return current;
          if (initialDirectionId && items.some((item) => item.id === initialDirectionId)) return initialDirectionId;
          return items[0]?.id ?? fallbackForLine[0]?.id;
        });
      })
      .catch((error) => {
        if (cancelled) return;

        if (isConnectionFailure(error)) {
          setLiveRequestsBlocked(true);
        }

        setDirectionOptions([]);
        setDirectionOptionsLineId(undefined);
        setDirectionsError(error instanceof Error ? error.message : 'Nao foi possivel carregar os sentidos desta linha.');
        setSelectedDirectionId((current) => {
          if (current && fallbackForLine.some((item) => item.id === current)) return current;
          if (initialDirectionId && fallbackForLine.some((item) => item.id === initialDirectionId)) return initialDirectionId;
          return fallbackForLine[0]?.id;
        });
      })
      .finally(() => {
        if (!cancelled) setDirectionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enableLiveDirectionRequests, initialDirectionId, selectedLine, selectedLineId, shouldUseLiveRequests]);

  useEffect(() => {
    if (!selectedLineId) return;
    if (isCurrentDirectionValid) return;

    const nextDirectionId =
      (initialDirectionId && effectiveDirectionOptions.some((direction) => direction.id === initialDirectionId)
        ? initialDirectionId
        : undefined) ?? effectiveDirectionOptions[0]?.id;

    setSelectedDirectionId((current) => (current === nextDirectionId ? current : nextDirectionId));
  }, [effectiveDirectionOptions, initialDirectionId, isCurrentDirectionValid, selectedLineId]);

  useEffect(() => {
    if (!selectedLine || !selectedDirectionId || !isCurrentDirectionValid || !isCurrentDirectionLive || !shouldUseLiveRequests) {
      setActiveDirectionDetail(null);
      setActiveDirectionContext(null);
      return;
    }

    const selectedDirectionSummary = directionOptions.find((direction) => direction.id === selectedDirectionId);
    if (!selectedDirectionSummary) {
      setActiveDirectionDetail(null);
      setActiveDirectionContext(null);
      return;
    }

    const lineHasAnySchedules =
      selectedLine.schedules.weekday.length > 0 ||
      selectedLine.schedules.saturday.length > 0 ||
      selectedLine.schedules.sunday.length > 0;
    const shouldFetchStops = selectedDirectionSummary.stopCount > 0;
    const shouldFetchPath = selectedDirectionSummary.pathPoints > 0;
    const shouldFetchSchedules = lineHasAnySchedules;

    if (!shouldFetchStops && !shouldFetchPath && !shouldFetchSchedules) {
      setActiveDirectionDetail(null);
      setActiveDirectionContext(null);
      return;
    }

    let cancelled = false;
    const currentLineId = selectedLine.id;
    const currentDirectionId = selectedDirectionId;

    type TaskResult =
      | { kind: 'stops'; value: Awaited<ReturnType<typeof getLineDirectionStops>> }
      | { kind: 'schedules'; value: Awaited<ReturnType<typeof getLineDirectionSchedules>> }
      | { kind: 'path'; value: Awaited<ReturnType<typeof getLineDirectionPath>> };

    const tasks: Promise<TaskResult>[] = [];
    if (shouldFetchStops) {
      tasks.push(
        getLineDirectionStops(currentLineId, currentDirectionId).then((value) => ({
          kind: 'stops' as const,
          value,
        }))
      );
    }
    if (shouldFetchSchedules) {
      tasks.push(
        getLineDirectionSchedules(currentLineId, currentDirectionId, dayType).then((value) => ({
          kind: 'schedules' as const,
          value,
        }))
      );
    }
    if (shouldFetchPath) {
      tasks.push(
        getLineDirectionPath(currentLineId, currentDirectionId).then((value) => ({
          kind: 'path' as const,
          value,
        }))
      );
    }

    setDirectionsLoading(true);
    void Promise.allSettled(tasks)
      .then((results) => {
        if (cancelled) return;

        const stopsResult = results.find(
          (item): item is PromiseFulfilledResult<Extract<TaskResult, { kind: 'stops' }>> =>
            item.status === 'fulfilled' && item.value.kind === 'stops'
        );
        const schedulesResult = results.find(
          (item): item is PromiseFulfilledResult<Extract<TaskResult, { kind: 'schedules' }>> =>
            item.status === 'fulfilled' && item.value.kind === 'schedules'
        );
        const pathResult = results.find(
          (item): item is PromiseFulfilledResult<Extract<TaskResult, { kind: 'path' }>> =>
            item.status === 'fulfilled' && item.value.kind === 'path'
        );

        if (stopsResult && schedulesResult && pathResult) {
          setActiveDirectionDetail(
            buildDirectionDetailFromResponses(
              selectedLine,
              dayType,
              stopsResult.value.value,
              schedulesResult.value.value,
              pathResult.value.value
            )
          );
          setActiveDirectionContext({
            lineId: currentLineId,
            directionId: currentDirectionId,
          });
          setDirectionsError(null);
          return;
        }

        setActiveDirectionDetail(
          fallbackDirectionDetails.find((direction) => direction.id === currentDirectionId) ?? null
        );
        setActiveDirectionContext({
          lineId: currentLineId,
          directionId: currentDirectionId,
        });
        if (process.env.NODE_ENV !== 'production' && results.some((item) => item.status === 'rejected')) {
          console.debug('[useLineDirectionState] detalhe parcial/fallback para direcao', {
            lineId: currentLineId,
            directionId: currentDirectionId,
          });
        }
        setDirectionsError(null);
      })
      .catch((error) => {
        if (cancelled) return;

        setActiveDirectionDetail(null);
        setActiveDirectionContext(null);
        setDirectionsError(error instanceof Error ? error.message : 'Nao foi possivel atualizar o detalhe do sentido.');
      })
      .finally(() => {
        if (!cancelled) setDirectionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dayType, directionOptions, fallbackDirectionDetails, isCurrentDirectionLive, isCurrentDirectionValid, selectedDirectionId, selectedLine, shouldUseLiveRequests]);

  return {
    selectedDirectionId,
    setSelectedDirectionId,
    directionsLoading,
    directionsError,
    effectiveDirectionOptions,
    effectiveActiveDirection: resolvedActiveDirection,
  };
}
