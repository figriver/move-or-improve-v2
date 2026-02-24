import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import QuestionEditClient from './question-edit-client';

export default async function QuestionEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/admin/login');
  }

  const question = await prisma.question.findUnique({
    where: { id: params.id },
    include: { scoring: true },
  });

  if (!question) {
    return <div className="error">Question not found</div>;
  }

  return <QuestionEditClient question={question as any} />;
}
