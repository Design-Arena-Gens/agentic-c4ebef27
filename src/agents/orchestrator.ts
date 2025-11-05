import { TrendAgent } from './trendAgent';
import { ScriptAgent } from './scriptAgent';
import { VisualAgent } from './visualAgent';
import { VoiceAgent } from './voiceAgent';
import { EditorAgent } from './editorAgent';
import { SEOAgent } from './seoAgent';
import { UploaderAgent } from './uploaderAgent';
import { OptimizerAgent } from './optimizerAgent';
import { GenerationConfig, VideoProject } from '@/types';
import { saveVideoProject, getVideoProject } from '@/lib/database';
import { randomUUID } from 'crypto';

export class OrchestratorAgent {
  private trendAgent: TrendAgent;
  private scriptAgent: ScriptAgent;
  private visualAgent: VisualAgent;
  private voiceAgent: VoiceAgent;
  private editorAgent: EditorAgent;
  private seoAgent: SEOAgent;
  private uploaderAgent: UploaderAgent;
  private optimizerAgent: OptimizerAgent;

  constructor() {
    this.trendAgent = new TrendAgent();
    this.scriptAgent = new ScriptAgent();
    this.visualAgent = new VisualAgent();
    this.voiceAgent = new VoiceAgent();
    this.editorAgent = new EditorAgent();
    this.seoAgent = new SEOAgent();
    this.uploaderAgent = new UploaderAgent();
    this.optimizerAgent = new OptimizerAgent();
  }

  async generateAndUploadVideo(config?: Partial<GenerationConfig>): Promise<VideoProject> {
    console.log('\n🚀 ============================================');
    console.log('🎬 Starting AI Micro-Drama Generation Pipeline');
    console.log('============================================\n');

    const projectId = randomUUID();

    try {
      // Step 1: Analyze trends
      console.log('📊 STEP 1/8: Analyzing trends...');
      await this.trendAgent.analyzeTrends();
      const trendingTopic = this.trendAgent.selectTrendingTopic();
      console.log(`✅ Selected trend: "${trendingTopic.topic}" (${trendingTopic.genre})\n`);

      // Step 2: Generate script
      console.log('📝 STEP 2/8: Generating script...');
      const script = await this.scriptAgent.generateScript(trendingTopic);
      console.log(`✅ Script created: "${script.title}"\n`);

      // Create project record
      const project: VideoProject = {
        id: projectId,
        scriptId: script.id,
        status: 'generating'
      };
      saveVideoProject(project);

      // Step 3: Generate visuals
      console.log('🎨 STEP 3/8: Generating visuals...');
      const generationConfig: GenerationConfig = {
        genre: config?.genre || script.genre,
        style: config?.style || 'anime',
        duration: 60,
        voiceType: config?.voiceType || 'neutral'
      };

      const imagePaths = await this.visualAgent.generateVisuals(script, generationConfig);
      const thumbnailPath = await this.visualAgent.generateThumbnail(script);
      console.log(`✅ Generated ${imagePaths.length} scene images and thumbnail\n`);

      // Step 4: Generate voice
      console.log('🎙️ STEP 4/8: Generating voiceover...');
      const audioPaths = await this.voiceAgent.generateVoiceover(script, generationConfig);
      const subtitlePath = await this.voiceAgent.generateSubtitles(script);
      console.log(`✅ Generated ${audioPaths.length} audio clips and subtitles\n`);

      // Step 5: Edit video
      console.log('🎬 STEP 5/8: Assembling video...');
      project.status = 'editing';
      saveVideoProject(project);

      let videoPath = await this.editorAgent.assembleVideo(
        script,
        imagePaths,
        audioPaths,
        subtitlePath
      );
      console.log(`✅ Video assembled\n`);

      // Step 6: Generate SEO
      console.log('🔍 STEP 6/8: Generating SEO metadata...');
      const seoMetadata = this.seoAgent.generateSEO(script, thumbnailPath);
      console.log(`✅ SEO metadata generated\n`);
      console.log(`   Title: ${seoMetadata.title}`);
      console.log(`   Tags: ${seoMetadata.tags.slice(0, 5).join(', ')}...\n`);

      // Update project
      project.videoPath = videoPath;
      project.thumbnailPath = thumbnailPath;
      project.seoMetadata = seoMetadata;
      project.status = 'rendering';
      saveVideoProject(project);

      // Step 7: Upload to YouTube
      console.log('📤 STEP 7/8: Uploading to YouTube...');
      project.status = 'uploading';
      saveVideoProject(project);

      const youtubeId = await this.uploaderAgent.uploadVideo(
        videoPath,
        thumbnailPath,
        seoMetadata
      );

      project.youtubeId = youtubeId;
      project.uploadedAt = new Date();
      project.status = 'published';
      saveVideoProject(project);
      console.log(`✅ Video uploaded! ID: ${youtubeId}\n`);

      // Step 8: Analyze and optimize
      console.log('📊 STEP 8/8: Running optimization analysis...');
      setTimeout(async () => {
        await this.optimizerAgent.fetchAnalytics(youtubeId);
        await this.optimizerAgent.learnFromSuccess();
      }, 1000);

      console.log('\n✅ ============================================');
      console.log('🎉 Video Generation Complete!');
      console.log('============================================');
      console.log(`📹 Project ID: ${project.id}`);
      console.log(`🆔 YouTube ID: ${youtubeId}`);
      console.log(`📊 Title: ${seoMetadata.title}`);
      console.log(`🎬 Genre: ${script.genre}`);
      console.log('============================================\n');

      return project;
    } catch (error) {
      console.error('\n❌ ============================================');
      console.error('❌ Pipeline Error:', error);
      console.error('============================================\n');

      const project = getVideoProject(projectId);
      if (project) {
        project.status = 'failed';
        saveVideoProject(project);
      }

      throw error;
    }
  }

  async runAnalytics() {
    console.log('\n📊 Running Analytics Report...\n');

    const performance = await this.optimizerAgent.analyzePerformance();

    console.log('\n💡 Recommendations:');
    performance.recommendations.forEach((rec: string) => {
      console.log(`   ${rec}`);
    });

    console.log('\n💰 Revenue Projection:');
    const projected30Day = this.optimizerAgent.calculateProjectedRevenue(30);
    console.log(`   30 videos: $${projected30Day.toFixed(2)}`);
    console.log(`   100 videos: $${this.optimizerAgent.calculateProjectedRevenue(100).toFixed(2)}`);

    return performance;
  }

  async generateBatch(count: number, config?: Partial<GenerationConfig>) {
    console.log(`\n🔄 Starting batch generation of ${count} videos...\n`);

    const results = [];

    for (let i = 0; i < count; i++) {
      console.log(`\n[${i + 1}/${count}] Generating video...`);
      try {
        const project = await this.generateAndUploadVideo(config);
        results.push(project);

        // Wait between generations to avoid rate limits
        if (i < count - 1) {
          console.log('\n⏳ Waiting 30 seconds before next generation...\n');
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error(`Failed to generate video ${i + 1}:`, error);
        results.push(null);
      }
    }

    console.log(`\n✅ Batch complete! ${results.filter(r => r).length}/${count} successful\n`);
    return results;
  }
}

// CLI Interface
if (require.main === module) {
  const orchestrator = new OrchestratorAgent();

  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    switch (command) {
      case 'generate':
        await orchestrator.generateAndUploadVideo();
        break;

      case 'batch':
        const count = parseInt(args[1]) || 5;
        await orchestrator.generateBatch(count);
        break;

      case 'analytics':
        await orchestrator.runAnalytics();
        break;

      default:
        console.log('🎬 AI YouTube Micro-Drama Network');
        console.log('\nUsage:');
        console.log('  npm run agent generate       - Generate and upload one video');
        console.log('  npm run agent batch [count]  - Generate multiple videos');
        console.log('  npm run agent analytics      - View analytics report');
        process.exit(0);
    }

    process.exit(0);
  })();
}

export default OrchestratorAgent;
