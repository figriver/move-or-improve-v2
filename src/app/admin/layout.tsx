import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Move vs Improve',
  description: 'Admin dashboard for managing assessment questionnaire',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
