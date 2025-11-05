'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style: 'anime' })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Generation error:', error);
      setResult({ error: 'Failed to generate video' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            AI YouTube Micro-Drama Network
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Autonomous AI System for Viral Content Generation
          </p>
          <p className="text-sm text-gray-400">
            Generates 1-minute anime & realistic micro-dramas across multiple genres
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
            <div className="text-3xl font-bold text-purple-400 mb-2">8</div>
            <div className="text-gray-300">AI Agents</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-pink-500">
            <div className="text-3xl font-bold text-pink-400 mb-2">100%</div>
            <div className="text-gray-300">Autonomous</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-blue-500">
            <div className="text-3xl font-bold text-blue-400 mb-2">60s</div>
            <div className="text-gray-300">Video Length</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
            <div className="text-3xl font-bold text-green-400 mb-2">$5K+</div>
            <div className="text-gray-300">Monthly Goal</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { emoji: '📊', title: 'Trend Analysis', desc: 'Scrapes viral patterns' },
            { emoji: '📝', title: 'Script Generation', desc: 'AI-powered storytelling' },
            { emoji: '🎨', title: 'Visual Creation', desc: 'Stable Diffusion art' },
            { emoji: '🎙️', title: 'Voice Synthesis', desc: 'Realistic voiceovers' },
            { emoji: '🎬', title: 'Auto Editing', desc: 'FFmpeg processing' },
            { emoji: '🔍', title: 'SEO Optimization', desc: 'Viral titles & tags' },
            { emoji: '📤', title: 'YouTube Upload', desc: 'Automated publishing' },
            { emoji: '📈', title: 'Analytics Loop', desc: 'Performance learning' }
          ].map((feature, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition">
              <div className="text-3xl mb-2">{feature.emoji}</div>
              <div className="font-semibold text-sm mb-1">{feature.title}</div>
              <div className="text-xs text-gray-400">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {generating ? '⚡ Generating Video...' : '🚀 Generate Viral Video'}
          </button>

          <Link
            href="/dashboard"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg border border-gray-600 transition"
          >
            📊 View Dashboard
          </Link>
        </div>

        {/* Generation Result */}
        {result && (
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500 max-w-2xl mx-auto">
            {result.error ? (
              <div className="text-red-400">
                <div className="text-xl font-bold mb-2">❌ Error</div>
                <div>{result.error}</div>
              </div>
            ) : (
              <div>
                <div className="text-xl font-bold mb-4 text-purple-400">
                  ✅ Video Generated Successfully!
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Project ID:</strong> {result.id}</div>
                  <div><strong>Title:</strong> {result.seoMetadata?.title}</div>
                  <div><strong>Genre:</strong> {result.genre}</div>
                  <div><strong>Status:</strong> {result.status}</div>
                  {result.youtubeId && (
                    <div>
                      <strong>YouTube ID:</strong> {result.youtubeId}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tech Stack */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6 text-purple-400">
            Open-Source Tech Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              'Llama 3 / Mistral',
              'Stable Diffusion',
              'XTTS2 / Bark',
              'FFmpeg',
              'Next.js',
              'YouTube API',
              'SQLite',
              'TypeScript'
            ].map((tech, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3 text-sm">
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-4 text-pink-400">
            Supported Genres
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {['Romance', 'Horror', 'Sci-Fi', 'Thriller', 'Emotional', 'Mystery', 'Comedy', 'Action'].map((genre) => (
              <span key={genre} className="bg-purple-900 px-4 py-2 rounded-full text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>🤖 Fully autonomous AI system powered by open-source models</p>
          <p className="mt-2">Built with Next.js • Deployable to Vercel</p>
        </div>
      </div>
    </div>
  );
}
