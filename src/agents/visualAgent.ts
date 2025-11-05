import { StoryScript, ScriptScene, GenerationConfig } from '@/types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export class VisualAgent {
  private sdApiUrl: string;
  private outputDir: string;

  constructor() {
    this.sdApiUrl = process.env.SD_API_URL || 'http://localhost:7860';
    this.outputDir = path.join(process.cwd(), 'generated', 'visuals');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateVisuals(script: StoryScript, config: GenerationConfig): Promise<string[]> {
    console.log(`🎨 Visual Agent: Generating visuals for "${script.title}"...`);

    const imagePaths: string[] = [];

    try {
      for (let i = 0; i < script.script.length; i++) {
        const scene = script.script[i];
        const imagePath = await this.generateSceneImage(scene, config, i);
        imagePaths.push(imagePath);
      }

      console.log(`✅ Visual Agent: Generated ${imagePaths.length} scene images`);
      return imagePaths;
    } catch (error) {
      console.error('❌ Visual Agent Error:', error);
      return this.generatePlaceholderVisuals(script);
    }
  }

  private async generateSceneImage(scene: ScriptScene, config: GenerationConfig, index: number): Promise<string> {
    const prompt = this.buildPrompt(scene, config);

    try {
      const response = await axios.post(
        `${this.sdApiUrl}/sdapi/v1/txt2img`,
        {
          prompt: prompt,
          negative_prompt: 'blurry, low quality, distorted, ugly, watermark',
          steps: 20,
          width: 1080,
          height: 1920,
          cfg_scale: 7,
          sampler_name: 'DPM++ 2M Karras',
        },
        { timeout: 60000 }
      );

      const imageData = response.data.images[0];
      const imagePath = path.join(this.outputDir, `scene_${index}_${Date.now()}.png`);
      const buffer = Buffer.from(imageData, 'base64');
      fs.writeFileSync(imagePath, buffer);
      return imagePath;
    } catch (error) {
      console.warn(`⚠️ SD API unavailable for scene ${index}, generating placeholder`);
      return this.generatePlaceholderImage(scene, index);
    }
  }

  private buildPrompt(scene: ScriptScene, config: GenerationConfig): string {
    const styleModifiers = {
      anime: 'anime style, manga art, cel shaded, vibrant colors, detailed anime character design',
      realistic: 'photorealistic, cinematic lighting, 8k, highly detailed, film photography',
      mixed: 'semi-realistic anime, Studio Ghibli style, detailed illustration'
    };

    const emotionModifiers: Record<string, string> = {
      fear: 'dark atmosphere, ominous lighting, tense mood',
      love: 'warm lighting, soft focus, romantic atmosphere',
      shock: 'dramatic lighting, high contrast, intense focus',
      wonder: 'ethereal lighting, dreamlike quality, magical atmosphere',
      dread: 'oppressive darkness, cold tones, horror atmosphere',
      excitement: 'dynamic composition, vibrant energy, bright colors'
    };

    const basePrompt = scene.visualDescription || scene.scene;
    const style = styleModifiers[config.style];
    const emotion = scene.emotion ? emotionModifiers[scene.emotion] || '' : '';

    return `${basePrompt}, ${style}, ${emotion}, masterpiece, best quality, professional composition`;
  }

  private generatePlaceholderImage(scene: ScriptScene, index: number): string {
    const colors = this.getColorForScene(scene);

    const svg = `<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${index}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#grad${index})" />
      <rect x="0" y="800" width="1080" height="320" fill="rgba(0,0,0,0.7)" />
      <text x="540" y="900" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">Scene ${index + 1}</text>
      <text x="540" y="980" font-size="36" fill="white" text-anchor="middle" font-family="Arial">${scene.scene.replace(/[<>&"']/g, '')}</text>
      ${scene.emotion ? `<text x="540" y="1080" font-size="32" font-style="italic" fill="#ffcc00" text-anchor="middle" font-family="Arial">[${scene.emotion}]</text>` : ''}
    </svg>`;

    const imagePath = path.join(this.outputDir, `placeholder_scene_${index}_${Date.now()}.svg`);
    fs.writeFileSync(imagePath, svg);
    return imagePath;
  }

  private generatePlaceholderVisuals(script: StoryScript): string[] {
    return script.script.map((scene, i) => this.generatePlaceholderImage(scene, i));
  }

  private getColorForScene(scene: ScriptScene): [string, string] {
    const emotionColors: Record<string, [string, string]> = {
      fear: ['#1a0033', '#330066'],
      love: ['#ff6b6b', '#ffd93d'],
      shock: ['#000000', '#ff0000'],
      wonder: ['#4a148c', '#00bcd4'],
      dread: ['#0d0d0d', '#1a1a1a'],
      excitement: ['#ff6b35', '#f7931e'],
      default: ['#1e3a8a', '#3b82f6']
    };

    return emotionColors[scene.emotion || 'default'] || emotionColors.default;
  }

  async generateThumbnail(script: StoryScript): Promise<string> {
    console.log(`🖼️ Visual Agent: Generating thumbnail for "${script.title}"...`);

    const svg = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="thumbGrad">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#thumbGrad)" />
      <text x="640" y="360" font-size="72" font-weight="bold" fill="white" stroke="black" stroke-width="8" text-anchor="middle" font-family="Arial">${script.title.replace(/[<>&"']/g, '').substring(0, 50)}</text>
      <rect x="50" y="50" width="200" height="60" fill="#ffcc00" />
      <text x="70" y="90" font-size="32" font-weight="bold" fill="black" font-family="Arial">${script.genre.toUpperCase()}</text>
      <rect x="1030" y="50" width="200" height="60" fill="#ff4444" />
      <text x="1210" y="90" font-size="32" font-weight="bold" fill="white" text-anchor="end" font-family="Arial">60 SEC</text>
    </svg>`;

    const thumbnailPath = path.join(this.outputDir, `thumbnail_${Date.now()}.svg`);
    fs.writeFileSync(thumbnailPath, svg);

    console.log(`✅ Visual Agent: Thumbnail created`);
    return thumbnailPath;
  }
}
