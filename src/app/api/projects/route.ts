import { NextResponse } from 'next/server';
import { getAllVideoProjects } from '@/lib/database';

export async function GET() {
  try {
    const projects = getAllVideoProjects();
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
