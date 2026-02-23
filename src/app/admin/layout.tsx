import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isAuthEnforced } from '@/lib/auth-mode';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin Panel - Move vs Improve',
  description: 'Admin dashboard for managing assessment questionnaire',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if auth should be enforced
  const authEnforced = isAuthEnforced();
  
  let session = await getServerSession(authOptions);

  // In non-production, create a mock session to bypass auth
  if (!authEnforced && !session) {
    session = {
      user: {
        id: 'dev-user',
        email: 'dev@localhost',
        name: 'Developer',
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    } as any;
  }

  if (!session) {
    redirect('/admin/login');
  }

  const isAdmin = (session.user as any)?.role === 'ADMIN';
  const isEditor = (session.user as any)?.role === 'EDITOR' || isAdmin;

  if (!isEditor) {
    redirect('/quiz');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Move vs Improve</h2>
          <p className="role-badge">{(session.user as any)?.role}</p>
        </div>

        <nav className="admin-nav">
          <a href="/admin" className="nav-item">Dashboard</a>
          {isEditor && (
            <>
              <a href="/admin/questions" className="nav-item">Questions</a>
              <a href="/admin/categories" className="nav-item">Categories</a>
              <a href="/admin/scoring" className="nav-item">Scoring</a>
            </>
          )}
          {isAdmin && (
            <>
              <a href="/admin/versions" className="nav-item">Versions</a>
              <a href="/admin/settings" className="nav-item">Settings</a>
            </>
          )}
        </nav>

        <div className="admin-footer">
          <p className="user-info">Logged in as: {session.user?.email}</p>
          <a href="/api/auth/signout" className="logout-link">Sign Out</a>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
