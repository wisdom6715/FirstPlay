import { DiscoverClient } from '@/components/discover/DiscoverClient';
import { getDiscoverData } from '@/lib/discover';

// Re-read Firestore at most once a minute; listings and banners update without a redeploy.
export const revalidate = 60;

export default async function HomePage() {
  const data = await getDiscoverData();
  return <DiscoverClient listings={data.listings} banners={data.banners} demo={data.demo} />;
}
