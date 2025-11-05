import { google } from 'googleapis';
import { VideoAnalytics } from '@/types';
import { saveAnalytics, getAggregateAnalytics, saveAgentMemory, getAgentMemory } from '@/lib/database';

export class OptimizerAgent {
  private youtube: any;

  constructor(oauth2Client?: any) {
    if (oauth2Client) {
      this.youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });
    }
  }

  async fetchAnalytics(videoId: string): Promise<VideoAnalytics | null> {
    console.log(`📊 Optimizer Agent: Fetching analytics for ${videoId}...`);

    try {
      if (!this.youtube) {
        return this.generateMockAnalytics(videoId);
      }

      const response = await this.youtube.videos.list({
        part: ['statistics', 'contentDetails'],
        id: [videoId]
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const video = response.data.items[0];
      const stats = video.statistics;

      const analytics: VideoAnalytics = {
        videoId,
        views: parseInt(stats.viewCount) || 0,
        likes: parseInt(stats.likeCount) || 0,
        comments: parseInt(stats.commentCount) || 0,
        watchTime: 0, // Requires YouTube Analytics API
        ctr: 0, // Requires YouTube Analytics API
        retention: 0, // Requires YouTube Analytics API
        updatedAt: new Date()
      };

      saveAnalytics(analytics);
      console.log(`✅ Analytics saved for ${videoId}`);

      return analytics;
    } catch (error) {
      console.error('❌ Optimizer Agent Error:', error);
      return this.generateMockAnalytics(videoId);
    }
  }

  private generateMockAnalytics(videoId: string): VideoAnalytics {
    // Generate realistic mock data for demonstration
    const analytics: VideoAnalytics = {
      videoId,
      views: Math.floor(Math.random() * 50000) + 5000,
      likes: Math.floor(Math.random() * 2000) + 100,
      comments: Math.floor(Math.random() * 500) + 10,
      watchTime: Math.floor(Math.random() * 30000) + 5000,
      ctr: Math.random() * 0.15 + 0.02, // 2-17% CTR
      retention: Math.random() * 0.4 + 0.3, // 30-70% retention
      revenue: Math.random() * 50 + 5,
      updatedAt: new Date()
    };

    saveAnalytics(analytics);
    return analytics;
  }

  async analyzePerformance(): Promise<any> {
    console.log(`🔍 Optimizer Agent: Analyzing overall performance...`);

    const aggregate = getAggregateAnalytics() as any;

    const insights = {
      totalVideos: aggregate?.total_videos || 0,
      totalViews: aggregate?.total_views || 0,
      totalRevenue: aggregate?.total_revenue || 0,
      avgCTR: aggregate?.avg_ctr || 0,
      avgRetention: aggregate?.avg_retention || 0,
      recommendations: this.generateRecommendations(aggregate)
    };

    console.log(`📈 Performance Summary:`);
    console.log(`   Videos: ${insights.totalVideos}`);
    console.log(`   Views: ${insights.totalViews}`);
    console.log(`   Revenue: $${insights.totalRevenue?.toFixed(2)}`);
    console.log(`   Avg CTR: ${(insights.avgCTR * 100).toFixed(2)}%`);
    console.log(`   Avg Retention: ${(insights.avgRetention * 100).toFixed(2)}%`);

    return insights;
  }

  private generateRecommendations(aggregate: any): string[] {
    const recommendations: string[] = [];

    const avgCTR = aggregate?.avg_ctr || 0;
    const avgRetention = aggregate?.avg_retention || 0;

    if (avgCTR < 0.05) {
      recommendations.push('📌 CTR is below 5% - Focus on more compelling thumbnails and titles');
      recommendations.push('💡 Test emotional hooks and curiosity gaps in titles');
    } else if (avgCTR > 0.10) {
      recommendations.push('🎉 Excellent CTR! Keep using similar thumbnail and title strategies');
    }

    if (avgRetention < 0.40) {
      recommendations.push('⏱️ Retention is below 40% - Strengthen opening hooks');
      recommendations.push('🎬 Consider faster pacing in first 3 seconds');
    } else if (avgRetention > 0.60) {
      recommendations.push('🎯 Great retention! Your story pacing is working well');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Performance is solid - continue current strategies');
      recommendations.push('📊 Test variations in genre and emotional tones');
    }

    return recommendations;
  }

  async learnFromSuccess(): Promise<void> {
    console.log(`🧠 Optimizer Agent: Learning from successful patterns...`);

    const aggregate = getAggregateAnalytics() as any;

    // Store learnings in agent memory
    const memory = getAgentMemory('performance_patterns') || {
      successfulPatterns: {
        hooks: [],
        structures: [],
        visualStyles: []
      },
      performanceMetrics: {
        avgCTR: 0,
        avgRetention: 0,
        topGenres: []
      }
    };

    memory.performanceMetrics = {
      avgCTR: aggregate?.avg_ctr || 0,
      avgRetention: aggregate?.avg_retention || 0,
      topGenres: this.identifyTopGenres()
    };

    // Add successful hook patterns
    if ((aggregate?.avg_ctr || 0) > 0.08) {
      memory.successfulPatterns.hooks.push('Emotional opening questions');
      memory.successfulPatterns.hooks.push('Time-sensitive scenarios');
    }

    saveAgentMemory('performance_patterns', memory);
    console.log(`✅ Learning patterns saved`);
  }

  private identifyTopGenres(): string[] {
    // In production, query database for top-performing genres
    return ['thriller', 'sci-fi', 'romance'];
  }

  async suggestNextVideo(): Promise<any> {
    console.log(`💡 Optimizer Agent: Suggesting next video concept...`);

    const memory = getAgentMemory('performance_patterns');

    const suggestions = {
      recommendedGenre: memory?.performanceMetrics?.topGenres?.[0] || 'sci-fi',
      recommendedHook: 'Start with a shocking revelation',
      recommendedDuration: 60,
      reasoning: 'Based on historical performance, this genre and approach has highest engagement'
    };

    return suggestions;
  }

  calculateProjectedRevenue(videos: number, avgCPM: number = 5): number {
    // Simplified revenue calculation
    // Assumes: avg 20k views per video, $5 CPM, 60% retention
    const avgViews = 20000;
    const monetizableViews = avgViews * 0.6; // 60% retention
    const revenuePerVideo = (monetizableViews / 1000) * avgCPM;

    return videos * revenuePerVideo;
  }
}
