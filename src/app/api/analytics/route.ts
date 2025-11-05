import { NextResponse } from 'next/server';
import { OptimizerAgent } from '@/agents/optimizerAgent';

export async function GET() {
  try {
    const optimizer = new OptimizerAgent();
    const analytics = await optimizer.analyzePerformance();

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
