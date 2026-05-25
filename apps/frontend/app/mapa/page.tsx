import { PublicMapBrowser } from '@/features/transport/components/public-map-browser';
import { getDashboardData } from '@/services/transport/transport.service';

export const dynamic = 'force-dynamic';

interface MapPageProps {
  searchParams?: Promise<{ linha?: string }>;
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const dashboardData = await getDashboardData();

  return (
    <PublicMapBrowser
      lines={dashboardData.lines}
      mapLines={dashboardData.mapLines}
      initialLineId={resolvedSearchParams.linha}
      dataSource={dashboardData.dataSource}
      lastUpdated={dashboardData.lastUpdated}
    />
  );
}
