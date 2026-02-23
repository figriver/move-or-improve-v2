import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ScoringPageClient from './scoring-client';

export default async function ScoringPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const isEditor = (session.user as any)?.role === 'EDITOR' || (session.user as any)?.role === 'ADMIN';

  if (!isEditor) {
    redirect('/quiz');
  }

  return <ScoringPageClient />;
}
