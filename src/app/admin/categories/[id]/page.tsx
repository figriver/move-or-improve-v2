import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CategoryEditClient from './category-edit-client';

export default async function CategoryEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/admin/login');
  }

  const category = await prisma.category.findUnique({
    where: { id: params.id },
  });

  if (!category) {
    return <div className="error">Category not found</div>;
  }

  return <CategoryEditClient category={category as any} />;
}
