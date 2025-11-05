import { NextRequest, NextResponse } from 'next/server';
import OrchestratorAgent from '@/agents/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style, genre, voiceType } = body;

    const orchestrator = new OrchestratorAgent();

    const project = await orchestrator.generateAndUploadVideo({
      style: style || 'anime',
      genre: genre,
      voiceType: voiceType || 'neutral',
      duration: 60
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Generation API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate video' },
      { status: 500 }
    );
  }
}
