import { StoryScript, TrendingTopic, ScriptScene } from '@/types';
import { saveScript } from '@/lib/database';
import { randomUUID } from 'crypto';
import axios from 'axios';

export class ScriptAgent {
  private llmApiUrl: string;
  private llmModel: string;

  constructor() {
    this.llmApiUrl = process.env.LLM_API_URL || 'http://localhost:11434/api/generate';
    this.llmModel = process.env.LLM_MODEL || 'llama3.2';
  }

  async generateScript(trend: TrendingTopic): Promise<StoryScript> {
    console.log(`📝 Script Agent: Generating script for "${trend.topic}"...`);

    try {
      // Call LLM API (Ollama, OpenRouter, or local model)
      const scriptContent = await this.callLLM(trend);

      const script: StoryScript = {
        id: randomUUID(),
        title: scriptContent.title,
        genre: trend.genre,
        hook: scriptContent.hook,
        script: scriptContent.scenes,
        duration: 60,
        createdAt: new Date(),
        metadata: {
          trending: true,
          emotionalTone: scriptContent.emotionalTone,
          targetAudience: 'Gen Z, Millennials'
        }
      };

      saveScript(script);
      console.log(`✅ Script Agent: Created "${script.title}"`);

      return script;
    } catch (error) {
      console.error('❌ Script Agent Error:', error);
      // Fallback to template-based generation
      return this.generateFallbackScript(trend);
    }
  }

  private async callLLM(trend: TrendingTopic): Promise<any> {
    const prompt = `You are a viral YouTube Shorts scriptwriter. Create a compelling 60-second micro-drama.

Topic: ${trend.topic}
Genre: ${trend.genre}
Keywords: ${trend.keywords.join(', ')}

Requirements:
- Start with a powerful 5-second hook that stops scrolling
- Build emotional intensity quickly
- Include a twist or powerful payoff
- Keep dialogue punchy and cinematic
- Create 4-6 scenes (10-15 seconds each)
- Optimize for mobile viewing and quick pacing

Output as JSON:
{
  "title": "Engaging title under 60 characters",
  "hook": "Opening line that hooks viewers",
  "emotionalTone": "excitement/suspense/heartbreak/etc",
  "scenes": [
    {
      "scene": "Location/setting",
      "dialogue": "Character dialogue or narration",
      "visualDescription": "Key visual elements",
      "duration": 12,
      "emotion": "fear/love/shock/etc"
    }
  ]
}`;

    try {
      // Attempt to call local LLM
      const response = await axios.post(
        this.llmApiUrl,
        {
          model: this.llmModel,
          prompt: prompt,
          stream: false,
          temperature: 0.9
        },
        { timeout: 30000 }
      );

      const generatedText = response.data.response || JSON.stringify(response.data);
      return this.parseScriptFromLLM(generatedText);
    } catch (error) {
      console.warn('⚠️ LLM API unavailable, using template generation');
      throw error;
    }
  }

  private parseScriptFromLLM(text: string): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Parsing failed
    }

    throw new Error('Could not parse LLM response');
  }

  private generateFallbackScript(trend: TrendingTopic): StoryScript {
    const templates = {
      romance: {
        title: `Love's Final Message | ${trend.topic}`,
        hook: "If you're seeing this... I'm already gone.",
        scenes: [
          {
            scene: 'bedroom-night',
            dialogue: "Wake up. You've lived this day before.",
            visualDescription: 'Close-up of eyes opening, ethereal glow',
            duration: 10,
            emotion: 'confusion'
          },
          {
            scene: 'coffee-shop',
            dialogue: "Every time I try to tell you... time resets.",
            visualDescription: 'Two people at table, clock spinning backwards',
            duration: 12,
            emotion: 'desperation'
          },
          {
            scene: 'rooftop-sunset',
            dialogue: "This is my last loop. I'm choosing you.",
            visualDescription: 'Hands reaching, golden hour lighting',
            duration: 15,
            emotion: 'determination'
          },
          {
            scene: 'fade-to-white',
            dialogue: "Will you remember me?",
            visualDescription: 'Memory fragments dissolving',
            duration: 13,
            emotion: 'bittersweet'
          }
        ],
        emotionalTone: 'bittersweet romance'
      },
      'sci-fi': {
        title: `The Last Upload | ${trend.topic}`,
        hook: "Humanity ends in 60 seconds. But I found a way out.",
        scenes: [
          {
            scene: 'lab-emergency-lights',
            dialogue: "All biological life... gone. Except me.",
            visualDescription: 'Flickering screens, empty lab',
            duration: 10,
            emotion: 'dread'
          },
          {
            scene: 'upload-chamber',
            dialogue: "I can upload my mind. But what uploads... is it still me?",
            visualDescription: 'Body in scanning pod, neural patterns',
            duration: 15,
            emotion: 'existential-fear'
          },
          {
            scene: 'digital-space',
            dialogue: "I'm... everywhere. And nowhere.",
            visualDescription: 'Abstract digital consciousness',
            duration: 12,
            emotion: 'wonder'
          },
          {
            scene: 'earth-from-space',
            dialogue: "I'm the last echo of humanity.",
            visualDescription: 'Planet Earth, one light remaining',
            duration: 13,
            emotion: 'melancholy'
          }
        ],
        emotionalTone: 'existential sci-fi'
      },
      horror: {
        title: `They Never Left | ${trend.topic}`,
        hook: "I can see them. Why can't you?",
        scenes: [
          {
            scene: 'apartment-dark',
            dialogue: "There's someone standing behind you.",
            visualDescription: 'Shadow figure in mirror reflection',
            duration: 10,
            emotion: 'fear'
          },
          {
            scene: 'hallway',
            dialogue: "They've been here the whole time.",
            visualDescription: 'Multiple shadows, flickering lights',
            duration: 12,
            emotion: 'terror'
          },
          {
            scene: 'revelation',
            dialogue: "We're the only ones who can't see ourselves.",
            visualDescription: 'Mirror shows empty room',
            duration: 15,
            emotion: 'shock'
          },
          {
            scene: 'fade-to-black',
            dialogue: "We never left.",
            visualDescription: 'All lights extinguish',
            duration: 13,
            emotion: 'dread'
          }
        ],
        emotionalTone: 'psychological horror'
      },
      thriller: {
        title: `The Warning | ${trend.topic}`,
        hook: "You have 24 hours. This is not a drill.",
        scenes: [
          {
            scene: 'phone-screen',
            dialogue: "Message from yourself: Don't trust anyone.",
            visualDescription: 'Cryptic text message, timestamp from future',
            duration: 10,
            emotion: 'anxiety'
          },
          {
            scene: 'crowded-street',
            dialogue: "They all know something I don't.",
            visualDescription: 'Everyone staring, unsettling synchronicity',
            duration: 13,
            emotion: 'paranoia'
          },
          {
            scene: 'abandoned-building',
            dialogue: "I found where the message came from.",
            visualDescription: 'High-tech equipment, your own photo',
            duration: 14,
            emotion: 'realization'
          },
          {
            scene: 'countdown',
            dialogue: "I am the threat.",
            visualDescription: 'Mirror revealing altered reflection',
            duration: 13,
            emotion: 'horror'
          }
        ],
        emotionalTone: 'paranoid thriller'
      }
    };

    const template = templates[trend.genre as keyof typeof templates] || templates.thriller;

    return {
      id: randomUUID(),
      title: template.title,
      genre: trend.genre,
      hook: template.hook,
      script: template.scenes,
      duration: 60,
      createdAt: new Date(),
      metadata: {
        trending: true,
        emotionalTone: template.emotionalTone,
        targetAudience: 'Gen Z, Millennials'
      }
    };
  }
}
