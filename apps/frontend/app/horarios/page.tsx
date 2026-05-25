import { LinesSchedulesUnifiedPage } from '@/features/transport/components/lines-schedules-unified-page';
import { getDashboardData } from '@/services/transport/transport.service';

export const dynamic = 'force-dynamic';

interface SchedulesPageProps {
  searchParams?: Promise<{ linha?: string }>;
}

export default async function SchedulesPage({ searchParams }: SchedulesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const dashboardData = await getDashboardData();

  return (
    <LinesSchedulesUnifiedPage
      lines={dashboardData.lines}
      initialLineId={resolvedSearchParams.linha}
      dataSource={dashboardData.dataSource}
    />
  );
}
