import { StoryScript, GenerationConfig } from '@/types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export class VoiceAgent {
  private ttsApiUrl: string;
  private outputDir: string;

  constructor() {
    this.ttsApiUrl = process.env.TTS_API_URL || 'http://localhost:5002';
    this.outputDir = path.join(process.cwd(), 'generated', 'audio');

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateVoiceover(script: StoryScript, config: GenerationConfig): Promise<string[]> {
    console.log(`🎙️ Voice Agent: Generating voiceover for "${script.title}"...`);

    const audioPaths: string[] = [];

    try {
      for (let i = 0; i < script.script.length; i++) {
        const scene = script.script[i];
        const audioPath = await this.generateSceneAudio(scene.dialogue, config, i);
        audioPaths.push(audioPath);
      }

      console.log(`✅ Voice Agent: Generated ${audioPaths.length} audio clips`);
      return audioPaths;
    } catch (error) {
      console.error('❌ Voice Agent Error:', error);
      // Return placeholder audio paths
      return script.script.map((_, i) => this.generateSilentAudio(i));
    }
  }

  private async generateSceneAudio(text: string, config: GenerationConfig, index: number): Promise<string> {
    try {
      // Attempt to call TTS API (XTTS2, Coqui, etc.)
      const response = await axios.post(
        `${this.ttsApiUrl}/api/tts`,
        {
          text: text,
          speaker_id: this.getSpeakerId(config.voiceType),
          language: 'en',
          speed: 1.1 // Slightly faster for engaging content
        },
        {
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );

      const audioPath = path.join(this.outputDir, `voice_${index}_${Date.now()}.wav`);
      fs.writeFileSync(audioPath, response.data);

      return audioPath;
    } catch (error) {
      console.warn(`⚠️ TTS API unavailable for scene ${index}, using silent audio`);
      return this.generateSilentAudio(index);
    }
  }

  private getSpeakerId(voiceType: string): string {
    const voiceMap: Record<string, string> = {
      male: 'male_1',
      female: 'female_1',
      neutral: 'neutral_1'
    };

    return voiceMap[voiceType] || 'neutral_1';
  }

  private generateSilentAudio(index: number): string {
    // Generate a 10-second silent audio file as placeholder
    const audioPath = path.join(this.outputDir, `silent_${index}_${Date.now()}.wav`);

    // Create a minimal WAV file (44.1kHz, 16-bit, mono, 10 seconds)
    const sampleRate = 44100;
    const duration = 10; // seconds
    const numSamples = sampleRate * duration;
    const numChannels = 1;
    const bitsPerSample = 16;

    const buffer = Buffer.alloc(44 + numSamples * 2); // WAV header + data

    // WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // fmt chunk size
    buffer.writeUInt16LE(1, 20); // audio format (PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * bitsPerSample / 8, 28); // byte rate
    buffer.writeUInt16LE(numChannels * bitsPerSample / 8, 32); // block align
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    // Silent audio data (all zeros)
    buffer.fill(0, 44);

    fs.writeFileSync(audioPath, buffer);
    return audioPath;
  }

  async addBackgroundMusic(scriptGenre: string): Promise<string> {
    console.log(`🎵 Voice Agent: Adding background music (${scriptGenre})...`);

    // In production, fetch from free music libraries or generate with AI
    // For now, return placeholder
    const musicPath = path.join(this.outputDir, `music_${scriptGenre}_${Date.now()}.mp3`);

    // Create a placeholder file
    fs.writeFileSync(musicPath, Buffer.from('placeholder'));

    return musicPath;
  }

  async generateSubtitles(script: StoryScript): Promise<string> {
    console.log(`📝 Voice Agent: Generating subtitles...`);

    const srtContent = script.script
      .map((scene, index) => {
        const startTime = index * 15; // Rough estimate
        const endTime = startTime + (scene.duration || 10);

        return `${index + 1}
${this.formatSRTTime(startTime)} --> ${this.formatSRTTime(endTime)}
${scene.dialogue}

`;
      })
      .join('');

    const srtPath = path.join(this.outputDir, `subtitles_${Date.now()}.srt`);
    fs.writeFileSync(srtPath, srtContent);

    return srtPath;
  }

  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}
