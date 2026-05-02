import { NextResponse } from 'next/server';
import { getProjectData } from '../../../lib/projects';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  try {
    const project = await getProjectData(slug);
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
}
