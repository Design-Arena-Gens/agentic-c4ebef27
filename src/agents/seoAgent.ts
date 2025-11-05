import { StoryScript, SEOMetadata } from '@/types';

export class SEOAgent {
  generateSEO(script: StoryScript, thumbnailPath: string): SEOMetadata {
    console.log(`🔍 SEO Agent: Generating metadata for "${script.title}"...`);

    const title = this.optimizeTitle(script);
    const description = this.generateDescription(script);
    const tags = this.generateTags(script);

    const metadata: SEOMetadata = {
      title,
      description,
      tags,
      category: this.mapGenreToCategory(script.genre),
      thumbnailUrl: thumbnailPath
    };

    console.log(`✅ SEO Agent: Metadata generated`);
    return metadata;
  }

  private optimizeTitle(script: StoryScript): string {
    // YouTube title optimization (max 100 chars, front-load keywords)
    const hooks = [
      '💔',
      '🤯',
      '⚡',
      '🔥',
      '😱',
      '💀',
      '🚨',
      '⏰'
    ];

    const genreEmoji = {
      romance: '💔',
      horror: '😱',
      'sci-fi': '🚀',
      thriller: '🔥',
      emotional: '💔',
      mystery: '🔍',
      comedy: '😂',
      action: '⚡'
    };

    const emoji = genreEmoji[script.genre as keyof typeof genreEmoji] || hooks[Math.floor(Math.random() * hooks.length)];

    let title = `${emoji} ${script.title}`;

    // Add viral modifiers
    const modifiers = [
      '| 60 Second Story',
      '| Micro Drama',
      '| Short Story',
      '| Must Watch',
      '| Plot Twist',
      '#Shorts'
    ];

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];

    if ((title + ' ' + modifier).length <= 100) {
      title += ' ' + modifier;
    }

    return title.substring(0, 100);
  }

  private generateDescription(script: StoryScript): string {
    const hooks = [
      'You won\'t believe what happens...',
      'Wait for the ending...',
      'This will give you goosebumps...',
      'The twist will shock you...',
      'You need to see this...'
    ];

    const hook = hooks[Math.floor(Math.random() * hooks.length)];

    const description = `${hook}

${script.hook}

A ${script.duration}-second ${script.genre} micro-drama that will keep you on the edge of your seat.

🎬 Genre: ${script.genre}
⏱️ Duration: ${script.duration} seconds
🎭 ${script.metadata?.emotionalTone || 'Emotional storytelling'}

---

Subscribe for more AI-generated micro-dramas!

#Shorts #MicroDrama #${script.genre} #ShortFilm #StoryTime #AIGenerated #ViralShorts #MustWatch #PlotTwist #60Seconds

---

🤖 This video was created using AI technology:
- Script: Open-source LLM (Llama 3)
- Visuals: Stable Diffusion
- Voice: Open-source TTS
- Editing: FFmpeg

All content is AI-generated for entertainment purposes.`;

    return description;
  }

  private generateTags(script: StoryScript): string[] {
    const baseTags = [
      'shorts',
      'short film',
      'micro drama',
      '60 seconds',
      'short story',
      'plot twist',
      'viral shorts',
      'must watch',
      'AI generated',
      'storytelling'
    ];

    const genreTags = {
      romance: ['love story', 'romance', 'heartbreak', 'emotional', 'relationship'],
      horror: ['horror', 'scary', 'creepy', 'paranormal', 'ghost story', 'nightmare'],
      'sci-fi': ['sci-fi', 'science fiction', 'future', 'technology', 'AI', 'space'],
      thriller: ['thriller', 'suspense', 'mystery', 'psychological', 'intense'],
      emotional: ['emotional', 'touching', 'heartwarming', 'feelings', 'tears'],
      mystery: ['mystery', 'detective', 'investigation', 'whodunit', 'clues'],
      comedy: ['comedy', 'funny', 'humor', 'laugh', 'entertainment'],
      action: ['action', 'adventure', 'excitement', 'intense', 'thrilling']
    };

    const specificTags = genreTags[script.genre as keyof typeof genreTags] || [];

    // Add keyword-based tags from script
    const keywords = script.metadata?.targetAudience?.toLowerCase().split(',') || [];

    const allTags = [...baseTags, ...specificTags, ...keywords, script.genre];

    // Return unique tags, max 500 chars total
    const uniqueTags = Array.from(new Set(allTags));
    let totalLength = 0;
    const finalTags = [];

    for (const tag of uniqueTags) {
      if (totalLength + tag.length + 1 <= 500) {
        finalTags.push(tag);
        totalLength += tag.length + 1;
      } else {
        break;
      }
    }

    return finalTags;
  }

  private mapGenreToCategory(genre: string): string {
    const categoryMap: Record<string, string> = {
      romance: 'Film & Animation',
      horror: 'Film & Animation',
      'sci-fi': 'Science & Technology',
      thriller: 'Film & Animation',
      emotional: 'People & Blogs',
      mystery: 'Film & Animation',
      comedy: 'Comedy',
      action: 'Film & Animation'
    };

    return categoryMap[genre] || 'Entertainment';
  }

  generateHashtags(script: StoryScript): string[] {
    return [
      '#Shorts',
      '#YouTubeShorts',
      `#${script.genre.replace('-', '')}`,
      '#ShortFilm',
      '#MicroDrama',
      '#ViralShorts',
      '#StoryTime',
      '#PlotTwist',
      '#AIGenerated',
      '#MustWatch'
    ];
  }
}
