export interface StoryScript {
  id: string;
  title: string;
  genre: string;
  hook: string;
  script: ScriptScene[];
  duration: number;
  createdAt: Date;
  metadata?: {
    trending?: boolean;
    emotionalTone?: string;
    targetAudience?: string;
  };
}

export interface ScriptScene {
  scene: string;
  dialogue: string;
  visualDescription?: string;
  duration?: number;
  emotion?: string;
}

export interface VideoProject {
  id: string;
  scriptId: string;
  status: 'pending' | 'generating' | 'editing' | 'rendering' | 'uploading' | 'published' | 'failed';
  videoPath?: string;
  thumbnailPath?: string;
  seoMetadata?: SEOMetadata;
  uploadedAt?: Date;
  youtubeId?: string;
  analytics?: VideoAnalytics;
}

export interface SEOMetadata {
  title: string;
  description: string;
  tags: string[];
  category: string;
  thumbnailUrl?: string;
}

export interface VideoAnalytics {
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  watchTime: number;
  ctr: number;
  retention: number;
  revenue?: number;
  updatedAt: Date;
}

export interface TrendingTopic {
  topic: string;
  genre: string;
  popularity: number;
  keywords: string[];
  source: string;
  timestamp: Date;
}

export interface AgentTask {
  id: string;
  agentType: AgentType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export type AgentType =
  | 'trend'
  | 'script'
  | 'visual'
  | 'voice'
  | 'editor'
  | 'seo'
  | 'uploader'
  | 'optimizer';

export interface GenerationConfig {
  genre?: string;
  style: 'anime' | 'realistic' | 'mixed';
  duration: number;
  voiceType: 'male' | 'female' | 'neutral';
  musicGenre?: string;
  targetEmotion?: string;
}

export interface AgentMemory {
  successfulPatterns: {
    hooks: string[];
    structures: string[];
    visualStyles: string[];
  };
  performanceMetrics: {
    avgCTR: number;
    avgRetention: number;
    topGenres: string[];
  };
  learningData: {
    timestamp: Date;
    insights: string[];
  };
}
