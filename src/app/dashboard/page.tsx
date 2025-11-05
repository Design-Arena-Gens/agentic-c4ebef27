'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, analyticsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/analytics')
      ]);

      const projectsData = await projectsRes.json();
      const analyticsData = await analyticsRes.json();

      setProjects(projectsData.projects || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-xl">⚡ Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            📊 Dashboard
          </h1>
          <Link
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg border border-gray-600 transition"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {analytics.totalVideos || 0}
              </div>
              <div className="text-gray-300 text-sm">Total Videos</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-blue-500">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {(analytics.totalViews || 0).toLocaleString()}
              </div>
              <div className="text-gray-300 text-sm">Total Views</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {((analytics.avgCTR || 0) * 100).toFixed(2)}%
              </div>
              <div className="text-gray-300 text-sm">Avg CTR</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-pink-500">
              <div className="text-2xl font-bold text-pink-400 mb-1">
                {((analytics.avgRetention || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-300 text-sm">Avg Retention</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
              <div className="text-2xl font-bold text-green-400 mb-1">
                ${(analytics.totalRevenue || 0).toFixed(2)}
              </div>
              <div className="text-gray-300 text-sm">Revenue</div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analytics?.recommendations && analytics.recommendations.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-500 mb-8">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">💡 AI Recommendations</h2>
            <ul className="space-y-2">
              {analytics.recommendations.map((rec: string, i: number) => (
                <li key={i} className="text-gray-300">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
          <h2 className="text-2xl font-bold mb-6 text-purple-400">📹 Recent Projects</h2>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-4">🎬</div>
              <div>No videos generated yet</div>
              <Link
                href="/"
                className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Generate Your First Video
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Genre</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">YouTube ID</th>
                    <th className="text-left py-3 px-4">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-3 px-4">
                        <div className="font-semibold">{project.seoMetadata?.title || 'Untitled'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-purple-900 px-3 py-1 rounded-full text-sm">
                          {project.genre || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="py-3 px-4">
                        {project.youtubeId ? (
                          <a
                            href={`https://youtube.com/watch?v=${project.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {project.youtubeId}
                          </a>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {project.uploadedAt
                          ? new Date(project.uploadedAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revenue Projections */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-green-500">
          <h2 className="text-2xl font-bold mb-4 text-green-400">💰 Revenue Projections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded p-4">
              <div className="text-lg font-semibold mb-2">30 Videos/Month</div>
              <div className="text-2xl font-bold text-green-400">
                ${calculateRevenue(30).toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 mt-1">@ 20K views avg</div>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <div className="text-lg font-semibold mb-2">100 Videos</div>
              <div className="text-2xl font-bold text-green-400">
                ${calculateRevenue(100).toFixed(2)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Scaling up</div>
            </div>
            <div className="bg-gray-900 rounded p-4">
              <div className="text-lg font-semibold mb-2">Goal</div>
              <div className="text-2xl font-bold text-green-400">$5,000</div>
              <div className="text-xs text-gray-400 mt-1">Monthly target</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-gray-600',
    generating: 'bg-blue-600',
    editing: 'bg-yellow-600',
    rendering: 'bg-orange-600',
    uploading: 'bg-purple-600',
    published: 'bg-green-600',
    failed: 'bg-red-600'
  };

  return (
    <span className={`${colors[status] || 'bg-gray-600'} px-3 py-1 rounded-full text-sm`}>
      {status}
    </span>
  );
}

function calculateRevenue(videos: number): number {
  const avgViews = 20000;
  const retention = 0.6;
  const cpm = 5;
  const monetizableViews = avgViews * retention;
  return (videos * monetizableViews / 1000) * cpm;
}
