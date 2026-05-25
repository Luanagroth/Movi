import { FavoritesAccount } from '@/features/favorites/components/favorites-account';
import { getDashboardData } from '@/services/transport/transport.service';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const dashboardData = await getDashboardData();

  return <FavoritesAccount lines={dashboardData.lines} />;
}
