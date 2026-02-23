import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminDashboardClient from './dashboard-client';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

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
        <AdminDashboardClient />
      </main>
    </div>
  );
}
