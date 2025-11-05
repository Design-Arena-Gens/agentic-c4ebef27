import { StoryScript } from '@/types';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class EditorAgent {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'generated', 'videos');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async assembleVideo(
    script: StoryScript,
    imagePaths: string[],
    audioPaths: string[],
    subtitlePath: string
  ): Promise<string> {
    console.log(`🎬 Editor Agent: Assembling video for "${script.title}"...`);

    try {
      // Create video using FFmpeg
      const videoPath = path.join(this.outputDir, `video_${Date.now()}.mp4`);

      // For web deployment, we'll create a simple HTML5 video demonstration
      // In production with ffmpeg installed, use the full pipeline

      if (await this.isFFmpegAvailable()) {
        return await this.assembleWithFFmpeg(imagePaths, audioPaths, subtitlePath, videoPath);
      } else {
        console.warn('⚠️ FFmpeg not available, creating demonstration video metadata');
        return await this.createDemoVideo(script, imagePaths);
      }
    } catch (error) {
      console.error('❌ Editor Agent Error:', error);
      throw error;
    }
  }

  private async isFFmpegAvailable(): Promise<boolean> {
    try {
      await execAsync('ffmpeg -version');
      return true;
    } catch {
      return false;
    }
  }

  private async assembleWithFFmpeg(
    imagePaths: string[],
    audioPaths: string[],
    subtitlePath: string,
    outputPath: string
  ): Promise<string> {
    // Create concat file for images
    const concatFile = path.join(this.outputDir, `concat_${Date.now()}.txt`);
    const concatContent = imagePaths.map(img => `file '${img}'\nduration 10`).join('\n');
    fs.writeFileSync(concatFile, concatContent);

    // Step 1: Create video from images
    const tempVideoPath = path.join(this.outputDir, `temp_video_${Date.now()}.mp4`);
    await execAsync(`ffmpeg -f concat -safe 0 -i "${concatFile}" -vf "fps=30,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p "${tempVideoPath}"`);

    // Step 2: Merge audio (simplified - in production, sync timing)
    const audioConcat = audioPaths.join('|');
    const tempWithAudio = path.join(this.outputDir, `temp_audio_${Date.now()}.mp4`);

    if (audioPaths.length > 0) {
      await execAsync(`ffmpeg -i "${tempVideoPath}" -i "${audioPaths[0]}" -c:v copy -c:a aac -shortest "${tempWithAudio}"`);
    } else {
      fs.copyFileSync(tempVideoPath, tempWithAudio);
    }

    // Step 3: Add subtitles
    await execAsync(`ffmpeg -i "${tempWithAudio}" -vf "subtitles=${subtitlePath}:force_style='FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,MarginV=20'" -c:a copy "${outputPath}"`);

    // Cleanup
    fs.unlinkSync(concatFile);
    fs.unlinkSync(tempVideoPath);
    fs.unlinkSync(tempWithAudio);

    console.log(`✅ Editor Agent: Video assembled at ${outputPath}`);
    return outputPath;
  }

  private async createDemoVideo(script: StoryScript, imagePaths: string[]): Promise<string> {
    // Create a JSON manifest that can be used by web player
    const manifestPath = path.join(this.outputDir, `manifest_${Date.now()}.json`);

    const manifest = {
      id: script.id,
      title: script.title,
      genre: script.genre,
      duration: script.duration,
      scenes: script.script.map((scene, i) => ({
        dialogue: scene.dialogue,
        image: imagePaths[i] || null,
        duration: scene.duration || 10,
        emotion: scene.emotion
      })),
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ Editor Agent: Created video manifest at ${manifestPath}`);
    return manifestPath;
  }

  async addWatermark(videoPath: string, logoText: string): Promise<string> {
    console.log(`💧 Editor Agent: Adding watermark...`);

    const outputPath = path.join(
      path.dirname(videoPath),
      `watermarked_${path.basename(videoPath)}`
    );

    if (await this.isFFmpegAvailable()) {
      await execAsync(`ffmpeg -i "${videoPath}" -vf "drawtext=text='${logoText}':fontsize=30:fontcolor=white@0.5:x=10:y=10" -c:a copy "${outputPath}"`);
      return outputPath;
    }

    return videoPath;
  }

  async optimizeForYouTube(videoPath: string): Promise<string> {
    console.log(`📊 Editor Agent: Optimizing for YouTube...`);

    const outputPath = path.join(
      path.dirname(videoPath),
      `optimized_${path.basename(videoPath)}`
    );

    if (await this.isFFmpegAvailable()) {
      // YouTube recommended settings
      await execAsync(`ffmpeg -i "${videoPath}" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 192k -ar 48000 -movflags +faststart "${outputPath}"`);
      return outputPath;
    }

    return videoPath;
  }
}
