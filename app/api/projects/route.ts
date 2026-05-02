import { NextResponse } from 'next/server';
import { getSortedProjectsData } from '../../lib/projects';

export async function GET() {
  try {
    const projects = await getSortedProjectsData();
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
