import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import VersionsPageClient from './versions-client';

export default async function VersionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const isAdmin = (session.user as any)?.role === 'ADMIN';

  if (!isAdmin) {
    redirect('/quiz');
  }

  return <VersionsPageClient />;
}
