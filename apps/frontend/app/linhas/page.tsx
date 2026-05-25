import { LinesSchedulesUnifiedPage } from '@/features/transport/components/lines-schedules-unified-page';
import { getDashboardData } from '@/services/transport/transport.service';

export const dynamic = 'force-dynamic';

interface LinesPageProps {
  searchParams?: Promise<{ linha?: string; painel?: string }>;
}

export default async function LinesPage({ searchParams }: LinesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const dashboardData = await getDashboardData();

  return (
    <LinesSchedulesUnifiedPage
      lines={dashboardData.lines}
      initialLineId={resolvedSearchParams.linha}
      initialPanel={resolvedSearchParams.painel === 'ferry' ? 'ferry' : 'terrestrial'}
      dataSource={dashboardData.dataSource}
    />
  );
}
