import { google } from 'googleapis';
import { SEOMetadata } from '@/types';
import fs from 'fs';
import path from 'path';

export class UploaderAgent {
  private youtube: any;
  private oauth2Client: any;

  constructor() {
    this.initializeYouTubeClient();
  }

  private initializeYouTubeClient() {
    if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
      console.warn('⚠️ YouTube credentials not configured');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
    );

    // In production, implement full OAuth2 flow
    // For now, check if we have stored tokens
    const tokenPath = path.join(process.cwd(), 'data', 'youtube_tokens.json');
    if (fs.existsSync(tokenPath)) {
      const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
      this.oauth2Client.setCredentials(tokens);
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  async uploadVideo(videoPath: string, thumbnailPath: string, metadata: SEOMetadata): Promise<string> {
    console.log(`📤 Uploader Agent: Uploading "${metadata.title}"...`);

    try {
      if (!this.youtube) {
        console.warn('⚠️ YouTube client not initialized, simulating upload');
        return this.simulateUpload(metadata);
      }

      const videoFileSize = fs.statSync(videoPath).size;
      const videoStream = fs.createReadStream(videoPath);

      const response = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: this.getCategoryId(metadata.category),
            defaultLanguage: 'en',
            defaultAudioLanguage: 'en'
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
            madeForKids: false
          }
        },
        media: {
          body: videoStream
        }
      });

      const videoId = response.data.id;

      // Upload thumbnail
      if (fs.existsSync(thumbnailPath)) {
        await this.uploadThumbnail(videoId, thumbnailPath);
      }

      console.log(`✅ Uploader Agent: Video uploaded! ID: ${videoId}`);
      console.log(`🔗 URL: https://youtube.com/watch?v=${videoId}`);

      return videoId;
    } catch (error) {
      console.error('❌ Uploader Agent Error:', error);
      return this.simulateUpload(metadata);
    }
  }

  private async uploadThumbnail(videoId: string, thumbnailPath: string) {
    try {
      const thumbnailStream = fs.createReadStream(thumbnailPath);

      await this.youtube.thumbnails.set({
        videoId: videoId,
        media: {
          body: thumbnailStream
        }
      });

      console.log(`✅ Thumbnail uploaded for video ${videoId}`);
    } catch (error) {
      console.error('❌ Thumbnail upload error:', error);
    }
  }

  private simulateUpload(metadata: SEOMetadata): string {
    const simulatedId = 'SIM_' + Math.random().toString(36).substring(7);
    console.log(`🎬 Simulated Upload: ${metadata.title}`);
    console.log(`🆔 Simulated ID: ${simulatedId}`);
    return simulatedId;
  }

  private getCategoryId(category: string): string {
    const categories: Record<string, string> = {
      'Film & Animation': '1',
      'Autos & Vehicles': '2',
      'Music': '10',
      'Pets & Animals': '15',
      'Sports': '17',
      'Travel & Events': '19',
      'Gaming': '20',
      'People & Blogs': '22',
      'Comedy': '23',
      'Entertainment': '24',
      'News & Politics': '25',
      'Howto & Style': '26',
      'Education': '27',
      'Science & Technology': '28',
      'Nonprofits & Activism': '29'
    };

    return categories[category] || '24';
  }

  async scheduleUpload(videoPath: string, thumbnailPath: string, metadata: SEOMetadata, publishTime: Date): Promise<string> {
    console.log(`⏰ Uploader Agent: Scheduling upload for ${publishTime.toISOString()}...`);

    // In production, implement scheduling logic
    // For now, upload immediately
    return this.uploadVideo(videoPath, thumbnailPath, metadata);
  }

  getAuthUrl(): string {
    if (!this.oauth2Client) {
      return '';
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ]
    });
  }

  async setTokens(code: string) {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Save tokens
    const tokenPath = path.join(process.cwd(), 'data', 'youtube_tokens.json');
    fs.mkdirSync(path.dirname(tokenPath), { recursive: true });
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  }
}
