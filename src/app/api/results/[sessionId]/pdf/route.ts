import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePDF } from '@/lib/pdf-generator';

/**
 * GET /api/results/[sessionId]/pdf
 * Generate and download PDF report
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get session with results
    const session = await prisma.responseSession.findUnique({
      where: { id: params.sessionId },
      include: {
        scoreResult: true,
        answers: true,
        version: {
          include: {
            categories: true,
            questions: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.scoreResult) {
      return NextResponse.json(
        { error: 'Results not found - session may not be completed' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(session);

    // Return PDF response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="move-improve-results-${params.sessionId}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
